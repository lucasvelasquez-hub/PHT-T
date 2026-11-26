/**
 * Momento grande: se subió de rango. La ficha nueva gira y brilla sobre la sala atenuada; se cierra sola o con un toque.
 * Con movimiento reducido la ficha aparece sin girar (las reglas están en retador.css).
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Rango } from '../../progreso/progreso.ts'

export const DURACION_MOMENTO_RANGO = 3400

export function MomentoRango({ rango, onCerrar }: { rango: Rango; onCerrar: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onCerrar, DURACION_MOMENTO_RANGO)
    return () => window.clearTimeout(t)
  }, [onCerrar])
  return createPortal(
    <div className="rt-rango" role="alertdialog" aria-label={`Subiste de rango: ${rango.nombre}`} onClick={onCerrar} data-e="momento-rango">
      <div className="rt-rango__escena">
        <div className="rt-rango__rayos" aria-hidden="true" />
        <div className="rt-rango__resplandor" aria-hidden="true" />
        <div className="rt-rango__giro">
          <img className="rt-rango__ficha" src={`/assets/fichas/ficha_${rango.ficha}.webp`} alt="" draggable={false} />
        </div>
      </div>
      <p className="rt-rango__sobre">Subiste de rango</p>
      <p className="rt-rango__nombre">{rango.nombre}</p>
      <p className="rt-rango__toque">Toca para seguir</p>
    </div>,
    document.body,
  )
}
