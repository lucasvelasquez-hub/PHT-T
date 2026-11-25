/**
 * equidad.ts: probabilidad de ganar (equity) contra manos aleatorias.
 *
 *  - PREFLOP: búsqueda directa en `equity_preflop_169.json` (la tabla EXACTA que usó el Modelo 4 como
 *    variable `c_eq_pre`). Clave: tabla["J9s"]["2"], con rivales = min(activos − 1, 4) y mínimo 1.
 *  - POSTFLOP: Monte Carlo con el mismo método del Notebook 12 (calcular_equity_monte_carlo):
 *    se quitan de la baraja las cartas conocidas, a cada rival se le reparten 2 cartas al azar, se completa
 *    la mesa hasta 5 cartas y se compara con el evaluador (menor puntaje gana).
 *    Equity = (victorias + empates / 2) / simulaciones. Los rivales no se retiran ni se descartan manos.
 *
 * El generador de números aleatorios es propio y con semilla, para poder repetir resultados en pruebas.
 */
import { BARAJA_ENTEROS, cartaAEntero, claseDeMano, type Carta } from './cartas.ts'
import { evaluarEnteros } from './evaluador.ts'

/** Simulaciones por defecto en producción (el entrenamiento usó 150; con 1,000 la estimación es más estable). */
export const SIMULACIONES_POR_DEFECTO = 1000
/** Máximo de rivales que consideró el entrenamiento. */
export const MAX_RIVALES = 4

// --- Generador aleatorio con semilla -----------------------------------------------------------------------

/** Generador aleatorio: cada llamada devuelve un número en [0, 1). */
export type Rng = () => number

/** Generador sfc32 inicializado con splitmix32 a partir de una semilla entera. Rápido y de buena calidad. */
export function crearRng(semilla: number): Rng {
  let s = semilla >>> 0
  const splitmix = () => {
    s = (s + 0x9e3779b9) >>> 0
    let z = s
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b)
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35)
    return (z ^ (z >>> 16)) >>> 0
  }
  let a = splitmix()
  let b = splitmix()
  let c = splitmix()
  let d = splitmix()
  return () => {
    const t = (((a + b) >>> 0) + d) >>> 0
    d = (d + 1) >>> 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) >>> 0
    c = ((c << 21) | (c >>> 11)) >>> 0
    c = (c + t) >>> 0
    return t / 4294967296
  }
}

/** Generador con semilla tomada del sistema (distinta en cada sesión). */
export function crearRngAleatorio(): Rng {
  const buf = new Uint32Array(1)
  globalThis.crypto.getRandomValues(buf)
  return crearRng(buf[0]!)
}

let rngGlobal: Rng | null = null
function rngPorDefecto(): Rng {
  return (rngGlobal ??= crearRngAleatorio())
}

// --- Tabla preflop ------------------------------------------------------------------------------------------

/** Contenido de equity_preflop_169.json (solo lo que se usa). */
export interface TablaPreflop {
  tabla: Record<string, Record<string, number>>
}

/** Rivales que usa el modelo: min(activos − 1, 4), con mínimo 1. */
export function rivalesDeActivos(nActivos: number): number {
  return Math.max(1, Math.min(nActivos - 1, MAX_RIVALES))
}

/**
 * Equity preflop de la mano inicial contra `numRivales` (se limita a 1..4) rivales aleatorios.
 * Es una lectura de tabla: instantánea y exacta respecto al entrenamiento.
 */
export function equityPreflop(tabla: TablaPreflop, carta1: Carta, carta2: Carta, numRivales: number): number {
  const clase = claseDeMano(carta1, carta2)
  const r = String(Math.max(1, Math.min(numRivales, MAX_RIVALES)))
  const fila = tabla.tabla[clase]
  const valor = fila?.[r]
  if (valor === undefined) throw new Error(`La tabla preflop no tiene la clase "${clase}" con ${r} rivales`)
  return valor
}

// --- Monte Carlo postflop -----------------------------------------------------------------------------------

export interface ResultadoEquity {
  /** Probabilidad de ganar (empates cuentan la mitad), entre 0 y 1. */
  equity: number
  victorias: number
  empates: number
  derrotas: number
  simulaciones: number
  /** Error estándar de la estimación: sqrt(varianza / simulaciones), con x ∈ {0, 0.5, 1}. */
  errorEstandar: number
}

