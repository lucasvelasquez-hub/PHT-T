/**
 * sonidoSeguro.ts: reproduce un efecto si el módulo de sonido de la app existe y no hace nada si falla.
 * `src/sonido/sonido.ts` lo construye otro frente y puede no existir todavía: `import.meta.glob` devuelve un
 * objeto vacío si el archivo no está, así que ni el build ni la mesa se rompen.
 */

/** Los mismos eventos de la sección 3.3 de CONTRATOS_JUGABILIDAD.md. */
export type EventoSonido =
  | 'carta' | 'volteo' | 'ficha' | 'fichas_bote' | 'check' | 'fold'
  | 'boton' | 'puntos_alto' | 'puntos_medio' | 'puntos_bajo'
  | 'ganar_bote' | 'subir_rango' | 'fin_sesion'

type ModuloSonido = { reproducir?: (evento: EventoSonido) => void }

const cargadores = import.meta.glob<ModuloSonido>('../sonido/sonido.ts')
let modulo: Promise<ModuloSonido | null> | null = null

function cargar(): Promise<ModuloSonido | null> {
  if (!modulo) {
    const carga = Object.values(cargadores)[0]
    modulo = carga ? carga().catch(() => null) : Promise.resolve(null)
  }
  return modulo
}

export function reproducirSeguro(evento: EventoSonido): void {
  try {
    void cargar().then((m) => { try { m?.reproducir?.(evento) } catch { /* sin sonido */ } }).catch(() => undefined)
  } catch { /* sin sonido */ }
}
