/**
 * evaluador.ts: port exacto del evaluador de treys 0.1.8 (variante de Cactus Kev).
 *
 * Puntaje de 1 (escalera real) a 7462 (7-5-4-3-2 sin color): MENOR = mano MÁS fuerte.
 * Para 5 cartas se busca en una tabla; para 6 y 7 se evalúan todas las combinaciones de 5 y se toma el
 * menor puntaje. Las tablas se generan una vez (de forma perezosa) con el mismo procedimiento que treys.
 */
import { PRIMOS, cartaAEntero, type Carta } from './cartas.ts'

// Umbrales de treys (LookupTable.MAX_*)
export const MAX_ESCALERA_REAL = 1
export const MAX_ESCALERA_COLOR = 10
export const MAX_POKER = 166
export const MAX_FULL = 322
export const MAX_COLOR = 1599
export const MAX_ESCALERA = 1609
export const MAX_TRIO = 2467
export const MAX_DOBLE_PAR = 3325
export const MAX_PAR = 6185
export const MAX_CARTA_ALTA = 7462

/** Nombres de las clases de mano (treys 0.1.8: 0 = escalera real ... 9 = carta alta). */
export const NOMBRES_CLASE = [
  'Escalera real', 'Escalera de color', 'Póker', 'Full house', 'Color',
  'Escalera', 'Trío', 'Doble par', 'Par', 'Carta alta',
] as const

/** Producto de primos a partir de los bits de rango (para 5 rangos distintos). */
function productoPrimosDeBits(bits: number): number {
  let producto = 1
  for (let i = 0; i < 13; i++) if (bits & (1 << i)) producto *= PRIMOS[i]!
  return producto
}

/** Generador de la siguiente secuencia de bits con el mismo número de unos (hack de Gosper), igual que treys. */
function* siguienteSecuenciaDeBits(bits: number): Generator<number> {
  let t = (bits | (bits - 1)) + 1
  let siguiente = t | ((Math.floor((t & -t) / (bits & -bits)) >> 1) - 1)
  yield siguiente
  for (;;) {
    t = (siguiente | (siguiente - 1)) + 1
    siguiente = t | ((Math.floor((t & -t) / (siguiente & -siguiente)) >> 1) - 1)
    yield siguiente
  }
}

interface Tablas {
  /** producto de primos de los rangos -> puntaje, cuando las 5 cartas son del mismo palo */
  color: Map<number, number>
  /** producto de primos de las 5 cartas -> puntaje, cuando NO son del mismo palo */
  sinColor: Map<number, number>
}

function generarTablas(): Tablas {
  const color = new Map<number, number>()
  const sinColor = new Map<number, number>()

  const escalerasDeColor = [7936, 3968, 1984, 992, 496, 248, 124, 62, 31, 4111]
  const colores: number[] = []
  const gen = siguienteSecuenciaDeBits(0b11111)
  for (let i = 0; i < 1277 + escalerasDeColor.length - 1; i++) {
    const f = gen.next().value as number
    if (!escalerasDeColor.includes(f)) colores.push(f)
  }
  colores.reverse()

  let rango = 1
  for (const sf of escalerasDeColor) color.set(productoPrimosDeBits(sf), rango++)
  rango = MAX_FULL + 1
  for (const f of colores) color.set(productoPrimosDeBits(f), rango++)

  // Escaleras y cartas altas (5 rangos distintos, sin color) reutilizan las mismas secuencias de bits
  rango = MAX_COLOR + 1
  for (const s of escalerasDeColor) sinColor.set(productoPrimosDeBits(s), rango++)
  rango = MAX_PAR + 1
  for (const h of colores) sinColor.set(productoPrimosDeBits(h), rango++)

  const atras = Array.from({ length: 13 }, (_, i) => 12 - i)
  const sin = (lista: number[], x: number) => lista.filter((v) => v !== x)
  const combinaciones = (lista: number[], k: number): number[][] => {
    const salida: number[][] = []
    const actual: number[] = []
    const rec = (inicio: number) => {
      if (actual.length === k) { salida.push([...actual]); return }
      for (let i = inicio; i < lista.length; i++) { actual.push(lista[i]!); rec(i + 1); actual.pop() }
    }
    rec(0)
    return salida
  }
  const P = PRIMOS

  // 1) Póker
  rango = MAX_ESCALERA_COLOR + 1
  for (const i of atras) for (const k of sin(atras, i)) sinColor.set(P[i]! ** 4 * P[k]!, rango++)
  // 2) Full house
  rango = MAX_POKER + 1
  for (const i of atras) for (const pr of sin(atras, i)) sinColor.set(P[i]! ** 3 * P[pr]! ** 2, rango++)
  // 3) Trío
  rango = MAX_ESCALERA + 1
  for (const r of atras) {
    for (const [c1, c2] of combinaciones(sin(atras, r), 2) as [number, number][]) {
      sinColor.set(P[r]! ** 3 * P[c1]! * P[c2]!, rango++)
    }
  }
  // 4) Doble par
  rango = MAX_TRIO + 1
  for (const [par1, par2] of combinaciones(atras, 2) as [number, number][]) {
    for (const k of sin(sin(atras, par1), par2)) sinColor.set(P[par1]! ** 2 * P[par2]! ** 2 * P[k]!, rango++)
  }
  // 5) Par
  rango = MAX_DOBLE_PAR + 1
  for (const par of atras) {
    for (const [k1, k2, k3] of combinaciones(sin(atras, par), 3) as [number, number, number][]) {
      sinColor.set(P[par]! ** 2 * P[k1]! * P[k2]! * P[k3]!, rango++)
    }
  }
  return { color, sinColor }
}

