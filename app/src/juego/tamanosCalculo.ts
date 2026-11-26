/**
 * tamanosCalculo.ts: los botones de tamaño de una subida y cuánto significa cada uno en fichas.
 *
 * Es la misma tabla para el jugador (botones de RAISE) y para los rivales (que sortean uno con las frecuencias
 * de `tamanos_pluribus.json`). No depende de React ni de JSON: también la usa la herramienta que mide las frecuencias.
 *
 *   pre_abierta        preflop, nadie ha subido todavía        2.5 bb · 3 bb · all-in
 *   pre_contra_subida  preflop, frente a una subida            3× · 4× la subida · all-in
 *   post_apuesta       postflop, abriendo la apuesta           1/3 · 1/2 · 3/4 · bote · all-in
 *   post_subida        postflop, subiendo una apuesta          las mismas fracciones, sobre el bote tras igualar
 */
import { accionesLegales, aPagarDe, type EstadoMano } from '../motor/index.ts'

export type ContextoSubida = 'pre_abierta' | 'pre_contra_subida' | 'post_apuesta' | 'post_subida'

export interface OpcionTamano {
  /** Clave estable (también en el JSON de frecuencias). */
  id: string
  /** Texto del botón. */
  etiqueta: string
  /** Valor numérico del tamaño (bb, veces o fracción del bote); 0 para all-in. */
  valor: number
  allin: boolean
}

const OPCIONES_POSTFLOP: OpcionTamano[] = [
  { id: '1/3', etiqueta: '1/3', valor: 1 / 3, allin: false },
  { id: '1/2', etiqueta: '1/2', valor: 1 / 2, allin: false },
  { id: '3/4', etiqueta: '3/4', valor: 3 / 4, allin: false },
  { id: 'bote', etiqueta: 'BOTE', valor: 1, allin: false },
  { id: 'allin', etiqueta: 'ALL-IN', valor: 0, allin: true },
]

export const OPCIONES_POR_CONTEXTO: Record<ContextoSubida, OpcionTamano[]> = {
  pre_abierta: [
    { id: '2.5', etiqueta: '2.5 BB', valor: 2.5, allin: false },
    { id: '3', etiqueta: '3 BB', valor: 3, allin: false },
    { id: 'allin', etiqueta: 'ALL-IN', valor: 0, allin: true },
  ],
  pre_contra_subida: [
    { id: '3x', etiqueta: '3×', valor: 3, allin: false },
    { id: '4x', etiqueta: '4×', valor: 4, allin: false },
    { id: 'allin', etiqueta: 'ALL-IN', valor: 0, allin: true },
  ],
  post_apuesta: OPCIONES_POSTFLOP,
  post_subida: OPCIONES_POSTFLOP,
}

/** En qué situación de subida está la mesa (antes de actuar). */
export function contextoDe(estado: EstadoMano): ContextoSubida {
  if (estado.calle === 0) return estado.subidasPre === 0 ? 'pre_abierta' : 'pre_contra_subida'
  return estado.apuestaAlta === 0 ? 'post_apuesta' : 'post_subida'
}

/** "Subir hasta" sin ajustar, en fichas, para una opción que no es all-in. */
function hastaCrudo(estado: EstadoMano, asiento: number, ctx: ContextoSubida, op: OpcionTamano): number {
  if (ctx === 'pre_abierta') return op.valor * estado.bb
  if (ctx === 'pre_contra_subida') return op.valor * estado.apuestaAlta
  return estado.apuestaAlta + op.valor * (estado.bote + aPagarDe(estado, asiento))
}

/** Lo que mide un "subir hasta" real en la unidad de las opciones del contexto (bb, veces o fracción del bote). */
export function medidaDe(estado: EstadoMano, asiento: number, ctx: ContextoSubida, hasta: number): number {
  if (ctx === 'pre_abierta') return hasta / estado.bb
  if (ctx === 'pre_contra_subida') return hasta / Math.max(estado.apuestaAlta, 1)
  return (hasta - estado.apuestaAlta) / Math.max(estado.bote + aPagarDe(estado, asiento), 1)
}

/** Opción no all-in más cercana (en escala logarítmica) a una medida. */
export function opcionMasCercana(ctx: ContextoSubida, medida: number): OpcionTamano {
  const candidatas = OPCIONES_POR_CONTEXTO[ctx].filter((o) => !o.allin)
  const m = Math.max(medida, 1e-6)
  let mejor = candidatas[0]!
  let dist = Infinity
  for (const o of candidatas) {
    const d = Math.abs(Math.log(m / o.valor))
    if (d < dist) { dist = d; mejor = o }
  }
  return mejor
}

export interface SubidaPosible extends OpcionTamano {
  /** Total al que se sube en la calle, ya ajustado a los límites legales. */
  hasta: number
}

/**
 * Cuánto vale cada opción en fichas: redondeado a media ciega y limitado al mínimo y máximo legales.
 * Sin duplicados; un tamaño que llega al máximo se ofrece solo como ALL-IN.
 */
export function subidasPosibles(estado: EstadoMano, asiento: number): SubidaPosible[] {
  const legales = accionesLegales(estado, asiento)
  if (!legales.subir) return []
  const { min, max } = legales.subir
  const ctx = contextoDe(estado)
  const unidad = Math.max(estado.bb / 2, 1)
  const salida: SubidaPosible[] = []
  for (const op of OPCIONES_POR_CONTEXTO[ctx]) {
    let hasta = op.allin ? max : Math.round(hastaCrudo(estado, asiento, ctx, op) / unidad) * unidad
    hasta = Math.min(Math.max(hasta, min), max)
    if (!op.allin && hasta >= max) continue
    if (salida.some((s) => s.hasta === hasta)) continue
    salida.push({ ...op, hasta })
  }
  return salida
}
