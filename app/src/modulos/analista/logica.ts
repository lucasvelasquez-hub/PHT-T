/**
 * logica.ts: la parte pura del Analista (sin React ni navegador), para poder probarla con Vitest.
 *
 *  - Indexa el banco de manos reales en una lista plana de decisiones.
 *  - Filtra por calle, posición del jugador y cartas.
 *  - Calcula el puntaje de "¿Adivinas qué hizo la élite?" y elige las decisiones de una sesión.
 */
import { fmtBB } from '../../ui/datos/formato.ts'

// --- Tipos mínimos del banco (BancoManos del frente Juego los cumple) ------------------------------------------------
export interface ManoMinima {
  k: number
  n: string[]
  /** Ciegas por asiento (la mayor es la ciega grande). */
  bl: number[]
  h: string[]
  /** [asiento, código 0/1/2, hasta, pago, calle, bote_después] */
  a: number[][]
  /** [índice en `a`, acción real, 47 variables, 3 probabilidades] */
  d: [number, number, number[], number[]][]
}
export interface BancoMinimo { meta?: { orden_variables: string[] }; manos: ManoMinima[] }

export type Calle = 0 | 1 | 2 | 3
export type CodigoAccion = 0 | 1 | 2
export type AccionJuego = 'fold' | 'call' | 'raise'

export const NOMBRES_CALLE = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'] as const
/** Posición por asiento: el asiento 0 es la ciega pequeña y el último es el botón (6 jugadores). */
export const POSICIONES = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'] as const

/** Una decisión del banco, con lo necesario para buscarla y puntuarla. */
export interface Decision {
  k: number
  /** Índice de la acción en la mano (el `d` de la mesa de revisión). */
  idx: number
  asiento: number
  calle: Calle
  /** Cartas del jugador, por ejemplo "9hAh". */
  cartas: string
  /** Nombre del jugador en ese asiento (Pluribus o un humano). */
  jugador: string
  /** Lo que hizo de verdad: 0 fold, 1 check/call, 2 bet/raise. */
  real: CodigoAccion
  /** Probabilidades de la red de élite: [fold, check/call, bet/raise]. */
  prob: [number, number, number]
  /** Total al que subió o apostó, en fichas (solo si real = 2). */
  hastaFichas: number
  /** Fichas que puso con esa acción. */
  pagoFichas: number
  /** Valor de la ciega grande, en fichas. */
  bb: number
  /** Ciegas grandes que había que pagar en esa decisión (0 = se podía pasar). */
  aPagarBB: number
}

export function indexarBanco(banco: BancoMinimo): Decision[] {
  const salida: Decision[] = []
  const iAPagar = banco.meta?.orden_variables.indexOf('to_call_bb') ?? 2
  for (const m of banco.manos) {
    const bb = Math.max(1, ...m.bl)
    for (const d of m.d) {
      const a = m.a[d[0]]
      if (!a) continue
      const asiento = a[0]!
      salida.push({
        k: m.k,
        idx: d[0],
        asiento,
        calle: a[4] as Calle,
        cartas: m.h[asiento] ?? '',
        jugador: m.n[asiento] ?? `Asiento ${asiento + 1}`,
        real: d[1] as CodigoAccion,
        prob: [d[3][0]!, d[3][1]!, d[3][2]!],
        hastaFichas: a[2]!,
        pagoFichas: a[3]!,
        bb,
        aPagarBB: d[2][iAPagar >= 0 ? iAPagar : 2] ?? 0,
      })
    }
  }
  return salida
}

// --- Cartas ---------------------------------------------------------------------------------------------------------
const ORDEN_RANGOS = '23456789TJQKA'

export interface ClaseCartas {
  pareja: boolean
  suited: boolean
  /** Al menos un as. */
  as: boolean
  /** Las dos cartas son T o más. */
  broadway: boolean
}

/** Clasifica dos cartas de la forma "9hAh". */
export function clasificarCartas(cartas: string): ClaseCartas {
  const r1 = cartas[0] ?? '', p1 = cartas[1] ?? '', r2 = cartas[2] ?? '', p2 = cartas[3] ?? ''
  const alto = (r: string) => ORDEN_RANGOS.indexOf(r) >= ORDEN_RANGOS.indexOf('T')
  return {
    pareja: r1 !== '' && r1 === r2,
    suited: p1 !== '' && p1 === p2,
    as: r1 === 'A' || r2 === 'A',
    broadway: alto(r1) && alto(r2),
  }
}

