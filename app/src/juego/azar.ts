/**
 * azar.ts: números pseudoaleatorios repetibles. La misma semilla da siempre la misma secuencia,
 * así que la misma semilla reparte las mismas cartas y sortea las mismas acciones de los rivales.
 */
import { crearRng } from '../motor/index.ts'

/** Generador pseudoaleatorio en [0, 1), repetible a partir de una semilla entera. */
export function crearAzar(semilla: number): () => number {
  return crearRng(semilla)
}

/** Baraja (Fisher-Yates) una copia del arreglo. */
export function barajar<T>(elementos: readonly T[], azar: () => number): T[] {
  const copia = [...elementos]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j]!, copia[i]!]
  }
  return copia
}

/** Entero de 31 bits sacado del generador (sirve de semilla para el Monte Carlo del motor). */
export function enteroDe(azar: () => number): number {
  return Math.floor(azar() * 0x7fffffff)
}
