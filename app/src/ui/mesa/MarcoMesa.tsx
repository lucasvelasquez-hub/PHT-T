/**
 * MarcoMesa: la pantalla de la mesa con todo en su sitio, sin saber de dónde salen los datos.
 *  - Celular: mesa arriba; abajo, el panel con las lecturas y las acciones.
 *  - PC: mesa a la izquierda, columna de lecturas a la derecha y las acciones bajo la mesa.
 * La usan la mesa de revisión (`PantallaMesa`) y la mano en vivo (`src/juego`).
 */
import { motion, useReducedMotion } from 'motion/react'
import { type CSSProperties, type ReactNode } from 'react'
import { Ajustes } from './Ajustes.tsx'
import { BarraSuperior } from './BarraSuperior.tsx'
import type { Escena } from './geometria.ts'

const CURVA = [0.16, 1, 0.3, 1] as const

export interface MarcoMesaProps {
  escena: Escena
  /** La mesa (componente `Mesa`); si no hay datos todavía, un fondo vacío. */
  mesa: ReactNode
  calle: string
  origen: string
  /** Mensaje breve que ocupa el lugar de la píldora de calle y origen. */
  aviso?: ReactNode
  onVolver: () => void
  /** Lecturas (PanelLecturas). Si es null no hay panel y solo se ven las acciones. */
  panel: ReactNode | null
  acciones: ReactNode
  /** Cosas que flotan sobre la mesa (avisos, errores, ayudas). */
  superpuesto?: ReactNode
  ajustes: { abierto: boolean; onAbrir: () => void; onCerrar: () => void; cuatroColores: boolean; onCuatroColores: (v: boolean) => void }
}

export function MarcoMesa({ escena, mesa, calle, origen, aviso, onVolver, panel, acciones, superpuesto, ajustes }: MarcoMesaProps) {
  const reducido = useReducedMotion()
  const { plano, s } = escena
  const w = escena.anchoViewport
  const modoEscritorio = plano.modo === 'escritorio'
  const entrada = (retraso: number) => ({
    initial: reducido ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducido ? 0.2 : 0.3, ease: CURVA, delay: reducido ? 0 : retraso },
  })

  // Anchos de la columna de lecturas en PC: de la orilla derecha de la mesa al borde de la ventana
  const bordeMesa = plano.W * s * 0.72
  const centroMesa = escena.ox + 620 * s
  const anchoBarra = Math.min(560, plano.W * s * 0.62)
  const colX = Math.max(bordeMesa + 12, w - Math.min(440, Math.max(340, w * 0.26)) - 24)

  return (
    <div className="pantalla" style={{ '--reservado': `${escena.reservado}px` } as CSSProperties}>
      {mesa}

      <motion.div {...(reducido ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } } : entrada(0))}>
        <BarraSuperior calle={calle} origen={origen} onVolver={onVolver} onAjustes={ajustes.onAbrir} aviso={aviso} />
      </motion.div>

      {superpuesto}

      {modoEscritorio ? (
        <>
          {panel ? (
            <motion.aside className="columna" style={{ left: colX, top: escena.barraSuperior + 44, bottom: escena.reservado + 24 }} {...entrada(0.1)}>
              <div className="panel panel--columna">{panel}</div>
            </motion.aside>
          ) : null}
          <motion.div
            className="barra-inferior"
            style={{ left: centroMesa - anchoBarra / 2, top: plano.H * s, height: escena.reservado, width: anchoBarra }}
            {...entrada(0.14)}
          >
            {acciones}
          </motion.div>
        </>
      ) : (
        panel || acciones ? (
        <motion.div className={`panel panel--movil ${panel ? '' : 'panel--solo-acciones'}`} {...entrada(0.1)}>
          {panel}
          {acciones}
        </motion.div>
        ) : null
      )}

      <Ajustes abierto={ajustes.abierto} onCerrar={ajustes.onCerrar} cuatroColores={ajustes.cuatroColores} onCuatroColores={ajustes.onCuatroColores} />
    </div>
  )
}
