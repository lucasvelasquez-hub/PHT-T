/** Una pregunta de la evaluación: tarjetas de opciones o campo numérico, y respuesta inmediata con la explicación. */
import { useEffect, useRef, useState } from 'react'
import type { Pregunta } from '../../curso/index.ts'
import { reproducir } from '../../sonido/sonido.ts'
import { calificarPregunta, leerNumero, sinIdsInternos } from './logica.ts'
import { Rico } from './piezas.tsx'

interface Props {
  pregunta: Pregunta
  /** Se llama una vez, al responder. */
  onResponder: (acierto: boolean) => void
  onSiguiente: () => void
  ultima: boolean
}

const LETRAS = ['A', 'B', 'C', 'D', 'E']

function textoEsperado(p: Pregunta): string {
  if (p.formato !== 'numero') return String(p.correcta)
  const u = p.unidad ?? ''
  return u === '$' ? `$${p.correcta}` : u ? `${p.correcta} ${u}` : String(p.correcta)
}

export default function PreguntaTarjeta({ pregunta, onResponder, onSiguiente, ultima }: Props) {
  const [eleccion, setEleccion] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState<boolean | null>(null)
  const campo = useRef<HTMLInputElement | null>(null)
  const respondida = resultado !== null

  useEffect(() => { if (pregunta.formato === 'numero') campo.current?.focus({ preventScroll: true }) }, [pregunta])

  const responder = (acierto: boolean) => {
    setResultado(acierto)
    reproducir(acierto ? 'puntos_alto' : 'puntos_bajo')
    onResponder(acierto)
  }
  const elegir = (op: string) => {
    if (respondida) return
    setEleccion(op)
    responder(calificarPregunta(pregunta, op))
  }
  const comprobar = () => {
    if (respondida || leerNumero(texto) === null) return
    responder(calificarPregunta(pregunta, texto))
  }

  const unidad = pregunta.unidad ?? ''
  return (
    <div className="ins-pregunta">
      <p className="ins-pregunta__enunciado"><Rico texto={pregunta.enunciado} /></p>

      {pregunta.formato === 'opciones' ? (
        <ul className="ins-opciones" role="list">
          {(pregunta.opciones ?? []).map((op, i) => {
            const esEsperada = calificarPregunta(pregunta, op)
            const estado = !respondida ? '' : esEsperada ? 'is-esperada' : op === eleccion ? 'is-otra' : 'is-apagada'
            return (
              <li key={op}>
                <button type="button" className={`ins-opcion ${estado}`} onClick={() => elegir(op)} disabled={respondida} aria-pressed={op === eleccion}>
                  <span className="ins-opcion__letra" aria-hidden="true">{LETRAS[i] ?? i + 1}</span>
                  <span className="ins-opcion__texto"><Rico texto={op} /></span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <form className="ins-numero" onSubmit={(e) => { e.preventDefault(); comprobar() }}>
          <label className="ins-numero__campo">
            {unidad === '$' ? <span className="ins-numero__unidad" aria-hidden="true">$</span> : null}
            <input
              ref={campo} type="text" inputMode="decimal" autoComplete="off" enterKeyHint="done"
              value={texto} onChange={(e) => setTexto(e.target.value)} disabled={respondida}
              placeholder="Tu respuesta" aria-label={`Tu respuesta${unidad ? ` en ${unidad}` : ''}`}
              className={resultado === null ? '' : resultado ? 'is-esperada' : 'is-otra'}
            />
            {unidad && unidad !== '$' ? <span className="ins-numero__unidad" aria-hidden="true">{unidad}</span> : null}
          </label>
          {!respondida ? <button type="submit" className="nc-boton ins-numero__boton" disabled={leerNumero(texto) === null}>Comprobar</button> : null}
        </form>
      )}

      {respondida ? (
        <div className={`ins-retro ${resultado ? 'ins-retro--bien' : 'ins-retro--otra'}`} role="status" aria-live="polite">
          <p className="ins-retro__titulo">{resultado ? '¡Bien!' : 'Esta vez no, pero ya lo tienes a la vista'}</p>
          {!resultado ? <p className="ins-retro__esperada">Lo esperado: <b><Rico texto={textoEsperado(pregunta)} /></b>{pregunta.formato === 'numero' && texto ? <> · tú pusiste {texto}</> : null}</p> : null}
          <p className="ins-retro__texto"><Rico texto={sinIdsInternos(pregunta.explicacion)} /></p>
          {!resultado ? <p className="ins-retro__repaso">Quedó en tu Repaso para que la vuelvas a ver.</p> : null}
          <button type="button" className="nc-boton nc-boton--ancho" onClick={onSiguiente} autoFocus>{ultima ? 'Ver resultado' : 'Siguiente'}</button>
        </div>
      ) : null}
    </div>
  )
}
