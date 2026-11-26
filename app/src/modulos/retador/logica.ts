/**
 * Lógica pura del Retador (sin React ni navegador): puntaje de una decisión, resumen de la sesión, estilo frente a la
 * élite, semilla del reto del día y lectura tolerante de lo guardado. Reglas: docs/features/retador/design.md.
 */

export type AccionRetador = 'f' | 'cc' | 'cbr'
export interface ProbabilidadesElite { fold: number; checkCall: number; betRaise: number }
export type TipoSesion = 'sesion' | 'reto'
export type NivelPuntaje = 'alto' | 'medio' | 'bajo'

// --- Números del diseño (todos SUPUESTO, ver design.md › Números) -----------------------------------------------------
export const MANOS_SESION = 10
export const MANOS_RETO = 5
export const UMBRAL_ALTO = 60
export const UMBRAL_MEDIO = 30
/** Diferencia, en puntos porcentuales, para decir "más" o "menos" que la élite. */
export const UMBRAL_ESTILO = 10
/** Con menos decisiones que estas no se habla de estilo (una sola mano no define cómo juegas). */
export const MIN_DECISIONES_ESTILO = 5

const MESAS = 6

export const manosDe = (tipo: TipoSesion): number => (tipo === 'reto' ? MANOS_RETO : MANOS_SESION)

// --- Puntaje de una decisión --------------------------------------------------------------------------------------------
const acotar01 = (v: number): number => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0)

/** Probabilidad que la élite da a la acción elegida. El tamaño de la subida no cambia nada: la red no lo distingue. */
export function probabilidadDe(accion: AccionRetador, elite: ProbabilidadesElite): number {
  const p = accion === 'f' ? elite.fold : accion === 'cc' ? elite.checkCall : elite.betRaise
  return acotar01(p)
}

/** 100 × la probabilidad de la élite para la acción elegida, redondeado. */
export function puntajeDecision(accion: AccionRetador, elite: ProbabilidadesElite): number {
  return Math.round(100 * probabilidadDe(accion, elite))
}

export function nivelDePuntaje(puntos: number): NivelPuntaje {
  return puntos >= UMBRAL_ALTO ? 'alto' : puntos >= UMBRAL_MEDIO ? 'medio' : 'bajo'
}

export const ETIQUETA_NIVEL: Record<NivelPuntaje, string> = {
  alto: 'Como la élite',
  medio: 'Discutible',
  bajo: 'La élite casi nunca lo hace',
}

export const SONIDO_NIVEL = { alto: 'puntos_alto', medio: 'puntos_medio', bajo: 'puntos_bajo' } as const

// --- Decisiones registradas ---------------------------------------------------------------------------------------------
export type PosicionRetador = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'

export interface DecisionRegistrada {
  /** Número de mano dentro de la sesión (desde 1). */
  mano: number
  calle: 0 | 1 | 2 | 3
  posicion: PosicionRetador
  accion: AccionRetador
  puntos: number
  elite: ProbabilidadesElite
  /** Cartas del jugador, si la mano llegó a su fin. */
  cartas?: [string, string]
}

export const NOMBRE_CALLE = ['Preflop', 'Flop', 'Turn', 'River'] as const
export const NOMBRE_ACCION: Record<AccionRetador, string> = { f: 'Fold', cc: 'Check-Call', cbr: 'Raise' }

/** Precisión élite: promedio de los puntajes, redondeado. null si todavía no hay decisiones. */
export function precisionMedia(decisiones: readonly DecisionRegistrada[]): number | null {
  if (decisiones.length === 0) return null
  return Math.round(decisiones.reduce((s, d) => s + d.puntos, 0) / decisiones.length)
}

export const xpDeDecisiones = (decisiones: readonly DecisionRegistrada[]): number => decisiones.reduce((s, d) => s + d.puntos, 0)

/** Qué tan dividida estaba la élite: 0 (todos hacen lo mismo) a 1 (reparto parejo entre las tres acciones). */
export function divisionDeElite(e: ProbabilidadesElite): number {
  const ps = [e.fold, e.checkCall, e.betRaise].map(acotar01)
  const total = ps.reduce((a, b) => a + b, 0)
  if (total <= 0) return 0
  let h = 0
  for (const p of ps) {
    const q = p / total
    if (q > 0) h -= q * Math.log(q)
  }
  return h / Math.log(3)
}

