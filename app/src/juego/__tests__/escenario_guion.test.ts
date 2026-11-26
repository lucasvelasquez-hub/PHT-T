/**
 * Pruebas de las dos formas especiales de arrancar una mano: desde un estado dado (casos del Instructor)
 * y con un guion fijo (mano guiada de la bienvenida).
 */
import { describe, expect, it } from 'vitest'
import {
  aplicarAccion, crearMano, crearServicio, repartirCalle, repartirPrivadas, type EstadoMano, type Ort,
} from '../../motor/index.ts'
import { leerBytes, leerJson } from '../../motor/__tests__/ayudas.ts'
import { analistaDeServicio } from '../analista.ts'
import { detenerTrasDecision, lecturaDeContexto } from '../conductor.ts'
import { GUION_PRACTICA } from '../guionPractica.ts'
import { Partida, jugarHastaElFinal } from '../partida.ts'
import type { EscenarioInicial } from '../tipos.ts'

const analista = analistaDeServicio(
  crearServicio({
    ort: async () => (await import('onnxruntime-web')) as unknown as Ort,
    json: async (n) => leerJson(n),
    bytes: async (n) => leerBytes(n),
    proveedores: ['wasm'],
  }),
)

/** Flop con el héroe en el botón (asiento 5 del motor) frente a una apuesta de la ciega pequeña. */
function escenarioFlop(): EscenarioInicial {
  const e: EstadoMano = crearMano({ jugadores: ['a', 'b', 'c', 'd', 'e', 'f'], stacks: new Array(6).fill(10000), ciegas: [50, 100, 0, 0, 0, 0] })
  for (const a of [2, 3, 4]) aplicarAccion(e, { asiento: a, tipo: 'f' })
  aplicarAccion(e, { asiento: 5, tipo: 'cbr', hasta: 250 })
  aplicarAccion(e, { asiento: 0, tipo: 'cc' })
  aplicarAccion(e, { asiento: 1, tipo: 'f' })
  repartirCalle(e, ['Qc', '7d', '2s'])
  aplicarAccion(e, { asiento: 0, tipo: 'cbr', hasta: 400 })
  return { estado: e, asientoHeroe: 5, cartasHeroe: ['Ah', 'Qh'], tablero: ['Qc', '7d', '2s'] }
}

describe('Arrancar desde un EscenarioInicial', () => {
  it('conserva las cartas, el bote y el turno del héroe, y la mano llega al final', async () => {
    const esc = escenarioFlop()
    const p = new Partida({ semilla: 9, boton: 0, escenarioInicial: esc })
    expect(p.heroe).toBe(5)
    expect(p.turno()).toBe(5)
    expect(p.estado.cartasPrivadas[5]).toEqual(['Ah', 'Qh'])
    expect(p.estado.tablero).toEqual(['Qc', '7d', '2s'])
    expect(p.tablero.slice(0, 3)).toEqual(['Qc', '7d', '2s'])
    expect(p.tablero).toHaveLength(5)
    const todas = [...p.tablero, ...Array.from({ length: 6 }, (_, s) => p.estado.cartasPrivadas[s]!).flat()]
    expect(new Set(todas).size).toBe(todas.length)
    expect(esc.estado.cartasPrivadas[1]).toBeNull() // el estado original no se toca
    const r = await jugarHastaElFinal(p, analista, (x) => ({ asiento: x.heroe, tipo: 'cc' }))
    expect(p.estado.stacks.reduce((a, b) => a + b, 0)).toBe(60000)
    expect(r.historial.acciones[0]!.asiento).toBe(0) // el héroe siempre es el asiento 0 de la mesa
  })

  it('rechaza un escenario cuyo tablero no coincide con el estado', () => {
    const esc = escenarioFlop()
    expect(() => new Partida({ semilla: 1, boton: 0, escenarioInicial: { ...esc, tablero: ['Ah', 'Kd', '2c'] } })).toThrow(/incoherente/)
  })

  it('cualquier asiento puede ser el héroe', () => {
    const e = crearMano({ jugadores: ['a', 'b', 'c', 'd', 'e', 'f'], stacks: new Array(6).fill(10000), ciegas: [50, 100, 0, 0, 0, 0] })
    repartirPrivadas(e, 1, ['As', 'Ks'])
    const p = new Partida({ semilla: 3, boton: 0, escenarioInicial: { estado: e, asientoHeroe: 1, cartasHeroe: ['As', 'Ks'], tablero: [] } })
    expect(p.fisicoDe(1)).toBe(0)
    expect(p.posicionHeroe).toBe('BB')
    expect(p.turno()).toBe(2)
  })
})

