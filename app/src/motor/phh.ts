/**
 * phh.ts: lectura de manos en formato PHH (Poker Hand History) y reconstrucción de sus decisiones.
 *
 * Una mano PHH es una lista ordenada de acciones en texto:
 *   "d dh p1 Ah2s"   reparto de cartas privadas al asiento p1
 *   "d db 4s3sQh"    reparto de cartas comunitarias (flop, turn o river)
 *   "p3 f"           p3 se retira
 *   "p6 cc"          p6 iguala o pasa
 *   "p6 cbr 200"     p6 sube HASTA 200 en total en esta calle
 *   "p2 sm JdTd"     p2 muestra cartas (se ignora)
 * `reconstruirDecisiones` hace lo mismo que `reconstruir_decisiones_v4` del Notebook 10: recorre la mano,
 * y ANTES de cada acción de un jugador guarda la foto de la mesa con sus 47 variables.
 */
import { separarCartas } from './cartas.ts'
import {
  aplicarAccion, crearMano, repartirCalle, repartirPrivadas,
  type Accion, type EstadoMano, type EventoMano, type TipoAccion,
} from './mano.ts'
import { extraerVariables, fotoDecision, type ContextoVariables, type FotoDecision, type Variables } from './variables.ts'

/** Una mano cruda: lo mínimo del archivo PHH para reproducirla. */
export interface ManoCruda {
  jugadores: string[]
  stacksIniciales: number[]
  /** Ciegas o straddles por asiento (p1, p2, ...). */
  ciegas: number[]
  /** Acciones PHH en orden, incluidas las del crupier ("d dh ...", "d db ..."). */
  acciones: string[]
  claveMano?: number
}

/** Código numérico de cada acción: lo que predice el modelo (0 fold, 1 check/call, 2 bet/raise). */
export const CODIGO_ACCION: Record<TipoAccion, 0 | 1 | 2> = { f: 0, cc: 1, cbr: 2 }
const TIPO_DE_CODIGO: TipoAccion[] = ['f', 'cc', 'cbr']

/** Convierte "p3" en el índice de asiento 2. Devuelve null si no es un asiento válido. */
export function asientoDePid(pid: string, n: number): number | null {
  const m = /^p(\d+)$/.exec(pid)
  if (!m) return null
  const i = Number(m[1]) - 1
  return i >= 0 && i < n ? i : null
}

/** Convierte un asiento 0..n−1 en "p1".."pn". */
export function pidDeAsiento(asiento: number): string {
  return `p${asiento + 1}`
}

/** Convierte un arreglo TOML de una línea o varias ("['a', 'b']" o "[1, 2]") en un arreglo de JavaScript. */
function arregloToml(texto: string): unknown[] {
  const json = texto
    .replace(/'([^']*)'/g, (_, s: string) => JSON.stringify(s))
    .replace(/,\s*\]/g, ']')
  return JSON.parse(json) as unknown[]
}

/**
 * Lee el texto de un archivo `.phh` (TOML) de Pluribus. Solo interpreta los 4 campos que importan:
 * players, starting_stacks, blinds_or_straddles y actions.
 */
export function parsearPHH(texto: string, claveMano?: number): ManoCruda {
  const campo = (nombre: string): unknown[] => {
    const m = new RegExp(`^${nombre}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*$`, 'm').exec(texto)
    if (!m) throw new Error(`El PHH no trae el campo "${nombre}"`)
    return arregloToml(m[1]!)
  }
  return {
    jugadores: campo('players') as string[],
    stacksIniciales: (campo('starting_stacks') as number[]).map(Number),
    ciegas: (campo('blinds_or_straddles') as number[]).map(Number),
    acciones: campo('actions') as string[],
    claveMano,
  }
}

/** Una decisión de un jugador, con su foto y las 47 variables. */
export interface DecisionReconstruida {
  /** Posición de la acción dentro de la lista PHH. */
  indiceAccion: number
  asiento: number
  jugador: string
  /** Lo que el jugador hizo de verdad. */
  tipo: TipoAccion
  /** 0 = fold, 1 = check/call, 2 = bet/raise. */
  accion: 0 | 1 | 2
  /** Cartas privadas del jugador, por ejemplo "AhKd". */
  cartas: string
  /** Cartas comunitarias visibles, por ejemplo "Qs9c2h". */
  mesa: string
  calle: number
  foto: FotoDecision
  variables: Variables
  /** Lo que pasó en la mesa al aplicar la acción real. */
  evento: EventoMano
}

