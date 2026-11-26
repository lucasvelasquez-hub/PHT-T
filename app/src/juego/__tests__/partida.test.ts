/**
 * Pruebas de la mano completa (sin React): 200 manos simuladas con el Modelo 4 de verdad (onnxruntime en Node),
 * bote que cuadra, solo acciones legales, repetibilidad por semilla y tamaños de subida dentro de los límites.
 */
import { describe, expect, it } from 'vitest'
import { accionesLegales, crearMano, crearServicio, repartirCalle, repartirPrivadas, type Accion, type Ort } from '../../motor/index.ts'
import { leerBytes, leerJson, reportar } from '../../motor/__tests__/ayudas.ts'
import { analistaDeServicio, type Analista } from '../analista.ts'
import { crearAzar } from '../azar.ts'
import { Partida, jugarHastaElFinal } from '../partida.ts'
import { repartirBote } from '../reparto.ts'
import { elegirSubida, subidasPosibles } from '../tamanos.ts'

const servicio = crearServicio({
  ort: async () => (await import('onnxruntime-web')) as unknown as Ort,
  json: async (n) => leerJson(n),
  bytes: async (n) => leerBytes(n),
  proveedores: ['wasm'],
})
const real = analistaDeServicio(servicio)
/** Mismo motor con menos simulaciones, para que las 200 manos corran rápido. */
const analista: Analista = {
  iniciar: () => real.iniciar(),
  analizar: (e, a, sims, semilla) => real.analizar(e, a, Math.min(sims, 600), semilla),
  cerrar: () => undefined,
}

const sumaStacks = (p: Partida) => p.estado.stacks.reduce((a, b) => a + b, 0)
const sumaInicial = (p: Partida) => p.estado.inicial.reduce((a, b) => a + b, 0)

/** El héroe de las pruebas elige al azar entre lo legal (incluidos los tamaños de subida). */
function heroeAlAzar(azarHeroe: () => number) {
  return (p: Partida): Accion => {
    const l = accionesLegales(p.estado, p.heroe)
    const opciones: Accion[] = [{ asiento: p.heroe, tipo: 'cc' }]
    if (l.puedeFold) opciones.push({ asiento: p.heroe, tipo: 'f' })
    for (const s of subidasPosibles(p.estado, p.heroe)) opciones.push({ asiento: p.heroe, tipo: 'cbr', hasta: s.hasta })
    return opciones[Math.floor(azarHeroe() * opciones.length)]!
  }
}

interface Registro { cartas: string; historial: unknown; neto: number; ganadores: number[]; showdown: boolean }

async function jugar(semilla: number, verificar: boolean): Promise<Registro> {
  const p = new Partida({ semilla, boton: semilla % 6 })
  const azarHeroe = crearAzar(semilla + 7777)
  const elegir = heroeAlAzar(azarHeroe)
  let rondas = 0
  let resultado = null as ReturnType<Partida['resolver']> | null
  for (; rondas < 500; rondas++) {
    const fase = p.fase()
    if (verificar) {
      // El bote siempre cuadra: lo que falta en los stacks está en el bote
      expect(p.estado.bote).toBe(sumaInicial(p) - sumaStacks(p))
      expect(p.estado.stacks.every((s) => s >= 0)).toBe(true)
    }
    if (fase === 'esperando_accion') {
      const s = p.turno()!
      let accion: Accion
      let lectura = null
      if (s === p.heroe) {
        lectura = await p.analizarHeroe(analista)
        accion = elegir(p)
      } else {
        const d = await p.decidirRival(analista, s)
        accion = d.accion
        lectura = d.lectura
        if (verificar && accion.tipo === 'cbr') {
          // Los tamaños de los rivales son uno de los botones y quedan dentro de los límites legales
          const l = accionesLegales(p.estado, s)
          expect(l.subir).not.toBeNull()
          expect(accion.hasta!).toBeGreaterThanOrEqual(l.subir!.min)
          expect(accion.hasta!).toBeLessThanOrEqual(l.subir!.max)
          expect(subidasPosibles(p.estado, s).map((x) => x.hasta)).toContain(accion.hasta)
        }
        if (verificar && accion.tipo === 'f') expect(l_puedeFold(p, s)).toBe(true)
      }
      p.aplicar(accion, lectura) // `validar: true`: lanza error si la acción no es legal
    } else if (fase === 'repartir_calle') {
      p.repartirSiguienteCalle()
    } else {
      resultado = p.resolver()
      break
    }
  }
  expect(resultado).not.toBeNull()
  const r = resultado!
  if (verificar) {
    // Al final no se pierden ni se inventan fichas
    expect(sumaStacks(p)).toBe(sumaInicial(p))
    expect(p.estado.bote).toBe(0)
    expect(r.ganadores.length).toBeGreaterThan(0)
    expect(r.cartas[0]).toHaveLength(2)
    const premios = r.reparto.premios.reduce((a, b) => a + b, 0)
    expect(premios / p.estado.bb).toBeCloseTo(r.boteBB!, 9)
    expect(r.historial.acciones.length).toBeGreaterThan(0)
    expect(r.historial.tablero).toHaveLength(5)
    // Con 100 bb para todos nunca hay botes laterales: nadie gana más de lo que había en juego
    expect(new Set(r.historial.tablero).size).toBe(5)
    const todas = [...r.historial.tablero, ...Object.values(r.cartas).flat()]
    expect(new Set(todas).size).toBe(todas.length) // sin cartas repetidas
  }
  return {
    cartas: JSON.stringify(r.cartas) + r.historial.tablero.join(''),
    historial: r.historial.acciones,
    neto: r.netoBB,
    ganadores: r.ganadores,
    showdown: !!r.showdown,
  }
}