let tablas: Tablas | null = null
function obtenerTablas(): Tablas {
  return (tablas ??= generarTablas())
}

/** Puntaje de 5 cartas (enteros treys). */
function evaluar5(c0: number, c1: number, c2: number, c3: number, c4: number, t: Tablas): number {
  if (c0 & c1 & c2 & c3 & c4 & 0xf000) {
    const bits = (c0 | c1 | c2 | c3 | c4) >> 16
    return t.color.get(productoPrimosDeBits(bits))!
  }
  const producto = (c0 & 0xff) * (c1 & 0xff) * (c2 & 0xff) * (c3 & 0xff) * (c4 & 0xff)
  return t.sinColor.get(producto)!
}

// Índices de las combinaciones de 5 entre 6 y entre 7 cartas
function indicesDeCombinaciones(n: number): number[][] {
  const salida: number[][] = []
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++)
    for (let d = c + 1; d < n; d++) for (let e = d + 1; e < n; e++) salida.push([a, b, c, d, e])
  return salida
}
const COMBOS: Record<number, number[][]> = { 6: indicesDeCombinaciones(6), 7: indicesDeCombinaciones(7) }

/**
 * Puntaje de 5, 6 o 7 cartas en enteros treys (equivale a Evaluator.evaluate(mano, mesa) con mano + mesa).
 * Menor = más fuerte. El orden de las cartas no importa.
 */
export function evaluarEnteros(cartas: ArrayLike<number>): number {
  const t = obtenerTablas()
  const n = cartas.length
  if (n === 5) return evaluar5(cartas[0]!, cartas[1]!, cartas[2]!, cartas[3]!, cartas[4]!, t)
  const combos = COMBOS[n]
  if (!combos) throw new Error(`El evaluador necesita 5, 6 o 7 cartas (recibió ${n})`)
  let minimo = MAX_CARTA_ALTA
  for (const [a, b, c, d, e] of combos as [number, number, number, number, number][]) {
    const puntaje = evaluar5(cartas[a]!, cartas[b]!, cartas[c]!, cartas[d]!, cartas[e]!, t)
    if (puntaje < minimo) minimo = puntaje
  }
  return minimo
}

/** Puntaje de las cartas privadas + las de la mesa (en texto). Equivale a evaluator.evaluate(mesa, mano). */
export function evaluar(mano: readonly Carta[], mesa: readonly Carta[]): number {
  return evaluarEnteros([...mano, ...mesa].map(cartaAEntero))
}

/**
 * Clase de la mano a partir del puntaje, exactamente como treys 0.1.8:
 * 0 = escalera real, 1 = escalera de color, 2 = póker, 3 = full, 4 = color, 5 = escalera,
 * 6 = trío, 7 = doble par, 8 = par, 9 = carta alta.
 * (Preflop el Notebook 10 usa 10 por convención: eso se asigna en variables.ts, no aquí.)
 */
export function claseDePuntaje(puntaje: number): number {
  if (puntaje >= 0 && puntaje <= MAX_ESCALERA_REAL) return 0
  if (puntaje <= MAX_ESCALERA_COLOR) return 1
  if (puntaje <= MAX_POKER) return 2
  if (puntaje <= MAX_FULL) return 3
  if (puntaje <= MAX_COLOR) return 4
  if (puntaje <= MAX_ESCALERA) return 5
  if (puntaje <= MAX_TRIO) return 6
  if (puntaje <= MAX_DOBLE_PAR) return 7
  if (puntaje <= MAX_PAR) return 8
  if (puntaje <= MAX_CARTA_ALTA) return 9
  throw new Error('Puntaje inválido, no se puede calcular la clase')
}
