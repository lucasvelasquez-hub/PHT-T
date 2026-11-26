/**
 * Un caso de la prueba en vivo, dentro de la mesa.
 *  - `decision`: se decide con los botones de la mesa (`continuar: false`: la mesa queda quieta) y se califica contra `correcta`.
 *  - `opciones`: la mesa es solo contexto (`soloContexto`); una hoja con tarjetas recoge la respuesta y `onLectura` trae la lectura de la red.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { construirEscenarioCaso, type Caso } from '../../curso/index.ts'
import { MesaEnVivo, type DecisionHeroe, type LecturaDecision } from '../../juego/index.ts'
import { reproducir } from '../../sonido/sonido.ts'
import { modoPara } from '../../ui/mesa/geometria.ts'
import { useViewport } from '../../ui/datos/entorno.ts'
import { calificarCaso, calificarDecision, cartasATexto, semillaDeCaso, sinIdsInternos, textoDeAccion } from './logica.ts'
import { IconoVer, Rico } from './piezas.tsx'

interface Props {
  caso: Caso
  /** Posición del caso en la sesión (desde 1). */
  numero: number
  total: number
  onResultado: (acierto: boolean) => void
  onSiguiente: () => void
  ultima: boolean
  onSalir: () => void
}

const LETRAS = ['A', 'B', 'C', 'D', 'E']
const NOMBRE_CALLE: Record<string, string> = { preflop: 'preflop', flop: 'flop', turn: 'turn', river: 'river' }

/** Rectángulo de un elemento de la mesa, vigilado mientras `activo` (la mesa lo pinta al cargar y al cambiar de tamaño). */
function useRect(selector: string, activo: boolean): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null)
  useEffect(() => {
    if (!activo) { setRect(null); return }
    const medir = () => {
      const el = document.querySelector(selector)
      const r = el ? el.getBoundingClientRect() : null
      setRect((p) => (r && p && Math.abs(p.top - r.top) < 1 && Math.abs(p.left - r.left) < 1 && Math.abs(p.width - r.width) < 1 && Math.abs(p.height - r.height) < 1 ? p : r))
    }
    medir()
    const id = window.setInterval(medir, 200)
    return () => window.clearInterval(id)
  }, [selector, activo])
  return rect
}

