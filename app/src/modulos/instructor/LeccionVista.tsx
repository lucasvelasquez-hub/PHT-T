/** Una lección: una pantalla por apartado, con barra de avance, deslizamiento y botones. Al terminar, muestra la medalla y el XP. */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Leccion } from '../../curso/index.ts'
import { BarraPantalla, Pantalla } from '../../pantallas/elementos.tsx'
import { BarraAvance, HtmlLeccion, IconoCheck, Rico } from './piezas.tsx'

export interface CierreLeccion {
  /** XP que se acaba de ganar (0 si ya la había terminado antes). */
  xp: number
  subioDeRango: boolean
  nombreRango: string
}

interface Props {
  leccion: Leccion
  indiceInicial: number
  /** Recibe el índice de pantalla cada vez que cambia (para guardar dónde quedó). */
  onIndice: (i: number) => void
  /** Se llama una sola vez al terminar; devuelve lo que se ganó. */
  onTerminar: () => CierreLeccion
  /** Texto del nodo siguiente ("Lección 4.3", "Evaluación") y cómo abrirlo; null si era el último. */
  siguiente: { texto: string; abrir: () => void } | null
  onSalir: () => void
}

const UMBRAL_DESLIZAR = 56

export default function LeccionVista({ leccion, indiceInicial, onIndice, onTerminar, siguiente, onSalir }: Props) {
  const total = leccion.pantallas.length
  const [indice, setIndice] = useState(() => Math.min(Math.max(indiceInicial, 0), Math.max(total - 1, 0)))
  const [sentido, setSentido] = useState<'der' | 'izq'>('der')
  const [cierre, setCierre] = useState<CierreLeccion | null>(null)
  const cuerpo = useRef<HTMLDivElement | null>(null)
  const toque = useRef<{ x: number; y: number } | null>(null)

  const ir = useCallback((destino: number) => {
    if (destino < 0 || destino >= total) return
    setSentido(destino > indice ? 'der' : 'izq')
    setIndice(destino)
    onIndice(destino)
  }, [indice, total, onIndice])

  const yaTermino = useRef(false)
  const terminar = useCallback(() => {
    if (yaTermino.current) return
    yaTermino.current = true
    setCierre(onTerminar())
  }, [onTerminar])
  const avanzar = useCallback(() => (indice >= total - 1 ? terminar() : ir(indice + 1)), [indice, total, ir, terminar])
  const retroceder = useCallback(() => ir(indice - 1), [indice, ir])

  // Cada pantalla nueva empieza arriba.
  useEffect(() => { cuerpo.current?.scrollTo({ top: 0 }) }, [indice])

  // Teclado en PC.
  useEffect(() => {
    if (cierre) return
    const alTeclear = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SUMMARY)$/.test(e.target.tagName)) return
      if (e.key === 'ArrowRight') avanzar()
      else if (e.key === 'ArrowLeft') retroceder()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [avanzar, retroceder, cierre])

  const alTocar = (e: React.TouchEvent) => { const t = e.touches[0]; if (t) toque.current = { x: t.clientX, y: t.clientY } }
  const alSoltar = (e: React.TouchEvent) => {
    const ini = toque.current
    toque.current = null
    const t = e.changedTouches[0]
    if (!ini || !t) return
    const dx = t.clientX - ini.x
    const dy = t.clientY - ini.y
    if (Math.abs(dx) < UMBRAL_DESLIZAR || Math.abs(dx) < Math.abs(dy) * 1.5) return // un gesto vertical es para leer
    if (dx < 0) avanzar(); else retroceder()
  }

  if (cierre) {
    return (
      <Pantalla className="ins-raiz">
        <div className="ins-marco">
          <BarraPantalla titulo={`Lección ${leccion.modulo}.${leccion.numero}`} onVolver={onSalir} />
          <div className="ins-cierre">
            <span className="ins-medalla" aria-hidden="true"><IconoCheck tam={44} /></span>
            <h2 className="ins-cierre__titulo">Lección terminada</h2>
            <p className="ins-cierre__texto"><Rico texto={leccion.titulo} /></p>
            {cierre.xp > 0 ? <p className="ins-xp" role="status"><b>+{cierre.xp}</b> XP</p> : <p className="ins-cierre__nota">Ya la habías terminado antes, así que esta vez no suma XP.</p>}
            {cierre.subioDeRango ? <p className="ins-cierre__rango" role="status">Subiste de rango: {cierre.nombreRango}</p> : null}
            <div className="ins-cierre__botones">
              {siguiente ? <button type="button" className="nc-boton nc-boton--ancho" onClick={siguiente.abrir}>Siguiente: {siguiente.texto}</button> : null}
              <button type="button" className="nc-boton-suave" onClick={onSalir}>Volver al camino</button>
            </div>
          </div>
        </div>
      </Pantalla>
    )
  }

  const pantalla = leccion.pantallas[indice]
  const ultima = indice >= total - 1
  return (
    <Pantalla className="ins-raiz">
      <div className="ins-marco">
        <BarraPantalla titulo={`Lección ${leccion.modulo}.${leccion.numero}`} onVolver={onSalir} />
        <BarraAvance total={total} actual={indice} etiqueta={`Pantalla ${indice + 1} de ${total}`} />
        <div className="ins-cuerpo" ref={cuerpo} onTouchStart={alTocar} onTouchEnd={alSoltar}>
          {pantalla ? (
            <article key={indice} className={`ins-pagina ins-pagina--${sentido}`} aria-live="polite">
              <p className="ins-pagina__kicker"><Rico texto={leccion.titulo} /> · {indice + 1} de {total}</p>
              <h2 className="ins-pagina__titulo"><Rico texto={pantalla.titulo} /></h2>
              <HtmlLeccion html={pantalla.html} className="ins-lectura" />
            </article>
          ) : <p className="ins-vacio">Esta lección todavía no tiene pantallas.</p>}
        </div>
        <footer className="ins-pie">
          <button type="button" className="nc-boton-suave ins-pie__atras" onClick={retroceder} disabled={indice === 0}>Atrás</button>
          <button type="button" className="nc-boton ins-pie__siguiente" onClick={avanzar}>{ultima ? 'Terminar' : 'Siguiente'}</button>
        </footer>
      </div>
    </Pantalla>
  )
}
