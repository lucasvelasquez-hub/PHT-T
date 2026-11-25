/** Reparto de un monto (en ciegas grandes) en pilas de fichas. */

export const DENOMINACIONES = [100, 50, 25, 10, 5, 1] as const
export type Denominacion = (typeof DENOMINACIONES)[number]

export interface Pila {
  den: Denominacion
  /** Fichas de la pila (tope visual de 6). */
  n: number
  /** Pila de una sola ficha de 1 que representa una fracción (0.5 BB); el monto exacto lo lleva la píldora. */
  fraccion?: boolean
}

/** Reparto voraz: 100/50/25/10/5/1. Una fracción suelta se muestra como una ficha de 1. */
export function descomponer(montoBB: number): Pila[] {
  const pilas: Pila[] = []
  let resto = Math.floor(Math.max(0, montoBB) + 1e-9)
  for (const den of DENOMINACIONES) {
    const n = Math.floor(resto / den)
    if (n > 0) {
      pilas.push({ den, n: Math.min(n, 6) })
      resto -= n * den
    }
  }
  if (montoBB - Math.floor(montoBB + 1e-9) > 0.049) pilas.push({ den: 1, n: 1, fraccion: true })
  if (pilas.length === 0 && montoBB > 0) pilas.push({ den: 1, n: 1, fraccion: true })
  return pilas
}
