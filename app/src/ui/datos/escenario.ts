/**
 * escenario.ts: de una decisión del banco de manos reales a lo que dibuja la mesa.
 *
 * El banco guarda cada mano en formato compacto (`ManoDeBanco`). Aquí se REPRODUCE la mano con el motor
 * (mismas funciones que usan las pruebas) hasta justo antes de la decisión, y se arma el estado de la mesa:
 * stacks, apuestas, quién sigue, cartas. Ese mismo estado es el que viaja al Worker para calcular las lecturas.
 */
import {
  accionesLegales, aplicarAccion, crearMano, repartirCalle, repartirPrivadas, separarCartas,
  type AccionesLegales, type EstadoMano, type ManoDeBanco, type Prediccion, type TipoAccion,
} from '../../motor/index.ts'

/** Mano del banco con sus decisiones: [índice en `a`, acción real, 47 variables, 3 probabilidades]. */
export interface ManoBanco extends ManoDeBanco {
  d: [number, number, number[], number[]][]
}

export interface BancoManos {
  meta: { orden_variables: string[] }
  manos: ManoBanco[]
}

export type EtiquetaAccion = 'BET' | 'CALL' | 'CHECK' | 'FOLD' | 'ALL-IN'

export interface DatosAsiento {
  indice: number
  nombre: string
  /** Fichas que le quedan, en ciegas grandes. */
  stackBB: number
  /** Lo que tiene puesto en la calle actual, en ciegas grandes. */
  apuestaBB: number
  activo: boolean
  etiqueta: EtiquetaAccion | null
  esBoton: boolean
  // --- Solo en la mesa en vivo ---
  /** Cartas que se muestran boca arriba (showdown). */
  cartas?: [string, string]
  /** Le toca actuar (o está "pensando"). */
  turno?: boolean
  /** Se lleva el bote. */
  ganador?: boolean
  /** Texto breve en la pestaña del asiento (por ejemplo "+12 BB"). */
  nota?: string
}

/** Lo que dibuja la mesa de un escenario (el de revisión y el de la mano en vivo cumplen esta forma). */
export type EscenarioMesa = Pick<Escenario, 'tablero' | 'heroe' | 'cartasHeroe' | 'rivales'>

export interface Escenario {
  claveMano: number
  indiceDecision: number
  origen: 'real' | 'generada'
  /** "REAL · PLURIBUS" o "GENERADA". */
  etiquetaOrigen: string
  /** "FLOP", "TURN"... */
  calle: string
  estado: EstadoMano
  heroe: DatosAsiento
  cartasHeroe: [string, string]
  tablero: string[]
  boteBB: number
  aPagarBB: number
  legales: AccionesLegales
  /** Rivales de izquierda a derecha, empezando por el siguiente al héroe en el sentido del reloj. */
  rivales: DatosAsiento[]
  /** Lo que el banco guardó para esta decisión (para comprobar el cálculo en vivo). */
  banco: { equity: number; prediccion: Prediccion; potOdds: number }
}

const CALLES = ['PREFLOP', 'FLOP', 'TURN', 'RIVER']
const TIPOS: TipoAccion[] = ['f', 'cc', 'cbr']

export async function cargarBanco(): Promise<BancoManos> {
  const r = await fetch(`${import.meta.env.BASE_URL}modelo_transformado/banco_manos_reales.json`)
  if (!r.ok) throw new Error(`No se pudo cargar el banco de manos (${r.status})`)
  return (await r.json()) as BancoManos
}

/** Primera decisión postflop con algo que pagar; si no hay, la primera de la mano. */
export function decisionPorDefecto(m: ManoBanco, orden: string[]): number {
  const iCall = orden.indexOf('to_call_bb')
  const iCalle = orden.indexOf('calle')
  const hit = m.d.find((d) => d[2][iCalle]! >= 1 && d[2][iCall]! > 0)
  return (hit ?? m.d[0]!)[0]
}

/** Reproduce la mano hasta justo antes de la acción `indice` y arma el escenario de esa decisión. */
export function construirEscenario(banco: BancoManos, claveMano: number, indice?: number): Escenario {
  const m = banco.manos.find((x) => x.k === claveMano)
  if (!m) throw new Error(`La mano ${claveMano} no está en el banco`)
  const idx = indice ?? decisionPorDefecto(m, banco.meta.orden_variables)
  const dec = m.d.find((x) => x[0] === idx)
  if (!dec) throw new Error(`La acción ${idx} de la mano ${claveMano} no es una decisión del banco`)

  const estado = crearMano({ jugadores: m.n, stacks: m.st, ciegas: m.bl, claveMano: m.k })
  m.h.forEach((c, i) => repartirPrivadas(estado, i, separarCartas(c)))

  const hastaCalle = (calle: number) => {
    while (estado.calle < calle) repartirCalle(estado, separarCartas(m.t[estado.calle]!))
  }
  for (let i = 0; i < idx; i++) {
    const [asiento, codigo, hasta, , calle] = m.a[i]! as [number, number, number, number, number, number]
    hastaCalle(calle)
    const tipo = TIPOS[codigo]!
    aplicarAccion(estado, tipo === 'cbr' ? { asiento, tipo, hasta } : { asiento, tipo })
  }
  const [asientoHeroe, , , , calleDecision] = m.a[idx]! as [number, number, number, number, number, number]
  hastaCalle(calleDecision)

  const datosDe = (i: number): DatosAsiento => datosAsiento(estado, i)
  const n = estado.n
  const bb = estado.bb

  const legales = accionesLegales(estado, asientoHeroe)
  const cartas = estado.cartasPrivadas[asientoHeroe]!
  const iEquity = banco.meta.orden_variables.indexOf('c_equity')
  const iPot = banco.meta.orden_variables.indexOf('pot_odds')
  return {
    claveMano: m.k,
    indiceDecision: idx,
    origen: 'real',
    etiquetaOrigen: 'REAL · PLURIBUS',
    calle: CALLES[estado.calle]!,
    estado,
    heroe: datosDe(asientoHeroe),
    cartasHeroe: [cartas[0]!, cartas[1]!],
    tablero: [...estado.tablero],
    boteBB: estado.bote / bb,
    aPagarBB: legales.aPagar / bb,
    legales,
    rivales: Array.from({ length: n - 1 }, (_, k) => datosDe((asientoHeroe + 1 + k) % n)),
    banco: {
      equity: dec[2][iEquity]!,
      potOdds: dec[2][iPot]!,
      prediccion: { fold: dec[3][0]!, call: dec[3][1]!, raise: dec[3][2]! },
    },
  }
}

/** Lo que se ve de un asiento del motor: stack, apuesta de la calle, si sigue y la etiqueta de su última acción. */
export function datosAsiento(estado: EstadoMano, i: number): DatosAsiento {
  const bb = estado.bb
  const activo = estado.activos[i]!
  const puesto = estado.puesto[i]!
  let etiqueta: EtiquetaAccion | null = null
  if (!activo) etiqueta = estado.actuoCalle[i]! > 0 ? 'FOLD' : null
  else if (estado.stacks[i]! <= 0 && estado.actuoCalle[i]! > 0) etiqueta = 'ALL-IN'
  else if (estado.ultimoAgresor === i && puesto > 0) etiqueta = 'BET'
  else if (estado.actuoCalle[i]! > 0) etiqueta = puesto > 0 ? 'CALL' : 'CHECK'
  return {
    indice: i, nombre: estado.jugadores[i]!, stackBB: estado.stacks[i]! / bb, apuestaBB: puesto / bb,
    activo, etiqueta, esBoton: i === estado.n - 1,
  }
}
