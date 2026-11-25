/**
 * Fichas: pilas de fichas de arcilla (una imagen por denominación, repetida y desplazada hacia arriba
 * ~7.5 % de su ancho por ficha) con una sombra suave bajo cada pila.
 */
import { forwardRef, type CSSProperties } from 'react'
import { descomponer } from '../datos/fichas.ts'

const ALTO_REL = 348 / 405
const PASO = 0.075

/** Posición de cada pila (en anchos de ficha) según cuántas pilas hay. */
const DISPOSICION: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.56, 0], [0.56, 0]],
  3: [[-0.58, -0.12], [0.58, -0.12], [0, 0.3]],
  4: [[-0.52, -0.15], [0.52, -0.15], [-1.05, 0.3], [1.05, 0.3]],
  5: [[-0.52, -0.15], [0.52, -0.15], [-1.05, 0.3], [1.05, 0.3], [0, 0.58]],
  6: [[-0.52, -0.15], [0.52, -0.15], [-1.05, 0.3], [1.05, 0.3], [0, 0.58], [-1.6, 0.75]],
  7: [[-0.52, -0.15], [0.52, -0.15], [-1.05, 0.3], [1.05, 0.3], [0, 0.58], [-1.6, 0.75], [1.6, 0.75]],
}

export interface FichasProps {
  /** Monto en ciegas grandes. */
  monto: number
  /** Ancho de una ficha en pantalla (px). */
  ancho: number
  className?: string
  /** Valor de data-e para que la coreografía encuentre el grupo. */
  dato?: string
  style?: CSSProperties
}

/** Caja que ocupa el grupo (el centro de la caja es el centro del grupo). */
export const cajaFichas = (ancho: number) => ({ w: ancho * 4, h: ancho * 2.3 })

export const Fichas = forwardRef<HTMLDivElement, FichasProps>(function Fichas({ monto, ancho, className, dato, style }, ref) {
  const { w, h } = cajaFichas(ancho)
  const pilas = descomponer(monto)
  const sitios = DISPOSICION[Math.min(Math.max(pilas.length, 1), 7)]!
  const dibujadas = pilas
    .map((p, i) => ({ p, x: sitios[i]![0], y: sitios[i]![1] }))
    .sort((a, b) => a.y - b.y)
  return (
    <div ref={ref} className={`fichas ${className ?? ''}`} data-e={dato} style={{ width: w, height: h, ...style }} aria-hidden="true">
      {dibujadas.map(({ p, x, y }, k) => {
        const cw = p.fraccion ? ancho * 0.9 : ancho
        const cx = w / 2 + x * ancho
        const cy = h * 0.58 + y * ancho
        return (
          <div key={`${p.den}-${p.fraccion ? 'f' : 'n'}-${k}`} className="fichas__pila" style={{ left: cx, top: cy }}>
            <span className="fichas__sombra" style={{ width: cw * 1.12, height: cw * 0.4, left: -cw * 0.56, top: cw * ALTO_REL * 0.14 }} />
            {Array.from({ length: p.n }, (_, i) => (
              <img
                key={i}
                className="fichas__ficha"
                src={`/assets/fichas/ficha_${p.den}.webp`}
                width={cw}
                height={cw * ALTO_REL}
                alt=""
                decoding="async"
                draggable={false}
                style={{ left: -cw / 2, top: -(cw * ALTO_REL) / 2 - i * cw * PASO }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
})
