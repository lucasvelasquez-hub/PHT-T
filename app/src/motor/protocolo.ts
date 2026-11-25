/**
 * protocolo.ts: mensajes entre la interfaz y el Web Worker del motor (`motor.worker.ts`).
 *
 * Cada petición lleva un `id`; la respuesta devuelve el mismo `id`, con `ok: true` y el resultado,
 * o `ok: false` y el mensaje de error. Todos los datos son planos (se pueden clonar con postMessage).
 */
import type { Carta } from './cartas.ts'
import type { EstadoMano } from './mano.ts'
import type { LecturaConjunta } from './lectura.ts'
import type { Prediccion } from './red.ts'
import type { FotoDecision, Variables } from './variables.ts'

/** Carga las tablas y los modelos indicados (por defecto el 4). Se puede llamar varias veces. */
export interface PeticionIniciar { tipo: 'iniciar'; modelos?: number[] }

/** Equity de una situación: preflop lee la tabla; postflop corre Monte Carlo. */
export interface PeticionEquity {
  tipo: 'equity'
  cartas: Carta[]
  mesa: Carta[]
  /** Rivales (jugadores activos − 1). Se limita a 1..4. */
  rivales: number
  simulaciones?: number
  /** Semilla para repetir el resultado (si se omite, es aleatorio). */
  semilla?: number
}

/** Probabilidades de la red para filas de variables (por nombre o en el orden del modelo). */
export interface PeticionPredecir {
  tipo: 'predecir'
  modelo?: number
  filas: (Record<string, number> | number[])[]
}

/** Todo junto para la decisión de un asiento: variables, equity, red y lectura conjunta (Modelo 4). */
export interface PeticionAnalizar {
  tipo: 'analizar'
  estado: EstadoMano
  asiento: number
  simulaciones?: number
  semilla?: number
}

export type Peticion = PeticionIniciar | PeticionEquity | PeticionPredecir | PeticionAnalizar

export interface RespuestaIniciar { modelosCargados: number[] }
export interface RespuestaEquity { equity: number; errorEstandar: number; simulaciones: number; origen: 'tabla' | 'monte_carlo' }
export interface RespuestaPredecir { predicciones: Prediccion[] }
export interface RespuestaAnalizar {
  variables: Variables
  foto: FotoDecision
  prediccion: Prediccion
  lectura: LecturaConjunta
}

export interface MapaRespuestas {
  iniciar: RespuestaIniciar
  equity: RespuestaEquity
  predecir: RespuestaPredecir
  analizar: RespuestaAnalizar
}

export type Mensaje = Peticion & { id: number }
export type Respuesta =
  | { id: number; ok: true; resultado: MapaRespuestas[Peticion['tipo']] }
  | { id: number; ok: false; error: string }
