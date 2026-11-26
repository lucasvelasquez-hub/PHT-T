/**
 * Una sesión (o el reto del día): manos completas en la mesa en vivo, con dos marcadores arriba y la respuesta inmediata
 * de cada decisión. Todo lo que se guarda sale de aquí hacia PantallaRetador (`onGuardar`), después de cada decisión y
 * de cada mano, para que salir a la mitad no pierda nada.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Cifra } from '../../ui/Cifra.tsx'
import { MesaEnVivo, type DecisionHeroe, type ResultadoMano } from '../../juego/index.ts'
import { useProgreso, type Rango } from '../../progreso/progreso.ts'
import { reproducir } from '../../sonido/sonido.ts'
import { MomentoRango } from './MomentoRango.tsx'
import { PuntosSaltan, type InfoDecision } from './PuntosSaltan.tsx'
import {
  SONIDO_NIVEL, botonDeMano, formatearFichas, nivelDePuntaje, precisionMedia, puntajeDecision, semillaDeMano,
  type DecisionRegistrada, type SesionGuardada,
} from './logica.ts'

export interface PropsSesion {
  inicial: SesionGuardada
  /** El aviso de "la élite no distingue tamaños" ya se mostró alguna vez. */
  avisoSubidaVisto: boolean
  onGuardar: (s: SesionGuardada) => void
  onAvisoSubida: () => void
  /** Volver al menú (lo avanzado queda guardado). */
  onSalir: () => void
  /** Se terminó la última mano. */
  onTerminar: (s: SesionGuardada) => void
}

