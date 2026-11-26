/**
 * PantallaMesa: la mesa de Next Chip.
 *
 *  - Sin parámetros: la mano completa en vivo (`MesaEnVivo`, en `src/juego`). Cada mano usa una semilla nueva y el botón rota.
 *    Parámetros opcionales: `semilla=<n>`, `boton=<0..5>`, `lecturas=siempre|despues-de-decidir|nunca`, `guiada=1` (mano de práctica).
 *  - Con `?mano=<hand_key>&d=<índice de acción>&fuente=banco`: la mesa de REVISIÓN, que muestra UNA decisión de una mano real:
 *
 *      banco_manos_reales.json --(cargarBanco + construirEscenario)--> Escenario
 *      Escenario --(useAnalisis: Web Worker del motor)--> Lectura (equity, red ONNX, lectura conjunta) --> PanelLecturas
 *
 *    La mesa se pinta enseguida con los datos de la mano; el panel muestra las lecturas en cuanto el motor las calcula.
 *    Con `ajustes=1` se abren los ajustes.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ManoGuiada, MesaEnVivo } from '../juego/index.ts'
import { cargarBanco, construirEscenario, type Escenario } from './datos/escenario.ts'
import { CLAVE_MAZO4, guardarAjuste, leerAjuste, useViewport } from './datos/entorno.ts'
import { fmtBB } from './datos/formato.ts'
import { useAnalisis } from './datos/useAnalisis.ts'
import { BarraAcciones, type AccionHeroe } from './mesa/BarraAcciones.tsx'
import { calcularEscena } from './mesa/geometria.ts'
import { MarcoMesa } from './mesa/MarcoMesa.tsx'
import { Mesa, type VueloFichas } from './mesa/Mesa.tsx'
import { PanelLecturas } from './mesa/PanelLecturas.tsx'

const MANO_DEMO = 1687

export default function PantallaMesa() {
  const parametros = useMemo(() => new URLSearchParams(window.location.search), [])
  if (parametros.has('mano') || parametros.get('fuente') === 'banco') return <MesaRevision parametros={parametros} />
  return <MesaJugable parametros={parametros} />
}

/** La mano en vivo: una tras otra, con semilla nueva y el botón avanzando un asiento. */
function MesaJugable({ parametros }: { parametros: URLSearchParams }) {
  const [mano, setMano] = useState(() => ({
    semilla: Number(parametros.get('semilla') ?? Math.floor(Math.random() * 1e9)),
    boton: Number(parametros.get('boton') ?? 3),
  }))
  const siguiente = useCallback(() => setMano((m) => ({ semilla: m.semilla + 1, boton: (m.boton + 1) % 6 })), [])
  const lecturas = parametros.get('lecturas')
  if (parametros.get('guiada') === '1') return <ManoGuiada onTerminar={() => window.history.length > 1 && window.history.back()} />
  return (
    <MesaEnVivo
      semilla={mano.semilla}
      boton={mano.boton}
      mostrarLecturas={lecturas === 'nunca' || lecturas === 'despues-de-decidir' ? lecturas : 'siempre'}
      onSiguienteMano={siguiente}
      onVolver={() => window.history.length > 1 && window.history.back()}
    />
  )
}

