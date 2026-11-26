/**
 * ¿Adivinas qué hizo la élite? Sesión de 10 decisiones al azar del banco de manos reales.
 *
 *   Elegir (la lectura de la élite y la acción real están ocultas)
 *     -> puntos que saltan + sonido + XP + revelación (las barras de la élite corren hasta su valor)
 *     -> Siguiente ... -> Resumen
 *
 * Puntaje de cada decisión: 100 × la probabilidad que la élite le da a la acción elegida.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BarraPantalla, Pantalla } from '../../pantallas/elementos.tsx'
import { rutaCarta } from '../../ui/mesa/Carta.tsx'
import { BarraAcciones, type AccionHeroe } from '../../ui/mesa/BarraAcciones.tsx'
import { PanelLecturas, type Lectura } from '../../ui/mesa/PanelLecturas.tsx'
import { construirEscenario } from '../../ui/datos/escenario.ts'
import { fmtPct } from '../../ui/datos/formato.ts'
import { useAnalisis } from '../../ui/datos/useAnalisis.ts'
import { useProgreso } from '../../progreso/progreso.ts'
import { reproducir } from '../../sonido/sonido.ts'
import type { BancoIndexado } from './banco.ts'
import { guardarEstado, leerEstado, registrarSesion } from './estado.ts'
import {
  DECISIONES_POR_SESION, describirAccion, elegirDecisiones, indiceDeAccion, nivelDePuntaje, nombreDeMano, NOMBRES_CALLE, POSICIONES,
  puntosPorAccion, resumirSesion, sonidoDePuntaje, type AccionJuego, type CodigoAccion, type Referencia, type ResultadoDecision,
} from './logica.ts'
import { MarcoDecision, type Eleccion, type PuntosSaltan } from './MarcoDecision.tsx'

const TEXTO_ACCION: Record<AccionJuego, string> = { fold: 'FOLD', call: 'CALL', raise: 'RAISE' }
/** Con nada que pagar, "CALL" se llama CHECK y "RAISE" se llama BET (como en los botones de la mesa). */
const nombreAccion = (a: AccionJuego, hayQuePagar: boolean) => (hayQuePagar ? TEXTO_ACCION[a] : a === 'call' ? 'CHECK' : a === 'raise' ? 'BET' : 'FOLD')

interface Final { nuevoRecord: boolean; record: number; primera: boolean }

export interface AdivinasProps {
  datos: BancoIndexado
  onSalir: () => void
  /** Abre una decisión en el visor (desde el resumen). */
  onRevisar: (k: number, d: number) => void
}

