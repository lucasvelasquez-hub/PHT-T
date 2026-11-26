/**
 * tipos.ts: los tipos públicos de la mesa en vivo (sección 3.4 de CONTRATOS_JUGABILIDAD.md).
 *
 * ASIENTOS. Hay dos numeraciones y no se mezclan:
 *  - asiento de la MESA ("físico"): 0 = el héroe (siempre abajo, sobre el riel), 1..5 = los rivales en el sentido
 *    del reloj, de izquierda a derecha en pantalla. Es el que usan `boton`, `ResultadoMano` y `GuionMano`.
 *  - asiento del MOTOR: 0 = ciega pequeña, 1 = ciega grande, ..., 5 = botón. Es el de `EstadoMano`
 *    y el que usa `EscenarioInicial`.
 */
import type { ReactNode } from 'react'
import type { EstadoMano } from '../motor/index.ts'

export interface LecturaDecision {
  equityPct: number
  equityMinimaPct: number | null
  /** Probabilidades de la red (Modelo 4); suman 1. */
  elite: { fold: number; checkCall: number; betRaise: number }
  /** CodigoLectura de `src/motor/lectura.ts`. */
  codigo: string
}

export interface DecisionHeroe {
  accion: 'f' | 'cc' | 'cbr'
  /** Total al que se sube en la calle, en fichas (solo con `cbr`). */
  hasta?: number
  calle: 0 | 1 | 2 | 3
  posicion: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'
  lectura: LecturaDecision
}

/** Una acción de la mano, para el visor del Analista. Cantidades en ciegas grandes. */
export interface EventoHistorial {
  /** Asiento de la mesa (0 = héroe). */
  asiento: number
  tipo: 'f' | 'cc' | 'cbr'
  /** Total al que se subió en la calle (solo con `cbr`). */
  hastaBB: number
  /** Fichas que puso con esta acción. */
  pagoBB: number
  /** Bote después de la acción. */
  boteBB: number
  calle: 0 | 1 | 2 | 3
  /** Lectura del momento (la red y la equity de quien decidió), si se calculó. */
  lectura: LecturaDecision | null
}

/** Todo lo que el visor de manos necesita para repetir la mano. */
export interface HistorialMano {
  origen: 'generada'
  semilla: number
  /** Asiento de la mesa que tenía el botón. */
  boton: number
  ciegasBB: [number, number]
  stackInicialBB: number
  nombres: string[]
  /** Cartas de cada asiento de la mesa (también las de quien se retiró). */
  cartas: Record<number, [string, string]>
  /** Las 5 cartas comunitarias que se repartieron o se habrían repartido. */
  tablero: string[]
  acciones: EventoHistorial[]
}

export interface ResultadoMano {
  /** Fichas ganadas (+) o perdidas (−) por el héroe, en ciegas grandes. */
  netoBB: number
  /** Asientos de la mesa que se llevaron parte del bote. */
  ganadores: number[]
  /** Cartas privadas de cada asiento de la mesa. */
  cartas: Record<number, [string, string]>
  historial: HistorialMano
  /** true si hubo showdown (si no, todos se retiraron menos uno). */
  showdown?: boolean
  /** Bote repartido, en ciegas grandes. */
  boteBB?: number
  /** Nombre de la mejor mano de los ganadores ("Par", "Escalera"...), si hubo showdown. */
  nombreMano?: string
}

/**
 * Arrancar desde un estado dado (casos del Instructor). Tiene la misma forma que lo que devuelve
 * `construirEscenarioCaso` del Curso, así que se le pasa tal cual.
 *  - `estado`: el estado del motor justo antes de la decisión. Si ya hay cartas comunitarias deben estar en
 *    `estado.tablero` (repartidas con `repartirCalle`) y coincidir con `tablero`.
 *  - `asientoHeroe`: asiento del MOTOR del héroe. Cualquier asiento puede ser el héroe.
 *  - `tablero`: las cartas comunitarias visibles (0, 3, 4 o 5).
 *  - `cartasRivales`: opcional, por asiento del MOTOR. Las que falten se sortean de las cartas libres.
 * El resto de la mano (calles que faltan, rivales) se juega normalmente con la semilla.
 */
export interface EscenarioInicial {
  estado: EstadoMano
  asientoHeroe: number
  cartasHeroe: [string, string]
  tablero: string[]
  cartasRivales?: Record<number, [string, string]>
}

/** Un paso de una mano guiada: lo que hace un asiento, con un texto de ayuda opcional. */
export interface PasoGuion {
  /** Asiento de la mesa (0 = héroe). */
  asiento: number
  tipo: 'f' | 'cc' | 'cbr'
  /** Total al que se sube en la calle, en ciegas grandes (solo con `cbr`). */
  hastaBB?: number
  /** Texto que se muestra antes de esta acción (en el paso del héroe explica qué botón tocar). */
  ayuda?: string
}

/**
 * Una mano con cartas y acciones fijas. `acciones` lista TODAS las acciones de la mano en orden (desde la primera
 * tras las ciegas, incluidas las del héroe). El héroe solo puede tocar el botón que toca en el guion. Si el guion
 * se acaba antes de que termine la mano, el resto se juega normal (rivales con la red).
 */
export interface GuionMano {
  /** Asiento de la mesa que tiene el botón. */
  boton: number
  cartasHeroe: [string, string]
  /** Cartas de los rivales por asiento de la mesa (1..5). Las que falten se sortean. */
  cartasRivales?: Record<number, [string, string]>
  /** Flop (3), turn (1) y river (1): 5 cartas. */
  tablero: string[]
  acciones: PasoGuion[]
  /** Texto antes de la primera acción (por ejemplo, para explicar las cartas). */
  introduccion?: string
}

export interface PropsMesaEnVivo {
  /** Fija las cartas y los sorteos de los rivales. */
  semilla: number
  /** Asiento de la mesa que tiene el botón (rota entre manos). */
  boton: number
  escenarioInicial?: EscenarioInicial
  guion?: GuionMano
  mostrarLecturas: 'siempre' | 'despues-de-decidir' | 'nunca'
  retroalimentacion?: (d: DecisionHeroe) => ReactNode
  onDecisionHeroe?: (d: DecisionHeroe) => void
  onFinMano?: (r: ResultadoMano) => void
  onSiguienteMano?: () => void
  // --- Opcionales (no están en el contrato mínimo) ---
  /** Nombre del héroe en la mesa (por defecto "Tú"). */
  nombreHeroe?: string
  /** Mazo de 4 colores; si se omite, la mesa lee su propio ajuste de `localStorage`. */
  cuatroColores?: boolean
  /** Botón "volver" de la barra superior. */
  onVolver?: () => void
  /** Texto de la píldora de origen; por defecto "Mano generada". */
  origen?: string
  /** Texto del botón al terminar la mano; por defecto "SIGUIENTE MANO". */
  textoSiguiente?: string
  /**
   * Por defecto `true`. Con `escenarioInicial` y `false`, la mano se detiene justo después de la decisión del héroe:
   * llama a `onDecisionHeroe`, no juega a los rivales y la mesa queda quieta (lectura visible según `mostrarLecturas`).
   */
  continuar?: boolean
  /**
   * Muestra la mesa del escenario sin barra de acciones y sin pedir decisión (casos de opción múltiple).
   * Si es el turno del héroe, calcula su lectura y la entrega en `onLectura`.
   */
  soloContexto?: boolean
  onLectura?: (l: LecturaDecision) => void
}
