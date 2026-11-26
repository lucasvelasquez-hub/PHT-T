/**
 * Lo que se ve justo después de decidir: los puntos saltan junto a las cartas del jugador, con su etiqueta, y (la primera
 * vez que sube) el aviso de que la élite no distingue tamaños de subida. Todo flota sobre la mesa y se apaga solo.
 * Va por un portal con posición fija porque la mesa pinta la retroalimentación en un contenedor propio.
 */
import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ETIQUETA_NIVEL, type NivelPuntaje } from './logica.ts'

export interface InfoDecision {
  puntos: number
  nivel: NivelPuntaje
  /** Es la primera vez que el jugador sube: se muestra el aviso. */
  avisoSubida: boolean
}

export const TEXTO_AVISO_SUBIDA = 'La élite no distingue tamaños de subida'

interface Sitio { puntos: { left: number; top: number; ancho: number }; aviso: { left: number; top: number } }

/** Mide las cartas del jugador para pegarse a ellas; si no están (todavía), usa el centro inferior de la pantalla. */
function medirSitio(): Sitio {
  const an = window.innerWidth
  const al = window.innerHeight
  const c0 = document.querySelector<HTMLElement>('[data-carta="heroe-0"]')?.getBoundingClientRect()
  const c1 = document.querySelector<HTMLElement>('[data-carta="heroe-1"]')?.getBoundingClientRect()
  if (!c0 || !c1) {
    return { puntos: { left: an / 2 + 70, top: al * 0.55, ancho: 130 }, aviso: { left: an / 2, top: al * 0.5 } }
  }
  const izq = Math.min(c0.left, c1.left)
  const der = Math.max(c0.right, c1.right)
  const arriba = Math.min(c0.top, c1.top)
  const medio = (arriba + Math.max(c0.bottom, c1.bottom)) / 2
  const libreDer = an - der - 10
  // A la derecha de las cartas si cabe; si no, a la izquierda.
  const ancho = Math.max(96, Math.min(190, libreDer >= 96 ? libreDer : izq - 18))
  const left = libreDer >= 96 ? der + 10 : Math.max(6, izq - ancho - 10)
  // El aviso va sobre la píldora del bote (así no tapa las cartas); si no la encuentra, sobre las cartas.
  const bote = document.querySelector<HTMLElement>('.pildora--bote')?.getBoundingClientRect()
  const aviso = bote ? { left: (bote.left + bote.right) / 2, top: bote.top - 6 } : { left: (izq + der) / 2, top: arriba - 8 }
  return { puntos: { left, top: medio, ancho }, aviso }
}

export function PuntosSaltan({ info }: { info: InfoDecision }) {
  const [sitio, setSitio] = useState<Sitio | null>(null)
  useLayoutEffect(() => { setSitio(medirSitio()) }, [])
  if (!sitio || typeof document === 'undefined') return null
  const { puntos, nivel, avisoSubida } = info
  return createPortal(
    <>
      <div
        className={`rt-puntos rt-puntos--${nivel}`}
        style={{ left: sitio.puntos.left, top: sitio.puntos.top, width: sitio.puntos.ancho }}
        role="status" aria-live="polite" data-e="puntos"
      >
        <span className="rt-puntos__num" aria-label={`${puntos} puntos`}>+{puntos}</span>
        <span className="rt-puntos__etq">{ETIQUETA_NIVEL[nivel]}</span>
      </div>
      {avisoSubida ? (
        <p className="rt-aviso" style={{ left: sitio.aviso.left, top: sitio.aviso.top }} role="status" data-e="aviso-subida">
          {TEXTO_AVISO_SUBIDA}
        </p>
      ) : null}
    </>,
    document.body,
  )
}