export default function CasoVista({ caso, numero, total, onResultado, onSiguiente, ultima, onSalir }: Props) {
  const { w, h } = useViewport()
  const escritorio = modoPara(w, h) === 'escritorio'
  const escenario = useMemo(() => {
    try { return { ok: construirEscenarioCaso(caso) } } catch (e) { return { error: e instanceof Error ? e.message : String(e) } }
  }, [caso])

  const [decision, setDecision] = useState<DecisionHeroe | null>(null)
  const [lecturaCtx, setLecturaCtx] = useState<LecturaDecision | null>(null)
  const [eleccion, setEleccion] = useState<string | null>(null)
  const [acierto, setAcierto] = useState<boolean | null>(null)
  const [plegada, setPlegada] = useState(false)
  const esDecision = caso.formato === 'decision'
  const respondido = acierto !== null

  const yaDecidio = useRef(false)
  const alDecidir = (d: DecisionHeroe) => {
    if (!esDecision || yaDecidio.current) return
    yaDecidio.current = true
    const r = calificarDecision(caso, d.accion)
    setDecision(d)
    setEleccion(r.texto)
    setAcierto(r.acierto)
    reproducir(r.acierto ? 'puntos_alto' : 'puntos_bajo')
    onResultado(r.acierto)
  }
  const elegir = (op: string) => {
    if (respondido) return
    const ok = calificarCaso(caso, op)
    setEleccion(op)
    setAcierto(ok)
    reproducir(ok ? 'puntos_alto' : 'puntos_bajo')
    onResultado(ok)
  }

  // La pregunta de un caso `decision` se pone sobre el panel de espera de la mesa, sin tapar los botones.
  const espera = useRect('.panel__lecturas--espera', esDecision && !respondido && !('error' in escenario))
  const esperada = caso.correcta.join(' o ')

  if ('error' in escenario) {
    return (
      <div className="ins-hoja ins-hoja--sola" role="alert">
        <p className="ins-hoja__kicker">Caso {numero} de {total}</p>
        <p className="ins-hoja__pregunta">No se pudo armar la mesa de este caso. {escenario.error}</p>
        <div className="ins-hoja__pie"><button type="button" className="nc-boton nc-boton--ancho" onClick={onSiguiente}>{ultima ? 'Ver resultado' : 'Siguiente'}</button></div>
      </div>
    )
  }

  const retroCuerpo = respondido ? (
    <div className={`ins-retro ${acierto ? 'ins-retro--bien' : 'ins-retro--otra'}`} role="status" aria-live="polite">
      <p className="ins-retro__titulo">{acierto ? 'Como se esperaba' : 'Distinto de lo esperado'}</p>
      <p className="ins-retro__esperada">
        Elegiste <b>{eleccion}</b>{!acierto ? <> · la lección esperaba <b>{esperada}</b></> : null}
      </p>
      <p className="ins-retro__texto"><Rico texto={sinIdsInternos(caso.explicacion)} /></p>
      {!acierto && eleccion && caso.porOpcion[eleccion] ? <p className="ins-retro__porque"><b>Sobre {eleccion}:</b> <Rico texto={sinIdsInternos(caso.porOpcion[eleccion]!)} /></p> : null}
      {decision ? <LecturaElite caso={caso} lectura={decision.lectura} eleccion={decision.accion} /> : lecturaCtx ? <LecturaElite caso={caso} lectura={lecturaCtx} eleccion={null} /> : null}
      {!acierto ? <p className="ins-retro__repaso">Quedó en tu Repaso para que lo vuelvas a ver.</p> : null}
    </div>
  ) : null

  return (
    <>
      <MesaEnVivo
        semilla={semillaDeCaso(caso.id)}
        boton={0}
        escenarioInicial={escenario.ok}
        mostrarLecturas={esDecision ? 'despues-de-decidir' : 'nunca'}
        onDecisionHeroe={alDecidir}
        continuar={false}
        soloContexto={!esDecision}
        onLectura={setLecturaCtx}
        onVolver={onSalir}
        origen={`Prueba en vivo · caso ${numero} de ${total}`}
        textoSiguiente={ultima ? 'VER RESULTADO' : 'SIGUIENTE CASO'}
      />

      {/* Caso `decision`, antes de decidir: la pregunta sobre el panel de espera. */}
      {esDecision && !respondido ? (
        <aside
          className="ins-pregunta-mesa"
          style={espera ? { left: espera.left, width: espera.width, bottom: Math.max(8, h - espera.bottom), minHeight: espera.height } : undefined}
          aria-label="Pregunta del caso"
        >
          <p className="ins-hoja__kicker">Caso {numero} de {total} · <Rico texto={caso.titulo} /></p>
          <p className="ins-pregunta-mesa__texto"><Rico texto={caso.pregunta} /></p>
        </aside>
      ) : null}

      {/* Hoja: opciones (formato `opciones`) o retroalimentación (los dos formatos). */}
      {!esDecision || respondido ? (
        <section className={`ins-hoja ${escritorio ? 'ins-hoja--lateral' : 'ins-hoja--inferior'} ${plegada ? 'is-plegada' : ''}`} aria-label={respondido ? 'Retroalimentación' : 'Responde'}>
          {!escritorio ? (
            <button type="button" className="ins-hoja__asa" onClick={() => setPlegada((p) => !p)} aria-expanded={!plegada}>
              <IconoVer /> {plegada ? 'Ver la hoja' : 'Ver la mesa'}
            </button>
          ) : null}
          <div className="ins-hoja__cuerpo">
            <p className="ins-hoja__kicker">Caso {numero} de {total} · <Rico texto={caso.titulo} /> · {caso.heroe}, {NOMBRE_CALLE[caso.calle] ?? caso.calle}</p>
            <p className="ins-hoja__cartas">Tus cartas <b><Rico texto={cartasATexto(caso.cartasHeroe)} /></b>{caso.mesa ? <> · Mesa <b><Rico texto={cartasATexto(caso.mesa)} /></b></> : null}</p>
            {!respondido || !esDecision ? <p className="ins-hoja__pregunta"><Rico texto={caso.pregunta} /></p> : null}

            {!esDecision && !respondido ? (
              <ul className="ins-opciones" role="list">
                {caso.opciones.map((op, i) => (
                  <li key={op}>
                    <button type="button" className="ins-opcion" onClick={() => elegir(op)}>
                      <span className="ins-opcion__letra" aria-hidden="true">{LETRAS[i] ?? i + 1}</span>
                      <span className="ins-opcion__texto">{op}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {!esDecision && respondido ? (
              <ul className="ins-opciones ins-opciones--compactas" role="list">
                {caso.opciones.map((op, i) => {
                  const esEsperada = calificarCaso(caso, op)
                  return (
                    <li key={op}>
                      <span className={`ins-opcion ins-opcion--fija ${esEsperada ? 'is-esperada' : op === eleccion ? 'is-otra' : 'is-apagada'}`}>
                        <span className="ins-opcion__letra" aria-hidden="true">{LETRAS[i] ?? i + 1}</span>
                        <span className="ins-opcion__texto">{op}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : null}

            {retroCuerpo}
          </div>
          {respondido ? (
            <div className="ins-hoja__pie">
              <button type="button" className="nc-boton nc-boton--ancho" onClick={onSiguiente} autoFocus>{ultima ? 'Ver resultado' : 'Siguiente caso'}</button>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  )
}

/** "Lo que haría la élite": las 3 probabilidades de la red, con la decisión del jugador marcada. */
function LecturaElite({ caso, lectura, eleccion }: { caso: Caso; lectura: LecturaDecision; eleccion: 'f' | 'cc' | 'cbr' | null }) {
  const { elite, equityPct, equityMinimaPct } = lectura
  const filas: { clave: 'f' | 'cc' | 'cbr'; nombre: string; p: number }[] = [
    { clave: 'f', nombre: textoDeAccion('f', caso.opciones), p: elite.fold },
    { clave: 'cc', nombre: textoDeAccion('cc', caso.opciones), p: elite.checkCall },
    { clave: 'cbr', nombre: textoDeAccion('cbr', caso.opciones), p: elite.betRaise },
  ]
  const mayor = Math.max(...filas.map((f) => f.p))
  return (
    <div className="ins-elite">
      <h3 className="ins-elite__titulo">Lo que haría la élite</h3>
      <ul className="ins-elite__lista" role="list">
        {filas.map((f) => (
          <li key={f.clave} className={`ins-elite__fila ${f.p === mayor ? 'is-mayor' : ''}`}>
            <span className="ins-elite__nombre">{f.nombre}{f.clave === eleccion ? <em> · tu elección</em> : null}</span>
            <span className="ins-elite__barra" aria-hidden="true"><span style={{ width: `${Math.round(f.p * 100)}%` }} /></span>
            <span className="ins-elite__valor">{Math.round(f.p * 100)} %</span>
          </li>
        ))}
      </ul>
      {caso.tipo === 'matematica' ? (
        <p className="ins-elite__nota">
          La equity de la app es <b>{Math.round(equityPct)} %</b> contra manos al azar{equityMinimaPct !== null ? <> (el precio pide {Math.round(equityMinimaPct)} %)</> : null}.
          La lección calcula con otro método (el de la explicación), así que los números pueden no coincidir.
        </p>
      ) : null}
    </div>
  )
}
