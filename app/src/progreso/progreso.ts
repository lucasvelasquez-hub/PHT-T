/**
 * Progreso del jugador: perfil, experiencia (XP), rango, racha, ajustes y el "dónde quedó" de cada módulo.
 * Todo vive en una sola clave de localStorage (`nextchip.v1`), siempre envuelta en try/catch: si el navegador no deja
 * guardar (ventana privada), el juego sigue funcionando durante la visita.
 * Reglas: docs/features/progreso/design.md.
 */
import { useSyncExternalStore } from 'react'

export interface Perfil { nombre: string; invitado: boolean }
export interface Rango { indice: number; nombre: string; ficha: 1 | 5 | 10 | 25 | 50 | 100; xpMin: number; xpSiguiente: number | null }
export interface Ajustes { sonido: boolean; musica: boolean; mazo4colores: boolean }
export type Seccion = 'retador' | 'instructor' | 'analista'
export interface Racha { actual: number; mejor: number }

export const CLAVE = 'nextchip.v1'
/** Clave que la mesa de revisión ya usaba para el mazo de 4 colores ('1' o '0'). Se migra a Progreso y se sigue reflejando ahí. */
export const CLAVE_MAZO_LEGADO = 'nextchip:mazo4'
export const NOMBRE_MAX = 16

// --- Rangos -----------------------------------------------------------------------------------------------------------
// SUPUESTO: umbrales de design.md (marcados allí como provisionales).
const RANGOS: ReadonlyArray<Omit<Rango, 'xpSiguiente'>> = [
  { indice: 0, nombre: 'Novato', ficha: 1, xpMin: 0 },
  { indice: 1, nombre: 'Aprendiz', ficha: 5, xpMin: 1000 },
  { indice: 2, nombre: 'Habitual', ficha: 10, xpMin: 3000 },
  { indice: 3, nombre: 'Regular', ficha: 25, xpMin: 6000 },
  { indice: 4, nombre: 'Profesional', ficha: 50, xpMin: 10000 },
  { indice: 5, nombre: 'Élite', ficha: 100, xpMin: 15000 },
]

export function rangoDe(xp: number): Rango {
  const v = Number.isFinite(xp) ? Math.max(0, xp) : 0
  let i = 0
  while (i + 1 < RANGOS.length && v >= RANGOS[i + 1]!.xpMin) i++
  return { ...RANGOS[i]!, xpSiguiente: RANGOS[i + 1]?.xpMin ?? null }
}