const mayorProbabilidad = (e: ProbabilidadesElite): number => Math.max(acotar01(e.fold), acotar01(e.checkCall), acotar01(e.betRaise))

/**
 * Mejor decisión: de las que coinciden con la élite (≥ 60 puntos), la que más dividida la tenía; así no premia lo obvio.
 * Si ninguna llega a 60, la de más puntos, siempre que pase de 30. Ante un empate gana la más temprana.
 */
export function mejorDecision(decisiones: readonly DecisionRegistrada[]): DecisionRegistrada | null {
  if (decisiones.length === 0) return null
  const altas = decisiones.filter((d) => d.puntos >= UMBRAL_ALTO)
  if (altas.length > 0) {
    return altas.reduce((mejor, d) => {
      const a = divisionDeElite(d.elite)
      const b = divisionDeElite(mejor.elite)
      if (a > b + 1e-9) return d
      if (Math.abs(a - b) <= 1e-9 && d.puntos > mejor.puntos) return d
      return mejor
    })
  }
  const tope = decisiones.reduce((m, d) => (d.puntos > m.puntos ? d : m))
  return tope.puntos >= UMBRAL_MEDIO ? tope : null
}

/** Decisión a revisar: la de menos puntos (solo si no llegó a 60). Ante un empate, aquella donde la élite estaba más segura. */
export function decisionARevisar(decisiones: readonly DecisionRegistrada[]): DecisionRegistrada | null {
  if (decisiones.length === 0) return null
  const peor = decisiones.reduce((m, d) => {
    if (d.puntos < m.puntos) return d
    if (d.puntos === m.puntos && mayorProbabilidad(d.elite) > mayorProbabilidad(m.elite)) return d
    return m
  })
  return peor.puntos < UMBRAL_ALTO ? peor : null
}

// --- Estilo frente a la élite -------------------------------------------------------------------------------------------
export type Comparacion = 'mas' | 'menos' | 'parecido'

export interface EstiloFrenteElite {
  n: number
  /** Con muy pocas decisiones no se saca ninguna frase. */
  suficiente: boolean
  /** Porcentajes enteros, 0 a 100. */
  jugador: { raise: number; fold: number }
  elite: { raise: number; fold: number }
  raise: Comparacion
  fold: Comparacion
  titulo: string
  fraseRaise: string
  fraseFold: string
}

function comparar(jugadorPct: number, elitePct: number): Comparacion {
  const dif = jugadorPct - elitePct
  return dif >= UMBRAL_ESTILO ? 'mas' : dif <= -UMBRAL_ESTILO ? 'menos' : 'parecido'
}

/**
 * Compara cuántas veces subió y se retiró el jugador con cuántas veces lo habría hecho la élite en esas mismas
 * decisiones (el promedio de sus probabilidades). Diferencia mínima para hablar de "más" o "menos": 10 puntos.
 */
export function estiloFrenteElite(decisiones: readonly DecisionRegistrada[]): EstiloFrenteElite {
  const n = decisiones.length
  const prom = (f: (d: DecisionRegistrada) => number) => (n === 0 ? 0 : (100 * decisiones.reduce((s, d) => s + f(d), 0)) / n)
  const jugRaise = prom((d) => (d.accion === 'cbr' ? 1 : 0))
  const jugFold = prom((d) => (d.accion === 'f' ? 1 : 0))
  const eliRaise = prom((d) => acotar01(d.elite.betRaise))
  const eliFold = prom((d) => acotar01(d.elite.fold))
  const suficiente = n >= MIN_DECISIONES_ESTILO
  const raise = suficiente ? comparar(jugRaise, eliRaise) : 'parecido'
  const fold = suficiente ? comparar(jugFold, eliFold) : 'parecido'

  const titulo = !suficiente
    ? 'Todavía hay pocas decisiones para hablar de tu estilo'
    : raise === 'mas' ? 'Jugaste más agresivo que la élite'
    : raise === 'menos' ? 'Jugaste más pasivo que la élite'
    : 'Jugaste muy parecido a la élite'
  const fraseRaise = !suficiente ? '' : raise === 'mas' ? 'Subiste más veces de las que habría subido la élite.' : raise === 'menos' ? 'Subiste menos veces de las que habría subido la élite.' : 'Subiste casi igual de seguido que la élite.'
  const fraseFold = !suficiente ? '' : fold === 'mas' ? 'Te retiraste más veces que la élite.' : fold === 'menos' ? 'Te retiraste menos veces que la élite.' : 'Te retiraste casi igual de seguido que la élite.'

  return {
    n, suficiente,
    jugador: { raise: Math.round(jugRaise), fold: Math.round(jugFold) },
    elite: { raise: Math.round(eliRaise), fold: Math.round(eliFold) },
    raise, fold, titulo, fraseRaise, fraseFold,
  }
}