export function Adivinas({ datos, onSalir, onRevisar }: AdivinasProps) {
  const { sumarXP } = useProgreso()
  const [sesion, setSesion] = useState<Referencia[]>(() => elegirDecisiones(datos.decisiones, DECISIONES_POR_SESION, Math.random))
  const [i, setI] = useState(0)
  const [resultados, setResultados] = useState<ResultadoDecision[]>([])
  const [eleccion, setEleccion] = useState<Eleccion | null>(null)
  const [puntos, setPuntos] = useState<PuntosSaltan | null>(null)
  const [final, setFinal] = useState<Final | null>(null)
  const contador = useRef(0)

  const ref = sesion[i] ?? null
  const escenario = useMemo(() => {
    if (!ref) return null
    try { return construirEscenario(datos.banco, ref.k, ref.idx) } catch { return null }
  }, [datos, ref])
  const lectura = useAnalisis(escenario, true)
  const total = resultados.reduce((t, r) => t + r.puntos, 0)
  const revelada = eleccion !== null
  const ultimo = resultados[resultados.length - 1]

  // Lo que hizo de verdad el jugador (se muestra solo al revelar).
  const real = useMemo(() => {
    if (!ref || !escenario) return null
    const mano = datos.banco.manos.find((m) => m.k === ref.k)!
    const dec = mano.d.find((x) => x[0] === ref.idx)!
    const a = mano.a[ref.idx]!
    return { codigo: dec[1] as CodigoAccion, texto: describirAccion(dec[1] as CodigoAccion, a[2]!, a[3]!, escenario.estado.bb, escenario.aPagarBB > 0) }
  }, [datos, ref, escenario])

  const elegir = useCallback((a: AccionHeroe) => {
    if (!escenario || !ref || !real || eleccion) return
    const p = escenario.banco.prediccion
    const prob: [number, number, number] = [p.fold, p.call, p.raise]
    const pts = puntosPorAccion(prob, a)
    const id = ++contador.current
    reproducir(sonidoDePuntaje(pts))
    const { subioDeRango } = sumarXP(pts)
    if (subioDeRango) window.setTimeout(() => reproducir('subir_rango'), 700)
    setEleccion({ id, accion: a })
    setPuntos({ id, puntos: pts, nivel: nivelDePuntaje(pts) })
    setResultados((r) => [...r, { ...ref, eleccion: a, puntos: pts, real: real.codigo, prob }])
  }, [escenario, ref, real, eleccion, sumarXP])

  const siguiente = useCallback(() => {
    if (i + 1 < sesion.length) {
      setI(i + 1); setEleccion(null); setPuntos(null)
      return
    }
    const suma = resultados.reduce((t, r) => t + r.puntos, 0)
    const { estado, nuevoRecord } = registrarSesion(leerEstado(), suma)
    guardarEstado(estado)
    reproducir('fin_sesion')
    setFinal({ nuevoRecord, record: estado.record, primera: estado.sesiones === 1 })
  }, [i, sesion.length, resultados])

  const otraSesion = useCallback(() => {
    setSesion(elegirDecisiones(datos.decisiones, DECISIONES_POR_SESION, Math.random))
    setI(0); setResultados([]); setEleccion(null); setPuntos(null); setFinal(null)
  }, [datos])

  if (final) {
    return <Resumen resultados={resultados} final={final} datos={datos} onOtra={otraSesion} onSalir={onSalir} onRevisar={onRevisar} />
  }

  // --- La lectura de la élite se oculta hasta que el jugador elige ---
  const ayuda = !revelada
    ? 'Elige una acción antes de ver la respuesta.'
    : ultimo
      ? `Elegiste ${nombreAccion(ultimo.eleccion, (escenario?.aPagarBB ?? 0) > 0)}: la élite lo hace el ${fmtPct(ultimo.prob[indiceDeAccion(ultimo.eleccion)])} de las veces aquí.`
      : null

  const aviso = (
    <p className="aviso an-aviso" role="status">
      <span>{i + 1}/{sesion.length}</span>
      <span>{escenario?.calle ?? '…'}</span>
      <span>REAL · PLURIBUS</span>
      <b>{total} pts</b>
    </p>
  )

  const acciones = !escenario ? null : revelada && ultimo && real ? (
    <div className="an-resultado" data-e="resultado" role="status">
      <div className={`an-resultado__pts an-resultado__pts--${nivelDePuntaje(ultimo.puntos)}`}>
        <b>+{ultimo.puntos}</b><span>pts</span>
      </div>
      <div className="an-resultado__texto">
        <span>{escenario.heroe.nombre} hizo</span>
        <b>{real.texto}</b>
      </div>
      <button type="button" className="accion accion--call an-resultado__sigue" onClick={siguiente} autoFocus>
        {i + 1 < sesion.length ? 'Siguiente' : 'Ver resumen'}
      </button>
    </div>
  ) : (
    <BarraAcciones aPagarBB={escenario.aPagarBB} puedeSubir={escenario.legales.subir !== null} elegida={null} onAccion={elegir} />
  )

  return (
    <MarcoDecision
      escenario={escenario}
      clave={`s${i}`}
      aviso={aviso}
      eleccion={eleccion}
      puntos={puntos}
      onVolver={onSalir}
      panel={(columna) => <PanelAdivinas lectura={lectura} columna={columna} ayuda={ayuda} revelada={revelada} />}
      acciones={acciones}
    />
  )
}

// ======================================================================================================================
/**
 * PanelLecturas con la élite oculta y, encima de esa zona, un recuadro que invita a elegir. El recuadro se coloca midiendo
 * la columna de la élite (así sirve en celular y en PC sin tocar src/ui) y se desvanece al revelar.
 */
