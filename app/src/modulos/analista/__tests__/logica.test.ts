/**
 * Lógica pura del Analista: índice del banco, filtros, puntaje de "¿Adivinas?", selección de decisiones y estado guardado.
 */
import { describe, expect, it } from 'vitest'
import { crearRng } from '../../../motor/index.ts'
import { leerJson } from '../../../motor/__tests__/ayudas.ts'
import {
  accionMasProbable, buscarManos, clasificarCartas, coincide, describirAccion, elegirDecisiones, indexarBanco, nivelDePuntaje,
  nombreDeMano, paginar, puntosPorAccion, resumirSesion, sonidoDePuntaje, SIN_FILTROS,
  type BancoMinimo, type Decision, type Filtros, type ResultadoDecision,
} from '../logica.ts'
import { ESTADO_INICIAL, interpretarEstado, registrarSesion } from '../estado.ts'

/** Decisión de mentira con lo mínimo para probar. */
function dec(k: number, idx: number, calle: 0 | 1 | 2 | 3, asiento: number, cartas: string, prob: [number, number, number] = [0.2, 0.5, 0.3]): Decision {
  return { k, idx, asiento, calle, cartas, jugador: 'X', real: 1, prob, hastaFichas: 0, pagoFichas: 0, bb: 100, aPagarBB: 1 }
}
const F = (parcial: Partial<Filtros>): Filtros => ({ ...SIN_FILTROS, ...parcial })

describe('cartas', () => {
  it('clasifica pareja, suited, as y broadway', () => {
    expect(clasificarCartas('AhAd')).toEqual({ pareja: true, suited: false, as: true, broadway: true })
    expect(clasificarCartas('9hAh')).toEqual({ pareja: false, suited: true, as: true, broadway: false })
    expect(clasificarCartas('KsTd')).toEqual({ pareja: false, suited: false, as: false, broadway: true })
    expect(clasificarCartas('7c2d')).toEqual({ pareja: false, suited: false, as: false, broadway: false })
  })
  it('da el nombre corto de la mano con la carta alta primero', () => {
    expect(nombreDeMano('9hAh')).toBe('A9s')
    expect(nombreDeMano('Td9c')).toBe('T9o')
    expect(nombreDeMano('7c7d')).toBe('77')
  })
})

describe('filtros', () => {
  const lista = [
    dec(1, 0, 0, 5, 'AhKh'), dec(1, 3, 1, 5, 'AhKh'),
    dec(2, 0, 0, 2, '7c7d'), dec(2, 4, 2, 2, '7c7d'),
    dec(3, 1, 1, 0, '9hAh'),
    dec(4, 2, 3, 5, '2c3d'),
  ]
  it('sin filtros entran todas las manos, una fila por mano', () => {
    expect(buscarManos(lista, SIN_FILTROS).map((f) => f.decision.k)).toEqual([1, 2, 3, 4])
    expect(buscarManos(lista, SIN_FILTROS)[0]!.coinciden).toBe(2)
  })
  it('filtra por calle y la fila apunta a la decisión de esa calle', () => {
    const filas = buscarManos(lista, F({ calle: 1 }))
    expect(filas.map((f) => [f.decision.k, f.decision.idx])).toEqual([[1, 3], [3, 1]])
  })
  it('filtra por posición', () => {
    expect(buscarManos(lista, F({ posicion: 5 })).map((f) => f.decision.k)).toEqual([1, 4])
    expect(buscarManos(lista, F({ posicion: 3 }))).toEqual([])
  })
  it('las cartas marcadas se cumplen todas a la vez', () => {
    expect(buscarManos(lista, F({ cartas: ['pareja'] })).map((f) => f.decision.k)).toEqual([2])
    expect(buscarManos(lista, F({ cartas: ['suited'] })).map((f) => f.decision.k)).toEqual([1, 3])
    expect(buscarManos(lista, F({ cartas: ['suited', 'as'] })).map((f) => f.decision.k)).toEqual([1, 3])
    expect(buscarManos(lista, F({ cartas: ['pareja', 'suited'] }))).toEqual([])
  })
  it('combina calle, posición y cartas en la MISMA decisión', () => {
    // La mano 1 tiene un as suited en BTN (preflop y flop); la mano 3 lo tiene en SB.
    expect(buscarManos(lista, F({ calle: 1, posicion: 5, cartas: ['as'] })).map((f) => f.decision.k)).toEqual([1])
    expect(coincide(lista[0]!, F({ calle: 1 }))).toBe(false)
  })
  it('pagina sin salirse del rango', () => {
    const n = Array.from({ length: 23 }, (_, i) => i)
    expect(paginar(n, 0, 10)).toMatchObject({ pagina: 0, paginas: 3 })
    expect(paginar(n, 2, 10).items).toEqual([20, 21, 22])
    expect(paginar(n, 99, 10).pagina).toBe(2)
    expect(paginar([], 5, 10)).toEqual({ items: [], pagina: 0, paginas: 1 })
  })
})