// --- Resumen --------------------------------------------------------------------------------------------------------------
export interface ResumenSesion {
  tipo: TipoSesion
  n: number
  precision: number | null
  fichasBB: number
  xp: number
  mejor: DecisionRegistrada | null
  revisar: DecisionRegistrada | null
  estilo: EstiloFrenteElite
}

export function resumirSesion(tipo: TipoSesion, decisiones: readonly DecisionRegistrada[], fichasBB: number): ResumenSesion {
  return {
    tipo, n: decisiones.length, precision: precisionMedia(decisiones), fichasBB,
    xp: xpDeDecisiones(decisiones),
    mejor: mejorDecision(decisiones), revisar: decisionARevisar(decisiones), estilo: estiloFrenteElite(decisiones),
  }
}

// --- Semillas y botón -----------------------------------------------------------------------------------------------------
/** Mezcla de texto a entero de 31 bits (FNV-1a), repetible. */
export function hashTexto(texto: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) & 0x7fffffff
}

/** Día local como 'AAAA-MM-DD' (no usa la hora UTC: el reto cambia a medianoche del jugador). */
export function diaLocalTexto(f: Date): string {
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`
}

/** Semilla base del reto del día: sale solo de la fecha local, así que todos juegan las mismas manos ese día. */
export function semillaDelDia(f: Date): number {
  return hashTexto(`nextchip-reto-${diaLocalTexto(f)}`)
}

/** Semilla de la mano `indice` (desde 0) de una sesión con esa base. */
export function semillaDeMano(base: number, indice: number): number {
  return hashTexto(`${base}#${indice}`)
}

/** Asiento de la mesa con el botón en la mano `indice`: rota un asiento por mano para pasar por todas las posiciones. */
export function botonDeMano(base: number, indice: number): number {
  return (hashTexto(`boton-${base}`) + indice) % MESAS
}

// --- Lo que se guarda -----------------------------------------------------------------------------------------------------
export interface SesionGuardada {
  tipo: TipoSesion
  /** Solo en el reto: el día ('AAAA-MM-DD') para el que se armó. */
  dia?: string
  semillaBase: number
  total: number
  /** Índice (desde 0) de la mano que toca jugar al volver. */
  siguiente: number
  decisiones: DecisionRegistrada[]
  fichasBB: number
}

export interface DatosRetador {
  version: 1
  /** Mejor Precisión élite en una Sesión completa. */
  record: number | null
  /** Mejor Precisión élite del reto de un día. */
  mejorReto: { dia: string; puntaje: number } | null
  avisoSubidaVisto: boolean
  enCurso: SesionGuardada | null
}

export const DATOS_INICIALES: DatosRetador = { version: 1, record: null, mejorReto: null, avisoSubidaVisto: false, enCurso: null }

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const esNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function leerElite(v: unknown): ProbabilidadesElite | null {
  if (!esObjeto(v) || !esNum(v.fold) || !esNum(v.checkCall) || !esNum(v.betRaise)) return null
  return { fold: acotar01(v.fold), checkCall: acotar01(v.checkCall), betRaise: acotar01(v.betRaise) }
}

function leerDecision(v: unknown): DecisionRegistrada | null {
  if (!esObjeto(v)) return null
  const elite = leerElite(v.elite)
  const { mano, calle, posicion, accion, puntos, cartas } = v
  if (!elite || !esNum(mano) || !esNum(puntos)) return null
  if (calle !== 0 && calle !== 1 && calle !== 2 && calle !== 3) return null
  if (accion !== 'f' && accion !== 'cc' && accion !== 'cbr') return null
  if (typeof posicion !== 'string' || !['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'].includes(posicion)) return null
  const d: DecisionRegistrada = {
    mano: Math.max(1, Math.floor(mano)), calle, posicion: posicion as PosicionRetador, accion,
    puntos: Math.min(100, Math.max(0, Math.round(puntos))), elite,
  }
  if (Array.isArray(cartas) && cartas.length === 2 && cartas.every((c) => typeof c === 'string' && c.length === 2)) {
    d.cartas = [cartas[0] as string, cartas[1] as string]
  }
  return d
}