/** Nombre corto de la mano: "AKs", "77", "T9o". */
export function nombreDeMano(cartas: string): string {
  const r1 = cartas[0] ?? '', r2 = cartas[2] ?? ''
  const [a, b] = ORDEN_RANGOS.indexOf(r1) >= ORDEN_RANGOS.indexOf(r2) ? [r1, r2] : [r2, r1]
  if (a === b) return `${a}${b}`
  return `${a}${b}${cartas[1] === cartas[3] ? 's' : 'o'}`
}

// --- Filtros --------------------------------------------------------------------------------------------------------
export type FiltroCarta = keyof ClaseCartas

export const FILTROS_CARTAS: ReadonlyArray<{ id: FiltroCarta; nombre: string }> = [
  { id: 'pareja', nombre: 'Pareja' },
  { id: 'suited', nombre: 'Suited' },
  { id: 'as', nombre: 'A en mano' },
  { id: 'broadway', nombre: 'Broadway' },
]

export interface Filtros {
  /** null = todas las calles. */
  calle: Calle | null
  /** Asiento del jugador (0 SB … 5 BTN); null = cualquiera. */
  posicion: number | null
  /** Todas las marcadas tienen que cumplirse. */
  cartas: FiltroCarta[]
}

export const SIN_FILTROS: Filtros = { calle: null, posicion: null, cartas: [] }

export function hayFiltros(f: Filtros): boolean {
  return f.calle !== null || f.posicion !== null || f.cartas.length > 0
}

export function coincide(d: Decision, f: Filtros): boolean {
  if (f.calle !== null && d.calle !== f.calle) return false
  if (f.posicion !== null && d.asiento !== f.posicion) return false
  if (f.cartas.length > 0) {
    const c = clasificarCartas(d.cartas)
    if (!f.cartas.every((x) => c[x])) return false
  }
  return true
}

/** Una fila del buscador: una mano, con la primera decisión suya que cumple los filtros. */
export interface FilaMano {
  decision: Decision
  /** Cuántas decisiones de esa mano cumplen los filtros. */
  coinciden: number
}

/** Manos con al menos una decisión que cumple TODOS los filtros a la vez, en el orden del banco. */
export function buscarManos(decisiones: readonly Decision[], f: Filtros): FilaMano[] {
  const filas: FilaMano[] = []
  let actual: FilaMano | null = null
  for (const d of decisiones) {
    if (actual && actual.decision.k !== d.k) actual = null
    if (!coincide(d, f)) continue
    if (actual) { actual.coinciden++; continue }
    actual = { decision: d, coinciden: 1 }
    filas.push(actual)
  }
  return filas
}

/** Trozo de una lista para la página `pagina` (0 = la primera). */
export function paginar<T>(items: readonly T[], pagina: number, porPagina: number): { items: T[]; pagina: number; paginas: number } {
  const paginas = Math.max(1, Math.ceil(items.length / porPagina))
  const p = Math.min(Math.max(0, Math.floor(pagina)), paginas - 1)
  return { items: items.slice(p * porPagina, (p + 1) * porPagina), pagina: p, paginas }
}

// --- Acción real ----------------------------------------------------------------------------------------------------
/** "FOLD", "CHECK", "CALL 6.5 bb", "BET 8 bb", "RAISE a 21 bb". */
export function describirAccion(real: CodigoAccion, hastaFichas: number, pagoFichas: number, bb: number, hayQuePagar: boolean): string {
  if (real === 0) return 'FOLD'
  if (real === 1) return hayQuePagar ? `CALL ${fmtBB(pagoFichas / bb)} bb` : 'CHECK'
  return hayQuePagar ? `RAISE a ${fmtBB(hastaFichas / bb)} bb` : `BET ${fmtBB(hastaFichas / bb)} bb`
}

const ACCION_A_INDICE: Record<AccionJuego, CodigoAccion> = { fold: 0, call: 1, raise: 2 }
export const indiceDeAccion = (a: AccionJuego): CodigoAccion => ACCION_A_INDICE[a]

// --- Puntaje de "¿Adivinas?" ---------------------------------------------------------------------------------------
export const PUNTOS_MAXIMOS_DECISION = 100
export const DECISIONES_POR_SESION = 10

