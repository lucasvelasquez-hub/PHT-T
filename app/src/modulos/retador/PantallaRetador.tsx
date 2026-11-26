/**
 * Retador: menú -> sesión (o reto del día) -> resumen. Guarda su sección en Progreso (`guardarSeccion('retador')`):
 * récord, mejor del día, el aviso de subida ya visto y la sesión a medias.
 */
import { useCallback, useRef, useState } from 'react'
import { useProgreso } from '../../progreso/progreso.ts'
import MenuRetador from './MenuRetador.tsx'
import ResumenRetador from './ResumenRetador.tsx'
import SesionRetador from './SesionRetador.tsx'
import {
  MANOS_RETO, MANOS_SESION, cerrarSesion, diaLocalTexto, leerDatos, mejorDeHoy, resumirSesion, semillaDelDia, sesionVigente,
  type DatosRetador, type ResultadoRecord, type ResumenSesion, type SesionGuardada,
} from './logica.ts'
import './retador.css'

type Vista =
  | { pantalla: 'menu' }
  | { pantalla: 'sesion'; sesion: SesionGuardada; clave: number }
  | { pantalla: 'resumen'; resumen: ResumenSesion; record: ResultadoRecord }

const semillaAleatoria = (): number => {
  try {
    const b = new Uint32Array(1)
    globalThis.crypto.getRandomValues(b)
    return b[0]! & 0x7fffffff
  } catch {
    return Math.floor(Math.random() * 0x7fffffff)
  }
}

export default function PantallaRetador(props: { onSalir: () => void }) {
  const { leerSeccion, guardarSeccion } = useProgreso()
  const [datos, setDatos] = useState<DatosRetador>(() => leerDatos(leerSeccion('retador')))
  const datosRef = useRef(datos)
  const [vista, setVista] = useState<Vista>({ pantalla: 'menu' })
  const contador = useRef(0)

  const actualizar = useCallback((f: (d: DatosRetador) => DatosRetador) => {
    const nuevo = f(datosRef.current)
    datosRef.current = nuevo
    setDatos(nuevo)
    guardarSeccion('retador', nuevo)
  }, [guardarSeccion])

  const hoy = diaLocalTexto(new Date())

  const empezar = (tipo: 'sesion' | 'reto') => {
    const ahora = new Date()
    const sesion: SesionGuardada = tipo === 'reto'
      ? { tipo, dia: diaLocalTexto(ahora), semillaBase: semillaDelDia(ahora), total: MANOS_RETO, siguiente: 0, decisiones: [], fichasBB: 0 }
      : { tipo, semillaBase: semillaAleatoria(), total: MANOS_SESION, siguiente: 0, decisiones: [], fichasBB: 0 }
    setVista({ pantalla: 'sesion', sesion, clave: ++contador.current })
  }

  const terminar = useCallback((s: SesionGuardada) => {
    const resumen = resumirSesion(s.tipo, s.decisiones, s.fichasBB)
    const { datos: nuevos, record } = cerrarSesion(datosRef.current, resumen, s.dia ?? diaLocalTexto(new Date()))
    actualizar(() => nuevos)
    setVista({ pantalla: 'resumen', resumen, record })
  }, [actualizar])

  const guardarSesion = useCallback((s: SesionGuardada) => actualizar((d) => ({ ...d, enCurso: s })), [actualizar])
  const avisoVisto = useCallback(() => actualizar((d) => ({ ...d, avisoSubidaVisto: true })), [actualizar])
  const alMenu = useCallback(() => setVista({ pantalla: 'menu' }), [])

  if (vista.pantalla === 'sesion') {
    return (
      <SesionRetador
        key={vista.clave}
        inicial={vista.sesion}
        avisoSubidaVisto={datos.avisoSubidaVisto}
        onGuardar={guardarSesion}
        onAvisoSubida={avisoVisto}
        onSalir={alMenu}
        onTerminar={terminar}
      />
    )
  }

  if (vista.pantalla === 'resumen') {
    return (
      <ResumenRetador
        resumen={vista.resumen}
        record={vista.record}
        onOtraSesion={() => empezar('sesion')}
        onRepetirReto={vista.resumen.tipo === 'reto' ? () => empezar('reto') : undefined}
        onVolver={alMenu}
      />
    )
  }

  const enCurso = sesionVigente(datos, hoy)
  return (
    <MenuRetador
      record={datos.record}
      mejorHoy={mejorDeHoy(datos, hoy)}
      enCurso={enCurso}
      onSesion={() => empezar('sesion')}
      onReto={() => empezar('reto')}
      onContinuar={() => {
        if (!enCurso) return
        if (enCurso.siguiente >= enCurso.total) { terminar(enCurso); return }
        setVista({ pantalla: 'sesion', sesion: enCurso, clave: ++contador.current })
      }}
      onSalir={props.onSalir}
    />
  )
}