function l_puedeFold(p: Partida, s: number): boolean {
  // Se evalúa DESPUÉS de decidir el rival y ANTES de aplicar: el estado todavía es el de su turno
  return accionesLegales(p.estado, s).puedeFold
}

describe('Mano completa', () => {
  it('200 manos simuladas: sin errores, el bote cuadra y solo hay acciones legales', async () => {
    const t0 = Date.now()
    let showdowns = 0
    let neto = 0
    let subidasRivales = 0
    for (let semilla = 1; semilla <= 200; semilla++) {
      const r = await jugar(semilla, true)
      neto += r.neto
      if (r.showdown) showdowns++
      subidasRivales += (r.historial as { asiento: number; tipo: string }[]).filter((a) => a.asiento !== 0 && a.tipo === 'cbr').length
    }
    reportar('Juego', `200 manos en ${((Date.now() - t0) / 1000).toFixed(1)} s · subidas de rivales: ${subidasRivales} · neto total del héroe al azar: ${neto.toFixed(1)} bb · showdowns: ${showdowns}`)
    expect(subidasRivales).toBeGreaterThan(50)
    expect(showdowns).toBeGreaterThan(5)
  })

  it('la misma semilla da las mismas manos (cartas, acciones y resultado)', async () => {
    for (const semilla of [3, 42, 99, 1687]) {
      const a = await jugar(semilla, false)
      const b = await jugar(semilla, false)
      expect(b).toEqual(a)
    }
    const otra = await jugar(4, false)
    const base = await jugar(3, false)
    expect(otra.cartas).not.toBe(base.cartas)
  })

  it('el héroe cambia de posición con el botón y las manos son completas', async () => {
    const posiciones = new Set<string>()
    for (let boton = 0; boton < 6; boton++) posiciones.add(new Partida({ semilla: 5, boton }).posicionHeroe)
    expect(posiciones.size).toBe(6)
    const p = new Partida({ semilla: 5, boton: 0 })
    const r = await jugarHastaElFinal(p, analista, (x) => ({ asiento: x.heroe, tipo: 'cc' }))
    expect(r.historial.acciones.some((a) => a.calle === 0)).toBe(true)
  })

  it('con el héroe siempre pagando, hay manos que llegan al showdown', async () => {
    let showdowns = 0
    for (let semilla = 300; semilla < 312; semilla++) {
      const p = new Partida({ semilla, boton: semilla % 6 })
      const r = await jugarHastaElFinal(p, analista, (x) => ({ asiento: x.heroe, tipo: 'cc' }))
      if (r.showdown) showdowns++
    }
    expect(showdowns).toBeGreaterThan(0)
  })
})

