/**
 * tamanos.ts: cuánto sube un rival cuando la red dice Bet/Raise.
 * Sortea uno de los botones de tamaño con las frecuencias medidas en las manos del banco
 * (`tamanos_pluribus.json`, generado por `herramientas/medir_tamanos.ts`).
 */
import tabla from './tamanos_pluribus.json'
import { contextoDe, subidasPosibles } from './tamanosCalculo.ts'
import type { EstadoMano } from '../motor/index.ts'

export * from './tamanosCalculo.ts'

type Frecuencias = Record<string, number>
const FRECUENCIAS = Object.fromEntries(
  Object.entries(tabla.todos).map(([ctx, v]) => [ctx, v.frecuencias as Frecuencias]),
)

/** "Subir hasta" (en fichas) que elige un rival, siempre dentro de los límites legales. Devuelve null si no puede subir. */
export function elegirSubida(estado: EstadoMano, asiento: number, azar: () => number): number | null {
  const posibles = subidasPosibles(estado, asiento)
  if (posibles.length === 0) return null
  const f = FRECUENCIAS[contextoDe(estado)] ?? {}
  const pesos = posibles.map((p) => f[p.id] ?? 0)
  let total = pesos.reduce((a, b) => a + b, 0)
  if (total <= 0) { pesos.fill(1); total = pesos.length }
  let u = azar() * total
  for (let i = 0; i < posibles.length; i++) {
    u -= pesos[i]!
    if (u < 0) return posibles[i]!.hasta
  }
  return posibles[posibles.length - 1]!.hasta
}
