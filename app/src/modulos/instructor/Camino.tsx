/** El camino: los 13 módulos como un recorrido vertical con fichas de casino por nodo. Todo abierto; el siguiente recomendado brilla. */
import { useEffect, useRef } from 'react'
import type { Curso, Modulo } from '../../curso/index.ts'
import { BarraPantalla, Pantalla } from '../../pantallas/elementos.tsx'
import {
  desplazamiento, estrellasDeModulo, mismoNodo, nodoHecho, nodosDeModulo, siguienteRecomendado,
  type EstadoInstructor, type NodoCamino,
} from './logica.ts'
import { Estrellas, IconoEstrella, IconoCartas, IconoCheck, IconoEvaluacion, IconoJugar, IconoRepaso, Rico } from './piezas.tsx'
import { MODULO_OPCIONAL, tituloDeModulo } from './titulos.ts'

interface Props {
  curso: Curso
  estado: EstadoInstructor
  xp: number
  rango: { nombre: string; xpMin: number; xpSiguiente: number | null }
  /** Descripción de dónde quedó, si aplica ("Lección 4.2 · pantalla 3 de 5"). */
  continuar: { texto: string; alAbrir: () => void } | null
  onAbrir: (n: NodoCamino) => void
  onRepaso: () => void
  onSalir: () => void
}

export default function Camino({ curso, estado, xp, rango, continuar, onAbrir, onRepaso, onSalir }: Props) {
  const recomendado = siguienteRecomendado(curso.modulos, estado)
  const totalEstrellas = curso.modulos.reduce((s, m) => s + estrellasDeModulo(estado, m), 0)
  const refRecomendado = useRef<HTMLButtonElement | null>(null)

  // Al abrir, el recomendado queda a la vista (sin animación forzada: el navegador respeta reduced-motion).
  useEffect(() => {
    const id = window.setTimeout(() => refRecomendado.current?.scrollIntoView({ block: 'center' }), 60)
    return () => window.clearTimeout(id)
  }, [])

  const pctRango = rango.xpSiguiente === null ? 100 : Math.round(((xp - rango.xpMin) / (rango.xpSiguiente - rango.xpMin)) * 100)

  return (
    <Pantalla className="ins-raiz">
      <div className="nc-envoltura nc-instructor ins-camino-envoltura">
        <BarraPantalla titulo="Instructor" onVolver={onSalir} />
        <div className="ins-camino">
          <section className="ins-resumen" aria-label="Tu progreso">
            <div className="ins-resumen__rango">
              <span className="ins-resumen__nombre">{rango.nombre}</span>
              <span className="ins-resumen__xp">{xp} XP</span>
              <span className="ins-resumen__barra" role="img" aria-label={`${Math.max(0, Math.min(100, pctRango))} % hacia el siguiente rango`}>
                <span style={{ width: `${Math.max(4, Math.min(100, pctRango))}%` }} />
              </span>
            </div>
            <div className="ins-resumen__estrellas">
              <IconoEstrella llena tam={22} />
              <span><b>{totalEstrellas}</b> / {curso.modulos.length * 3}</span>
            </div>
          </section>

          {continuar ? (
            <button type="button" className="ins-tarjeta-accion ins-tarjeta-accion--continuar" onClick={continuar.alAbrir}>
              <span className="ins-tarjeta-accion__icono"><IconoJugar /></span>
              <span className="ins-tarjeta-accion__texto"><b>Seguir donde quedaste</b><small>{continuar.texto}</small></span>
            </button>
          ) : null}

          {estado.repaso.length > 0 ? (
            <button type="button" className="ins-tarjeta-accion" onClick={onRepaso}>
              <span className="ins-tarjeta-accion__icono"><IconoRepaso /></span>
              <span className="ins-tarjeta-accion__texto"><b>Repaso</b><small>{estado.repaso.length === 1 ? '1 pendiente' : `${estado.repaso.length} pendientes`}: acierta cada uno dos veces para despedirlo.</small></span>
            </button>
          ) : null}

          {curso.modulos.map((m) => (
            <SeccionModulo key={m.id} modulo={m} estado={estado} recomendado={recomendado} refRecomendado={refRecomendado} onAbrir={onAbrir} />
          ))}
          <p className="ins-fin-camino">Has llegado al final del camino. Los nodos siguen abiertos para repasar cuando quieras.</p>
        </div>
      </div>
    </Pantalla>
  )
}