describe('Tamaños de subida', () => {
  function estadoPostflop(bote: number, puestoRival: number) {
    const e = crearMano({ jugadores: ['a', 'b', 'c', 'd', 'e', 'f'], stacks: new Array(6).fill(10000), ciegas: [50, 100, 0, 0, 0, 0] })
    ;['AhKh', 'QsJs', '7c2d', '9h9d', 'Ts8s', 'KcQd'].forEach((m, i) => repartirPrivadas(e, i, [m.slice(0, 2), m.slice(2)]))
    e.activos = [true, true, false, false, false, false]
    e.stacks[0] = 10000 - bote / 2
    e.stacks[1] = 10000 - bote / 2
    e.puesto = [0, 0, 0, 0, 0, 0]
    e.bote = bote
    e.pendientes = [true, true, false, false, false, false]
    repartirCalle(e, ['Ah', '7s', '2h'])
    e.bote = bote
    if (puestoRival > 0) { e.puesto[0] = puestoRival; e.apuestaAlta = puestoRival; e.stacks[0]! -= puestoRival; e.bote += puestoRival; e.ultimoActor = 0; e.pendientes = [false, true, false, false, false, false] }
    return e
  }

  it('los botones del jugador y los sorteos de los rivales quedan dentro del mínimo y el máximo legales', () => {
    const azar = crearAzar(11)
    let ok = 0
    for (const [bote, apuesta] of [[300, 0], [300, 100], [2000, 0], [2000, 1500], [18000, 0], [12000, 1000], [150, 0]] as const) {
      const e = estadoPostflop(bote, apuesta)
      const asiento = apuesta > 0 ? 1 : 0
      const l = accionesLegales(e, asiento)
      if (!l.subir) continue
      const posibles = subidasPosibles(e, asiento)
      expect(posibles.length).toBeGreaterThan(0)
      expect(new Set(posibles.map((p) => p.hasta)).size).toBe(posibles.length)
      for (const p of posibles) {
        expect(p.hasta).toBeGreaterThanOrEqual(l.subir.min)
        expect(p.hasta).toBeLessThanOrEqual(l.subir.max)
      }
      for (let i = 0; i < 300; i++) {
        const h = elegirSubida(e, asiento, azar)!
        expect(h).toBeGreaterThanOrEqual(l.subir.min)
        expect(h).toBeLessThanOrEqual(l.subir.max)
        ok++
      }
    }
    expect(ok).toBeGreaterThan(1000)
  })

  it('las frecuencias sorteadas se parecen a las medidas (postflop sin apuesta, bote grande)', () => {
    const e = estadoPostflop(2000, 0)
    const azar = crearAzar(5)
    const cuentas = new Map<number, number>()
    const N = 20000
    for (let i = 0; i < N; i++) { const h = elegirSubida(e, 0, azar)!; cuentas.set(h, (cuentas.get(h) ?? 0) + 1) }
    const pos = subidasPosibles(e, 0)
    const f = (id: string) => (cuentas.get(pos.find((p) => p.id === id)!.hasta) ?? 0) / N
    // En el banco: 1/3 24.8 %, 1/2 34.4 %, 3/4 23.0 %, bote 15.2 %, all-in 2.7 % (se reparten entre los que existen)
    expect(f('1/2')).toBeGreaterThan(f('bote'))
    expect(f('1/3')).toBeGreaterThan(f('bote'))
  })

  it('subir con el botón "bote" en el flop equivale a apostar el bote', () => {
    const e = estadoPostflop(2000, 0)
    expect(subidasPosibles(e, 0).find((p) => p.id === 'bote')!.hasta).toBe(2000)
    const f = estadoPostflop(2000, 1000) // el rival apostó 1000 a un bote de 2000: tras igualar el bote es 4000
    expect(subidasPosibles(f, 1).find((p) => p.id === 'bote')!.hasta).toBe(1000 + 4000)
  })
})

describe('Reparto del bote', () => {
  it('un empate divide el bote y la ficha sobrante va al primer asiento después del botón', () => {
    const e = crearMano({ jugadores: ['a', 'b', 'c', 'd', 'e', 'f'], stacks: new Array(6).fill(1000), ciegas: [0, 0, 0, 0, 0, 0] })
    repartirPrivadas(e, 0, ['2c', '3d'])
    repartirPrivadas(e, 3, ['2h', '3s'])
    e.activos = [true, false, false, true, false, false]
    e.stacks = [1000 - 101, 1000, 1000, 1000 - 100, 1000, 1000]
    e.bote = 201
    const r = repartirBote(e, ['As', 'Kd', 'Qh', 'Jc', '9d'])
    expect(r.premios[0]).toBe(101)
    expect(r.premios[3]).toBe(100)
    expect(r.premios.reduce((a, b) => a + b, 0)).toBe(201)
  })

  it('con un all-in corto hay bote lateral', () => {
    const e = crearMano({ jugadores: ['a', 'b', 'c', 'd', 'e', 'f'], stacks: new Array(6).fill(1000), ciegas: [0, 0, 0, 0, 0, 0] })
    repartirPrivadas(e, 0, ['As', 'Ad']) // gana, pero solo puso 100
    repartirPrivadas(e, 1, ['Kc', 'Kd'])
    repartirPrivadas(e, 2, ['2c', '7d'])
    e.activos = [true, true, true, false, false, false]
    e.stacks = [900, 600, 600, 1000, 1000, 1000]
    e.bote = 100 + 400 + 400
    const r = repartirBote(e, ['3h', '8s', '9c', 'Ts', '4h'])
    expect(r.premios[0]).toBe(300) // 100 de cada uno de los tres
    expect(r.premios[1]).toBe(600) // lo demás lo gana el segundo mejor
    expect(r.premios[2]).toBe(0)
  })

  it('si todos se retiran menos uno, se lleva todo sin showdown', () => {
    const e = crearMano({ jugadores: ['a', 'b', 'c', 'd', 'e', 'f'], stacks: new Array(6).fill(10000), ciegas: [50, 100, 0, 0, 0, 0] })
    e.activos = [false, true, false, false, false, false]
    const r = repartirBote(e, [])
    expect(r.showdown).toBe(false)
    expect(r.premios[1]).toBe(150)
  })
})
