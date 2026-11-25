/**
 * Asiento: medallón circular con el avatar, píldora con nombre y stack ("MRBLUE 98 BB"), pestaña de acción
 * (BET / CALL / CHECK / FOLD / ALL-IN), botón del repartidor y las dos cartas tapadas (dorso).
 * Estados: activo, retirado (foldeado), todo dentro (all-in) y vacío.
 */
import { memo, useLayoutEffect, useRef } from 'react'
import type { DatosAsiento } from '../datos/escenario.ts'
import { fmtBB } from '../datos/formato.ts'
import { RUTA_DORSO } from './Carta.tsx'

const AVATARES = new Set([
  'Pluribus', 'MrBlue', 'MrOrange', 'MrPink', 'MrWhite', 'MrBlonde', 'Eddie', 'Bill', 'Hattori', 'MrBrown', 'Budd', 'ORen', 'Joe',
])

/** Avatar de un jugador: por nombre si existe; las manos generadas usan rival_1..rival_5; si no, null (iniciales). */
export function rutaAvatar(nombre: string, indiceRival: number): string | null {
  if (AVATARES.has(nombre)) return `/assets/avatares/${nombre}.webp`
  if (/^rival_[1-5]$/.test(nombre)) return `/assets/avatares/${nombre}.webp`
  if (/^(rival|bot)/i.test(nombre)) return `/assets/avatares/rival_${(indiceRival % 5) + 1}.webp`
  return null
}

const iniciales = (n: string) => n.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2).toUpperCase() || '?'

export interface AsientoProps {
  datos: DatosAsiento | null
  indiceRival: number
  /** Centro del avatar en pantalla. */
  x: number
  y: number
  /** Diámetro del avatar (px). */
  d: number
  /** Tamaño de letra de la píldora (px). */
  fuente: number
  /** Muestra las dos cartas tapadas junto al medallón. */
  conCartas?: boolean
  /** Ancho de la ventana: la píldora se desplaza para no salirse de la pantalla. */
  anchoViewport: number
}

export const Asiento = memo(function Asiento({ datos, indiceRival, x, y, d, fuente, conCartas = true, anchoViewport }: AsientoProps) {
  const pildora = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = pildora.current
    if (!el) return
    const margen = 6
    const mitad = el.offsetWidth / 2
    const izquierda = x - mitad
    const derecha = x + mitad
    const dx = izquierda < margen ? margen - izquierda : derecha > anchoViewport - margen ? anchoViewport - margen - derecha : 0
    el.style.setProperty('--dx', `${dx}px`)
  }, [x, anchoViewport, datos?.nombre, datos?.stackBB, fuente])

  const estilo = { left: x - d / 2, top: y - d / 2, width: d, height: d, '--d': `${d}px`, '--f': `${fuente}px` } as React.CSSProperties
  if (!datos) {
    return (
      <div className="asiento asiento--vacio" data-e="asiento" style={estilo}>
        <div className="asiento__medallon"><span className="asiento__libre">Libre</span></div>
      </div>
    )
  }
  const retirado = !datos.activo
  const todoDentro = datos.activo && datos.stackBB <= 0
  const ruta = rutaAvatar(datos.nombre, indiceRival)
  const clases = ['asiento', retirado && 'asiento--retirado', todoDentro && 'asiento--todo-dentro'].filter(Boolean).join(' ')
  const estado = retirado ? 'retirado' : todoDentro ? 'todo dentro' : 'en la mano'
  return (
    <div className={clases} data-e="asiento" style={estilo} role="group" aria-label={`${datos.nombre}, ${fmtBB(datos.stackBB)} BB, ${estado}${datos.etiqueta ? `, ${datos.etiqueta}` : ''}`}>
      {conCartas && datos.activo ? (
        <div className="asiento__mano" aria-hidden="true">
          <img src={RUTA_DORSO} width={640} height={894} alt="" decoding="async" draggable={false} />
          <img src={RUTA_DORSO} width={640} height={894} alt="" decoding="async" draggable={false} />
        </div>
      ) : null}
      <div className="asiento__medallon">
        {ruta ? (
          <img className="asiento__foto" src={ruta} width={512} height={512} alt="" decoding="async" draggable={false} />
        ) : (
          <span className="asiento__iniciales">{iniciales(datos.nombre)}</span>
        )}
      </div>
      {datos.etiqueta ? <span className={`asiento__tab asiento__tab--${datos.etiqueta.toLowerCase()}`}>{datos.etiqueta}</span> : null}
      {datos.esBoton ? <span className="asiento__boton" title="Botón del repartidor" aria-label="Botón del repartidor">D</span> : null}
      <div className="asiento__pildora" ref={pildora}>
        <span className="asiento__nombre">{datos.nombre}</span>
        <span className="asiento__stack">{fmtBB(datos.stackBB)} BB</span>
      </div>
    </div>
  )
})
