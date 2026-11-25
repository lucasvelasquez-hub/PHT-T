/**
 * red.ts: la red neuronal (modelo ONNX) y su inferencia por lotes.
 *
 * Este archivo NO importa onnxruntime directamente: recibe el módulo ya cargado (`Ort`). Así el mismo código
 * sirve en el navegador (onnxruntime-web con wasm, ver `ortWeb.ts`) y en las pruebas de Node
 * (onnxruntime-node). El resultado es el mismo modelo, con el mismo archivo `.onnx`.
 */
import type * as OrtWeb from 'onnxruntime-web'
import { prepararLote, type FilaVariables, type Preparacion } from './preparacion.ts'

/** Lo que usamos de onnxruntime (web y node tienen esta misma forma). */
export type Ort = Pick<typeof OrtWeb, 'InferenceSession' | 'Tensor'>

/** Probabilidades de la red: lo que harían jugadores de élite en esa situación. */
export interface Prediccion {
  fold: number
  call: number
  raise: number
}

export interface RedOnnx {
  readonly prep: Preparacion
  /** Predice un lote de filas de variables (por nombre o en el orden del modelo). */
  predecir(filas: readonly FilaVariables[]): Promise<Prediccion[]>
  /** Predice a partir de una matriz ya preparada [n, 47]. */
  predecirPreparado(vectores: Float32Array, n: number): Promise<Prediccion[]>
  liberar(): Promise<void>
}

/** Índice de la acción más probable (empates: la primera, igual que numpy.argmax). */
export function argmax(p: Prediccion): 0 | 1 | 2 {
  const v = [p.fold, p.call, p.raise]
  let mejor = 0
  for (let i = 1; i < 3; i++) if (v[i]! > v[mejor]!) mejor = i
  return mejor as 0 | 1 | 2
}

/**
 * Crea una red a partir del módulo ONNX, los bytes (o la ruta) del `.onnx` y su JSON de preparación.
 * La entrada del modelo es un tensor float32 [N, 47]; la salida son 3 probabilidades (softmax).
 */
export async function crearRed(
  ort: Ort,
  modelo: string | Uint8Array,
  prep: Preparacion,
  opciones: { proveedores?: string[] } = {},
): Promise<RedOnnx> {
  const sesion = await (ort.InferenceSession.create as (m: string | Uint8Array, o?: object) => Promise<OrtWeb.InferenceSession>)(
    modelo,
    { executionProviders: opciones.proveedores ?? ['wasm'], graphOptimizationLevel: 'all' },
  )
  const nombreEntrada = prep.onnx.entrada.nombre
  const nombreSalida = sesion.outputNames[0]!
  const d = prep.n_variables

  const predecirPreparado = async (vectores: Float32Array, n: number): Promise<Prediccion[]> => {
    if (n === 0) return []
    if (vectores.length !== n * d) throw new Error(`Se esperaban ${n * d} valores y llegaron ${vectores.length}`)
    const entrada = new ort.Tensor('float32', vectores, [n, d])
    const salida = await sesion.run({ [nombreEntrada]: entrada })
    const datos = salida[nombreSalida]!.data as Float32Array
    const resultado: Prediccion[] = []
    for (let i = 0; i < n; i++) resultado.push({ fold: datos[3 * i]!, call: datos[3 * i + 1]!, raise: datos[3 * i + 2]! })
    return resultado
  }

  return {
    prep,
    predecirPreparado,
    predecir: (filas) => predecirPreparado(prepararLote(filas, prep), filas.length),
    liberar: () => sesion.release(),
  }
}
