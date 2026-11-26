/** Una sesión de práctica: evaluación (preguntas), prueba en vivo (casos) o repaso (mezcla). Termina con la pantalla de resultado. */
import { useRef, useState } from 'react'
import type { Caso, Pregunta } from '../../curso/index.ts'
import { BarraPantalla, Pantalla } from '../../pantallas/elementos.tsx'
import CasoVista from './CasoVista.tsx'
import { porcentaje, UMBRAL_EVALUACION } from './logica.ts'
import PreguntaTarjeta from './PreguntaTarjeta.tsx'
import { BarraAvance, Estrellas, IconoCheck } from './piezas.tsx'

export type ItemSesion =
  | { tipo: 'pregunta'; modulo: number; pregunta: Pregunta }
  | { tipo: 'caso'; modulo: number; caso: Caso }

export type TipoSesion = 'evaluacion' | 'prueba' | 'repaso'

/** Lo que el orquestador devuelve al cerrar la sesión (estrellas y XP ganados). */
export interface CierreSesion {
  estrellasAntes: number
  estrellasDespues: number
  xp: number
  subioDeRango: boolean
  nombreRango: string
}

interface Props {
  tipo: TipoSesion
  titulo: string
  items: ItemSesion[]
  onResultado: (item: ItemSesion, acierto: boolean) => void
  /** Se llama una sola vez, al terminar el último ítem. */
  onFin: (aciertos: number, total: number) => CierreSesion | null
  siguiente: { texto: string; abrir: () => void } | null
  onRepetir: () => void
  onSalir: () => void
}

export default function Sesion({ tipo, titulo, items, onResultado, onFin, siguiente, onRepetir, onSalir }: Props) {
  const [indice, setIndice] = useState(0)
  const [estados, setEstados] = useState<('ok' | 'no' | undefined)[]>([])
  const [cierre, setCierre] = useState<{ aciertos: number; cierre: CierreSesion | null } | null>(null)
  const cerrado = useRef(false)
  const total = items.length
  const item = items[indice]

  const registrar = (acierto: boolean) => {
    if (!item) return
    setEstados((e) => { const c = [...e]; c[indice] = acierto ? 'ok' : 'no'; return c })
    onResultado(item, acierto)
  }
  const avanzar = () => {
    if (indice < total - 1) { setIndice(indice + 1); return }
    if (cerrado.current) return
    cerrado.current = true
    const aciertos = estados.filter((x) => x === 'ok').length
    setCierre({ aciertos, cierre: onFin(aciertos, total) })
  }

  if (total === 0) {
    return (
      <Pantalla className="ins-raiz">
        <div className="ins-marco">
          <BarraPantalla titulo={titulo} onVolver={onSalir} />
          <div className="ins-cierre"><p className="ins-cierre__texto">No hay nada pendiente por aquí.</p><button type="button" className="nc-boton-suave" onClick={onSalir}>Volver al camino</button></div>
        </div>
      </Pantalla>
    )
  }

  if (cierre) {
    const pct = porcentaje(cierre.aciertos, total)
    const c = cierre.cierre
    const fallos = total - cierre.aciertos
    return (
      <Pantalla className="ins-raiz">
        <div className="ins-marco">
          <BarraPantalla titulo={titulo} onVolver={onSalir} />
          <div className="ins-cierre">
            <span className="ins-medalla" aria-hidden="true"><IconoCheck tam={44} /></span>
            <h2 className="ins-cierre__titulo">{tipo === 'evaluacion' ? 'Evaluación terminada' : tipo === 'prueba' ? 'Prueba en vivo terminada' : 'Repaso terminado'}</h2>
            <p className="ins-cierre__cifra"><b>{cierre.aciertos}</b> de {total}{tipo === 'evaluacion' ? <small> · {pct} %</small> : null}</p>
            <p className="ins-cierre__texto">
              {tipo === 'evaluacion' ? (pct >= UMBRAL_EVALUACION ? 'Superaste el 80 %: ganas la estrella de la evaluación.' : 'Con el 80 % o más ganas la estrella de la evaluación. Puedes intentarlo otra vez cuando quieras.')
                : tipo === 'prueba' ? 'Con 2 de cada 3 casos como se esperaba ganas la estrella de la prueba.'
                : 'Lo que acertaste dos veces sale de tu lista de Repaso.'}
            </p>
            {c && tipo !== 'repaso' ? (
              <div className="ins-cierre__premio">
                <Estrellas n={c.estrellasDespues} tam={30} />
                {c.xp > 0 ? <p className="ins-xp" role="status"><b>+{c.xp}</b> XP · {c.estrellasDespues - c.estrellasAntes === 1 ? 'estrella nueva' : 'estrellas nuevas'}</p> : <p className="ins-cierre__nota">Sin estrellas nuevas esta vez.</p>}
                {c.subioDeRango ? <p className="ins-cierre__rango" role="status">Subiste de rango: {c.nombreRango}</p> : null}
              </div>
            ) : null}
            {fallos > 0 && tipo !== 'repaso' ? <p className="ins-cierre__nota">{fallos === 1 ? 'Un fallo quedó' : `${fallos} fallos quedaron`} en tu Repaso.</p> : null}
            <div className="ins-cierre__botones">
              {siguiente ? <button type="button" className="nc-boton nc-boton--ancho" onClick={siguiente.abrir}>Siguiente: {siguiente.texto}</button> : null}
              {tipo !== 'repaso' ? <button type="button" className="nc-boton-suave" onClick={onRepetir}>Intentarlo otra vez</button> : null}
              <button type="button" className="nc-boton-suave" onClick={onSalir}>Volver al camino</button>
            </div>
          </div>
        </div>
      </Pantalla>
    )
  }

  if (!item) return null
  const ultima = indice === total - 1

  if (item.tipo === 'caso') {
    return (
      <CasoVista
        key={`${item.caso.id}-${indice}`}
        caso={item.caso} numero={indice + 1} total={total} ultima={ultima}
        onResultado={registrar} onSiguiente={avanzar} onSalir={onSalir}
      />
    )
  }
  return (
    <Pantalla className="ins-raiz">
      <div className="ins-marco">
        <BarraPantalla titulo={titulo} onVolver={onSalir} />
        <BarraAvance total={total} actual={indice} estados={estados} etiqueta={`Pregunta ${indice + 1} de ${total}`} />
        <div className="ins-cuerpo">
          <article className="ins-pagina ins-pagina--der">
            <p className="ins-pagina__kicker">Pregunta {indice + 1} de {total}{tipo === 'repaso' ? ' · repaso' : ''}</p>
            <PreguntaTarjeta key={`${item.pregunta.id}-${indice}`} pregunta={item.pregunta} onResponder={registrar} onSiguiente={avanzar} ultima={ultima} />
          </article>
        </div>
      </div>
    </Pantalla>
  )
}

