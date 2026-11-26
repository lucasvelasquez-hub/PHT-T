/**
 * estado.ts: lo que el Analista recuerda ("dónde quedó"), guardado en la sección `analista` del progreso.
 * La lectura es tolerante: datos viejos o dañados se descartan sin romper nada.
 */
import { progresoGlobal } from '../../progreso/progreso.ts'

export interface UltimaMano { k: number; d: number }

export interface EstadoAnalista {
  /** La última mano abierta en el visor y la decisión en que se quedó. */
  ultimaMano: UltimaMano | null
  /** Mejor puntaje de una sesión de "¿Adivinas?". */
  record: number
  /** Sesiones de "¿Adivinas?" terminadas. */
  sesiones: number
}

export const ESTADO_INICIAL: EstadoAnalista = { ultimaMano: null, record: 0, sesiones: 0 }

const esEntero = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0

export function interpretarEstado(bruto: unknown): EstadoAnalista {
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) return { ...ESTADO_INICIAL }
  const o = bruto as Record<string, unknown>
  const u = o.ultimaMano
  let ultimaMano: UltimaMano | null = null
  if (typeof u === 'object' && u !== null) {
    const { k, d } = u as Record<string, unknown>
    if (esEntero(k) && esEntero(d)) ultimaMano = { k, d }
  }
  return { ultimaMano, record: esEntero(o.record) ? o.record : 0, sesiones: esEntero(o.sesiones) ? o.sesiones : 0 }
}

/** Suma una sesión terminada: sube el récord si el puntaje lo supera. */
export function registrarSesion(e: EstadoAnalista, puntos: number): { estado: EstadoAnalista; nuevoRecord: boolean } {
  const p = Number.isFinite(puntos) ? Math.max(0, Math.round(puntos)) : 0
  const nuevoRecord = p > e.record
  return { estado: { ...e, record: nuevoRecord ? p : e.record, sesiones: e.sesiones + 1 }, nuevoRecord }
}

export function leerEstado(): EstadoAnalista {
  try { return interpretarEstado(progresoGlobal().leerSeccion<unknown>('analista')) } catch { return { ...ESTADO_INICIAL } }
}

export function guardarEstado(e: EstadoAnalista): void {
  try { progresoGlobal().guardarSeccion<EstadoAnalista>('analista', e) } catch { /* sin almacenamiento: dura la visita */ }
}

export function guardarUltimaMano(k: number, d: number): void {
  guardarEstado({ ...leerEstado(), ultimaMano: { k, d } })
}
