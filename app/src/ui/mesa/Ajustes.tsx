/**
 * Ajustes: hoja que se abre desde el botón de ajustes. Lleva el mazo de 4 colores y los Créditos
 * (atribución obligatoria del mazo, licencia LGPL 3.0). Sube desde abajo en celular; en PC es un cuadro centrado.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Creditos } from './Creditos.tsx'

export interface AjustesProps {
  abierto: boolean
  onCerrar: () => void
  cuatroColores: boolean
  onCuatroColores: (v: boolean) => void
}

const CURVA = [0.16, 1, 0.3, 1] as const

export function Ajustes({ abierto, onCerrar, cuatroColores, onCuatroColores }: AjustesProps) {
  const reducido = useReducedMotion()
  const hoja = useRef<HTMLDivElement>(null)
  const cerrar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement as HTMLElement | null
    cerrar.current?.focus()
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCerrar()
        return
      }
      if (e.key !== 'Tab' || !hoja.current) return
      const focos = hoja.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
      if (focos.length === 0) return
      const primero = focos[0]!
      const ultimo = focos[focos.length - 1]!
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus() }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus() }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      previo?.focus?.()
    }
  }, [abierto, onCerrar])

  return (
    <AnimatePresence>
      {abierto ? (
        <motion.div
          className="hoja-fondo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducido ? 0.15 : 0.22, ease: 'linear' }}
          onClick={onCerrar}
        >
          <motion.div
            ref={hoja}
            className="hoja"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ajustes-titulo"
            initial={reducido ? { opacity: 0 } : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducido ? { opacity: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: reducido ? 0.15 : 0.3, ease: CURVA }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hoja__cabecera">
              <h2 id="ajustes-titulo" className="hoja__titulo">Ajustes</h2>
              <button ref={cerrar} type="button" className="icono" aria-label="Cerrar" onClick={onCerrar}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="ajuste">
              <div>
                <p className="ajuste__nombre" id="ajuste-cuatro">Mazo de 4 colores</p>
                <p className="ajuste__ayuda">Diamantes en azul y tréboles en verde, para distinguir los palos de un vistazo.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={cuatroColores}
                aria-labelledby="ajuste-cuatro"
                className="interruptor"
                onClick={() => onCuatroColores(!cuatroColores)}
              >
                <span className="interruptor__bola" />
              </button>
            </div>

            <Creditos />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
