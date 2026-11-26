/**
 * Lógica pura del Instructor (sin React): calificación de preguntas y casos, repaso, estrellas, recorrido y
 * lectura tolerante del estado guardado. Todo lo que se prueba con Vitest vive aquí.
 */

// --- Tipos mínimos (los del curso, sin importarlo para que las pruebas sean ligeras) ---------------------------------
export interface PreguntaMin {
  id: string
  formato: 'opciones' | 'numero'
  correcta: string | number
  tolerancia?: number
}
export interface CasoMin { id: string; opciones: string[]; correcta: string[] }
export interface ModuloMin {
  numero: number
  lecciones: { id: string }[]
  evaluacion: { id: string }[]
  casos: { id: string }[]
}

// --- Estado guardado ------------------------------------------------------------------------------------------------
export type PantallaGuardada = 'camino' | 'leccion' | 'evaluacion' | 'prueba' | 'repaso'
export interface Ubicacion { modulo: number; leccion: string | null; pantalla: PantallaGuardada; indice: number }
export interface ItemRepaso { tipo: 'pregunta' | 'caso'; id: string; modulo: number; aciertos: number }
export interface EstadoInstructor {
  version: 1
  /** Ids de las lecciones terminadas ('M04_L02'). */
  lecciones: string[]
  /** Mejor porcentaje (0 a 100) de la evaluación de cada módulo, por número de módulo. */
  evaluaciones: Record<string, number>
  /** Mejor resultado de la prueba en vivo de cada módulo. */
  pruebas: Record<string, { aciertos: number; total: number }>
  repaso: ItemRepaso[]
  ultimo: Ubicacion | null
}

export const ESTADO_INICIAL: EstadoInstructor = { version: 1, lecciones: [], evaluaciones: {}, pruebas: {}, repaso: [], ultimo: null }

/** Aciertos que hacen falta para salir del repaso. */
export const ACIERTOS_PARA_SALIR = 2
/** Porcentaje de la evaluación que da la segunda estrella. */
export const UMBRAL_EVALUACION = 80

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const esNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const PANTALLAS: readonly PantallaGuardada[] = ['camino', 'leccion', 'evaluacion', 'prueba', 'repaso']

/** Lee lo guardado con tolerancia: datos viejos o dañados nunca rompen el Instructor. */
export function normalizarEstado(bruto: unknown): EstadoInstructor {
  const e: EstadoInstructor = { version: 1, lecciones: [], evaluaciones: {}, pruebas: {}, repaso: [], ultimo: null }
  if (!esObjeto(bruto)) return e
  if (Array.isArray(bruto.lecciones)) e.lecciones = [...new Set(bruto.lecciones.filter((x): x is string => typeof x === 'string'))]
  if (esObjeto(bruto.evaluaciones)) {
    for (const [k, v] of Object.entries(bruto.evaluaciones)) if (esNum(v)) e.evaluaciones[k] = Math.min(100, Math.max(0, v))
  }
  if (esObjeto(bruto.pruebas)) {
    for (const [k, v] of Object.entries(bruto.pruebas)) {
      if (esObjeto(v) && esNum(v.aciertos) && esNum(v.total) && v.total > 0) e.pruebas[k] = { aciertos: Math.max(0, Math.min(v.aciertos, v.total)), total: v.total }
    }
  }
  if (Array.isArray(bruto.repaso)) {
    for (const r of bruto.repaso) {
      if (esObjeto(r) && (r.tipo === 'pregunta' || r.tipo === 'caso') && typeof r.id === 'string' && esNum(r.modulo)) {
        e.repaso.push({ tipo: r.tipo, id: r.id, modulo: r.modulo, aciertos: esNum(r.aciertos) ? Math.max(0, Math.floor(r.aciertos)) : 0 })
      }
    }
  }
  const u = bruto.ultimo
  if (esObjeto(u) && esNum(u.modulo) && PANTALLAS.includes(u.pantalla as PantallaGuardada)) {
    e.ultimo = { modulo: u.modulo, leccion: typeof u.leccion === 'string' ? u.leccion : null, pantalla: u.pantalla as PantallaGuardada, indice: esNum(u.indice) ? Math.max(0, Math.floor(u.indice)) : 0 }
  }
  return e
}

