/**
 * Resumen de una sesión: precisión y fichas, mejor decisión, decisión a revisar, el estilo frente a la élite y el récord.
 * Suena `fin_sesion` una vez al entrar.
 */
import { useEffect, useRef, useState } from 'react'
import { BarraPantalla, Pantalla } from '../../pantallas/elementos.tsx'
import { reproducir } from '../../sonido/sonido.ts'
import {
  NOMBRE_ACCION, NOMBRE_CALLE, ETIQUETA_NIVEL, formatearCarta, formatearFichas, nivelDePuntaje, probabilidadDe,
  type DecisionRegistrada, type ResultadoRecord, type ResumenSesion,
} from './logica.ts'

export interface PropsResumen {
  resumen: ResumenSesion
  record: ResultadoRecord
  onOtraSesion: () => void
  onRepetirReto?: () => void
  onVolver: () => void
}

/** Número que sube de 0 a su valor (con movimiento reducido, ya en su valor). */
function useContador(valor: number, ms = 900): number {
  const reducido = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [v, setV] = useState(reducido ? valor : 0)
  useEffect(() => {
    if (reducido) { setV(valor); return }
    let id = 0
    const t0 = performance.now()
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      setV(valor * (1 - Math.pow(1 - k, 3)))
      if (k < 1) id = requestAnimationFrame(paso)
    }
    id = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(id)
  }, [valor, ms, reducido])
  return v
}

const pct = (p: number) => Math.round(p * 100)

function BarrasElite({ d }: { d: DecisionRegistrada }) {
  const filas = [
    { id: 'f' as const, nombre: 'Fold', p: d.elite.fold },
    { id: 'cc' as const, nombre: 'Check-Call', p: d.elite.checkCall },
    { id: 'cbr' as const, nombre: 'Raise', p: d.elite.betRaise },
  ]
  return (
    <ul className="rt-barras" aria-label="Lo que haría la élite">
      {filas.map((f) => (
        <li key={f.id} className={f.id === d.accion ? 'rt-barras__fila rt-barras__fila--elegida' : 'rt-barras__fila'}>
          <span className="rt-barras__nombre">{f.nombre}{f.id === d.accion ? <i> · tú</i> : null}</span>
          <span className="rt-barras__pista"><span className="rt-barras__relleno" style={{ transform: `scaleX(${Math.max(0.01, f.p)})` }} /></span>
          <span className="rt-barras__pct">{pct(f.p)} %</span>
        </li>
      ))}
    </ul>
  )
}

function TarjetaDecision(props: { titulo: string; clase: string; d: DecisionRegistrada; texto: (p: number, accion: string) => string; dato: string }) {
  const { d } = props
  const p = pct(probabilidadDe(d.accion, d.elite))
  return (
    <section className={`rt-tarjeta ${props.clase}`} data-e={props.dato}>
      <h3 className="rt-tarjeta__titulo">{props.titulo}</h3>
      <p className="rt-tarjeta__donde">
        Mano {d.mano} · {NOMBRE_CALLE[d.calle]} · {d.posicion}
        {d.cartas ? <span className="rt-tarjeta__cartas">{d.cartas.map(formatearCarta).join(' ')}</span> : null}
      </p>
      <p className="rt-tarjeta__texto">{props.texto(p, NOMBRE_ACCION[d.accion])}</p>
      <BarrasElite d={d} />
      <p className="rt-tarjeta__pie"><b>{d.puntos}</b> puntos · {ETIQUETA_NIVEL[nivelDePuntaje(d.puntos)]}</p>
    </section>
  )
}

function FilaEstilo({ nombre, jugador, elite }: { nombre: string; jugador: number; elite: number }) {
  return (
    <div className="rt-estilo__fila">
      <span className="rt-estilo__nombre">{nombre}</span>
      <div className="rt-estilo__barras">
        <span className="rt-estilo__barra rt-estilo__barra--tu" style={{ width: `${Math.max(2, jugador)}%` }}><i>Tú {jugador} %</i></span>
        <span className="rt-estilo__barra rt-estilo__barra--elite" style={{ width: `${Math.max(2, elite)}%` }}><i>Élite {elite} %</i></span>
      </div>
    </div>
  )
}