/** 100 × la probabilidad de la élite para la acción elegida, redondeado. */
export function puntosPorAccion(prob: readonly [number, number, number], accion: AccionJuego): number {
  const p = prob[ACCION_A_INDICE[accion]]
  const v = Number.isFinite(p) ? p : 0
  return Math.round(Math.min(1, Math.max(0, v)) * PUNTOS_MAXIMOS_DECISION)
}

export type NivelPuntaje = 'alto' | 'medio' | 'bajo'

/** 60 o más: alto; de 30 a 59: medio; menos de 30: bajo. */
export function nivelDePuntaje(puntos: number): NivelPuntaje {
  return puntos >= 60 ? 'alto' : puntos >= 30 ? 'medio' : 'bajo'
}

export function sonidoDePuntaje(puntos: number): 'puntos_alto' | 'puntos_medio' | 'puntos_bajo' {
  return `puntos_${nivelDePuntaje(puntos)}`
}

/** La acción que la élite elige con más frecuencia (en empate, la primera en fold, call, raise). */
export function accionMasProbable(prob: readonly [number, number, number]): AccionJuego {
  const orden: AccionJuego[] = ['fold', 'call', 'raise']
  let mejor = 0
  for (let i = 1; i < 3; i++) if (prob[i]! > prob[mejor]!) mejor = i
  return orden[mejor]!
}

// --- Elección de las decisiones de una sesión ----------------------------------------------------------------------
export interface Referencia { k: number; idx: number }

export interface OpcionesSesion {
  /** Máximo de decisiones preflop (casi 7 de cada 10 del banco lo son). */
  maxPreflop?: number
}

/**
 * Elige `n` decisiones al azar, de manos distintas. Como el banco es sobre todo preflop, se limita cuántas
 * preflop entran (4 por defecto); si no alcanzan las postflop, se completa con preflop.
 */
export function elegirDecisiones(
  decisiones: readonly Decision[],
  n: number,
  azar: () => number,
  { maxPreflop = 4 }: OpcionesSesion = {},
): Referencia[] {
  // Barajar una copia (Fisher-Yates) y recorrerla tomando la primera decisión de cada mano.
  const copia = [...decisiones]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j]!, copia[i]!]
  }
  const manos = new Set<number>()
  const elegidas: Decision[] = []
  const sobrantes: Decision[] = []
  let preflop = 0
  for (const d of copia) {
    if (elegidas.length >= n) break
    if (manos.has(d.k)) continue
    if (d.calle === 0 && preflop >= maxPreflop) { sobrantes.push(d); continue }
    manos.add(d.k)
    elegidas.push(d)
    if (d.calle === 0) preflop++
  }
  for (const d of sobrantes) {
    if (elegidas.length >= n) break
    if (manos.has(d.k)) continue
    manos.add(d.k)
    elegidas.push(d)
  }
  // El orden final también se baraja para que las preflop no queden juntas al principio.
  for (let i = elegidas.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[elegidas[i], elegidas[j]] = [elegidas[j]!, elegidas[i]!]
  }
  return elegidas.map((d) => ({ k: d.k, idx: d.idx }))
}

// --- Resumen de la sesión -------------------------------------------------------------------------------------------
export interface ResultadoDecision extends Referencia {
  eleccion: AccionJuego
  puntos: number
  /** Lo que hizo de verdad el jugador. */
  real: CodigoAccion
  /** Probabilidades de la élite en esa decisión. */
  prob: [number, number, number]
}

export interface ResumenSesion {
  total: number
  maximo: number
  /** Veces que la elección fue la acción que la élite elige más a menudo. */
  conLaMasProbable: number
  /** Veces que la elección coincidió con lo que hizo de verdad el jugador. */
  conLoReal: number
  decisiones: number
}

export function resumirSesion(resultados: readonly ResultadoDecision[]): ResumenSesion {
  let total = 0, conLaMasProbable = 0, conLoReal = 0
  for (const r of resultados) {
    total += r.puntos
    if (r.eleccion === accionMasProbable(r.prob)) conLaMasProbable++
    if (indiceDeAccion(r.eleccion) === r.real) conLoReal++
  }
  return { total, maximo: resultados.length * PUNTOS_MAXIMOS_DECISION, conLaMasProbable, conLoReal, decisiones: resultados.length }
}