export default function SesionRetador(props: PropsSesion) {
  const { inicial, onGuardar, onAvisoSubida, onSalir, onTerminar } = props
  const { sumarXP } = useProgreso()

  // La verdad vive en una referencia (los eventos de la mesa son asíncronos); el estado solo repinta.
  const verdad = useRef({ decisiones: [...inicial.decisiones], fichasBB: inicial.fichasBB, siguiente: inicial.siguiente })
  const [indice, setIndice] = useState(inicial.siguiente)
  const [decisiones, setDecisiones] = useState<readonly DecisionRegistrada[]>(verdad.current.decisiones)
  const [fichasBB, setFichasBB] = useState(inicial.fichasBB)
  const [momento, setMomento] = useState<Rango | null>(null)
  const avisoVisto = useRef(props.avisoSubidaVisto)
  const infos = useRef(new WeakMap<DecisionHeroe, InfoDecision>())
  const temporizadores = useRef<number[]>([])
  useEffect(() => () => { temporizadores.current.forEach((t) => window.clearTimeout(t)) }, [])

  const indiceRef = useRef(indice)
  indiceRef.current = indice

  const guardar = useCallback(() => {
    const v = verdad.current
    onGuardar({
      tipo: inicial.tipo, dia: inicial.dia, semillaBase: inicial.semillaBase, total: inicial.total,
      siguiente: v.siguiente, decisiones: v.decisiones.map((d) => ({ ...d })), fichasBB: v.fichasBB,
    })
  }, [onGuardar, inicial.tipo, inicial.dia, inicial.semillaBase, inicial.total])

  const alDecidir = useCallback((d: DecisionHeroe) => {
    const puntos = puntajeDecision(d.accion, d.lectura.elite)
    const nivel = nivelDePuntaje(puntos)
    const avisoSubida = d.accion === 'cbr' && !avisoVisto.current
    if (avisoSubida) { avisoVisto.current = true; onAvisoSubida() }
    infos.current.set(d, { puntos, nivel, avisoSubida })
    reproducir(SONIDO_NIVEL[nivel])

    const { subioDeRango, rango } = sumarXP(puntos)
    if (subioDeRango) {
      setMomento(rango)
      temporizadores.current.push(window.setTimeout(() => reproducir('subir_rango'), 450))
    }

    const i = indiceRef.current
    verdad.current.decisiones.push({ mano: i + 1, calle: d.calle, posicion: d.posicion, accion: d.accion, puntos, elite: { ...d.lectura.elite } })
    verdad.current.siguiente = i + 1 // salir ahora deja esta mano como jugada: al volver toca la siguiente
    setDecisiones([...verdad.current.decisiones])
    guardar()
  }, [guardar, onAvisoSubida, sumarXP])

  const alTerminarMano = useCallback((r: ResultadoMano) => {
    const i = indiceRef.current
    const mias = r.cartas[0]
    for (const d of verdad.current.decisiones) if (d.mano === i + 1 && mias) d.cartas = [mias[0], mias[1]]
    verdad.current.fichasBB += r.netoBB
    verdad.current.siguiente = i + 1
    setFichasBB(verdad.current.fichasBB)
    setDecisiones([...verdad.current.decisiones])
    guardar()
  }, [guardar])

  const alSiguiente = useCallback(() => {
    const i = indiceRef.current
    if (i + 1 >= inicial.total) {
      const v = verdad.current
      onTerminar({
        tipo: inicial.tipo, dia: inicial.dia, semillaBase: inicial.semillaBase, total: inicial.total,
        siguiente: inicial.total, decisiones: v.decisiones.map((d) => ({ ...d })), fichasBB: v.fichasBB,
      })
      return
    }
    setIndice(i + 1)
  }, [inicial, onTerminar])

  const retroalimentacion = useCallback((d: DecisionHeroe) => {
    const info = infos.current.get(d) ?? { puntos: puntajeDecision(d.accion, d.lectura.elite), nivel: nivelDePuntaje(puntajeDecision(d.accion, d.lectura.elite)), avisoSubida: false }
    return <PuntosSaltan key={`${indice}-${decisiones.length}`} info={info} />
  }, [indice, decisiones.length])

  const precision = precisionMedia(decisiones)
  const esUltima = indice + 1 >= inicial.total
  const cerrarMomento = useCallback(() => setMomento(null), [])

  return (
    <div className="rt-sesion">
      <MesaEnVivo
        semilla={semillaDeMano(inicial.semillaBase, indice)}
        boton={botonDeMano(inicial.semillaBase, indice)}
        mostrarLecturas="despues-de-decidir"
        retroalimentacion={retroalimentacion}
        onDecisionHeroe={alDecidir}
        onFinMano={alTerminarMano}
        onSiguienteMano={alSiguiente}
        onVolver={onSalir}
        origen={`${inicial.tipo === 'reto' ? 'Reto' : 'Mano'} ${indice + 1}/${inicial.total}`}
        textoSiguiente={esUltima ? 'VER RESUMEN' : 'SIGUIENTE MANO'}
      />
      <BarraMarcadores fichasBB={fichasBB} precision={precision} />
      {momento ? <MomentoRango rango={momento} onCerrar={cerrarMomento} /> : null}
    </div>
  )
}

const fmtEntero = (v: number) => String(Math.round(v))
const fmtFichas = (v: number) => formatearFichas(v)

/** Los dos marcadores de la sesión, a los lados de la píldora de la calle. */
function BarraMarcadores({ fichasBB, precision }: { fichasBB: number; precision: number | null }) {
  return (
    <div className="rt-hud" data-e="marcadores">
      <div className={`rt-marcador ${fichasBB > 0.04 ? 'rt-marcador--sube' : ''}`} data-e="marcador-fichas">
        <strong className="rt-marcador__valor"><Cifra valor={fichasBB} formato={fmtFichas} /><small> BB</small></strong>
        <span className="rt-marcador__rotulo">Fichas</span>
      </div>
      <div className="rt-marcador rt-marcador--der" data-e="marcador-precision">
        <strong className="rt-marcador__valor">
          {precision === null ? <span aria-label="Sin decisiones todavía">—</span> : <><Cifra valor={precision} formato={fmtEntero} /><small> %</small></>}
        </strong>
        <span className="rt-marcador__rotulo">Precisión élite</span>
      </div>
    </div>
  )
}