/** La mesa de revisión: una sola decisión de una mano real del banco. */
function MesaRevision({ parametros }: { parametros: URLSearchParams }) {
  const { w, h } = useViewport()
  const escena = useMemo(() => calcularEscena(w, h), [w, h])

  const [escenario, setEscenario] = useState<Escenario | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    let vivo = true
    setFallo(null)
    cargarBanco()
      .then((b) => {
        if (!vivo) return
        const mano = Number(parametros.get('mano') ?? MANO_DEMO)
        const d = parametros.get('d')
        setEscenario(construirEscenario(b, mano, d === null ? undefined : Number(d)))
      })
      .catch((e: unknown) => vivo && setFallo(e instanceof Error ? e.message : String(e)))
    return () => { vivo = false }
  }, [parametros, intento])

  const lectura = useAnalisis(escenario, parametros.get('fuente') === 'banco')

  // --- Estado de la decisión ---------------------------------------------------------------------------------------
  const [cuatroColores, setCuatroColores] = useState(() => leerAjuste(CLAVE_MAZO4))
  const [ajustes, setAjustes] = useState(parametros.get('ajustes') === '1')
  const [elegida, setElegida] = useState<AccionHeroe | null>(null)
  const [boteExtra, setBoteExtra] = useState(0)
  const [stackGastado, setStackGastado] = useState(0)
  const [vuelo, setVuelo] = useState<VueloFichas | null>(null)
  const [repeticion, setRepeticion] = useState(0)

  const cambiarMazo = useCallback((v: boolean) => { setCuatroColores(v); guardarAjuste(CLAVE_MAZO4, v) }, [])

  const reiniciar = useCallback(() => {
    setElegida(null); setBoteExtra(0); setStackGastado(0); setVuelo(null); setRepeticion((n) => n + 1)
  }, [])

  const elegir = useCallback((accion: AccionHeroe) => {
    if (!escenario) return
    const bb = escenario.estado.bb
    setElegida(accion)
    if (accion === 'fold') return
    const pagoFichas =
      accion === 'call'
        ? escenario.legales.pagoCall
        : (escenario.legales.subir?.min ?? 0) - escenario.estado.puesto[escenario.heroe.indice]!
    const monto = pagoFichas / bb
    if (monto <= 0) return
    setStackGastado(monto)
    setVuelo({ id: Date.now(), monto })
  }, [escenario])

  const alLlegar = useCallback(() => { if (vuelo) setBoteExtra((b) => b + vuelo.monto) }, [vuelo])
  const alTerminarVuelo = useCallback(() => setVuelo(null), [])

  const aviso =
    elegida && escenario ? (
      <p className="aviso" role="status">
        Elegiste <b>{elegida === 'fold' ? 'FOLD' : elegida === 'call' ? (escenario.aPagarBB > 0 ? `CALL ${fmtBB(escenario.aPagarBB)}` : 'CHECK') : 'RAISE'}</b>
        <button type="button" className="aviso__boton" onClick={reiniciar}>Repetir</button>
      </p>
    ) : undefined

  return (
    <MarcoMesa
      escena={escena}
      mesa={
        escenario ? (
          <Mesa
            key={`${escenario.claveMano}-${escenario.indiceDecision}-${repeticion}`}
            escena={escena}
            escenario={escenario}
            cuatroColores={cuatroColores}
            boteBB={escenario.boteBB + boteExtra}
            stackHeroeBB={escenario.heroe.stackBB - (vuelo || boteExtra > 0 ? stackGastado : 0)}
            heroeRetirado={elegida === 'fold'}
            vuelo={vuelo}
            onLlegadaFichas={alLlegar}
            onFinVuelo={alTerminarVuelo}
          />
        ) : (
          <div className="pantalla__fondo" aria-hidden="true" />
        )
      }
      calle={escenario?.calle ?? 'MESA'}
      origen={escenario?.etiquetaOrigen ?? 'CARGANDO'}
      aviso={aviso}
      onVolver={() => window.history.length > 1 && window.history.back()}
      panel={<PanelLecturas lectura={lectura} columna={escena.plano.modo === 'escritorio'} />}
      acciones={
        escenario ? (
          <BarraAcciones aPagarBB={escenario.aPagarBB} puedeSubir={escenario.legales.subir !== null} elegida={elegida} onAccion={elegir} />
        ) : null
      }
      superpuesto={
        fallo ? (
          <div className="error" role="alert">
            <p>No se pudo cargar la mano. {fallo}</p>
            <button type="button" className="accion accion--call" onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
          </div>
        ) : null
      }
      ajustes={{ abierto: ajustes, onAbrir: () => setAjustes(true), onCerrar: () => setAjustes(false), cuatroColores, onCuatroColores: cambiarMazo }}
    />
  )
}