export interface ResultadoMano {
  decisiones: DecisionReconstruida[]
  /** Estado de la mesa al final de la mano. */
  final: EstadoMano
}

/**
 * Recorre una mano PHH y devuelve todas sus decisiones con las 47 variables (`reconstruir_decisiones_v4`).
 * Si `ctx.equity` es 'omitir', `c_equity` postflop queda en NaN (para comparar solo lo determinista).
 */
export function reconstruirDecisiones(mano: ManoCruda, ctx: ContextoVariables): ResultadoMano {
  const estado = crearMano({ jugadores: mano.jugadores, stacks: mano.stacksIniciales, ciegas: mano.ciegas, claveMano: mano.claveMano })
  const decisiones: DecisionReconstruida[] = []

  mano.acciones.forEach((act, indiceAccion) => {
    const partes = act.trim().split(/\s+/)
    if (partes.length === 0 || partes[0] === '') return
    const actor = partes[0]!

    // A. Acciones del crupier: cartas privadas ('dh') o comunitarias ('db')
    if (actor === 'd') {
      if (partes.length >= 4 && partes[1] === 'dh') {
        const asiento = asientoDePid(partes[2]!, estado.n)
        if (asiento !== null) repartirPrivadas(estado, asiento, separarCartas(partes[3]!))
      } else if (partes.length >= 3 && partes[1] === 'db') {
        repartirCalle(estado, separarCartas(partes[2]!))
      }
      return
    }

    // B. Decide un jugador
    const asiento = asientoDePid(actor, estado.n)
    if (partes.length < 2 || !['f', 'cc', 'cbr'].includes(partes[1]!) || asiento === null) return
    const tipo = partes[1] as TipoAccion

    // B1. Foto de la mesa con las cartas PROPIAS del jugador (antes de actuar)
    const foto = fotoDecision(estado, asiento)
    const variables = extraerVariables(estado, asiento, ctx)
    const accionAplicada: Accion = { asiento, tipo }
    if (tipo === 'cbr' && partes.length >= 3) accionAplicada.hasta = Number(partes[2])
    const cartas = estado.cartasPrivadas[asiento]!.join('')
    const mesa = estado.tablero.join('')
    const calle = estado.calle

    // B2. Solo después se aplica la acción
    const evento = aplicarAccion(estado, accionAplicada)
    decisiones.push({
      indiceAccion, asiento, jugador: mano.jugadores[asiento]!, tipo, accion: CODIGO_ACCION[tipo],
      cartas, mesa, calle, foto, variables, evento,
    })
  })
  return { decisiones, final: estado }
}

// --- Banco de manos reales (banco_manos_reales.json) ------------------------------------------------------

/** Una mano del banco de manos reales, en su formato compacto. */
export interface ManoDeBanco {
  /** hand_key */
  k: number
  /** nombres por asiento */
  n: string[]
  /** stacks iniciales */
  st: number[]
  /** ciegas */
  bl: number[]
  /** cartas privadas por asiento (ej. "TcQc") */
  h: string[]
  /** cartas comunitarias por calle: [flop, turn, river] */
  t: string[]
  /** acciones: [asiento, código 0/1/2, hasta, pago, calle, bote_después] */
  a: number[][]
}

/** Reconstruye la lista de acciones PHH de una mano del banco (reparto, calles y acciones en orden). */
export function manoDeBanco(m: ManoDeBanco): ManoCruda {
  const acciones: string[] = m.h.map((c, i) => `d dh ${pidDeAsiento(i)} ${c}`)
  let calleActual = 0
  for (const [asiento, codigo, hasta, , calle] of m.a as [number, number, number, number, number, number][]) {
    while (calleActual < calle) {
      acciones.push(`d db ${m.t[calleActual]!}`)
      calleActual++
    }
    const tipo = TIPO_DE_CODIGO[codigo]!
    acciones.push(tipo === 'cbr' ? `${pidDeAsiento(asiento)} cbr ${hasta}` : `${pidDeAsiento(asiento)} ${tipo}`)
  }
  return { jugadores: m.n, stacksIniciales: m.st, ciegas: m.bl, acciones, claveMano: m.k }
}