function PanelAdivinas({ lectura, columna, ayuda, revelada }: { lectura: Lectura | null; columna: boolean; ayuda: string | null; revelada: boolean }) {
  const raiz = useRef<HTMLDivElement>(null)
  const [caja, setCaja] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [montado, setMontado] = useState(!revelada)

  useLayoutEffect(() => {
    const el = raiz.current
    if (!el) return
    const medir = () => {
      const e = el.querySelector<HTMLElement>('.panel__elite')
      if (!e) return
      const a = el.getBoundingClientRect(), b = e.getBoundingClientRect()
      const t = e.querySelector<HTMLElement>('.panel__titulo')?.getBoundingClientRect()
      const arriba = t ? t.top - a.top : b.top - a.top
      setCaja((c) => {
        const n = { x: b.left - a.left, y: arriba, w: b.width, h: b.bottom - a.top - arriba }
        return c && c.x === n.x && c.y === n.y && c.w === n.w && c.h === n.h ? c : n
      })
    }
    medir()
    const obs = new ResizeObserver(medir)
    obs.observe(el)
    return () => obs.disconnect()
  }, [columna])

  // Tras revelar, el recuadro se queda lo que dura el fundido y se retira.
  useEffect(() => {
    if (!revelada) { setMontado(true); return }
    const t = window.setTimeout(() => setMontado(false), 400)
    return () => window.clearTimeout(t)
  }, [revelada])

  return (
    <div className="an-panel" ref={raiz}>
      <PanelLecturas lectura={lectura} columna={columna} ayuda={ayuda} ocultarElite={!revelada} />
      {montado && caja ? (
        <div
          className={`an-pregunta ${revelada ? 'an-pregunta--sale' : ''}`}
          style={{ left: caja.x, top: caja.y, width: caja.w, height: caja.h }}
          data-e="pregunta-elite"
          aria-hidden={revelada || undefined}
        >
          <b>¿Qué haría la élite?</b>
          <span>Elige para descubrirlo</span>
        </div>
      ) : null}
    </div>
  )
}

// ======================================================================================================================
function Resumen({ resultados, final, datos, onOtra, onSalir, onRevisar }: {
  resultados: ResultadoDecision[]
  final: Final
  datos: BancoIndexado
  onOtra: () => void
  onSalir: () => void
  onRevisar: (k: number, d: number) => void
}) {
  const { ajustes, rango } = useProgreso()
  const resumen = resumirSesion(resultados)
  const nivel = nivelDePuntaje(resumen.maximo > 0 ? (resumen.total / resumen.maximo) * 100 : 0)
  return (
    <Pantalla>
      <div className="nc-envoltura nc-analista an-envoltura">
        <BarraPantalla titulo="¿Adivinas?" onVolver={onSalir} />
        <div className="an-resumen" data-e="resumen">
          <p className="an-resumen__sobre">Sesión terminada</p>
          <h2 className={`an-resumen__total an-resumen__total--${nivel}`}>
            <b>{resumen.total}</b><span> / {resumen.maximo} puntos</span>
          </h2>
          {final.primera ? <p className="an-resumen__nota">Primera sesión: este es tu récord inicial.</p>
            : final.nuevoRecord ? <p className="an-resumen__record">Nuevo récord</p>
            : <p className="an-resumen__nota">Tu récord: <b>{final.record}</b></p>}
          <p className="an-resumen__nota">+{resumen.total} XP · rango {rango.nombre}</p>

          <ul className="an-datos">
            <li><b>{resumen.conLaMasProbable} de {resumen.decisiones}</b><span>veces elegiste lo que la élite hace más a menudo</span></li>
            <li><b>{resumen.conLoReal} de {resumen.decisiones}</b><span>veces coincidiste con lo que hizo el jugador</span></li>
          </ul>

          <ol className="an-sesion" aria-label="Tus decisiones">
            {resultados.map((r, n) => {
              const d = datos.decisiones.find((x) => x.k === r.k && x.idx === r.idx)
              return (
                <li key={`${r.k}-${r.idx}`}>
                  <button type="button" className="an-sesion__fila" onClick={() => onRevisar(r.k, r.idx)} aria-label={`Revisar la mano ${r.k}`}>
                    <span className="an-sesion__n">{n + 1}</span>
                    {d ? (
                      <span className="an-fila__cartas an-fila__cartas--chica" aria-hidden="true">
                        {[d.cartas.slice(0, 2), d.cartas.slice(2, 4)].map((c) => <img key={c} src={rutaCarta(c, ajustes.mazo4colores)} alt="" width={24} height={34} loading="lazy" draggable={false} />)}
                      </span>
                    ) : null}
                    <span className="an-sesion__txt">
                      <b>{d ? `${nombreDeMano(d.cartas)} · ${POSICIONES[d.asiento]} · ${NOMBRES_CALLE[d.calle]}` : `Mano ${r.k}`}</b>
                      <span>Elegiste {nombreAccion(r.eleccion, (d?.aPagarBB ?? 1) > 0)} · hizo {nombreAccion(['fold', 'call', 'raise'][r.real] as AccionJuego, (d?.aPagarBB ?? 1) > 0)}</span>
                    </span>
                    <span className={`an-sesion__pts an-sesion__pts--${nivelDePuntaje(r.puntos)}`}>+{r.puntos}</span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="an-resumen__botones">
            <button type="button" className="nc-boton nc-boton--ancho" onClick={onOtra}>Otra sesión</button>
            <button type="button" className="nc-boton-suave" onClick={onSalir}>Volver al Analista</button>
          </div>
        </div>
      </div>
    </Pantalla>
  )
}