// --- Racha ------------------------------------------------------------------------------------------------------------
/** Día local como 'AAAA-MM-DD'. */
export function diaLocal(fecha: Date): string {
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${m}-${d}`
}
function diaAnterior(dia: string): string {
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number]
  const f = new Date(Date.UTC(a, m - 1, d - 1))
  return `${f.getUTCFullYear()}-${String(f.getUTCMonth() + 1).padStart(2, '0')}-${String(f.getUTCDate()).padStart(2, '0')}`
}

export interface EstadoRacha { actual: number; mejor: number; ultimoDia: string | null }

/** Marca actividad en `hoy`: el mismo día no cambia nada, el día siguiente suma 1 y si se rompió vuelve a 1 (sin mensajes de culpa). */
export function marcarRacha(r: EstadoRacha, hoy: string): EstadoRacha {
  if (r.ultimoDia === hoy) return r
  const actual = r.ultimoDia === diaAnterior(hoy) ? r.actual + 1 : 1
  return { actual, mejor: Math.max(r.mejor, actual), ultimoDia: hoy }
}
/** Racha que se muestra: si pasó más de un día sin actividad ya no cuenta (se ve 0 hasta la próxima sesión). */
export function rachaVigente(r: EstadoRacha, hoy: string): number {
  return r.ultimoDia === hoy || r.ultimoDia === diaAnterior(hoy) ? r.actual : 0
}

// --- Estado guardado --------------------------------------------------------------------------------------------------
interface Guardado {
  version: 1
  perfil: Perfil | null
  xp: number
  racha: EstadoRacha
  bienvenidaVista: boolean
  ajustes: Ajustes
  secciones: Partial<Record<Seccion, unknown>>
}

const AJUSTES_INICIALES: Ajustes = { sonido: true, musica: false, mazo4colores: false }
function inicial(): Guardado {
  return {
    version: 1, perfil: null, xp: 0, racha: { actual: 0, mejor: 0, ultimoDia: null },
    bienvenidaVista: false, ajustes: { ...AJUSTES_INICIALES }, secciones: {},
  }
}

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const esNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Limpia el nombre: recorta espacios y lo deja en 1 a 16 caracteres. Devuelve null si queda vacío. */
export function nombreValido(texto: string): string | null {
  const n = texto.trim().replace(/\s+/g, ' ').slice(0, NOMBRE_MAX).trim()
  return n.length >= 1 ? n : null
}

/** Lee lo guardado con tolerancia: datos viejos o dañados nunca rompen la app; lo que no se entienda se descarta. */
export function interpretar(texto: string | null): Guardado {
  const base = inicial()
  if (!texto) return base
  let bruto: unknown
  try { bruto = JSON.parse(texto) } catch { return base }
  if (!esObjeto(bruto)) return base
  const p = bruto.perfil
  if (esObjeto(p) && typeof p.nombre === 'string') {
    const nombre = nombreValido(p.nombre)
    if (nombre) base.perfil = { nombre, invitado: p.invitado === true }
  }
  if (esNum(bruto.xp)) base.xp = Math.max(0, Math.floor(bruto.xp))
  const r = bruto.racha
  if (esObjeto(r)) {
    base.racha = {
      actual: esNum(r.actual) ? Math.max(0, Math.floor(r.actual)) : 0,
      mejor: esNum(r.mejor) ? Math.max(0, Math.floor(r.mejor)) : 0,
      ultimoDia: typeof r.ultimoDia === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.ultimoDia) ? r.ultimoDia : null,
    }
  }
  base.bienvenidaVista = bruto.bienvenidaVista === true
  const a = bruto.ajustes
  if (esObjeto(a)) {
    for (const k of Object.keys(AJUSTES_INICIALES) as (keyof Ajustes)[]) {
      if (typeof a[k] === 'boolean') base.ajustes[k] = a[k]
    }
  }
  if (esObjeto(bruto.secciones)) {
    for (const s of ['retador', 'instructor', 'analista'] as const) {
      if (bruto.secciones[s] !== undefined) base.secciones[s] = bruto.secciones[s]
    }
  }
  return base
}

// --- Almacén ----------------------------------------------------------------------------------------------------------
export interface Almacenamiento { getItem(k: string): string | null; setItem(k: string, v: string): void }

export interface Instantanea {
  perfil: Perfil | null
  xp: number
  rango: Rango
  racha: Racha
  bienvenidaVista: boolean
  ajustes: Ajustes
  /** false si el navegador no deja guardar (ventana privada): el progreso dura solo esta visita. */
  guardaEnNavegador: boolean
}

export interface Progreso {
  leer(): Instantanea
  suscribir(f: () => void): () => void
  definirPerfil(p: Perfil): void
  sumarXP(puntos: number): { subioDeRango: boolean; rango: Rango }
  marcarBienvenidaVista(): void
  cambiarAjuste<K extends keyof Ajustes>(k: K, v: Ajustes[K]): void
  leerSeccion<T>(clave: Seccion): T | null
  guardarSeccion<T>(clave: Seccion, datos: T): void
  /** Vuelve a leer el mazo que pudo cambiar la hoja de ajustes de la mesa (clave antigua). */
  sincronizarMazo(): void
}

/** Crea un almacén de progreso. `almacenamiento` y `ahora` se pueden simular en las pruebas. */
export function crearProgreso(
  almacenamiento: () => Almacenamiento | null,
  ahora: () => Date = () => new Date(),
): Progreso {
  let guarda = true
  const acceso = (): Almacenamiento | null => { try { return almacenamiento() } catch { return null } }
  const leerClave = (k: string): string | null => { try { return acceso()?.getItem(k) ?? null } catch { return null } }
  const escribir = (k: string, v: string) => {
    try {
      const a = acceso()
      if (!a) { guarda = false; return }
      a.setItem(k, v)
    } catch { guarda = false }
  }

  let estado = interpretar(leerClave(CLAVE))
  // Migración del mazo de 4 colores: la clave antigua de la mesa manda si existe.
  const mazoLegado = (): boolean | null => {
    const v = leerClave(CLAVE_MAZO_LEGADO)
    return v === '1' ? true : v === '0' ? false : null
  }
  const m0 = mazoLegado()
  if (m0 !== null) estado.ajustes.mazo4colores = m0

  const oyentes = new Set<() => void>()
  let vista: Instantanea | null = null
  let vistaDia = ''
  const avisar = () => { vista = null; oyentes.forEach((f) => f()) }
  const guardar = () => { guarda = true; escribir(CLAVE, JSON.stringify(estado)) }
  const cambiar = (f: (e: Guardado) => Guardado) => { estado = f(estado); guardar(); avisar() }

  return {
    leer() {
      const hoy = diaLocal(ahora())
      if (!vista || vistaDia !== hoy) {
        vistaDia = hoy
        vista = {
          perfil: estado.perfil, xp: estado.xp, rango: rangoDe(estado.xp),
          racha: { actual: rachaVigente(estado.racha, hoy), mejor: estado.racha.mejor },
          bienvenidaVista: estado.bienvenidaVista, ajustes: estado.ajustes, guardaEnNavegador: guarda,
        }
      }
      return vista
    },
    suscribir(f) { oyentes.add(f); return () => { oyentes.delete(f) } },
    definirPerfil(p) {
      const nombre = p.invitado ? null : nombreValido(p.nombre)
      cambiar((e) => ({ ...e, perfil: nombre ? { nombre, invitado: false } : { nombre: 'Invitado', invitado: true } }))
    },
    sumarXP(puntos) {
      const antes = rangoDe(estado.xp)
      const suma = esNum(puntos) ? Math.max(0, Math.floor(puntos)) : 0
      cambiar((e) => ({ ...e, xp: e.xp + suma, racha: marcarRacha(e.racha, diaLocal(ahora())) }))
      const rango = rangoDe(estado.xp)
      return { subioDeRango: rango.indice > antes.indice, rango }
    },
    marcarBienvenidaVista() { cambiar((e) => ({ ...e, bienvenidaVista: true })) },
    cambiarAjuste(k, v) {
      cambiar((e) => ({ ...e, ajustes: { ...e.ajustes, [k]: v } }))
      if (k === 'mazo4colores') escribir(CLAVE_MAZO_LEGADO, v ? '1' : '0')
    },
    leerSeccion<T>(clave: Seccion): T | null {
      const v = estado.secciones[clave]
      return v === undefined ? null : (v as T)
    },
    guardarSeccion<T>(clave: Seccion, datos: T) {
      // Sin avisar a los oyentes: los módulos guardan seguido y no necesitan repintar la app.
      estado = { ...estado, secciones: { ...estado.secciones, [clave]: datos } }
      guardar()
    },
    sincronizarMazo() {
      const m = mazoLegado()
      if (m !== null && m !== estado.ajustes.mazo4colores) cambiar((e) => ({ ...e, ajustes: { ...e.ajustes, mazo4colores: m } }))
    },
  }
}

// --- Instancia de la app y hook ---------------------------------------------------------------------------------------
let global: Progreso | null = null
/** Almacén único de la app (usa window.localStorage si existe). */
export function progresoGlobal(): Progreso {
  if (!global) global = crearProgreso(() => (typeof window === 'undefined' ? null : window.localStorage))
  return global
}

export function useProgreso(): Instantanea & Omit<Progreso, 'leer' | 'suscribir'> {
  const p = progresoGlobal()
  const v = useSyncExternalStore(p.suscribir, p.leer, p.leer)
  return {
    ...v,
    definirPerfil: p.definirPerfil, sumarXP: p.sumarXP, marcarBienvenidaVista: p.marcarBienvenidaVista,
    cambiarAjuste: p.cambiarAjuste, leerSeccion: p.leerSeccion, guardarSeccion: p.guardarSeccion, sincronizarMazo: p.sincronizarMazo,
  }
}