function leerSesion(v: unknown): SesionGuardada | null {
  if (!esObjeto(v)) return null
  if (v.tipo !== 'sesion' && v.tipo !== 'reto') return null
  if (!esNum(v.semillaBase) || !esNum(v.total) || !esNum(v.siguiente) || !esNum(v.fichasBB)) return null
  if (!Array.isArray(v.decisiones)) return null
  const total = Math.floor(v.total)
  if (total < 1 || total > 50) return null
  const decisiones = v.decisiones.map(leerDecision).filter((d): d is DecisionRegistrada => d !== null)
  const s: SesionGuardada = {
    tipo: v.tipo, semillaBase: Math.floor(v.semillaBase) & 0x7fffffff, total,
    siguiente: Math.min(total, Math.max(0, Math.floor(v.siguiente))), decisiones, fichasBB: v.fichasBB,
  }
  if (typeof v.dia === 'string') s.dia = v.dia
  return s
}

/** Lee lo guardado con tolerancia: datos viejos o dañados se descartan sin romper nada. */
export function leerDatos(bruto: unknown): DatosRetador {
  if (!esObjeto(bruto)) return { ...DATOS_INICIALES }
  const mr = bruto.mejorReto
  return {
    version: 1,
    record: esNum(bruto.record) ? Math.min(100, Math.max(0, Math.round(bruto.record))) : null,
    mejorReto: esObjeto(mr) && typeof mr.dia === 'string' && esNum(mr.puntaje) ? { dia: mr.dia, puntaje: Math.min(100, Math.max(0, Math.round(mr.puntaje))) } : null,
    avisoSubidaVisto: bruto.avisoSubidaVisto === true,
    enCurso: leerSesion(bruto.enCurso),
  }
}

/** La sesión guardada solo vale si no es un reto de otro día. */
export function sesionVigente(datos: DatosRetador, hoy: string): SesionGuardada | null {
  const s = datos.enCurso
  if (!s) return null
  if (s.tipo === 'reto' && s.dia !== hoy) return null
  return s
}

/** Mejor puntaje del reto de hoy (null si hoy todavía no se juega). */
export function mejorDeHoy(datos: DatosRetador, hoy: string): number | null {
  return datos.mejorReto && datos.mejorReto.dia === hoy ? datos.mejorReto.puntaje : null
}

export interface ResultadoRecord {
  /** Había un récord (o mejor del día) anterior. */
  anterior: number | null
  /** Se batió: el primero que se logra también cuenta. */
  batido: boolean
  primero: boolean
}

/**
 * Al terminar una sesión completa: actualiza el récord (Sesión) o el mejor del día (Reto) y limpia lo "en curso".
 * No cambia los datos de entrada.
 */
export function cerrarSesion(datos: DatosRetador, resumen: ResumenSesion, hoy: string): { datos: DatosRetador; record: ResultadoRecord } {
  const base: DatosRetador = { ...datos, enCurso: null }
  const p = resumen.precision
  if (p === null) return { datos: base, record: { anterior: null, batido: false, primero: false } }
  if (resumen.tipo === 'sesion') {
    const anterior = datos.record
    const batido = anterior === null || p > anterior
    return { datos: { ...base, record: batido ? p : anterior }, record: { anterior, batido, primero: anterior === null } }
  }
  const anterior = mejorDeHoy(datos, hoy)
  const batido = anterior === null || p > anterior
  return {
    datos: { ...base, mejorReto: batido ? { dia: hoy, puntaje: p } : datos.mejorReto },
    record: { anterior, batido, primero: anterior === null },
  }
}

// --- Texto ----------------------------------------------------------------------------------------------------------------
const PALOS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
/** 'Ah' → 'A♥' ; 'Td' → '10♦'. */
export function formatearCarta(c: string): string {
  const valor = c[0] === 'T' ? '10' : (c[0] ?? '')
  return `${valor}${PALOS[c[1] ?? ''] ?? ''}`
}

/** Fichas con signo y un decimal solo si hace falta: +4.5, −3, 0. */
export function formatearFichas(bb: number): string {
  const r = Math.round(bb * 10) / 10
  if (r === 0) return '0'
  const t = Number.isInteger(r) ? String(Math.abs(r)) : Math.abs(r).toFixed(1)
  return `${r > 0 ? '+' : '−'}${t}`
}
