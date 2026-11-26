/**
 * Instructor: el curso de póker con estilo Duolingo. Camino de módulos -> lección / evaluación / prueba en vivo / repaso.
 * El estado (lecciones hechas, mejores resultados, repaso y dónde quedó) vive en `guardarSeccion('instructor', …)`.
 * XP: +100 por terminar una lección por primera vez y +50 por cada estrella nueva ganada en evaluación o prueba.
 * La ruta puede traer `leccion` (#/instructor/M04_L02) para abrir esa lección directamente.
 */
import './instructor.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cargarCurso, type Curso, type Leccion, type Modulo } from '../../curso/index.ts'
import { useRuta } from '../../app/navegacion.ts'
import { BarraPantalla, Pantalla } from '../../pantallas/elementos.tsx'
import { progresoGlobal, useProgreso } from '../../progreso/progreso.ts'
import { reproducir } from '../../sonido/sonido.ts'
import { useAlmacenInstructor } from './almacen.ts'
import Camino from './Camino.tsx'
import LeccionVista, { type CierreLeccion } from './LeccionVista.tsx'
import {
  estrellasDeModulo, nodoSiguienteA, porcentaje, registrarRepaso,
  type EstadoInstructor, type NodoCamino, type Ubicacion,
} from './logica.ts'
import Sesion, { type CierreSesion, type ItemSesion } from './Sesion.tsx'
import { tituloDeModulo } from './titulos.ts'

const XP_LECCION = 100
const XP_ESTRELLA = 50
const TAMANO_REPASO = 8

type Vista =
  | { t: 'camino' }
  | { t: 'leccion'; id: string; indice: number }
  | { t: 'evaluacion'; modulo: number; intento: number }
  | { t: 'prueba'; modulo: number; intento: number }
  | { t: 'repaso'; intento: number }

