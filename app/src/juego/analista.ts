/**
 * analista.ts: quien calcula la lectura (equity + red + lectura conjunta) de una decisión.
 * En el navegador es el Web Worker del motor; en las pruebas es el servicio del motor sin Worker.
 */
import type { LecturaConjunta, Prediccion, Servicio } from '../motor/index.ts'
import { crearClienteMotor, type ClienteMotor } from '../motor/cliente.ts'
import type { EstadoMano } from '../motor/index.ts'
import type { LecturaDecision } from './tipos.ts'

export interface AnalisisDecision {
  equity: number
  potOdds: number
  prediccion: Prediccion
  lectura: LecturaConjunta
}

export interface Analista {
  /** Carga el motor (red, tablas, wasm). Se puede llamar varias veces. */
  iniciar(): Promise<void>
  analizar(estado: EstadoMano, asiento: number, simulaciones: number, semilla: number): Promise<AnalisisDecision>
  cerrar(): void
}

const marca = (nombre: string) => { try { performance.mark(nombre) } catch { /* sin marcas de rendimiento */ } }

/** Analista que usa el Worker del motor (se crea al primer uso). */
export function analistaWorker(): Analista {
  let cliente: ClienteMotor | null = null
  let listo: Promise<void> | null = null
  const obtener = () => (cliente ??= crearClienteMotor())
  return {
    iniciar() {
      if (!listo) {
        marca('nc:motor-inicio')
        listo = obtener().pedir({ tipo: 'iniciar' }).then(() => { marca('nc:motor-listo') }, (e) => { listo = null; throw e })
      }
      return listo
    },
    async analizar(estado, asiento, simulaciones, semilla) {
      await this.iniciar()
      const r = await obtener().pedir({ tipo: 'analizar', estado, asiento, simulaciones, semilla })
      return { equity: r.variables.c_equity, potOdds: r.foto.potOdds, prediccion: r.prediccion, lectura: r.lectura }
    },
    cerrar() {
      cliente?.cerrar()
      cliente = null
      listo = null
    },
  }
}

/** El Worker del motor compartido por todas las mesas: se crea una vez y se queda caliente entre manos. */
let compartido: Analista | null = null
export function analistaCompartido(): Analista {
  return (compartido ??= analistaWorker())
}

/**
 * Arranca el Worker y carga la red y la tabla en segundo plano. Idempotente: se puede llamar cuantas veces se quiera
 * (por ejemplo, al mostrar la portada); la mesa reutiliza ese mismo Worker.
 */
export function precalentarMotor(): void {
  if (typeof Worker === 'undefined') return
  void analistaCompartido().iniciar().catch(() => undefined)
}

/** Analista que usa directamente el servicio del motor (pruebas en Node). */
export function analistaDeServicio(servicio: Servicio): Analista {
  return {
    async iniciar() { await servicio.manejar({ tipo: 'iniciar' }) },
    async analizar(estado, asiento, simulaciones, semilla) {
      const r = await servicio.manejar({ tipo: 'analizar', estado, asiento, simulaciones, semilla })
      return { equity: r.variables.c_equity, potOdds: r.foto.potOdds, prediccion: r.prediccion, lectura: r.lectura }
    },
    cerrar() { /* nada que cerrar */ },
  }
}

export function lecturaDeAnalisis(a: AnalisisDecision): LecturaDecision {
  return {
    equityPct: a.lectura.equityPct,
    equityMinimaPct: a.lectura.equityMinimaPct,
    elite: { fold: a.prediccion.fold, checkCall: a.prediccion.call, betRaise: a.prediccion.raise },
    codigo: a.lectura.codigo,
  }
}