describe('puntaje', () => {
  it('es 100 por la probabilidad de la élite para la acción elegida', () => {
    const p: [number, number, number] = [0.1, 0.34, 0.56]
    expect(puntosPorAccion(p, 'fold')).toBe(10)
    expect(puntosPorAccion(p, 'call')).toBe(34)
    expect(puntosPorAccion(p, 'raise')).toBe(56)
    expect(puntosPorAccion([0, 0, 1], 'raise')).toBe(100)
    expect(puntosPorAccion([Number.NaN, 0, 0], 'fold')).toBe(0)
  })
  it('separa alto (60+), medio (30-59) y bajo (menos de 30)', () => {
    expect([100, 60, 59, 30, 29, 0].map(nivelDePuntaje)).toEqual(['alto', 'alto', 'medio', 'medio', 'bajo', 'bajo'])
    expect(sonidoDePuntaje(75)).toBe('puntos_alto')
    expect(sonidoDePuntaje(45)).toBe('puntos_medio')
    expect(sonidoDePuntaje(5)).toBe('puntos_bajo')
  })
  it('encuentra la acción más probable', () => {
    expect(accionMasProbable([0.1, 0.2, 0.7])).toBe('raise')
    expect(accionMasProbable([0.6, 0.3, 0.1])).toBe('fold')
    expect(accionMasProbable([0.4, 0.4, 0.2])).toBe('fold')
  })
  it('resume la sesión', () => {
    const r = (eleccion: ResultadoDecision['eleccion'], puntos: number, real: 0 | 1 | 2, prob: [number, number, number]): ResultadoDecision =>
      ({ k: 1, idx: 0, eleccion, puntos, real, prob })
    const s = resumirSesion([r('call', 60, 1, [0.1, 0.6, 0.3]), r('fold', 10, 2, [0.1, 0.2, 0.7]), r('raise', 70, 2, [0.1, 0.2, 0.7])])
    expect(s).toEqual({ total: 140, maximo: 300, conLaMasProbable: 2, conLoReal: 2, decisiones: 3 })
  })
  it('describe la acción real sin veredicto', () => {
    expect(describirAccion(0, 0, 0, 100, true)).toBe('FOLD')
    expect(describirAccion(1, 0, 650, 100, true)).toBe('CALL 6.5 bb')
    expect(describirAccion(1, 0, 0, 100, false)).toBe('CHECK')
    expect(describirAccion(2, 2100, 2100, 100, true)).toBe('RAISE a 21 bb')
    expect(describirAccion(2, 800, 800, 100, false)).toBe('BET 8 bb')
  })
})

