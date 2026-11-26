/**
 * Sonido de Next Chip. `reproducir(evento)` toca `public/sonidos/<evento>.mp3`.
 *  - Respeta el ajuste `sonido` de Progreso.
 *  - No falla si un archivo no existe (todavía los pone el frente de Recursos): ese evento simplemente queda en silencio.
 *  - Precarga los archivos en el primer toque del usuario (los navegadores no dejan sonar antes).
 * La música queda fuera por ahora.
 */
import { progresoGlobal } from '../progreso/progreso.ts'

export type EventoSonido =
  | 'carta' | 'volteo' | 'ficha' | 'fichas_bote' | 'check' | 'fold'
  | 'boton' | 'puntos_alto' | 'puntos_medio' | 'puntos_bajo'
  | 'ganar_bote' | 'subir_rango' | 'fin_sesion'

export const EVENTOS: readonly EventoSonido[] = [
  'carta', 'volteo', 'ficha', 'fichas_bote', 'check', 'fold',
  'boton', 'puntos_alto', 'puntos_medio', 'puntos_bajo',
  'ganar_bote', 'subir_rango', 'fin_sesion',
]

/** Lo mínimo que necesitamos de un elemento de audio (así se puede simular en las pruebas). */
export interface Reproductor {
  volume: number
  currentTime: number
  play(): Promise<void> | void
  cloneNode(): Reproductor
  addEventListener(tipo: 'error', f: () => void): void
  load(): void
}

export interface DependenciasSonido {
  activo: () => boolean
  crear: (url: string) => Reproductor
  base?: string
}

export function crearSonido({ activo, crear, base = '/sonidos/' }: DependenciasSonido) {
  const cache = new Map<EventoSonido, Reproductor | null>()
  const cargar = (e: EventoSonido): Reproductor | null => {
    if (cache.has(e)) return cache.get(e)!
    let r: Reproductor | null = null
    try {
      r = crear(`${base}${e}.mp3`)
      const quien = r
      quien.addEventListener('error', () => { if (cache.get(e) === quien) cache.set(e, null) }) // falta el archivo: se silencia
    } catch { r = null }
    cache.set(e, r)
    return r
  }
  return {
    reproducir(evento: EventoSonido): void {
      try {
        if (!activo()) return
        const base = cargar(evento)
        if (!base) return
        // Una copia por reproducción, para que el mismo sonido pueda solaparse (varias fichas seguidas).
        const copia = base.cloneNode()
        copia.volume = 0.7
        const p = copia.play()
        if (p && typeof p.catch === 'function') p.catch(() => { /* sin permiso o sin archivo: se ignora */ })
      } catch { /* el sonido nunca debe romper el juego */ }
    },
    /** Pide los archivos al navegador (se llama en el primer toque del usuario). */
    precargar(): void {
      for (const e of EVENTOS) cargar(e)?.load()
    },
  }
}

let motor: ReturnType<typeof crearSonido> | null = null
let escuchando = false

function motorGlobal() {
  if (!motor) {
    motor = crearSonido({
      activo: () => progresoGlobal().leer().ajustes.sonido,
      crear: (url) => {
        const a = new Audio()
        a.preload = 'auto'
        a.src = url
        return a as unknown as Reproductor
      },
    })
  }
  return motor
}

/** Prepara la precarga en el primer toque o tecla. Se llama una vez al arrancar la app; repetirla no hace nada. */
export function iniciarSonido(): void {
  if (escuchando || typeof window === 'undefined') return
  escuchando = true
  const alPrimerToque = () => {
    window.removeEventListener('pointerdown', alPrimerToque)
    window.removeEventListener('keydown', alPrimerToque)
    try { motorGlobal().precargar() } catch { /* sin audio en este navegador */ }
  }
  window.addEventListener('pointerdown', alPrimerToque, { passive: true })
  window.addEventListener('keydown', alPrimerToque)
}

export function reproducir(evento: EventoSonido): void {
  try { motorGlobal().reproducir(evento) } catch { /* sin audio en este navegador */ }
}