describe('Mano guiada', () => {
  it('el guion es legal de principio a fin, llega al showdown y el jugador gana con pareja de reinas', async () => {
    const p = new Partida({ semilla: 2026, boton: GUION_PRACTICA.boton, guion: GUION_PRACTICA })
    expect(p.posicionHeroe).toBe('BTN')
    const r = await jugarHastaElFinal(p, analista, (x) => {
      const paso = x.pasoDelGuion()
      expect(paso).not.toBeNull()
      return x.accionDePaso(paso!, x.heroe)!
    })
    expect(r.historial.acciones).toHaveLength(GUION_PRACTICA.acciones.length)
    expect(r.showdown).toBe(true)
    expect(r.ganadores).toEqual([0])
    expect(r.netoBB).toBeCloseTo(17.5, 9)
    expect(r.nombreMano).toBe('Par')
    expect(r.cartas[0]).toEqual(['Ah', 'Qh'])
    expect(r.cartas[5]).toEqual(['Kc', 'Jc'])
  })
})

describe('Props opcionales: continuar y soloContexto', () => {
  it('detenerTrasDecision solo detiene con escenarioInicial y continuar: false', () => {
    const esc = escenarioFlop()
    expect(detenerTrasDecision(false, esc)).toBe(true)
    expect(detenerTrasDecision(true, esc)).toBe(false)
    expect(detenerTrasDecision(undefined, esc)).toBe(false)
    expect(detenerTrasDecision(false, undefined)).toBe(false)
  })

  it('con continuar: false la decisión del héroe se registra y no actúa ningún rival', async () => {
    const p = new Partida({ semilla: 9, boton: 0, escenarioInicial: escenarioFlop() })
    const analisis = await p.analizarHeroe(analista)
    const accion = { asiento: p.heroe, tipo: 'cc' as const }
    const decision = p.decisionHeroe(accion, analisis)
    p.aplicar(accion, analisis)
    expect(decision.accion).toBe('cc')
    expect(decision.calle).toBe(1)
    expect(decision.lectura.elite.fold + decision.lectura.elite.checkCall + decision.lectura.elite.betRaise).toBeCloseTo(1, 5)
    // El conductor se detiene aquí: solo hay una acción en el historial y la mano sigue sin terminar
    expect(detenerTrasDecision(false, escenarioFlop())).toBe(true)
    expect(p.historial).toHaveLength(1)
    expect(p.fase()).not.toBe('terminada')
  })

  it('lecturaDeContexto entrega la lectura del héroe sin tocar la mesa', async () => {
    const p = new Partida({ semilla: 9, boton: 0, escenarioInicial: escenarioFlop() })
    const antes = JSON.stringify(p.estado)
    const c = await lecturaDeContexto(p, analista)
    expect(c).not.toBeNull()
    expect(c!.lectura.equityPct).toBeGreaterThan(0)
    expect(c!.lectura.equityPct).toBeLessThanOrEqual(100)
    expect(c!.lectura.equityMinimaPct).not.toBeNull() // hay una apuesta que pagar
    expect(c!.lectura.codigo).toMatch(/_|sin_apuesta/)
    const { fold, checkCall, betRaise } = c!.lectura.elite
    expect(fold + checkCall + betRaise).toBeCloseTo(1, 5)
    expect(JSON.stringify(p.estado)).toBe(antes)
    expect(p.historial).toHaveLength(0)
    // Misma semilla, misma lectura
    const q = new Partida({ semilla: 9, boton: 0, escenarioInicial: escenarioFlop() })
    expect((await lecturaDeContexto(q, analista))!.lectura).toEqual(c!.lectura)
  })

  it('lecturaDeContexto devuelve null si no le toca al héroe', async () => {
    const e = crearMano({ jugadores: ['a', 'b', 'c', 'd', 'e', 'f'], stacks: new Array(6).fill(10000), ciegas: [50, 100, 0, 0, 0, 0] })
    repartirPrivadas(e, 1, ['As', 'Ks'])
    const p = new Partida({ semilla: 3, boton: 0, escenarioInicial: { estado: e, asientoHeroe: 1, cartasHeroe: ['As', 'Ks'], tablero: [] } })
    expect(await lecturaDeContexto(p, analista)).toBeNull()
  })
})
