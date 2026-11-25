/**
 * Pruebas de la máquina de estados como motor de juego en vivo:
 *  - con manos REALES: de quién es el turno y cuándo se reparte la siguiente calle coinciden con el archivo PHH;
 *  - con manos generadas al azar usando solo acciones legales: se conservan las fichas, y recorrer la misma
 *    mano como PHH da las mismas 47 variables que las tomadas en vivo.
 */
import { describe, expect, it } from 'vitest'
import { BARAJA, separarCartas, type Carta } from '../cartas.ts'
import { crearRng, type TablaPreflop } from '../equidad.ts'
import {
  accionesLegales, aplicarAccion, clonarMano, contarActivos, crearMano, faseRonda, repartirCalle, repartirPrivadas, turnoActual,
  type Accion, type EstadoMano,
} from '../mano.ts'
import { asientoDePid, manoDeBanco, reconstruirDecisiones, type ManoCruda, type ManoDeBanco } from '../phh.ts'
import { extraerVariables, NOMBRES_VARIABLES, type Variables } from '../variables.ts'
import { leerJson, reportar } from './ayudas.ts'

const tabla = leerJson<TablaPreflop>('equity_preflop_169.json')
const SIN_EQUITY = { tabla, equity: 'omitir' as const }

describe('Turnos y calles contra manos reales', () => {
  it('el turno y el reparto de calle del motor coinciden con el PHH (golden + banco)', () => {
    const golden = leerJson<{ manos: Record<string, { jugadores: string[]; stacks_iniciales: number[]; ciegas_o_straddles: number[]; acciones: string[] }> }>('referencia_golden.json')
    const banco = leerJson<{ manos: ManoDeBanco[] }>('banco_manos_reales.json')
    const completas: ManoCruda[] = Object.values(golden.manos).map((m) => ({ jugadores: m.jugadores, stacksIniciales: m.stacks_iniciales, ciegas: m.ciegas_o_straddles, acciones: m.acciones }))
    // Las manos del banco no traen los repartos finales cuando todos están all-in: la mano queda esperando repartir la calle
    const compactas: ManoCruda[] = banco.manos.map(manoDeBanco)
    const manos = [...completas, ...compactas]
    const esCompleta = new Set(completas)
    let decisiones = 0
    let turnoMal = 0
    let calleMal = 0
    let finMal = 0
    let raiseFueraDeRango = 0
    let raises = 0
    const ejemplos: string[] = []
    for (const m of manos) {
      const e = crearMano({ jugadores: m.jugadores, stacks: m.stacksIniciales, ciegas: m.ciegas })
      m.acciones.forEach((act, i) => {
        const p = act.split(/\s+/)
        if (p[0] === 'd') {
          if (p[1] === 'dh') repartirPrivadas(e, asientoDePid(p[2]!, e.n)!, separarCartas(p[3]!))
          else if (p[1] === 'db') {
            if (faseRonda(e) !== 'repartir_calle') { calleMal++; if (ejemplos.length < 5) ejemplos.push(`fase=${faseRonda(e)} antes de ${act} (accion ${i})`) }
            repartirCalle(e, separarCartas(p[2]!))
          }
          return
        }
        const asiento = asientoDePid(p[0]!, e.n)
        if (asiento === null || !['f', 'cc', 'cbr'].includes(p[1]!)) return
        decisiones++
        if (turnoActual(e) !== asiento) { turnoMal++; if (ejemplos.length < 5) ejemplos.push(`turno=${turnoActual(e)} esperado=${asiento} en ${act} (accion ${i})`) }
        if (p[1] === 'cbr') {
          raises++
          const l = accionesLegales(e, asiento)
          const hasta = Number(p[2])
          if (!l.subir || hasta < l.subir.min || hasta > l.subir.max) raiseFueraDeRango++
        }
        aplicarAccion(e, { asiento, tipo: p[1] as 'f' | 'cc' | 'cbr', hasta: p[2] === undefined ? undefined : Number(p[2]) })
      })
      // Al terminar la mano: showdown o solo queda uno
      const f = faseRonda(e)
      const aceptadas = esCompleta.has(m) ? ['showdown', 'terminada'] : ['showdown', 'terminada', 'repartir_calle']
      if (!aceptadas.includes(f)) finMal++
    }
    reportar(
      'Turnos',
      `manos=${manos.length} | decisiones=${decisiones} | turno distinto al del PHH=${turnoMal} | reparto de calle fuera de lugar=${calleMal} | manos que no terminan donde deben=${finMal} | ` +
        `subidas reales=${raises}, fuera del rango legal calculado=${raiseFueraDeRango}${ejemplos.length ? ' | ejemplos: ' + ejemplos.join(' ; ') : ''}`,
    )
    expect(turnoMal).toBe(0)
    expect(calleMal).toBe(0)
    expect(finMal).toBe(0)
    expect(raiseFueraDeRango).toBe(0)
  })
})

