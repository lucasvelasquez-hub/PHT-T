/**
 * mano.ts: máquina de estados de UNA mano de póker (6 jugadores, ciegas y stacks en fichas).
 *
 * Replica `reconstruir_decisiones_v4` del Notebook 10 y la amplía con lo que necesita el juego en vivo:
 * a quién le toca, qué acciones son legales y cuándo termina cada ronda.
 *
 * REGLAS QUE VIENEN DEL PYTHON (no cambiar sin volver a pasar la prueba golden):
 *  - La "foto" de la mesa para las variables se toma ANTES de que el jugador actúe.
 *  - `cbr X` (PHH) significa subir HASTA X en total en esta calle (no subir X más).
 *  - Pago = min(max(0, X − ya_puesto), stack). Pagar = min(a_pagar, stack).
 *  - Asientos: índice 0 = p1 = ciega pequeña, 1 = p2 = ciega grande, ..., n−1 = botón.
 *  - Preflop empieza a actuar el asiento 2 (tras la ciega grande); postflop empieza el asiento 0.
 *
 * El estado es un objeto plano (solo números, textos y arreglos): se puede clonar con `structuredClone`,
 * enviar a un Web Worker y guardar como JSON. Las funciones lo MODIFICAN en sitio; usa `clonarMano` para
 * probar jugadas hipotéticas sin tocar la mano real.
 */
import type { Carta } from './cartas.ts'

/** f = fold, cc = check/call, cbr = bet/raise (códigos del formato PHH). */
export type TipoAccion = 'f' | 'cc' | 'cbr'

/** Una acción de un jugador. `hasta` solo aplica a `cbr`: total al que se sube en esta calle. */
export interface Accion {
  asiento: number
  tipo: TipoAccion
  hasta?: number
}

/** Datos para empezar una mano. */
export interface ConfigMano {
  /** Nombres por asiento (el asiento 0 es la ciega pequeña). */
  jugadores: string[]
  /** Stacks iniciales en fichas, por asiento. */
  stacks: number[]
  /** Ciegas por asiento (por ejemplo [50, 100, 0, 0, 0, 0]). */
  ciegas: number[]
  /** Identificador opcional (hand_key del dataset). */
  claveMano?: number
}

export interface EstadoMano {
  /** Número de jugadores. */
  n: number
  /** Ciega grande (la mayor de las ciegas). */
  bb: number
  jugadores: string[]
  /** Fichas que le quedan a cada asiento. */
  stacks: number[]
  /** Stack con el que empezó la mano cada asiento. */
  inicial: number[]
  /** Fichas puestas por cada asiento en la calle actual. */
  puesto: number[]
  bote: number
  /** Mayor apuesta de la calle actual. */
  apuestaAlta: number
  /** Orden de actuación preflop / postflop por asiento (0 = actúa primero). */
  ordenPre: number[]
  ordenPost: number[]
  /** true si el asiento sigue en la mano (no se ha retirado). */
  activos: boolean[]
  /** 0 = preflop, 1 = flop, 2 = turn, 3 = river. */
  calle: number
  tablero: Carta[]
  cartasPrivadas: (Carta[] | null)[]
  subidasCalle: number
  callersCalle: number
  checksCalle: number
  subidasPre: number
  ultimoAgresor: number | null
  agresorPrev: number | null
  agresorPre: number | null
  /** Último aumento como fracción del bote anterior (ult_apuesta_vs_bote). */
  ultApuesta: number
  actuoCalle: number[]
  subioCalle: number[]
  // --- Solo para el juego en vivo (no afectan a las 47 variables) ---
  /** Aumento mínimo permitido en la calle actual (el último aumento completo, o la ciega grande). */
  incrementoMin: number
  /** Asientos que todavía deben actuar en esta ronda de apuestas. */
  pendientes: boolean[]
  /** Último asiento que actuó en la calle (null al empezar la calle). */
  ultimoActor: number | null
  /** Clave opcional de la mano. */
  claveMano?: number
}

/** Lo que pasó al aplicar una acción (para el visor de manos y la animación). */
export interface EventoMano {
  asiento: number
  tipo: TipoAccion
  /** Total al que se subió (solo cbr; 0 en los demás). */
  hasta: number
  /** Fichas que el jugador puso con esta acción. */
  pago: number
  /** Bote después de la acción. */
  bote: number
  calle: number
}

/** Acciones que puede hacer un asiento ahora. */
export interface AccionesLegales {
  asiento: number
  /** Fichas que le faltan para igualar la apuesta más alta. */
  aPagar: number
  /** Puede pasar (no hay nada que pagar). */
  puedeCheck: boolean
  /** Puede retirarse (solo tiene sentido si hay algo que pagar). */
  puedeFold: boolean
  /** Fichas que pone si iguala (menos que `aPagar` si no le alcanza: all-in). */
  pagoCall: number
  /** Rango de "subir hasta" permitido (total en esta calle), o null si no puede subir. */
  subir: { min: number; max: number } | null
}