export default function ResumenRetador({ resumen, record, onOtraSesion, onRepetirReto, onVolver }: PropsResumen) {
  const sono = useRef(false)
  useEffect(() => {
    if (sono.current) return
    sono.current = true
    reproducir('fin_sesion')
  }, [])

  const precision = useContador(resumen.precision ?? 0)
  const { estilo } = resumen
  const nombre = resumen.tipo === 'reto' ? 'Reto del día' : 'Sesión'
  const marca = resumen.tipo === 'reto' ? 'el mejor de hoy' : 'tu récord'
  const fichas = formatearFichas(resumen.fichasBB)

  return (
    <Pantalla>
      <div className="nc-envoltura nc-retador rt-envoltura">
        <BarraPantalla titulo="Retador" onVolver={onVolver} />
        <div className="rt-resumen">
          <header className="rt-resumen__cabeza">
            <p className="rt-resumen__sobre">{nombre} · {resumen.n} {resumen.n === 1 ? 'decisión' : 'decisiones'}</p>
            <h2 className="nc-titulo">Así jugaste frente a la élite</h2>
          </header>

          <section className="rt-resumen__marcadores" aria-label="Marcadores finales">
            <div className="rt-grande rt-grande--precision" data-e="precision-final">
              <span className="rt-grande__rotulo">Precisión élite</span>
              <strong className="rt-grande__valor">{resumen.precision === null ? '—' : Math.round(precision)}<small>{resumen.precision === null ? '' : ' %'}</small></strong>
              <span className="rt-grande__nota">Cuánto se parecen tus decisiones a las de la élite</span>
            </div>
            <div className="rt-grande rt-grande--fichas" data-e="fichas-final">
              <span className="rt-grande__rotulo">Fichas</span>
              <strong className="rt-grande__valor">{fichas}<small> BB</small></strong>
              <span className="rt-grande__nota">Lo que ganaste o perdiste en las manos</span>
            </div>
            <p className="rt-xp" data-e="xp-ganada">+{resumen.xp.toLocaleString('es-MX')} XP</p>
          </section>

          {resumen.precision !== null ? (
            <p className={`rt-marca ${record.batido ? "rt-marca--nuevo" : ""}`} role="status" data-e="record-final">
              {record.batido
                ? <><b>{record.primero ? 'Primer récord' : 'Nuevo récord'}</b> {resumen.tipo === 'reto' ? 'de hoy' : ''} · {resumen.precision} %{record.anterior !== null ? ` (antes ${record.anterior} %)` : ''}</>
                : <>Todavía no superas {marca}: <b>{record.anterior} %</b>. Cada sesión cuenta.</>}
            </p>
          ) : null}

          <div className="rt-resumen__cuerpo">
            {resumen.mejor ? (
              <TarjetaDecision
                titulo="Tu mejor decisión" clase="rt-tarjeta--mejor" d={resumen.mejor} dato="mejor-decision"
                texto={(p, a) => (p >= 60 ? `Elegiste ${a} y la élite lo hace el ${p} % de las veces. Aquí estaba dividida y tú coincidiste con la mayoría.` : `Elegiste ${a} y la élite lo hace el ${p} % de las veces. Fue lo que más se pareció a la élite esta vez.`)}
              />
            ) : (
              <section className="rt-tarjeta" data-e="mejor-decision"><h3 className="rt-tarjeta__titulo">Tu mejor decisión</h3><p className="rt-tarjeta__texto">Esta vez ninguna decisión coincidió con la élite. Con más manos se ve mejor.</p></section>
            )}
            {resumen.revisar ? (
              <TarjetaDecision
                titulo="Decisión a revisar" clase="rt-tarjeta--revisar" d={resumen.revisar} dato="decision-a-revisar"
                texto={(p, a) => `Elegiste ${a}; la élite lo hace el ${p} % de las veces. Mírala con calma: es la que más se alejó de lo que hace la élite.`}
              />
            ) : (
              <section className="rt-tarjeta" data-e="decision-a-revisar"><h3 className="rt-tarjeta__titulo">Decisión a revisar</h3><p className="rt-tarjeta__texto">Ninguna: todas tus decisiones fueron como las de la élite.</p></section>
            )}

            <section className="rt-tarjeta rt-estilo" data-e="estilo">
              <h3 className="rt-tarjeta__titulo">Tu estilo frente a la élite</h3>
              <p className="rt-estilo__titulo">{estilo.titulo}</p>
              {estilo.suficiente ? (
                <>
                  <FilaEstilo nombre="Raise" jugador={estilo.jugador.raise} elite={estilo.elite.raise} />
                  <p className="rt-estilo__frase">{estilo.fraseRaise}</p>
                  <FilaEstilo nombre="Fold" jugador={estilo.jugador.fold} elite={estilo.elite.fold} />
                  <p className="rt-estilo__frase">{estilo.fraseFold}</p>
                </>
              ) : (
                <p className="rt-tarjeta__texto">Juega más manos y aquí verás cuántas veces subes y te retiras frente a la élite.</p>
              )}
            </section>
          </div>

          <div className="rt-resumen__botones">
            <button type="button" className="nc-boton nc-boton--ancho" onClick={onOtraSesion} data-e="otra-sesion">Otra sesión</button>
            {onRepetirReto ? <button type="button" className="nc-boton-suave" onClick={onRepetirReto} data-e="repetir-reto">Repetir el reto</button> : null}
            <button type="button" className="nc-boton-suave" onClick={onVolver} data-e="volver">Volver</button>
          </div>
        </div>
      </div>
    </Pantalla>
  )
}
