/**
 * conductor.ts: las dos reglas de las props opcionales `continuar` y `soloContexto` de `MesaEnVivo`,
 * separadas del componente para poder probarlas en Node.
 */
import { lecturaDeAnalisis, type Analista, type AnalisisDecision } from './analista.ts'
import type { Partida } from './partida.ts'
import type { LecturaDecision } from './tipos.ts'

/** ¿La mano se detiene justo después de la decisión del héroe? Solo con `escenarioInicial` y `continuar: false`. */
export function detenerTrasDecision(continuar: boolean | undefined, escenarioInicial: unknown): boolean {
  return continuar === false && escenarioInicial !== undefined && escenarioInicial !== null
}

/**
 * Lectura de la situación del héroe SIN pedirle decisión ni jugar a nadie (modo `soloContexto`).
 * Devuelve null si ahora no le toca al héroe.
 */
export async function lecturaDeContexto(
  p: Partida,
  analista: Analista,
): Promise<{ analisis: AnalisisDecision; lectura: LecturaDecision } | null> {
  if (p.fase() !== 'esperando_accion' || p.turno() !== p.heroe) return null
  const analisis = await p.analizarHeroe(analista)
  return { analisis, lectura: lecturaDeAnalisis(analisis) }
}
