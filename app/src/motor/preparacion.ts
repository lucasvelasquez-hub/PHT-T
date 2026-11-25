/**
 * preparacion.ts: de las 47 variables crudas al vector que entra a la red (lo que describe
 * `modelo4_preparacion.json`).
 *
 *   1. A cada variable de `variables_log` se le aplica x = log1p(max(x, 0)).
 *   2. Se escala en float64: z = (x − media) / escala (la media y la escala vienen del JSON).
 *   3. Recién entonces se pasa a float32 (Float32Array), que es lo que recibe el ONNX.
 *
 * Nota: los `pasos_preparacion` de texto del JSON mencionan convertir a float32 ANTES de escalar. La
 * verificación del Notebook 13 se hizo escalando en float64 (prueba 4: diferencia ≤ 1e-6 contra el .pkl y
 * probabilidades a ≤ 1.25e-6 de Keras), así que aquí se escala en float64.
 */
import type { NombreVariable, Variables } from './variables.ts'

/** Contenido de `modeloN_preparacion.json` (solo lo que usa el motor). */
export interface Preparacion {
  modelo: number
  nombre?: string
  archivo_onnx: string
  onnx: { entrada: { nombre: string; forma: (string | number)[] }; salida: { nombre: string } }
  n_variables: number
  /** Orden exacto de las variables de entrada. */
  variables: string[]
  /** Variables a las que se aplica log1p antes de escalar. */
  variables_log: string[]
  escalador: { mean: number[]; scale: number[] }
  /** Nombres de las 3 salidas: Fold, Check/Call, Bet/Raise. */
  clases_salida: string[]
}

/** Entrada aceptada: variables por nombre o ya en el orden del modelo. */
export type FilaVariables = Partial<Record<NombreVariable, number>> | Record<string, number> | ArrayLike<number>

function valorEn(fila: FilaVariables, nombre: string, i: number): number {
  const f = fila as Record<string, number> & ArrayLike<number>
  const esArreglo = Array.isArray(fila) || ArrayBuffer.isView(fila)
  const v = esArreglo ? f[i] : f[nombre]
  if (v === undefined) throw new Error(`Falta la variable "${nombre}"`)
  return v
}

/** Escribe en `salida` (desde `desplazamiento`) el vector preparado de una fila. */
export function prepararFilaEn(fila: FilaVariables, prep: Preparacion, salida: Float32Array, desplazamiento: number): void {
  const { variables, variables_log, escalador } = prep
  for (let i = 0; i < variables.length; i++) {
    const nombre = variables[i]!
    let x = valorEn(fila, nombre, i)
    if (variables_log.includes(nombre)) x = Math.log1p(Math.max(x, 0))
    salida[desplazamiento + i] = (x - escalador.mean[i]!) / escalador.scale[i]! // float64 y luego float32 al guardar
  }
}

/** Vector preparado de UNA fila (Float32Array de 47 valores). */
export function prepararFila(fila: FilaVariables, prep: Preparacion): Float32Array {
  const salida = new Float32Array(prep.variables.length)
  prepararFilaEn(fila, prep, salida, 0)
  return salida
}

/** Matriz preparada [N, 47] en un solo Float32Array (fila por fila), lista para el tensor de entrada. */
export function prepararLote(filas: readonly FilaVariables[], prep: Preparacion): Float32Array {
  const d = prep.variables.length
  const salida = new Float32Array(filas.length * d)
  filas.forEach((f, k) => prepararFilaEn(f, prep, salida, k * d))
  return salida
}

/** Atajo de tipos: las variables de una decisión ya calculada. */
export function prepararVariables(v: Variables, prep: Preparacion): Float32Array {
  return prepararFila(v, prep)
}