describe('selección de decisiones de una sesión', () => {
  // 40 manos: 30 con solo decisiones preflop y 10 con una decisión postflop.
  const todas: Decision[] = []
  for (let k = 1; k <= 30; k++) todas.push(dec(k, 0, 0, k % 6, 'AhKd'))
  for (let k = 31; k <= 40; k++) { todas.push(dec(k, 0, 0, 1, 'QhQd')); todas.push(dec(k, 5, 1 + (k % 3) as 1 | 2 | 3, 1, 'QhQd')) }

  it('elige 10 decisiones de manos distintas', () => {
    const e = elegirDecisiones(todas, 10, crearRng(1))
    expect(e).toHaveLength(10)
    expect(new Set(e.map((x) => x.k)).size).toBe(10)
  })
  it('limita las preflop (4 por defecto)', () => {
    for (let semilla = 1; semilla <= 20; semilla++) {
      const e = elegirDecisiones(todas, 10, crearRng(semilla))
      const preflop = e.filter((x) => todas.find((d) => d.k === x.k && d.idx === x.idx)!.calle === 0).length
      expect(preflop).toBeLessThanOrEqual(4)
    }
  })
  it('si no alcanzan las postflop, completa con preflop', () => {
    const pocas = todas.filter((d) => d.k <= 32)
    const e = elegirDecisiones(pocas, 10, crearRng(3))
    expect(e).toHaveLength(10)
  })
  it('con la misma semilla da la misma sesión y con otra, otra distinta', () => {
    const a = elegirDecisiones(todas, 10, crearRng(7))
    expect(elegirDecisiones(todas, 10, crearRng(7))).toEqual(a)
    expect(elegirDecisiones(todas, 10, crearRng(8))).not.toEqual(a)
  })
  it('con menos decisiones que n devuelve las que hay', () => {
    expect(elegirDecisiones(todas.slice(0, 3), 10, crearRng(1))).toHaveLength(3)
    expect(elegirDecisiones([], 10, crearRng(1))).toEqual([])
  })
})

describe('estado guardado', () => {
  it('lee lo válido y descarta lo dañado', () => {
    expect(interpretarEstado(null)).toEqual(ESTADO_INICIAL)
    expect(interpretarEstado('basura')).toEqual(ESTADO_INICIAL)
    expect(interpretarEstado({ ultimaMano: { k: 1687, d: 3 }, record: 640, sesiones: 4 })).toEqual({ ultimaMano: { k: 1687, d: 3 }, record: 640, sesiones: 4 })
    expect(interpretarEstado({ ultimaMano: { k: 'x', d: 3 }, record: -5, sesiones: 1.5 })).toEqual(ESTADO_INICIAL)
  })
  it('el récord solo sube cuando se supera', () => {
    const a = registrarSesion({ ...ESTADO_INICIAL, record: 500 }, 430)
    expect(a.nuevoRecord).toBe(false)
    expect(a.estado).toMatchObject({ record: 500, sesiones: 1 })
    const b = registrarSesion(a.estado, 612)
    expect(b.nuevoRecord).toBe(true)
    expect(b.estado).toMatchObject({ record: 612, sesiones: 2 })
  })
})

describe('con el banco real', () => {
  const banco = leerJson<BancoMinimo>('banco_manos_reales.json')
  const decisiones = indexarBanco(banco)
  it('indexa todas las decisiones', () => {
    expect(decisiones.length).toBe(banco.manos.reduce((t, m) => t + m.d.length, 0))
    expect(decisiones.every((d) => d.cartas.length === 4 && [0, 1, 2, 3].includes(d.calle) && d.asiento >= 0 && d.asiento <= 5)).toBe(true)
  })
  it('los filtros dan cifras coherentes', () => {
    const todas = buscarManos(decisiones, SIN_FILTROS)
    expect(todas.length).toBe(banco.manos.length)
    const flop = buscarManos(decisiones, F({ calle: 1 }))
    expect(flop.length).toBeGreaterThan(100)
    expect(flop.length).toBeLessThan(todas.length)
    const parejasBtn = buscarManos(decisiones, F({ posicion: 5, cartas: ['pareja'] }))
    expect(parejasBtn.length).toBeGreaterThan(0)
    expect(parejasBtn.every((f) => clasificarCartas(f.decision.cartas).pareja && f.decision.asiento === 5)).toBe(true)
  })
  it('una sesión real tiene 10 decisiones de manos distintas con probabilidades que suman 1', () => {
    const e = elegirDecisiones(decisiones, 10, crearRng(2026))
    expect(new Set(e.map((x) => x.k)).size).toBe(10)
    for (const r of e) {
      const d = decisiones.find((x) => x.k === r.k && x.idx === r.idx)!
      expect(Math.abs(d.prob[0] + d.prob[1] + d.prob[2] - 1)).toBeLessThan(0.001)
    }
  })
})
