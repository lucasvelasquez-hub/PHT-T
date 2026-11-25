/**
 * motor.worker.ts: Web Worker del motor. La interfaz le manda peticiones (equity, red, análisis completo)
 * y recibe las respuestas sin que la pantalla se congele durante el Monte Carlo. Protocolo en `protocolo.ts`.
 */
/// <reference lib="webworker" />
import { cargarOrtWeb } from './ortWeb.ts'
import type { Mensaje, Respuesta } from './protocolo.ts'
import { crearServicio } from './servicio.ts'

const BASE_DATOS = `${import.meta.env.BASE_URL}modelo_transformado/`

async function pedir(nombre: string): Promise<Response> {
  const r = await fetch(BASE_DATOS + nombre)
  if (!r.ok) throw new Error(`No se pudo descargar ${nombre} (${r.status})`)
  return r
}

const servicio = crearServicio({
  ort: cargarOrtWeb,
  json: async <T,>(nombre: string) => (await (await pedir(nombre)).json()) as T,
  bytes: async (nombre) => new Uint8Array(await (await pedir(nombre)).arrayBuffer()),
  proveedores: ['wasm'],
})

self.onmessage = async (e: MessageEvent<Mensaje>) => {
  const { id, ...peticion } = e.data
  let respuesta: Respuesta
  try {
    respuesta = { id, ok: true, resultado: await servicio.manejar(peticion) }
  } catch (err) {
    respuesta = { id, ok: false, error: err instanceof Error ? err.message : String(err) }
  }
  self.postMessage(respuesta)
}