/** Qué sigue en la mano. */
export type FaseRonda =
  | 'esperando_accion' // le toca a `turnoActual(estado)`
  | 'repartir_calle' // la ronda de apuestas terminó: repartir flop/turn/river
  | 'showdown' // river cerrado con 2 o más jugadores: se muestran las cartas
  | 'terminada' // solo queda un jugador

/** Crea una mano nueva: publica las ciegas y deja todo listo para repartir las cartas privadas. */
export function crearMano(config: ConfigMano): EstadoMano {
  const n = config.jugadores.length
  const ciegas = config.ciegas.map(Number)
  const bb = Math.max(...ciegas)
  const stacks = config.stacks.map(Number)
  const inicial = [...stacks]
  const puesto = new Array<number>(n).fill(0)
  let bote = 0
  let apuestaAlta = 0
  for (let i = 0; i < ciegas.length; i++) {
    const c = ciegas[i]!
    if (c > 0) {
      bote += c
      stacks[i]! -= c
      puesto[i] = c
      apuestaAlta = Math.max(apuestaAlta, c)
    }
  }
  const estado: EstadoMano = {
    n, bb,
    jugadores: [...config.jugadores],
    stacks, inicial, puesto, bote, apuestaAlta,
    // preflop empieza el asiento tras la ciega grande; postflop empieza la ciega pequeña
    ordenPre: Array.from({ length: n }, (_, i) => (((i - 2) % n) + n) % n),
    ordenPost: Array.from({ length: n }, (_, i) => i),
    activos: new Array<boolean>(n).fill(true),
    calle: 0,
    tablero: [],
    cartasPrivadas: new Array<Carta[] | null>(n).fill(null),
    subidasCalle: 0, callersCalle: 0, checksCalle: 0, subidasPre: 0,
    ultimoAgresor: null, agresorPrev: null, agresorPre: null,
    ultApuesta: 0,
    actuoCalle: new Array<number>(n).fill(0),
    subioCalle: new Array<number>(n).fill(0),
    incrementoMin: bb,
    pendientes: new Array<boolean>(n).fill(false),
    ultimoActor: null,
    claveMano: config.claveMano,
  }
  reiniciarPendientes(estado)
  return estado
}

/** Copia independiente del estado (para jugadas hipotéticas). */
export function clonarMano(estado: EstadoMano): EstadoMano {
  return structuredClone(estado)
}

/** Entrega las 2 cartas privadas de un asiento. */
export function repartirPrivadas(estado: EstadoMano, asiento: number, cartas: readonly Carta[]): void {
  estado.cartasPrivadas[asiento] = [...cartas]
}

/**
 * Reparte cartas comunitarias (flop = 3, turn = 1, river = 1) y empieza una calle nueva.
 * Igual que la acción `d db` del PHH: reinicia apuestas y contadores de la calle y guarda el agresor previo.
 */
export function repartirCalle(estado: EstadoMano, cartas: readonly Carta[]): void {
  estado.calle += 1
  estado.tablero.push(...cartas)
  estado.agresorPrev = estado.ultimoAgresor
  estado.ultimoAgresor = null
  estado.puesto = new Array<number>(estado.n).fill(0)
  estado.apuestaAlta = 0
  estado.subidasCalle = estado.callersCalle = estado.checksCalle = 0
  estado.ultApuesta = 0
  estado.actuoCalle = new Array<number>(estado.n).fill(0)
  estado.subioCalle = new Array<number>(estado.n).fill(0)
  estado.incrementoMin = estado.bb
  estado.ultimoActor = null
  reiniciarPendientes(estado)
}

/** Fichas que le faltan a un asiento para igualar la apuesta más alta (to_call). */
export function aPagarDe(estado: EstadoMano, asiento: number): number {
  return Math.max(0, estado.apuestaAlta - estado.puesto[asiento]!)
}

/** Cantidad de jugadores que siguen en la mano. */
export function contarActivos(estado: EstadoMano): number {
  return estado.activos.reduce((a, v) => a + (v ? 1 : 0), 0)
}

/**
 * Aplica una acción a la mesa (SOLO después de haber tomado la foto de la decisión).
 * `validar: true` rechaza acciones ilegales (para el juego en vivo); el reproductor de manos reales
 * no valida, porque el archivo PHH ya es la verdad.
 */
