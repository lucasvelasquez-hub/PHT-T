/**
 * BarraAcciones: FOLD / CALL x BB / RAISE, a la altura del pulgar. CALL es la acción principal (cobalto lleno),
 * FOLD pizarra y RAISE con contorno. Si no hay nada que pagar, FOLD se apaga y CALL pasa a CHECK.
 */
import { fmtBB } from '../datos/formato.ts'

export type AccionHeroe = 'fold' | 'call' | 'raise'

export interface BarraAccionesProps {
  /** Ciegas grandes por pagar (0 = se puede pasar). */
  aPagarBB: number
  puedeSubir: boolean
  /** Ya se eligió: los tres botones se apagan y el elegido queda marcado. */
  elegida: AccionHeroe | null
  deshabilitada?: boolean
  onAccion: (a: AccionHeroe) => void
}

export function BarraAcciones({ aPagarBB, puedeSubir, elegida, deshabilitada = false, onAccion }: BarraAccionesProps) {
  const bloqueada = deshabilitada || elegida !== null
  const hayQuePagar = aPagarBB > 0
  const boton = (accion: AccionHeroe, clase: string, texto: React.ReactNode, apagado: boolean) => (
    <button
      type="button"
      className={`accion ${clase} ${elegida === accion ? 'accion--elegida' : ''}`}
      disabled={bloqueada || apagado}
      aria-pressed={elegida === null ? undefined : elegida === accion}
      onClick={() => onAccion(accion)}
    >
      {texto}
    </button>
  )
  return (
    <div className="acciones" role="group" aria-label="Tu acción" data-e="acciones">
      {boton('fold', 'accion--fold', 'FOLD', !hayQuePagar)}
      {boton('call', 'accion--call', hayQuePagar ? <>CALL <b>{fmtBB(aPagarBB)}</b></> : 'CHECK', false)}
      {boton('raise', 'accion--raise', 'RAISE', !puedeSubir)}
    </div>
  )
}