export default function PantallaInstructor({ onSalir }: { onSalir: () => void }) {
  const [ruta] = useRuta()
  const { xp, rango } = useProgreso()
  const { estado, ref, actualizar } = useAlmacenInstructor()
  const [curso, setCurso] = useState<Curso | null>(null)
  const [fallo, setFallo] = useState<string | null>(null)
  const [vista, setVista] = useState<Vista>({ t: 'camino' })
  const rutaAplicada = useRef(false)

  useEffect(() => {
    let vivo = true
    cargarCurso().then((c) => { if (vivo) setCurso(c) }).catch((e: unknown) => { if (vivo) setFallo(e instanceof Error ? e.message : String(e)) })
    return () => { vivo = false }
  }, [])

  const porId = useMemo(() => {
    const lecciones = new Map<string, Leccion>()
    const preguntas = new Map<string, { pregunta: Modulo['evaluacion'][number]; modulo: number }>()
    const casos = new Map<string, { caso: Modulo['casos'][number]; modulo: number }>()
    const modulos = new Map<number, Modulo>()
    for (const m of curso?.modulos ?? []) {
      modulos.set(m.numero, m)
      for (const l of m.lecciones) lecciones.set(l.id, l)
      for (const p of m.evaluacion) preguntas.set(p.id, { pregunta: p, modulo: m.numero })
      for (const c of m.casos) casos.set(c.id, { caso: c, modulo: m.numero })
    }
    return { lecciones, preguntas, casos, modulos }
  }, [curso])

  // --- Dónde quedó ------------------------------------------------------------------------------------------------------
  const guardarUbicacion = useCallback((u: Ubicacion | null) => { actualizar((e) => ({ ...e, ultimo: u })) }, [actualizar])

  const irA = useCallback((v: Vista) => {
    setVista(v)
    if (v.t === 'leccion') {
      const l = porId.lecciones.get(v.id)
      if (l) guardarUbicacion({ modulo: l.modulo, leccion: l.id, pantalla: 'leccion', indice: v.indice })
    } else if (v.t === 'evaluacion' || v.t === 'prueba') {
      guardarUbicacion({ modulo: v.modulo, leccion: null, pantalla: v.t, indice: 0 })
    } else if (v.t === 'repaso') {
      guardarUbicacion({ modulo: ref.current.ultimo?.modulo ?? 0, leccion: null, pantalla: 'repaso', indice: 0 })
    } else {
      // De vuelta en el camino se conserva la última lección en curso solo si no la terminó.
      const u = ref.current.ultimo
      const sigueAbierta = u && u.pantalla === 'leccion' && u.leccion && !ref.current.lecciones.includes(u.leccion)
      guardarUbicacion(sigueAbierta ? u : null)
      if (window.location.hash.split('/').length > 2) window.history.replaceState(null, '', '#/instructor')
    }
  }, [porId, guardarUbicacion, ref])

  // La ruta #/instructor/M04_L02 abre esa lección una sola vez.
  useEffect(() => {
    if (!curso || rutaAplicada.current) return
    rutaAplicada.current = true
    if (ruta.pantalla === 'instructor' && ruta.leccion && porId.lecciones.has(ruta.leccion)) {
      const u = ref.current.ultimo
      irA({ t: 'leccion', id: ruta.leccion, indice: u?.leccion === ruta.leccion ? u.indice : 0 })
    }
  }, [curso, ruta, porId, ref, irA])

  const abrirNodo = useCallback((n: NodoCamino) => {
    if (n.tipo === 'leccion') {
      const u = ref.current.ultimo
      irA({ t: 'leccion', id: n.id, indice: u?.pantalla === 'leccion' && u.leccion === n.id ? u.indice : 0 })
    } else if (n.tipo === 'evaluacion') irA({ t: 'evaluacion', modulo: n.modulo, intento: Date.now() })
    else irA({ t: 'prueba', modulo: n.modulo, intento: Date.now() })
  }, [irA, ref])

  const textoNodo = useCallback((n: NodoCamino): string => {
    if (n.tipo === 'evaluacion') return 'Evaluación'
    if (n.tipo === 'prueba') return 'Prueba en vivo'
    const l = porId.lecciones.get(n.id)
    return l ? `Lección ${l.modulo}.${l.numero}` : n.id
  }, [porId])

  const siguienteDe = useCallback((n: NodoCamino) => {
    if (!curso) return null
    const s = nodoSiguienteA(curso.modulos, n)
    return s ? { texto: textoNodo(s), abrir: () => abrirNodo(s) } : null
  }, [curso, textoNodo, abrirNodo])

  // --- Resultados ---------------------------------------------------------------------------------------------------------
  const alResultado = useCallback((item: ItemSesion, acierto: boolean) => {
    const id = item.tipo === 'pregunta' ? item.pregunta.id : item.caso.id
    actualizar((e) => ({ ...e, repaso: registrarRepaso(e.repaso, { tipo: item.tipo, id, modulo: item.modulo }, acierto) }))
  }, [actualizar])

  const sumar = (puntos: number): { subioDeRango: boolean; nombreRango: string } => {
    if (puntos <= 0) return { subioDeRango: false, nombreRango: '' }
    const r = progresoGlobal().sumarXP(puntos)
    if (r.subioDeRango) reproducir('subir_rango')
    return { subioDeRango: r.subioDeRango, nombreRango: r.rango.nombre }
  }

  const terminarLeccion = (id: string): CierreLeccion => {
    const nueva = !ref.current.lecciones.includes(id)
    if (nueva) actualizar((e) => ({ ...e, lecciones: [...e.lecciones, id] }))
    guardarUbicacion(null)
    const r = sumar(nueva ? XP_LECCION : 0)
    if (nueva) reproducir('puntos_alto')
    return { xp: nueva ? XP_LECCION : 0, ...r }
  }

  const terminarSesion = (tipo: 'evaluacion' | 'prueba', modulo: number, aciertos: number, total: number): CierreSesion | null => {
    const m = porId.modulos.get(modulo)
    if (!m) return null
    const antes = estrellasDeModulo(ref.current, m)
    const despuesEstado = actualizar((e: EstadoInstructor) => {
      if (tipo === 'evaluacion') {
        const pct = porcentaje(aciertos, total)
        const previo = e.evaluaciones[String(modulo)]
        return { ...e, evaluaciones: { ...e.evaluaciones, [String(modulo)]: Math.max(previo ?? 0, pct) } }
      }
      const previo = e.pruebas[String(modulo)]
      const mejor = previo && previo.aciertos / previo.total >= aciertos / total ? previo : { aciertos, total }
      return { ...e, pruebas: { ...e.pruebas, [String(modulo)]: mejor } }
    })
    const despues = estrellasDeModulo(despuesEstado, m)
    const ganadas = Math.max(0, despues - antes)
    const r = sumar(ganadas * XP_ESTRELLA)
    if (ganadas > 0) reproducir('puntos_alto')
    return { estrellasAntes: antes, estrellasDespues: despues, xp: ganadas * XP_ESTRELLA, ...r }
  }

  // --- Pantallas --------------------------------------------------------------------------------------------------------
  const volver = () => irA({ t: 'camino' })

  if (fallo) {
    return (
      <Pantalla className="ins-raiz">
        <div className="ins-marco">
          <BarraPantalla titulo="Instructor" onVolver={onSalir} />
          <div className="ins-cierre"><p className="ins-cierre__texto" role="alert">No se pudo cargar el curso. {fallo}</p><button type="button" className="nc-boton-suave" onClick={onSalir}>Volver al inicio</button></div>
        </div>
      </Pantalla>
    )
  }
  if (!curso) {
    return (
      <Pantalla className="ins-raiz">
        <div className="ins-marco">
          <BarraPantalla titulo="Instructor" onVolver={onSalir} />
          <div className="ins-cierre"><p className="ins-cierre__texto" role="status">Preparando el curso…</p></div>
        </div>
      </Pantalla>
    )
  }

  if (vista.t === 'leccion') {
    const l = porId.lecciones.get(vista.id)
    if (l) {
      const nodo: NodoCamino = { tipo: 'leccion', modulo: l.modulo, id: l.id }
      return (
        <LeccionVista
          key={l.id}
          leccion={l}
          indiceInicial={vista.indice}
          onIndice={(i) => guardarUbicacion({ modulo: l.modulo, leccion: l.id, pantalla: 'leccion', indice: i })}
          onTerminar={() => terminarLeccion(l.id)}
          siguiente={siguienteDe(nodo)}
          onSalir={volver}
        />
      )
    }
  }

  if (vista.t === 'evaluacion' || vista.t === 'prueba') {
    const m = porId.modulos.get(vista.modulo)
    if (m) {
      const tipo = vista.t
      const items: ItemSesion[] = tipo === 'evaluacion'
        ? m.evaluacion.map((pregunta) => ({ tipo: 'pregunta', modulo: m.numero, pregunta }))
        : m.casos.map((caso) => ({ tipo: 'caso', modulo: m.numero, caso }))
      const nodo: NodoCamino = { tipo, modulo: m.numero }
      return (
        <Sesion
          key={`${tipo}-${m.numero}-${vista.intento}`}
          tipo={tipo}
          titulo={`${tipo === 'evaluacion' ? 'Evaluación' : 'Prueba en vivo'} · M${String(m.numero).padStart(2, '0')}`}
          items={items}
          onResultado={alResultado}
          onFin={(a, t) => terminarSesion(tipo, m.numero, a, t)}
          siguiente={siguienteDe(nodo)}
          onRepetir={() => irA({ t: tipo, modulo: m.numero, intento: Date.now() } as Vista)}
          onSalir={volver}
        />
      )
    }
  }

  if (vista.t === 'repaso') {
    // Un lote corto: lo que lleva menos aciertos primero. Se arma una sola vez por intento.
    return <SesionRepaso key={vista.intento} estado={ref.current} porId={porId} onResultado={alResultado} onRepetir={() => irA({ t: 'repaso', intento: Date.now() })} onSalir={volver} />
  }

  // Camino
  const u = estado.ultimo
  const ult = u && u.pantalla === 'leccion' && u.leccion ? porId.lecciones.get(u.leccion) : null
  const continuar = ult && u
    ? { texto: `Lección ${ult.modulo}.${ult.numero} · pantalla ${u.indice + 1} de ${ult.pantallas.length} · ${tituloDeModulo(ult.modulo)}`, alAbrir: () => irA({ t: 'leccion', id: ult.id, indice: u.indice }) }
    : u && (u.pantalla === 'evaluacion' || u.pantalla === 'prueba')
      ? { texto: `${u.pantalla === 'evaluacion' ? 'Evaluación' : 'Prueba en vivo'} del módulo ${u.modulo}`, alAbrir: () => abrirNodo({ tipo: u.pantalla as 'evaluacion' | 'prueba', modulo: u.modulo }) }
      : null
  return (
    <Camino
      curso={curso} estado={estado} xp={xp} rango={rango}
      continuar={continuar}
      onAbrir={abrirNodo}
      onRepaso={() => irA({ t: 'repaso', intento: Date.now() })}
      onSalir={onSalir}
    />
  )
}

