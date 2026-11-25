/**
 * ortWeb.ts: carga onnxruntime-web (wasm) en el navegador.
 *
 * El archivo .wasm (~15 MB) lo emite Vite como un recurso con nombre único (`?url`) y se le indica a
 * onnxruntime dónde está. Se usa un solo hilo para no exigir cabeceras de aislamiento (SharedArrayBuffer):
 * el modelo es diminuto (220 KB) y cada predicción tarda menos de 1 ms.
 */
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url'
import type { Ort } from './red.ts'

export async function cargarOrtWeb(): Promise<Ort> {
  const ort = await import('onnxruntime-web/wasm')
  ort.env.wasm.wasmPaths = { wasm: wasmUrl }
  ort.env.wasm.numThreads = 1
  ort.env.wasm.proxy = false
  return ort as unknown as Ort
}
