/**
 * servicio.ts: la lógica que atiende las peticiones del protocolo (equity, red, análisis completo).
 *
 * Está separada del Worker para poder probarla en Node: recibe un "cargador" que sabe traer los archivos
 * (fetch en el navegador, lectura de disco en las pruebas) y el módulo de onnxruntime.
 */
import { crearRng, crearRngAleatorio, equityPreflop, simularEquity, MAX_RIVALES, type TablaPreflop } from './equidad.ts'
import { lecturaConjunta } from './lectura.ts'
import type { Preparacion } from './preparacion.ts'
import type {
  MapaRespuestas, Peticion, PeticionAnalizar, PeticionEquity, PeticionIniciar, PeticionPredecir,
} from './protocolo.ts'
import { crearRed, type Ort, type RedOnnx } from './red.ts'
import { extraerVariables, fotoDecision } from './variables.ts'

/** Cómo traer los archivos y el módulo ONNX (cambia entre navegador y pruebas). */
export interface Cargador {
  ort(): Promise<Ort>
  /** JSON de `modelo_transformado/` (por ejemplo "modelo4_preparacion.json"). */
  json<T>(nombre: string): Promise<T>
  /** Bytes de un `.onnx`. */
  bytes(nombre: string): Promise<Uint8Array>
  /** Proveedores de ejecución de ONNX (navegador: ['wasm']). */
  proveedores?: string[]
}

export interface Servicio {
  manejar<T extends Peticion>(peticion: T): Promise<MapaRespuestas[T['tipo']]>
}

export function crearServicio(cargador: Cargador): Servicio {
  let tabla: TablaPreflop | null = null
  let ort: Ort | null = null
  const redes = new Map<number, RedOnnx>()

  const asegurarTabla = async (): Promise<TablaPreflop> => (tabla ??= await cargador.json<TablaPreflop>('equity_preflop_169.json'))

  const asegurarRed = async (modelo: number): Promise<RedOnnx> => {
    const existente = redes.get(modelo)
    if (existente) return existente
    ort ??= await cargador.ort()
    const prep = await cargador.json<Preparacion>(`modelo${modelo}_preparacion.json`)
    const red = await crearRed(ort, await cargador.bytes(prep.archivo_onnx), prep, { proveedores: cargador.proveedores })
    redes.set(modelo, red)
    return red
  }

  const rngDe = (semilla?: number) => (semilla === undefined ? crearRngAleatorio() : crearRng(semilla))

  async function iniciar(p: PeticionIniciar) {
    await asegurarTabla()
    const modelos = p.modelos ?? [4]
    for (const m of modelos) await asegurarRed(m)
    return { modelosCargados: [...redes.keys()].sort() }
  }

  async function equity(p: PeticionEquity) {
    const t = await asegurarTabla()
    if (p.mesa.length === 0) {
      return {
        equity: equityPreflop(t, p.cartas[0]!, p.cartas[1]!, p.rivales), errorEstandar: 0, simulaciones: 0, origen: 'tabla' as const,
      }
    }
    const r = simularEquity(p.cartas, p.mesa, p.rivales, { simulaciones: p.simulaciones, rng: rngDe(p.semilla), maxRivales: MAX_RIVALES })
    return { equity: r.equity, errorEstandar: r.errorEstandar, simulaciones: r.simulaciones, origen: 'monte_carlo' as const }
  }

  async function predecir(p: PeticionPredecir) {
    const red = await asegurarRed(p.modelo ?? 4)
    return { predicciones: await red.predecir(p.filas) }
  }

  async function analizar(p: PeticionAnalizar) {
    const t = await asegurarTabla()
    const red = await asegurarRed(4)
    const variables = extraerVariables(p.estado, p.asiento, { tabla: t, simulaciones: p.simulaciones, rng: rngDe(p.semilla) })
    const foto = fotoDecision(p.estado, p.asiento)
    const [prediccion] = await red.predecir([variables])
    const lectura = lecturaConjunta({ equity: variables.c_equity, potOdds: variables.pot_odds, aPagar: foto.aPagar, prediccion: prediccion! })
    return { variables, foto, prediccion: prediccion!, lectura }
  }

  return {
    async manejar(peticion) {
      switch (peticion.tipo) {
        case 'iniciar': return (await iniciar(peticion)) as never
        case 'equity': return (await equity(peticion)) as never
        case 'predecir': return (await predecir(peticion)) as never
        case 'analizar': return (await analizar(peticion)) as never
      }
    },
  }
}
