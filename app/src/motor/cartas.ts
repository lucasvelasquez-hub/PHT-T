/**
 * cartas.ts: cartas como texto ("As", "Td") y como entero compatible con treys.
 *
 * Una carta en texto son 2 caracteres: rango (23456789TJQKA) + palo (s, h, d, c).
 * Un entero treys (Card.new) usa 32 bits:
 *
 *     xxxbbbbb bbbbbbbb cdhsrrrr xxpppppp
 *
 *   p = primo del rango (2 para el 2, 3 para el 3, ..., 41 para el As)
 *   r = rango 0..12 (2 = 0, ..., As = 12)
 *   cdhs = palo en 4 bits (s = 1, h = 2, d = 4, c = 8), guardado en los bits 12 a 15
 *   b = un solo bit encendido según el rango (1 << rango), en los bits 16 a 28
 */

/** Los 13 rangos de menor a mayor. */
export const RANGOS = '23456789TJQKA'
/** Los 4 palos: picas, corazones, diamantes y tréboles. */
export const PALOS = 'shdc'

/** Una carta como texto, por ejemplo "As" o "Td". */
export type Carta = string

/** Primos por rango (treys: Card.PRIMES). */
export const PRIMOS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41] as const

const PALO_A_ENTERO: Record<string, number> = { s: 1, h: 2, d: 4, c: 8 }
const ENTERO_A_PALO: Record<number, string> = { 1: 's', 2: 'h', 4: 'd', 8: 'c' }

/** Valor numérico del rango como lo usa el Notebook 10: 2..14 (el As vale 14). */
export const VALOR_RANGO: Record<string, number> = Object.fromEntries(
  [...RANGOS].map((r, i) => [r, i + 2]),
)
/** Inverso de VALOR_RANGO: 14 -> "A". */
export const LETRA_DE_VALOR: Record<number, string> = Object.fromEntries(
  [...RANGOS].map((r, i) => [i + 2, r]),
)

/** Valor 2..14 de una carta en texto. */
export function valorDe(carta: Carta): number {
  const v = VALOR_RANGO[carta[0]!]
  if (v === undefined) throw new Error(`Carta inválida: "${carta}"`)
  return v
}

/** Convierte "As" al entero de treys (equivale a Card.new). */
export function cartaAEntero(carta: Carta): number {
  const r = RANGOS.indexOf(carta[0]!)
  const palo = PALO_A_ENTERO[carta[1]!]
  if (carta.length !== 2 || r < 0 || palo === undefined) throw new Error(`Carta inválida: "${carta}"`)
  return (1 << r << 16) | (palo << 12) | (r << 8) | PRIMOS[r]!
}

/** Convierte un entero de treys de vuelta a texto (equivale a Card.int_to_str). */
export function enteroACarta(entero: number): Carta {
  const r = (entero >> 8) & 0xf
  const palo = ENTERO_A_PALO[(entero >> 12) & 0xf]
  if (palo === undefined || r > 12) throw new Error(`Entero de carta inválido: ${entero}`)
  return RANGOS[r]! + palo
}

/** Convierte "Qs9c2h" en ["Qs", "9c", "2h"] (igual que separar_cartas del Notebook 10). */
export function separarCartas(texto: string): Carta[] {
  const salida: Carta[] = []
  for (let i = 0; i < texto.length; i += 2) salida.push(texto.slice(i, i + 2))
  return salida
}

/** Baraja completa de 52 cartas en texto (rango y luego palo). */
export const BARAJA: readonly Carta[] = [...RANGOS].flatMap((r) => [...PALOS].map((p) => r + p))

/** Baraja completa como enteros treys (mismo orden que BARAJA). */
export const BARAJA_ENTEROS: readonly number[] = BARAJA.map(cartaAEntero)

/**
 * Clase de mano inicial entre las 169: "AA", "AKs", "J9o".
 * Carta alta primero; pares sin letra final; "s" mismo palo; "o" palos distintos.
 */
export function claseDeMano(carta1: Carta, carta2: Carta): string {
  const [r1, r2] = [carta1[0]!, carta2[0]!].sort((a, b) => VALOR_RANGO[b]! - VALOR_RANGO[a]!) as [string, string]
  if (r1 === r2) return r1 + r2
  return r1 + r2 + (carta1[1] === carta2[1] ? 's' : 'o')
}