export interface OpcionesEquity {
  /** Simulaciones (por defecto 1,000). */
  simulaciones?: number
  /** Generador aleatorio (por defecto uno con semilla del sistema). */
  rng?: Rng
  /** Tope de rivales; el entrenamiento usó 4. Con `Infinity` no se limita. */
  maxRivales?: number
}

/**
 * Equity Monte Carlo de `misCartas` (2) con la `mesa` conocida (0 a 5 cartas) contra `numRivales` manos
 * aleatorias. Mismo método que el Notebook 12; el número de rivales se limita a 1..4 como en el entrenamiento.
 */
export function simularEquity(
  misCartas: readonly Carta[],
  mesa: readonly Carta[],
  numRivales: number,
  opciones: OpcionesEquity = {},
): ResultadoEquity {
  const simulaciones = opciones.simulaciones ?? SIMULACIONES_POR_DEFECTO
  const rng = opciones.rng ?? rngPorDefecto()
  const rivales = Math.max(1, Math.min(numRivales, opciones.maxRivales ?? MAX_RIVALES))

  const mias = misCartas.map(cartaAEntero)
  const tablero = mesa.map(cartaAEntero)
  const usadas = new Set([...mias, ...tablero])
  const disponibles = BARAJA_ENTEROS.filter((c) => !usadas.has(c))
  const faltan = 5 - tablero.length
  const necesarias = faltan + 2 * rivales
  if (necesarias > disponibles.length) throw new Error('No quedan cartas suficientes en la baraja')

  // Buffers reutilizados: [2 cartas del jugador, 5 de la mesa]
  const bufMio = new Array<number>(7)
  const bufRival = new Array<number>(7)
  bufMio[0] = mias[0]!
  bufMio[1] = mias[1]!
  for (let i = 0; i < tablero.length; i++) { bufMio[2 + i] = tablero[i]!; bufRival[2 + i] = tablero[i]! }

  let victorias = 0
  let empates = 0
  let derrotas = 0
  const n = disponibles.length
  for (let s = 0; s < simulaciones; s++) {
    // Muestra sin repetición: barajado parcial de Fisher-Yates (las cartas elegidas quedan al inicio)
    for (let i = 0; i < necesarias; i++) {
      const j = i + Math.floor(rng() * (n - i))
      const tmp = disponibles[i]!
      disponibles[i] = disponibles[j]!
      disponibles[j] = tmp
    }
    for (let k = 0; k < faltan; k++) {
      const carta = disponibles[k]!
      bufMio[2 + tablero.length + k] = carta
      bufRival[2 + tablero.length + k] = carta
    }
    const miPuntaje = evaluarEnteros(bufMio)
    let mejorRival = Infinity
    for (let r = 0; r < rivales; r++) {
      bufRival[0] = disponibles[faltan + 2 * r]!
      bufRival[1] = disponibles[faltan + 2 * r + 1]!
      const p = evaluarEnteros(bufRival)
      if (p < mejorRival) mejorRival = p
    }
    if (miPuntaje < mejorRival) victorias++
    else if (miPuntaje === mejorRival) empates++
    else derrotas++
  }
  const equity = (victorias + 0.5 * empates) / simulaciones
  const varianza = (victorias + 0.25 * empates) / simulaciones - equity * equity
  return {
    equity, victorias, empates, derrotas, simulaciones,
    errorEstandar: Math.sqrt(Math.max(varianza, 0) / simulaciones),
  }
}

/** Atajo: solo el número de equity (0 a 1) del Monte Carlo. */
export function equityMonteCarlo(
  misCartas: readonly Carta[],
  mesa: readonly Carta[],
  numRivales: number,
  opciones: OpcionesEquity = {},
): number {
  return simularEquity(misCartas, mesa, numRivales, opciones).equity
}

/**
 * Equity como la usa el modelo: preflop (mesa vacía) lee la tabla; postflop corre Monte Carlo.
 * `numRivales` = jugadores activos − 1 (se limita a 1..4).
 */
export function equityDeSituacion(
  tabla: TablaPreflop,
  misCartas: readonly Carta[],
  mesa: readonly Carta[],
  numRivales: number,
  opciones: OpcionesEquity = {},
): number {
  if (mesa.length === 0) return equityPreflop(tabla, misCartas[0]!, misCartas[1]!, numRivales)
  return equityMonteCarlo(misCartas, mesa, numRivales, opciones)
}
