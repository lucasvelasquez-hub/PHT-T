/**
 * Carta: imagen terminada (papel marfil, luz y canto ya horneados). La app pone el ángulo y la sombra:
 * una inclinación en perspectiva (rotateX) acorde con la mesa, un giro en el plano (abanico) y una sombra suave
 * sobre el paño. La carta tiene dos caras (dorso y figura) para poder voltearla al repartir.
 */
import { memo, type CSSProperties } from 'react'

export const RELACION_CARTA = 894 / 640

/** Ruta de la imagen de una carta ("Qd"). Con mazo de 4 colores, diamantes y tréboles salen de cuatro_colores. */
export function rutaCarta(carta: string, cuatroColores: boolean): string {
  const palo = carta[1]
  const carpeta = cuatroColores && (palo === 'd' || palo === 'c') ? 'cuatro_colores' : 'clasico'
  return `/cartas/${carpeta}/${carta}.webp`
}

export const RUTA_DORSO = '/cartas/dorso.webp'

export interface CartaProps {
  /** Carta visible ("Qd"), o null para un dorso (carta tapada). */
  carta: string | null
  /** Ancho de la carta en pantalla (px). */
  ancho: number
  /** Inclinación sobre el paño, en grados. */
  inclinacion: number
  /** Giro en el plano, en grados. */
  giro?: number
  cuatroColores?: boolean
  /** Posición del ancla (centro inferior de la carta) en pantalla. */
  x: number
  y: number
  /** Atributos para que la coreografía encuentre la carta. */
  dato?: string
  etiqueta?: string
  className?: string
  style?: CSSProperties
}

export const Carta = memo(function Carta({
  carta, ancho, inclinacion, giro = 0, cuatroColores = false, x, y, dato, etiqueta, className, style,
}: CartaProps) {
  const alto = ancho * RELACION_CARTA
  const perspectiva = ancho * 9.7
  const sombra = Math.max(1, ancho * 0.035)
  return (
    <div
      className={`carta ${className ?? ''}`}
      data-carta={dato}
      style={{ left: x - ancho / 2, top: y - alto, width: ancho, height: alto, ...style }}
    >
      <div
        className="carta__inclinada"
        style={{
          transform: `perspective(${perspectiva}px) rotateX(${inclinacion}deg) rotateZ(${giro}deg)`,
          filter: `drop-shadow(0 ${sombra * 1.6}px ${sombra * 2.2}px rgba(0,0,0,.55)) drop-shadow(0 ${sombra * 0.4}px ${sombra * 0.5}px rgba(0,0,0,.6))`,
        }}
      >
        <div className="carta__giro" data-giro>
          {carta ? (
            <img
              className="carta__cara"
              src={rutaCarta(carta, cuatroColores)}
              width={640}
              height={894}
              alt={etiqueta ?? carta}
              decoding="async"
              draggable={false}
            />
          ) : null}
          <img className="carta__dorso" src={RUTA_DORSO} width={640} height={894} alt="" decoding="async" draggable={false} />
        </div>
      </div>
    </div>
  )
})

/** Hueco de una carta que todavía no se reparte: contorno tenue sobre el paño, con la misma inclinación. */
export function HuecoCarta({ ancho, inclinacion, x, y }: { ancho: number; inclinacion: number; x: number; y: number }) {
  const alto = ancho * RELACION_CARTA
  return (
    <div className="carta carta--hueco" style={{ left: x - ancho / 2, top: y - alto, width: ancho, height: alto }} aria-hidden="true">
      <div className="carta__inclinada" style={{ transform: `perspective(${ancho * 9.7}px) rotateX(${inclinacion}deg)` }}>
        <div className="carta__contorno" />
      </div>
    </div>
  )
}