function SeccionModulo({ modulo, estado, recomendado, refRecomendado, onAbrir }: {
  modulo: Modulo
  estado: EstadoInstructor
  recomendado: NodoCamino | null
  refRecomendado: React.MutableRefObject<HTMLButtonElement | null>
  onAbrir: (n: NodoCamino) => void
}) {
  const nodos = nodosDeModulo(modulo)
  const hechas = modulo.lecciones.filter((l) => estado.lecciones.includes(l.id)).length
  const n = estrellasDeModulo(estado, modulo)
  const titulo = tituloDeModulo(modulo.numero, modulo.titulo)
  return (
    <section className="ins-modulo" aria-labelledby={`ins-mod-${modulo.numero}`}>
      <header className="ins-modulo__cabeza">
        <span className="ins-modulo__numero" aria-hidden="true">{String(modulo.numero).padStart(2, '0')}</span>
        <div className="ins-modulo__texto">
          <h2 id={`ins-mod-${modulo.numero}`} className="ins-modulo__titulo"><span className="ins-sr">Módulo {modulo.numero}: </span>{titulo}</h2>
          <p className="ins-modulo__sub">
            {modulo.numero === MODULO_OPCIONAL ? 'Opcional · ' : ''}{hechas}/{modulo.lecciones.length} lecciones
          </p>
        </div>
        <Estrellas n={n} />
      </header>
      <ol className="ins-sendero">
        {nodos.map((nodo, i) => {
          const esRecomendado = recomendado !== null && mismoNodo(nodo, recomendado)
          const hecho = nodoHecho(estado, nodo)
          const etiqueta = etiquetaDe(nodo, modulo)
          return (
            <li key={i} className="ins-sendero__fila" style={{ ['--desp' as string]: String(desplazamiento(i)) }}>
              <div className="ins-sendero__nodo">
                {esRecomendado ? <span className="ins-globo" aria-hidden="true">Empieza aquí</span> : null}
                <button
                  type="button"
                  ref={esRecomendado ? refRecomendado : undefined}
                  className={`ins-ficha ins-ficha--${nodo.tipo} ${hecho ? 'ins-ficha--hecha' : ''} ${esRecomendado ? 'ins-ficha--siguiente' : ''}`}
                  onClick={() => onAbrir(nodo)}
                  aria-label={`${etiqueta.titulo}${hecho ? ' (hecha)' : ''}${esRecomendado ? ' (siguiente recomendada)' : ''}`}
                >
                  <span className="ins-ficha__centro">
                    {hecho ? <IconoCheck /> : nodo.tipo === 'leccion' ? <span className="ins-ficha__num">{etiqueta.corto}</span> : nodo.tipo === 'evaluacion' ? <IconoEvaluacion /> : <IconoCartas />}
                  </span>
                </button>
                <span className="ins-sendero__rotulo">
                  <Rico texto={etiqueta.titulo} />
                  {etiqueta.detalle ? <small>{etiqueta.detalle}</small> : null}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function etiquetaDe(nodo: NodoCamino, m: Modulo): { titulo: string; corto: string; detalle: string } {
  if (nodo.tipo === 'evaluacion') return { titulo: 'Evaluación', corto: '', detalle: `${m.evaluacion.length} preguntas` }
  if (nodo.tipo === 'prueba') return { titulo: 'Prueba en vivo', corto: '', detalle: `${m.casos.length} casos en la mesa` }
  const l = m.lecciones.find((x) => x.id === nodo.id)
  return { titulo: l?.titulo ?? nodo.id, corto: l ? `${l.modulo}.${l.numero}` : '', detalle: l ? `${l.minutos} min` : '' }
}