export function aplicarAccion(estado: EstadoMano, accion: Accion, opciones: { validar?: boolean } = {}): EventoMano {
  const pid = accion.asiento
  if (!(pid >= 0 && pid < estado.n)) throw new Error(`Asiento inválido: ${pid}`)
  const aPagar = aPagarDe(estado, pid)
  const stack = estado.stacks[pid]!

  if (opciones.validar) {
    if (!estado.activos[pid]) throw new Error(`El asiento ${pid} ya no está en la mano`)
    if (turnoActual(estado) !== pid) throw new Error(`No es el turno del asiento ${pid}`)
    const legales = accionesLegales(estado, pid)
    if (accion.tipo === 'f' && !legales.puedeFold) throw new Error('No se puede retirar: no hay nada que pagar')
    if (accion.tipo === 'cbr') {
      if (!legales.subir) throw new Error('No puede subir')
      const hasta = accion.hasta ?? NaN
      if (!(hasta >= legales.subir.min && hasta <= legales.subir.max)) {
        throw new Error(`Subir hasta ${hasta} fuera de rango [${legales.subir.min}, ${legales.subir.max}]`)
      }
    }
  }

  estado.actuoCalle[pid]! += 1
  let hasta = 0
  let pago = 0
  if (accion.tipo === 'f') {
    estado.activos[pid] = false
  } else if (accion.tipo === 'cc') {
    pago = Math.min(aPagar, stack)
    estado.bote += pago
    estado.stacks[pid]! -= pago
    estado.puesto[pid]! += pago
    if (aPagar > 0) estado.callersCalle += 1
    else estado.checksCalle += 1
  } else {
    const total = accion.hasta ?? estado.apuestaAlta // 'cbr X' = subir HASTA X
    hasta = total
    pago = Math.min(Math.max(0, total - estado.puesto[pid]!), stack)
    estado.ultApuesta = estado.bote > 0 ? pago / estado.bote : 0
    estado.bote += pago
    estado.stacks[pid]! -= pago
    estado.puesto[pid]! += pago
    const apuestaAnterior = estado.apuestaAlta
    estado.apuestaAlta = Math.max(estado.apuestaAlta, estado.puesto[pid]!)
    const incremento = estado.apuestaAlta - apuestaAnterior
    if (incremento >= estado.incrementoMin) estado.incrementoMin = incremento // un all-in corto no cambia el mínimo
    estado.subidasCalle += 1
    estado.subioCalle[pid]! += 1
    estado.ultimoAgresor = pid
    if (estado.calle === 0) {
      estado.subidasPre += 1
      estado.agresorPre = pid
    }
  }

  // Quién debe actuar ahora (solo afecta al juego en vivo)
  estado.pendientes[pid] = false
  if (accion.tipo === 'cbr' && estado.apuestaAlta > 0) {
    for (let q = 0; q < estado.n; q++) {
      if (q !== pid && estado.activos[q] && estado.stacks[q]! > 0) estado.pendientes[q] = true
    }
  }
  estado.ultimoActor = pid
  return { asiento: pid, tipo: accion.tipo, hasta, pago, bote: estado.bote, calle: estado.calle }
}

/** Al empezar una calle deben actuar todos los que siguen y tienen fichas; el único con fichas no actúa si no hay que pagar. */
function reiniciarPendientes(estado: EstadoMano): void {
  const quedan: number[] = []
  for (let q = 0; q < estado.n; q++) {
    estado.pendientes[q] = false
    if (estado.activos[q] && estado.stacks[q]! > 0) quedan.push(q)
  }
  if (quedan.length === 1 && aPagarDe(estado, quedan[0]!) === 0) return
  for (const q of quedan) estado.pendientes[q] = true
}

/** A quién le toca actuar, o null si la ronda de apuestas terminó. */
export function turnoActual(estado: EstadoMano): number | null {
  if (contarActivos(estado) <= 1) return null
  const orden = estado.calle === 0 ? estado.ordenPre : estado.ordenPost
  const base = estado.ultimoActor === null ? -1 : orden[estado.ultimoActor]!
  let mejor: number | null = null
  let mejorDist = Infinity
  for (let q = 0; q < estado.n; q++) {
    if (!estado.pendientes[q] || !estado.activos[q]) continue
    const dist = (((orden[q]! - base - 1) % estado.n) + estado.n) % estado.n
    if (dist < mejorDist) { mejorDist = dist; mejor = q }
  }
  return mejor
}

/** Qué sigue: esperar una acción, repartir la siguiente calle, showdown o fin de la mano. */
export function faseRonda(estado: EstadoMano): FaseRonda {
  if (contarActivos(estado) <= 1) return 'terminada'
  if (turnoActual(estado) !== null) return 'esperando_accion'
  return estado.calle >= 3 ? 'showdown' : 'repartir_calle'
}

/** Acciones legales de un asiento (por defecto el que tiene el turno). */
export function accionesLegales(estado: EstadoMano, asiento?: number): AccionesLegales {
  const pid = asiento ?? turnoActual(estado)
  if (pid === null || pid === undefined) throw new Error('Nadie tiene el turno')
  const aPagar = aPagarDe(estado, pid)
  const stack = estado.stacks[pid]!
  const todoMetido = estado.puesto[pid]! + stack
  let subir: AccionesLegales['subir'] = null
  if (stack > aPagar) {
    const minimo = Math.min(estado.apuestaAlta + Math.max(estado.incrementoMin, estado.bb), todoMetido)
    subir = { min: minimo, max: todoMetido }
  }
  return {
    asiento: pid,
    aPagar,
    puedeCheck: aPagar === 0,
    puedeFold: aPagar > 0,
    pagoCall: Math.min(aPagar, stack),
    subir,
  }
}
