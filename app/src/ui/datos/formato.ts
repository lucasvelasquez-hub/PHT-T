/** Formato de cifras para la interfaz (decimales con punto, como en la mesa). */

/** Fichas -> ciegas grandes, con un decimal solo si hace falta: 6.5, 98, 91.5. */
export function fmtBB(bb: number): string {
  const r = Math.round(bb * 10) / 10
  return Number.isInteger(r) ? String(r) : r.toFixed(1)
}

/** Porcentaje entero con espacio fino antes del signo: "62 %". */
export function fmtPct(p0a1: number): string {
  return `${Math.round(p0a1 * 100)} %`
}

export const pct = (p0a1: number): number => Math.round(p0a1 * 100)