/** Repaso: arma un lote con los pendientes (los de menos aciertos primero) y lo corre como una sesión más. */
function SesionRepaso({ estado, porId, onResultado, onRepetir, onSalir }: {
  estado: EstadoInstructor
  porId: { preguntas: Map<string, { pregunta: Modulo['evaluacion'][number]; modulo: number }>; casos: Map<string, { caso: Modulo['casos'][number]; modulo: number }> }
  onResultado: (i: ItemSesion, ok: boolean) => void
  onRepetir: () => void
  onSalir: () => void
}) {
  const [items] = useState<ItemSesion[]>(() => {
    const lote: ItemSesion[] = []
    for (const r of [...estado.repaso].sort((a, b) => a.aciertos - b.aciertos).slice(0, TAMANO_REPASO)) {
      if (r.tipo === 'pregunta') { const x = porId.preguntas.get(r.id); if (x) lote.push({ tipo: 'pregunta', modulo: x.modulo, pregunta: x.pregunta }) }
      else { const x = porId.casos.get(r.id); if (x) lote.push({ tipo: 'caso', modulo: x.modulo, caso: x.caso }) }
    }
    return lote
  })
  return (
    <Sesion tipo="repaso" titulo="Repaso" items={items} onResultado={onResultado} onFin={() => null} siguiente={null} onRepetir={onRepetir} onSalir={onSalir} />
  )
}
