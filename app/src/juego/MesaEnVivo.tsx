/**
 * MesaEnVivo: una mano completa jugable en la mesa del comp B.
 *
 *   Partida (src/juego/partida.ts) ──> instantáneas (`Vista`) ──> Mesa + panel + barra de acciones
 *
 * Un "conductor" asíncrono lleva la mano: reparte, hace pensar a cada rival 0.6 s, espera la decisión del jugador
 * (la barra solo se activa cuando su lectura está lista), reparte las calles y, al final, muestra las cartas, marca
 * al ganador y manda las fichas del bote. "Saltar" (tras retirarse) resuelve el resto al instante.
 * El motor (equity + red ONNX) corre en el Web Worker y se comparte entre manos.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { accionesLegales, type Accion } from '../motor/index.ts'
import { CLAVE_MAZO4, guardarAjuste, leerAjuste, useViewport } from '../ui/datos/entorno.ts'
import { comentarioDe } from '../ui/datos/comentario.ts'
import { fmtBB } from '../ui/datos/formato.ts'
import { BarraAcciones, type AccionHeroe, type TamanoSubida } from '../ui/mesa/BarraAcciones.tsx'
import { calcularEscena } from '../ui/mesa/geometria.ts'
import { MarcoMesa } from '../ui/mesa/MarcoMesa.tsx'
import { Mesa, type PremioFichas, type VueloFichas } from '../ui/mesa/Mesa.tsx'
import { PanelLecturas, type Lectura } from '../ui/mesa/PanelLecturas.tsx'
import type { EscenarioMesa } from '../ui/datos/escenario.ts'
import { analistaWorker, type Analista, type AnalisisDecision } from './analista.ts'
import { detenerTrasDecision, lecturaDeContexto } from './conductor.ts'
import { Partida } from './partida.ts'
import { repartirBote } from './reparto.ts'
import { reproducirSeguro } from './sonidoSeguro.ts'
import { subidasPosibles } from './tamanos.ts'
import type { DecisionHeroe, PasoGuion, PropsMesaEnVivo, ResultadoMano } from './tipos.ts'
import { NOMBRES_CALLE, escenarioDe, type OpcionesVista } from './vista.ts'
import { NOMBRES_CLASE, claseDePuntaje } from '../motor/index.ts'

// --- Tiempos (segundos en el diseño; aquí en ms) --------------------------------------------------------------------
const T_REPARTO = 700
const T_PENSAR = 600
const T_TRAS_ACCION = 350
const T_ENTRE_CALLES = 650
const T_AYUDA_RIVAL = 1900
const T_SHOWDOWN = 1100
const T_PREMIO = 600

interface Vista {
  escenario: EscenarioMesa
  boteBB: number
  stackHeroeBB: number
  calle: string
  heroeRetirado: boolean
  premios: PremioFichas[] | null
}

interface Pendiente {
  aPagarBB: number
  puedeSubir: boolean
  subidas: TamanoSubida[]
  permitida: AccionHeroe | null
  textoSubir?: string
  paso: PasoGuion | null
}

/** Reloj que se puede "saltar": al saltar, todas las esperas terminan ya. */
function crearReloj() {
  let saltando = false
  const despertar = new Set<() => void>()
  return {
    get saltando() { return saltando },
    saltar() { saltando = true; despertar.forEach((f) => f()); despertar.clear() },
    esperar(ms: number): Promise<void> {
      if (saltando || ms <= 0) return Promise.resolve()
      return new Promise((ok) => {
        const fin = () => { clearTimeout(t); despertar.delete(fin); ok() }
        const t = setTimeout(fin, ms)
        despertar.add(fin)
      })
    },
  }
}

function lecturaDePanel(a: AnalisisDecision): Lectura {
  return {
    equity: a.equity,
    potOdds: a.potOdds,
    fold: a.prediccion.fold,
    call: a.prediccion.call,
    raise: a.prediccion.raise,
    comentario: comentarioDe(a.lectura, a.prediccion),
    fuente: 'vivo',
  }
}

