/**
 * BarraAcciones: FOLD / CALL x BB / RAISE, a la altura del pulgar. CALL es la acción principal (cobalto lleno),
 * FOLD pizarra y RAISE con contorno. Si no hay nada que pagar, FOLD se apaga y CALL pasa a CHECK.
 *
 * Con `subidas`, RAISE abre una fila con los tamaños de la calle (más un botón para volver); tocar uno confirma
 * la subida. Con `permitida`, solo esa acción está activa (mano guiada).
 */
import { useState } from 'react'
import { fmtBB } from '../datos/formato.ts'

export type AccionHeroe = 'fold' | 'call' | 'raise'

export interface TamanoSubida {
  id: string
  etiqueta: string
  /** Total al que se sube, en ciegas grandes. */
  hastaBB: number
}

export interface BarraAccionesProps {
  /** Ciegas grandes por pagar (0 = se puede pasar). */
  aPagarBB: number
  puedeSubir: boolean
  /** Ya se eligió: los tres botones se apagan y el elegido queda marcado. */
  elegida: AccionHeroe | null
  deshabilitada?: boolean
  onAccion: (a: AccionHeroe) => void
  /** Tamaños de subida; si se pasan, RAISE abre la fila de tamaños en lugar de llamar a `onAccion('raise')`. */
  subidas?: TamanoSubida[]
  onSubir?: (hastaBB: number) => void
  /** Solo esta acción está activa. */
  permitida?: AccionHeroe | null
  /** Texto de RAISE cuando solo hay una subida posible (mano guiada). */
  textoSubir?: string
}

export function BarraAcciones({
  aPagarBB, puedeSubir, elegida, deshabilitada = false, onAccion, subidas, onSubir, permitida = null, textoSubir,
}: BarraAccionesProps) {
  const [eligiendo, setEligiendo] = useState(false)
  const bloqueada = deshabilitada || elegida !== null
  const hayQuePagar = aPagarBB > 0
  const apagadaPor = (accion: AccionHeroe, apagado: boolean) => bloqueada || apagado || (permitida !== null && permitida !== accion)

  if (eligiendo && subidas && !bloqueada) {
    return (
      <div className="acciones acciones--tamanos" role="group" aria-label="Tamaño de la subida" data-e="tamanos" style={{ gridTemplateColumns: `minmax(44px, 0.6fr) repeat(${subidas.length}, 1fr)` }}>
        <button type="button" className="accion accion--fold accion--atras" aria-label="Volver a las acciones" onClick={() => setEligiendo(false)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5 8 12l7 7" /></svg>
        </button>
        {subidas.map((t) => (
          <button
            key={t.id}
            type="button"
            className="accion accion--raise accion--tamano"
            onClick={() => { setEligiendo(false); onSubir?.(t.hastaBB) }}
          >
            <span className="accion__etiqueta">{t.etiqueta}</span>
            <span className="accion__monto">{fmtBB(t.hastaBB)}</span>
          </button>
        ))}
      </div>
    )
  }

  const boton = (accion: AccionHeroe, clase: string, texto: React.ReactNode, apagado: boolean, alTocar: () => void) => (
    <button
      type="button"
      className={`accion ${clase} ${elegida === accion ? 'accion--elegida' : ''} ${permitida === accion && !bloqueada ? 'accion--indicada' : ''}`}
      disabled={apagadaPor(accion, apagado)}
      aria-pressed={elegida === null ? undefined : elegida === accion}
      onClick={alTocar}
    >
      {texto}
    </button>
  )
  return (
    <div className="acciones" role="group" aria-label="Tu acción" data-e="acciones">
      {boton('fold', 'accion--fold', 'FOLD', !hayQuePagar, () => onAccion('fold'))}
      {boton('call', 'accion--call', hayQuePagar ? <>CALL <b>{fmtBB(aPagarBB)}</b></> : 'CHECK', false, () => onAccion('call'))}
      {boton('raise', 'accion--raise', textoSubir ?? 'RAISE', !puedeSubir, () => (subidas && subidas.length > 0 ? setEligiendo(true) : onAccion('raise')))}
    </div>
  )
}
