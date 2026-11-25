/**
 * PantallaMesa: la pantalla principal de Next Chip.
 *
 *   banco_manos_reales.json --(cargarBanco + construirEscenario)--> Escenario (mesa de la mano 1687, decisión del flop)
 *   Escenario --(useAnalisis: Web Worker del motor)--> Lectura (equity, red ONNX, lectura conjunta) --> PanelLecturas
 *
 * La mesa se pinta enseguida con los datos de la mano; el panel muestra las lecturas en cuanto el motor las calcula.
 * Parámetros de la URL (para revisar): ?mano=<hand_key>&d=<índice de acción>&fuente=banco
 */
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { cargarBanco, construirEscenario, type Escenario } from './datos/escenario.ts'
import { fmtBB } from './datos/formato.ts'
import { useAnalisis } from './datos/useAnalisis.ts'
import { Ajustes } from './mesa/Ajustes.tsx'
import { BarraAcciones, type AccionHeroe } from './mesa/BarraAcciones.tsx'
import { BarraSuperior } from './mesa/BarraSuperior.tsx'
import { calcularEscena } from './mesa/geometria.ts'
import { Mesa, type VueloFichas } from './mesa/Mesa.tsx'
import { PanelLecturas } from './mesa/PanelLecturas.tsx'

const MANO_DEMO = 1687
const CURVA = [0.16, 1, 0.3, 1] as const

function leerAjuste(clave: string): boolean {
  try { return window.localStorage.getItem(clave) === '1' } catch { return false }
}
function guardarAjuste(clave: string, v: boolean) {
  try { window.localStorage.setItem(clave, v ? '1' : '0') } catch { /* sin almacenamiento: el ajuste dura la sesión */ }
}

function useViewport() {
  const [t, setT] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const medir = () => setT((a) => (a.w === window.innerWidth && a.h === window.innerHeight ? a : { w: window.innerWidth, h: window.innerHeight }))
    medir()
    window.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('resize', medir)
    }
  }, [])
  return t
}

export default function PantallaMesa() {
  const reducido = useReducedMotion()
  const { w, h } = useViewport()
  const escena = useMemo(() => calcularEscena(w, h), [w, h])
  const parametros = useMemo(() => new URLSearchParams(window.location.search), [])

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
  const [cuatroColores, setCuatroColores] = useState(() => leerAjuste('nextchip:mazo4'))
  const [ajustes, setAjustes] = useState(parametros.get('ajustes') === '1')
  const [elegida, setElegida] = useState<AccionHeroe | null>(null)
  const [boteExtra, setBoteExtra] = useState(0)
  const [stackGastado, setStackGastado] = useState(0)
  const [vuelo, setVuelo] = useState<VueloFichas | null>(null)
  const [repeticion, setRepeticion] = useState(0)

  const cambiarMazo = useCallback((v: boolean) => { setCuatroColores(v); guardarAjuste('nextchip:mazo4', v) }, [])
  const cerrarAjustes = useCallback(() => setAjustes(false), [])

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

  const modoEscritorio = escena.plano.modo === 'escritorio'
  const entrada = (retraso: number) => ({
    initial: reducido ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducido ? 0.2 : 0.3, ease: CURVA, delay: reducido ? 0 : retraso },
  })

  const aviso =
    elegida && escenario ? (
      <p className="aviso" role="status">
        Elegiste <b>{elegida === 'fold' ? 'FOLD' : elegida === 'call' ? (escenario.aPagarBB > 0 ? `CALL ${fmtBB(escenario.aPagarBB)}` : 'CHECK') : 'RAISE'}</b>
        <button type="button" className="aviso__boton" onClick={reiniciar}>Repetir</button>
      </p>
    ) : undefined

  const acciones = escenario ? (
    <BarraAcciones
      aPagarBB={escenario.aPagarBB}
      puedeSubir={escenario.legales.subir !== null}
      elegida={elegida}
      onAccion={elegir}
    />
  ) : null

  // Anchos de la columna de lecturas en PC: de la orilla derecha de la mesa al borde de la ventana
  const bordeMesa = escena.plano.W * escena.s * 0.72
  const centroMesa = escena.ox + 620 * escena.s
  const anchoBarra = Math.min(560, escena.plano.W * escena.s * 0.62)
  const colX = Math.max(bordeMesa + 12, w - Math.min(440, Math.max(340, w * 0.26)) - 24)

  return (
    <div className="pantalla" style={{ '--reservado': `${escena.reservado}px` } as CSSProperties}>
      {escenario ? (
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
      )}

      <motion.div {...(reducido ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } } : entrada(0))}>
        <BarraSuperior
          calle={escenario?.calle ?? 'MESA'}
          origen={escenario?.etiquetaOrigen ?? 'CARGANDO'}
          onVolver={() => window.history.length > 1 && window.history.back()}
          onAjustes={() => setAjustes(true)}
          aviso={aviso}
        />
      </motion.div>


      {fallo ? (
        <div className="error" role="alert">
          <p>No se pudo cargar la mano. {fallo}</p>
          <button type="button" className="accion accion--call" onClick={() => setIntento((n) => n + 1)}>Reintentar</button>
        </div>
      ) : null}

      {modoEscritorio ? (
        <>
          <motion.aside className="columna" style={{ left: colX, top: escena.barraSuperior + 44, bottom: escena.reservado + 24 }} {...entrada(0.1)}>
            <div className="panel panel--columna">
              <PanelLecturas lectura={lectura} columna />
            </div>
          </motion.aside>
          <motion.div
            className="barra-inferior"
            style={{ left: centroMesa - anchoBarra / 2, top: escena.plano.H * escena.s, height: escena.reservado, width: anchoBarra }}
            {...entrada(0.14)}
          >
            {acciones}
          </motion.div>
        </>
      ) : (
        <motion.div className="panel panel--movil" {...entrada(0.1)}>
          <PanelLecturas lectura={lectura} />
          {acciones}
        </motion.div>
      )}

      <Ajustes abierto={ajustes} onCerrar={cerrarAjustes} cuatroColores={cuatroColores} onCuatroColores={cambiarMazo} />
    </div>
  )
}