export function MesaEnVivo(props: PropsMesaEnVivo) {
  const [analista] = useState<Analista>(() => analistaWorker())
  useEffect(() => {
    void analista.iniciar().catch(() => undefined) // calienta el motor mientras se ve la mesa
    return () => analista.cerrar()
  }, [analista])
  return <ManoEnCurso key={`${props.semilla}-${props.boton}-${props.escenarioInicial ? 'e' : ''}${props.guion ? 'g' : ''}`} {...props} analista={analista} />
}

function ManoEnCurso(props: PropsMesaEnVivo & { analista: Analista }) {
  const { analista, mostrarLecturas } = props
  const { w, h } = useViewport()
  const escena = useMemo(() => calcularEscena(w, h), [w, h])
  const enlace = useRef(props)
  enlace.current = props

  const [cuatroColoresLocal, setCuatroColoresLocal] = useState(() => leerAjuste(CLAVE_MAZO4))
  const cuatroColores = props.cuatroColores ?? cuatroColoresLocal
  const cambiarMazo = useCallback((v: boolean) => { setCuatroColoresLocal(v); guardarAjuste(CLAVE_MAZO4, v) }, [])
  const [ajustes, setAjustes] = useState(false)

  const [vista, setVista] = useState<Vista | null>(null)
  const [pendiente, setPendiente] = useState<Pendiente | null>(null)
  const [lectura, setLectura] = useState<Lectura | null>(null)
  const [turnoHeroeVisto, setTurnoHeroeVisto] = useState(false)
  const [decision, setDecision] = useState<DecisionHeroe | null>(null)
  const [vuelo, setVuelo] = useState<VueloFichas | null>(null)
  const [boteOculto, setBoteOculto] = useState(0)
  const [fin, setFin] = useState<ResultadoMano | null>(null)
  const [ayuda, setAyuda] = useState<string | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)
  const [heroeFuera, setHeroeFuera] = useState(false)
  const [detenida, setDetenida] = useState(false) // `continuar: false`: la mano se paró tras la decisión del héroe
  const reloj = useRef(crearReloj())
  const respuesta = useRef<((a: Accion) => void) | null>(null)
  const partidaRef = useRef<Partida | null>(null)
  const subidasRef = useRef<Map<number, number>>(new Map())

  const alLlegar = useCallback(() => setBoteOculto(0), [])
  const alTerminarVuelo = useCallback(() => setVuelo(null), [])

  // --- El conductor de la mano ----------------------------------------------------------------------------------
  useEffect(() => {
    let vivo = true
    const reloj0 = crearReloj()
    reloj.current = reloj0
    const { semilla, boton, escenarioInicial, guion, nombreHeroe } = enlace.current
    let contadorVuelos = 0

    const publicar = (p: Partida, o: Partial<OpcionesVista> = {}, extra: Partial<Vista> = {}) => {
      if (!vivo) return
      const e = p.estado
      setVista({
        escenario: escenarioDe(p, { turno: null, reveladas: false, ganadores: [], notas: {}, ...o }),
        boteBB: e.bote / e.bb,
        stackHeroeBB: e.stacks[p.heroe]! / e.bb,
        calle: NOMBRES_CALLE[e.calle]!,
        heroeRetirado: !e.activos[p.heroe],
        premios: null,
        ...extra,
      })
      setHeroeFuera(!e.activos[p.heroe])
    }

    const correr = async () => {
      setFallo(null); setDetenida(false); setFin(null); setDecision(null); setLectura(null); setPendiente(null); setAyuda(null); setTurnoHeroeVisto(false)
      const p = new Partida({ semilla, boton, escenarioInicial, guion, nombreHeroe })
      partidaRef.current = p
      publicar(p)
      reproducirSeguro('carta')
      if (guion?.introduccion) setAyuda(guion.introduccion)
      await reloj0.esperar(T_REPARTO)

      // --- Solo contexto: se muestra la situación y se entrega la lectura, sin pedir decisión ---
      if (enlace.current.soloContexto) {
        const c = await lecturaDeContexto(p, analista)
        if (!vivo) return
        if (c) {
          setTurnoHeroeVisto(true)
          if (enlace.current.mostrarLecturas === 'siempre') setLectura(lecturaDePanel(c.analisis))
          enlace.current.onLectura?.(c.lectura)
        }
        return
      }

      for (let paso = 0; paso < 500 && vivo; paso++) {
        const fase = p.fase()

        if (fase === 'esperando_accion') {
          const s = p.turno()!
          const guionado = p.pasoDelGuion()
          if (s === p.heroe) {
            // --- Turno del jugador ---
            setTurnoHeroeVisto(true)
            setLectura(null)
            setPendiente(null)
            publicar(p, { turno: 0 })
            const analisis = await p.analizarHeroe(analista)
            if (!vivo) return
            const legales = accionesLegales(p.estado, p.heroe)
            const bb = p.estado.bb
            const posibles = subidasPosibles(p.estado, p.heroe)
            subidasRef.current = new Map(posibles.map((x) => [x.hasta / bb, x.hasta]))
            if (guionado?.ayuda) setAyuda(guionado.ayuda)
            else if (guionado) setAyuda(null)
            if (enlace.current.mostrarLecturas === 'siempre') setLectura(lecturaDePanel(analisis))
            const permitida: AccionHeroe | null = guionado
              ? guionado.tipo === 'f' ? (legales.puedeFold ? 'fold' : 'call') : guionado.tipo === 'cc' ? 'call' : 'raise'
              : null
            const accionGuion = guionado ? p.accionDePaso(guionado, p.heroe) : null
            const accion = await new Promise<Accion>((ok) => {
              respuesta.current = ok
              setPendiente({
                aPagarBB: legales.aPagar / bb,
                puedeSubir: legales.subir !== null,
                subidas: guionado ? [] : posibles.map((x) => ({ id: x.id, etiqueta: x.etiqueta, hastaBB: x.hasta / bb })),
                permitida,
                textoSubir: guionado?.tipo === 'cbr' && accionGuion?.hasta ? `RAISE ${fmtBB(accionGuion.hasta / bb)}` : undefined,
                paso: guionado,
              })
            })
            respuesta.current = null
            if (!vivo) return
            setPendiente(null)
            const dec = p.decisionHeroe(accion, analisis)
            setDecision(dec)
            if (enlace.current.mostrarLecturas === 'despues-de-decidir') setLectura(lecturaDePanel(analisis))
            enlace.current.onDecisionHeroe?.(dec)
            const ev = p.aplicar(accion, analisis)
            sonidoAccion(accion.tipo, ev.pago)
            const pagoBB = ev.pago / bb
            if (pagoBB > 0 && !reloj0.saltando) {
              setBoteOculto(pagoBB)
              setVuelo({ id: ++contadorVuelos, monto: pagoBB })
            }
            publicar(p)
            await reloj0.esperar(T_TRAS_ACCION)
            if (detenerTrasDecision(enlace.current.continuar, escenarioInicial)) { setDetenida(true); return } // la mesa queda quieta, sin barra ni Saltar
          } else {
            // --- Turno de un rival ---
            if (guionado?.ayuda) setAyuda(guionado.ayuda)
            publicar(p, { turno: p.fisicoDe(s) })
            const [d] = await Promise.all([
              p.decidirRival(analista, s),
              reloj0.esperar(guionado?.ayuda ? T_AYUDA_RIVAL : T_PENSAR),
            ])
            if (!vivo) return
            const ev = p.aplicar(d.accion, d.lectura)
            sonidoAccion(d.accion.tipo, ev.pago)
            publicar(p)
            await reloj0.esperar(T_TRAS_ACCION)
          }
        } else if (fase === 'repartir_calle') {
          await reloj0.esperar(T_ENTRE_CALLES)
          if (!vivo) return
          p.repartirSiguienteCalle()
          reproducirSeguro(p.estado.tablero.length === 3 ? 'volteo' : 'carta')
          setAyuda((a) => (p.guion ? a : null))
          publicar(p)
          await reloj0.esperar(T_TRAS_ACCION)
        } else {
          // --- Final de la mano: cartas, ganador y fichas ---
          const rep = repartirBote(p.estado, p.tablero)
          const bb = p.estado.bb
          const ganadoresMesa = rep.ganadores.map((s) => p.fisicoDe(s))
          const notas: Record<number, string> = {}
          if (rep.showdown) {
            p.estado.activos.forEach((a, s) => {
              if (a && rep.puntajes[s] !== null) notas[p.fisicoDe(s)] = NOMBRES_CLASE[claseDePuntaje(rep.puntajes[s]!)]!
            })
            reproducirSeguro('volteo')
          }
          publicar(p, { reveladas: rep.showdown, ganadores: ganadoresMesa, notas })
          await reloj0.esperar(rep.showdown ? T_SHOWDOWN : 300)
          if (!vivo) return
          const premios: PremioFichas[] = rep.ganadores.map((s) => ({ id: ++contadorVuelos, monto: rep.premios[s]! / bb, hacia: p.fisicoDe(s) }))
          reproducirSeguro('fichas_bote')
          publicar(p, { reveladas: rep.showdown, ganadores: ganadoresMesa, notas }, { premios })
          await reloj0.esperar(T_PREMIO)
          if (!vivo) return
          const resultado = p.resolver()
          const notasFinales = { ...notas }
          for (const s of rep.ganadores) notasFinales[p.fisicoDe(s)] = `+${fmtBB(rep.premios[s]! / bb)} BB`
          publicar(p, { reveladas: rep.showdown, ganadores: ganadoresMesa, notas: notasFinales })
          if (resultado.ganadores.includes(0)) reproducirSeguro('ganar_bote')
          setFin(resultado)
          enlace.current.onFinMano?.(resultado)
          return
        }
      }
    }

    correr().catch((e: unknown) => { if (vivo) setFallo(e instanceof Error ? e.message : String(e)) })
    return () => {
      vivo = false
      respuesta.current = null
    }
  }, [analista, intento])

  // --- Acciones del jugador ---------------------------------------------------------------------------------------
  const elegir = useCallback((a: AccionHeroe) => {
    const p = partidaRef.current
    const responder = respuesta.current
    if (!p || !responder || !pendiente) return
    respuesta.current = null // solo vale el primer toque
    const asiento = p.heroe
    if (a === 'fold') return responder({ asiento, tipo: 'f' })
    if (a === 'call') return responder({ asiento, tipo: 'cc' })
    const guionada = pendiente.paso ? p.accionDePaso(pendiente.paso, asiento) : null
    responder(guionada ?? { asiento, tipo: 'cbr', hasta: accionesLegales(p.estado, asiento).subir?.min })
  }, [pendiente])

  const subir = useCallback((hastaBB: number) => {
    const p = partidaRef.current
    const responder = respuesta.current
    if (!p || !responder) return
    respuesta.current = null
    responder({ asiento: p.heroe, tipo: 'cbr', hasta: subidasRef.current.get(hastaBB) ?? Math.round(hastaBB * p.estado.bb) })
  }, [])

  const saltar = useCallback(() => reloj.current.saltar(), [])

  // --- Qué se ve --------------------------------------------------------------------------------------------------
  const columna = escena.plano.modo === 'escritorio'
  const resultadoTexto = fin ? textoResultado(fin) : null
  const origen = (props.origen ?? 'Mano generada').toUpperCase()

  const panel: ReactNode | null =
    mostrarLecturas === 'nunca' ? null : mostrarLecturas === 'despues-de-decidir' && lectura === null ? (
      <PanelEspera columna={columna} ayuda={ayuda} texto="La lectura de la élite aparece después de que decidas." />
    ) : mostrarLecturas === 'siempre' && !turnoHeroeVisto ? (
      <PanelEspera columna={columna} ayuda={ayuda} texto="Cuando sea tu turno verás aquí la matemática y lo que harían jugadores de élite." />
    ) : (
      <PanelLecturas lectura={lectura} columna={columna} ayuda={ayuda} />
    )

  const acciones: ReactNode = fallo || props.soloContexto || detenida ? null : fin ? (
    <div className="acciones acciones--una">
      <button type="button" className="accion accion--call" onClick={() => props.onSiguienteMano?.()} data-e="siguiente">{props.textoSiguiente ?? 'SIGUIENTE MANO'}</button>
    </div>
  ) : heroeFuera ? (
    <div className="acciones acciones--una">
      <button type="button" className="accion accion--raise" onClick={saltar} data-e="saltar">SALTAR <span aria-hidden="true">››</span></button>
    </div>
  ) : (
    <BarraAcciones
      key={pendiente ? 'activa' : 'espera'}
      aPagarBB={pendiente?.aPagarBB ?? 0}
      puedeSubir={pendiente?.puedeSubir ?? true}
      elegida={null}
      deshabilitada={pendiente === null}
      onAccion={elegir}
      subidas={pendiente && pendiente.subidas.length > 0 ? pendiente.subidas : undefined}
      onSubir={subir}
      permitida={pendiente?.permitida ?? null}
      textoSubir={pendiente?.textoSubir}
    />
  )

  const aviso = resultadoTexto ? (
    <p className={`aviso aviso--resultado ${fin && fin.netoBB > 0 ? 'aviso--gana' : ''}`} role="status" data-e="resultado">{resultadoTexto}</p>
  ) : undefined

  const retro = decision && props.retroalimentacion ? props.retroalimentacion(decision) : null
  const superpuesto = (
    <>
      {ayuda && panel === null ? <p className="ayuda-guion" role="status" data-e="ayuda">{ayuda}</p> : null}
      {retro ? <div className="retro" data-e="retro">{retro}</div> : null}
      {fallo ? (
        <div className="error" role="alert">
          <p>No se pudo seguir con la mano. {fallo}</p>
          <button type="button" className="accion accion--call" onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
        </div>
      ) : null}
    </>
  )

  return (
    <MarcoMesa
      escena={escena}
      mesa={
        vista ? (
          <Mesa
            escena={escena}
            escenario={vista.escenario}
            cuatroColores={cuatroColores}
            boteBB={Math.max(0, vista.boteBB - boteOculto)}
            stackHeroeBB={vista.stackHeroeBB}
            heroeRetirado={vista.heroeRetirado}
            vuelo={vuelo}
            onLlegadaFichas={alLlegar}
            onFinVuelo={alTerminarVuelo}
            premios={vista.premios}
          />
        ) : (
          <div className="pantalla__fondo" aria-hidden="true" />
        )
      }
      calle={vista?.calle ?? 'MESA'}
      origen={origen}
      aviso={aviso}
      onVolver={props.onVolver ?? (() => window.history.length > 1 && window.history.back())}
      panel={panel}
      acciones={acciones}
      superpuesto={superpuesto}
      ajustes={{ abierto: ajustes, onAbrir: () => setAjustes(true), onCerrar: () => setAjustes(false), cuatroColores, onCuatroColores: cambiarMazo }}
    />
  )
}

function PanelEspera({ columna, texto, ayuda }: { columna: boolean; texto: string; ayuda: string | null }) {
  return (
    <section className={`panel__lecturas panel__lecturas--espera ${columna ? 'panel__lecturas--columna' : ''}`} aria-label="Lecturas de la situación" data-e="panel-espera">
      {ayuda ? <p className="panel__comentario panel__comentario--ayuda" data-e="ayuda" role="status">{ayuda}</p> : <p className="panel__espera">{texto}</p>}
    </section>
  )
}

function textoResultado(r: ResultadoMano): string {
  const con = r.nombreMano && r.showdown ? ` · ${r.nombreMano}` : ''
  if (r.netoBB > 0) return `Ganaste ${fmtBB(r.netoBB)} BB${r.ganadores.includes(0) ? con : ''}`
  if (r.netoBB < 0) return `Perdiste ${fmtBB(-r.netoBB)} BB`
  return r.ganadores.includes(0) ? `Mano en tablas${con}` : 'Te retiraste sin perder fichas'
}

function sonidoAccion(tipo: Accion['tipo'], pago: number) {
  if (tipo === 'f') reproducirSeguro('fold')
  else if (pago <= 0) reproducirSeguro('check')
  else reproducirSeguro('ficha')
}