// --- Preguntas de la evaluación -------------------------------------------------------------------------------------
/** Convierte lo que escribió el jugador en número: acepta coma decimal, "$", "%" y espacios. Devuelve null si no es un número. */
export function leerNumero(texto: string): number | null {
  const t = texto.trim().replace(/[$%\s]/g, '').replace(',', '.')
  if (t === '' || !/^-?\d+(\.\d+)?$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

const normalizar = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()

/** ¿La respuesta coincide con lo esperado? `numero` admite la tolerancia de la pregunta (0 si no trae). */
export function calificarPregunta(p: PreguntaMin, respuesta: string | number): boolean {
  if (p.formato === 'numero') {
    const dado = typeof respuesta === 'number' ? respuesta : leerNumero(respuesta)
    const esperado = typeof p.correcta === 'number' ? p.correcta : leerNumero(String(p.correcta))
    if (dado === null || esperado === null) return false
    return Math.abs(dado - esperado) <= (p.tolerancia ?? 0) + 1e-9
  }
  return normalizar(String(respuesta)) === normalizar(String(p.correcta))
}

/** Porcentaje entero (0 a 100) de aciertos; 0 si no hay preguntas. */
export function porcentaje(aciertos: number, total: number): number {
  return total > 0 ? Math.round((aciertos / total) * 100) : 0
}

// --- Casos de la prueba en vivo -------------------------------------------------------------------------------------
/** Texto de la opción del caso que corresponde a la acción tomada en la mesa (f, cc o cbr). */
export function textoDeAccion(accion: 'f' | 'cc' | 'cbr', opciones: string[]): string {
  const busca = (...candidatos: string[]) => opciones.find((o) => candidatos.includes(normalizar(o)))
  if (accion === 'f') return busca('fold') ?? 'Fold'
  if (accion === 'cc') return busca('check', 'call') ?? 'Call'
  return busca('bet', 'raise', 'all-in') ?? 'Raise'
}

/** ¿La opción elegida está entre las esperadas del caso? */
export function calificarCaso(c: Pick<CasoMin, 'correcta'>, eleccion: string): boolean {
  return c.correcta.some((x) => normalizar(x) === normalizar(eleccion))
}

/** Caso `decision`: califica la acción tomada en la mesa. */
export function calificarDecision(c: CasoMin, accion: 'f' | 'cc' | 'cbr'): { texto: string; acierto: boolean } {
  const texto = textoDeAccion(accion, c.opciones)
  return { texto, acierto: calificarCaso(c, texto) }
}

// --- Repaso ---------------------------------------------------------------------------------------------------------
/**
 * Un fallo mete (o reinicia) el ítem en el repaso; cada acierto suma uno y al llegar a `ACIERTOS_PARA_SALIR` sale.
 * Acertar algo que no está en el repaso no cambia nada. No modifica la lista recibida.
 */
export function registrarRepaso(repaso: ItemRepaso[], item: Omit<ItemRepaso, 'aciertos'>, acierto: boolean): ItemRepaso[] {
  const i = repaso.findIndex((r) => r.tipo === item.tipo && r.id === item.id)
  if (!acierto) {
    const nuevo: ItemRepaso = { ...item, aciertos: 0 }
    if (i < 0) return [...repaso, nuevo]
    const copia = [...repaso]
    copia[i] = nuevo
    return copia
  }
  if (i < 0) return repaso
  const aciertos = repaso[i]!.aciertos + 1
  if (aciertos >= ACIERTOS_PARA_SALIR) return repaso.filter((_, j) => j !== i)
  const copia = [...repaso]
  copia[i] = { ...repaso[i]!, aciertos }
  return copia
}

// --- Estrellas ------------------------------------------------------------------------------------------------------
export interface EntradaEstrellas {
  leccionesHechas: number
  leccionesTotal: number
  /** Mejor porcentaje de la evaluación, o null si no la ha hecho. */
  evaluacionPct: number | null
  /** Mejor resultado de la prueba en vivo, o null si no la ha hecho. */
  casos: { aciertos: number; total: number } | null
}

/** Estrellas del módulo (0 a 3): 1 por terminar las lecciones, 1 por la evaluación al 80 % o más, 1 por acertar 2/3 o más de los casos. */
export function estrellas(e: EntradaEstrellas): 0 | 1 | 2 | 3 {
  let n = 0
  if (e.leccionesTotal > 0 && e.leccionesHechas >= e.leccionesTotal) n++
  if (e.evaluacionPct !== null && e.evaluacionPct >= UMBRAL_EVALUACION) n++
  if (e.casos && e.casos.total > 0 && e.casos.aciertos * 3 >= e.casos.total * 2) n++
  return n as 0 | 1 | 2 | 3
}

export function estrellasDeModulo(estado: EstadoInstructor, m: ModuloMin): 0 | 1 | 2 | 3 {
  const hechas = m.lecciones.filter((l) => estado.lecciones.includes(l.id)).length
  return estrellas({
    leccionesHechas: hechas,
    leccionesTotal: m.lecciones.length,
    evaluacionPct: estado.evaluaciones[String(m.numero)] ?? null,
    casos: estado.pruebas[String(m.numero)] ?? null,
  })
}

// --- Recorrido ------------------------------------------------------------------------------------------------------
export type NodoCamino =
  | { tipo: 'leccion'; modulo: number; id: string }
  | { tipo: 'evaluacion'; modulo: number }
  | { tipo: 'prueba'; modulo: number }

/** Los nodos de un módulo en orden: lecciones, evaluación (si tiene preguntas) y prueba en vivo (si tiene casos). */
export function nodosDeModulo(m: ModuloMin): NodoCamino[] {
  const nodos: NodoCamino[] = m.lecciones.map((l) => ({ tipo: 'leccion', modulo: m.numero, id: l.id }))
  if (m.evaluacion.length) nodos.push({ tipo: 'evaluacion', modulo: m.numero })
  if (m.casos.length) nodos.push({ tipo: 'prueba', modulo: m.numero })
  return nodos
}

export function nodoHecho(estado: EstadoInstructor, n: NodoCamino): boolean {
  if (n.tipo === 'leccion') return estado.lecciones.includes(n.id)
  if (n.tipo === 'evaluacion') return estado.evaluaciones[String(n.modulo)] !== undefined
  return estado.pruebas[String(n.modulo)] !== undefined
}

export function mismoNodo(a: NodoCamino, b: NodoCamino): boolean {
  if (a.tipo !== b.tipo || a.modulo !== b.modulo) return false
  return a.tipo !== 'leccion' || (b.tipo === 'leccion' && a.id === b.id)
}

/** El primer nodo sin hacer, en el orden del curso (módulo 12 al final). Null si todo está hecho. */
export function siguienteRecomendado(modulos: ModuloMin[], estado: EstadoInstructor): NodoCamino | null {
  for (const m of modulos) for (const n of nodosDeModulo(m)) if (!nodoHecho(estado, n)) return n
  return null
}

/** El nodo que sigue a `actual` en el recorrido, hecho o no. Null si era el último. */
export function nodoSiguienteA(modulos: ModuloMin[], actual: NodoCamino): NodoCamino | null {
  const todos = modulos.flatMap(nodosDeModulo)
  const i = todos.findIndex((n) => mismoNodo(n, actual))
  return i >= 0 ? (todos[i + 1] ?? null) : null
}

/** Desplazamiento horizontal (de -1 a 1) del nodo número `i`, para dibujar el camino en zigzag. */
export function desplazamiento(i: number): number {
  return [0, 0.55, 1, 0.55, 0, -0.55, -1, -0.55][((i % 8) + 8) % 8]!
}

/** Número de semilla estable a partir de un id de caso ('m04-c01'), para que la mesa reparta siempre igual. */
export function semillaDeCaso(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) % 1000000
}

const PALOS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
/** 'Ah 5h' -> 'A♥ 5♥' (y 'Td' -> '10♦' no se convierte: se deja la T como en el curso). Lo ilegible se deja tal cual. */
export function cartasATexto(cartas: string): string {
  return cartas.trim().split(/\s+/).filter(Boolean).map((c) => (/^[2-9TJQKA][shdc]$/.test(c) ? `${c[0]}${PALOS[c[1]!]}` : c)).join(' ')
}
