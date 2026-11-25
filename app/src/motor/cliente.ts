/**
 * cliente.ts: envoltorio con promesas para hablar con `motor.worker.ts` desde la interfaz.
 *
 *   const motor = crearClienteMotor()
 *   await motor.pedir({ tipo: 'iniciar' })
 *   const { equity } = await motor.pedir({ tipo: 'equity', cartas: ['As','Kd'], mesa: ['Qc','9c','2s'], rivales: 2 })
 *   motor.cerrar()
 */
import type { MapaRespuestas, Peticion, Respuesta } from './protocolo.ts'

export interface ClienteMotor {
  pedir<T extends Peticion>(peticion: T): Promise<MapaRespuestas[T['tipo']]>
  cerrar(): void
}

export function crearClienteMotor(): ClienteMotor {
  const worker = new Worker(new URL('./motor.worker.ts', import.meta.url), { type: 'module' })
  let contador = 0
  const pendientes = new Map<number, { ok: (r: never) => void; error: (e: Error) => void }>()

  worker.onmessage = (e: MessageEvent<Respuesta>) => {
    const r = e.data
    const p = pendientes.get(r.id)
    if (!p) return
    pendientes.delete(r.id)
    if (r.ok) p.ok(r.resultado as never)
    else p.error(new Error(r.error))
  }
  worker.onerror = (e) => {
    for (const p of pendientes.values()) p.error(new Error(e.message))
    pendientes.clear()
  }

  return {
    pedir: <T extends Peticion>(peticion: T) =>
      new Promise<MapaRespuestas[T['tipo']]>((ok, error) => {
        const id = ++contador
        pendientes.set(id, { ok: ok as (r: never) => void, error })
        worker.postMessage({ id, ...peticion })
      }),
    cerrar: () => worker.terminate(),
  }
}