describe('Manos generadas con acciones legales', () => {
  function barajar(rng: () => number): Carta[] {
    const b = [...BARAJA]
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[b[i], b[j]] = [b[j]!, b[i]!]
    }
    return b
  }

  function jugarMano(semilla: number, stack: number): { phh: ManoCruda; vivo: Variables[]; final: EstadoMano; total: number } {
    const rng = crearRng(semilla)
    const mazo = barajar(rng)
    const jugadores = ['A', 'B', 'C', 'D', 'E', 'F']
    const stacks = jugadores.map((_, i) => (i % 2 === 0 ? stack : stack * 2))
    const ciegas = [50, 100, 0, 0, 0, 0]
    const e = crearMano({ jugadores, stacks, ciegas })
    const acciones: string[] = []
    jugadores.forEach((_, i) => {
      const c = mazo.pop()! + mazo.pop()!
      repartirPrivadas(e, i, separarCartas(c))
      acciones.push(`d dh p${i + 1} ${c}`)
    })
    const vivo: Variables[] = []
    for (let guardia = 0; guardia < 200; guardia++) {
      const fase = faseRonda(e)
      if (fase === 'terminada' || fase === 'showdown') break
      if (fase === 'repartir_calle') {
        const n = e.calle === 0 ? 3 : 1
        const cartas = Array.from({ length: n }, () => mazo.pop()!)
        acciones.push(`d db ${cartas.join('')}`)
        repartirCalle(e, cartas)
        continue
      }
      const asiento = turnoActual(e)!
      const l = accionesLegales(e, asiento)
      vivo.push(extraerVariables(e, asiento, SIN_EQUITY))
      const x = rng()
      let a: Accion
      if (l.subir && x < 0.3) {
        // a veces all-in, a veces un valor al azar dentro del rango
        const hasta = rng() < 0.15 ? l.subir.max : Math.round(l.subir.min + rng() * (l.subir.max - l.subir.min))
        a = { asiento, tipo: 'cbr', hasta }
      } else if (l.puedeFold && x > 0.8) a = { asiento, tipo: 'f' }
      else a = { asiento, tipo: 'cc' }
      aplicarAccion(e, a, { validar: true })
      acciones.push(a.tipo === 'cbr' ? `p${asiento + 1} cbr ${a.hasta}` : `p${asiento + 1} ${a.tipo}`)
    }
    return { phh: { jugadores, stacksIniciales: stacks, ciegas, acciones }, vivo, final: e, total: stacks.reduce((x, y) => x + y, 0) }
  }

  it('conserva las fichas, termina siempre y reproduce las mismas 47 variables al reconstruir el PHH', () => {
    let manos = 0
    let decisiones = 0
    let allIns = 0
    let showdowns = 0
    const problemas: string[] = []
    for (let semilla = 1; semilla <= 400; semilla++) {
      const stack = semilla % 3 === 0 ? 700 : semilla % 3 === 1 ? 3000 : 10000 // stacks cortos fuerzan all-in
      const { phh, vivo, final, total } = jugarMano(semilla, stack)
      manos++
      const fase = faseRonda(final)
      if (fase !== 'showdown' && fase !== 'terminada') problemas.push(`semilla ${semilla}: no terminó (${fase})`)
      if (fase === 'showdown') showdowns++
      const fichas = final.stacks.reduce((a, b) => a + b, 0) + final.bote
      if (Math.abs(fichas - total) > 1e-9) problemas.push(`semilla ${semilla}: fichas ${fichas} != ${total}`)
      if (final.stacks.some((s) => s < 0)) problemas.push(`semilla ${semilla}: stack negativo`)
      if (final.stacks.some((s, i) => s === 0 && final.activos[i])) allIns++
      if (contarActivos(final) < 1) problemas.push(`semilla ${semilla}: nadie activo`)
      const { decisiones: rec } = reconstruirDecisiones(phh, SIN_EQUITY)
      if (rec.length !== vivo.length) { problemas.push(`semilla ${semilla}: ${rec.length} vs ${vivo.length} decisiones`); continue }
      rec.forEach((d, i) => {
        decisiones++
        for (const nombre of NOMBRES_VARIABLES) {
          if (nombre === 'c_equity') continue
          if (d.variables[nombre] !== vivo[i]![nombre]) problemas.push(`semilla ${semilla} dec ${i} ${nombre}: ${d.variables[nombre]} vs ${vivo[i]![nombre]}`)
        }
      })
    }
    reportar('Vivo', `manos aleatorias=${manos} | decisiones=${decisiones} | con algún jugador all-in al final=${allIns} | llegaron a showdown=${showdowns} | problemas=${problemas.length}`)
    expect(problemas.slice(0, 10)).toEqual([])
    expect(allIns).toBeGreaterThan(0)
  })

  it('acciones legales: ciega grande con opción, subida mínima y all-in corto', () => {
    const e = crearMano({ jugadores: ['A', 'B', 'C', 'D', 'E', 'F'], stacks: [10000, 10000, 10000, 10000, 10000, 150], ciegas: [50, 100, 0, 0, 0, 0] })
    expect(turnoActual(e)).toBe(2) // preflop empieza el asiento tras la ciega grande
    let l = accionesLegales(e)
    expect(l).toMatchObject({ aPagar: 100, puedeCheck: false, puedeFold: true, pagoCall: 100 })
    expect(l.subir).toEqual({ min: 200, max: 10000 })
    aplicarAccion(e, { asiento: 2, tipo: 'cc' }, { validar: true })
    aplicarAccion(e, { asiento: 3, tipo: 'cc' }, { validar: true })
    aplicarAccion(e, { asiento: 4, tipo: 'cc' }, { validar: true })
    // El asiento 5 solo tiene 150 fichas: subir = all-in por 150
    l = accionesLegales(e)
    expect(l.asiento).toBe(5)
    expect(l.subir).toEqual({ min: 150, max: 150 })
    aplicarAccion(e, { asiento: 5, tipo: 'cbr', hasta: 150 }, { validar: true })
    // El all-in corto (50 sobre la ciega) no cambia el mínimo: subir otra vez exige 150 + 100
    aplicarAccion(e, { asiento: 0, tipo: 'cc' }, { validar: true })
    l = accionesLegales(e)
    expect(l.asiento).toBe(1)
    expect(l.aPagar).toBe(50)
    expect(l.subir).toEqual({ min: 250, max: 10000 })
    expect(() => aplicarAccion(e, { asiento: 1, tipo: 'cbr', hasta: 160 }, { validar: true })).toThrow()
    expect(() => aplicarAccion(e, { asiento: 3, tipo: 'cc' }, { validar: true })).toThrow() // no es su turno
    // Prueba hipotética sin tocar la mano real
    const copia = clonarMano(e)
    aplicarAccion(copia, { asiento: 1, tipo: 'f' })
    expect(turnoActual(e)).toBe(1)
    expect(turnoActual(copia)).toBe(2)
  })

  it('la ciega grande tiene opción cuando todos igualan, y la calle termina al cerrar la ronda', () => {
    const e = crearMano({ jugadores: ['A', 'B', 'C', 'D', 'E', 'F'], stacks: new Array(6).fill(10000), ciegas: [50, 100, 0, 0, 0, 0] })
    for (const a of [2, 3, 4, 5, 0]) aplicarAccion(e, { asiento: a, tipo: 'cc' })
    expect(turnoActual(e)).toBe(1)
    const l = accionesLegales(e)
    expect(l.puedeCheck).toBe(true)
    expect(l.puedeFold).toBe(false)
    aplicarAccion(e, { asiento: 1, tipo: 'cc' })
    expect(faseRonda(e)).toBe('repartir_calle')
    repartirCalle(e, ['As', 'Kd', '2c'])
    expect(turnoActual(e)).toBe(0) // postflop empieza la ciega pequeña
  })
})
