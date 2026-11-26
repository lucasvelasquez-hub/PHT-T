/**
 * Navegación de Next Chip, sin librerías: la ruta vive en `location.hash`, así que recargar
 * deja al jugador en la misma pantalla y el botón "atrás" del navegador funciona.
 *
 *   #/portada  #/bienvenida  #/inicio  #/retador  #/instructor/M04_L02  #/analista/12  #/ajustes  #/creditos
 *
 * Los parámetros de revisión de la mesa (?mano=…&d=…&fuente=banco) viven en `location.search`
 * y no se tocan aquí.
 */
import { useCallback, useSyncExternalStore } from 'react'

export type Ruta =
  | { pantalla: 'portada' }
  | { pantalla: 'bienvenida' }
  | { pantalla: 'inicio' }
  | { pantalla: 'retador' }
  | { pantalla: 'instructor'; leccion?: string }
  | { pantalla: 'analista'; mano?: number }
  | { pantalla: 'ajustes' }
  | { pantalla: 'creditos' }

const SIMPLES = ['portada', 'bienvenida', 'inicio', 'retador', 'ajustes', 'creditos'] as const

/** Convierte un hash (`#/instructor/M04_L02`) en una ruta. Lo desconocido o vacío cae en la portada. */
export function rutaDesdeHash(hash: string): Ruta {
  const partes = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const nombre = partes[0]
  let extra: string | undefined
  try { extra = partes[1] ? decodeURIComponent(partes[1]) : undefined } catch { extra = undefined }
  if (nombre === 'instructor') return extra ? { pantalla: 'instructor', leccion: extra } : { pantalla: 'instructor' }
  if (nombre === 'analista') {
    const n = extra === undefined ? NaN : Number(extra)
    return Number.isInteger(n) && n >= 0 ? { pantalla: 'analista', mano: n } : { pantalla: 'analista' }
  }
  const simple = SIMPLES.find((s) => s === nombre)
  return simple ? { pantalla: simple } : { pantalla: 'portada' }
}

/** Inversa de `rutaDesdeHash`. */
export function hashDesdeRuta(r: Ruta): string {
  if (r.pantalla === 'instructor' && r.leccion) return `#/instructor/${encodeURIComponent(r.leccion)}`
  if (r.pantalla === 'analista' && r.mano !== undefined) return `#/analista/${r.mano}`
  return `#/${r.pantalla}`
}

// Un objeto estable por hash, para que useSyncExternalStore no vea un valor nuevo en cada lectura.
const PORTADA: Ruta = { pantalla: 'portada' }
let hashPrevio: string | null = null
let rutaPrevia: Ruta = PORTADA
function instantanea(): Ruta {
  const h = window.location.hash
  if (h !== hashPrevio) { hashPrevio = h; rutaPrevia = rutaDesdeHash(h) }
  return rutaPrevia
}
function suscribir(aviso: () => void) {
  window.addEventListener('hashchange', aviso)
  return () => window.removeEventListener('hashchange', aviso)
}

export function useRuta(): [Ruta, (r: Ruta) => void] {
  const ruta = useSyncExternalStore(suscribir, instantanea, () => PORTADA)
  const ir = useCallback((r: Ruta) => {
    const destino = hashDesdeRuta(r)
    if (window.location.hash !== destino) window.location.hash = destino
  }, [])
  return [ruta, ir]
}
