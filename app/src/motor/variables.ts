/**
 * variables.ts: las 47 variables de entrada del Modelo 4, calculadas desde el estado de la mano.
 *
 * Replica EXACTAMENTE `textura_mesa`, `variables_cartas` (Notebooks 10 y 12) y la "foto" que arma
 * `reconstruir_decisiones_v4` (Notebook 10). Todas las divisiones se hacen en el mismo orden que en Python
 * para que los resultados en float64 sean idénticos.
 */
import { VALOR_RANGO, cartaAEntero, valorDe, type Carta } from './cartas.ts'
import { claseDePuntaje, evaluarEnteros } from './evaluador.ts'
import { equityMonteCarlo, equityPreflop, MAX_RIVALES, type Rng, type TablaPreflop } from './equidad.ts'
import { contarActivos, type EstadoMano } from './mano.ts'

/** Las 47 variables en el orden exacto del modelo (orden_variables de referencia_golden.json). */
export const NOMBRES_VARIABLES = [
  'calle', 'bote_bb', 'to_call_bb', 'stack_bb', 'pot_odds', 'n_activos', 'n_allin', 'detras',
  'pos_pre', 'pos_post', 'es_sb', 'es_bb', 'es_boton', 'eff_bb', 'spr', 'call_vs_bote',
  'call_es_allin', 'invertido_bb', 'subidas_calle', 'callers_calle', 'checks_calle', 'subidas_pre',
  'ult_apuesta_vs_bote', 'ya_actuo_calle', 'ya_subio_calle', 'es_agresor_pre', 'es_agresor_prev',
  'hay_agresor_prev', 'b_n', 'b_pareada', 'b_trio', 'b_max_palo', 'b_alta', 'b_broadway', 'b_conect',
  'es_pluribus', 'c_alta', 'c_baja', 'c_pareja', 'c_suited', 'c_gap', 'c_fuerza', 'c_clase',
  'c_proy_color', 'c_proy_escalera', 'c_eq_pre', 'c_equity',
] as const

export type NombreVariable = (typeof NOMBRES_VARIABLES)[number]
/** Las 47 variables de una decisión, por nombre. */
export type Variables = Record<NombreVariable, number>

/** Cómo calcular lo que depende de la tabla y del azar. */
export interface ContextoVariables {
  /** Tabla de equity preflop (equity_preflop_169.json). */
  tabla: TablaPreflop
  /** Simulaciones del Monte Carlo postflop (por defecto 1,000). */
  simulaciones?: number
  /** Generador aleatorio del Monte Carlo. */
  rng?: Rng
  /**
   * `c_equity` postflop:
   *  - omitido: se calcula con Monte Carlo;
   *  - un número: se usa ese valor (por ejemplo, calculado antes en el Worker);
   *  - 'omitir': queda en NaN (para comparar solo las 46 variables deterministas).
   */
  equity?: number | 'omitir'
  /** Fuerza el valor de `es_pluribus` (por defecto: 1 solo si el jugador se llama "Pluribus"). */
  esPluribus?: boolean
}

const RANGOS_LISTA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

/** Textura de las cartas comunitarias visibles (`textura_mesa`). */
export function texturaMesa(tablero: readonly Carta[]): Pick<
  Variables, 'b_n' | 'b_pareada' | 'b_trio' | 'b_max_palo' | 'b_alta' | 'b_broadway' | 'b_conect'
> {
  if (tablero.length === 0) {
    return { b_n: 0, b_pareada: 0, b_trio: 0, b_max_palo: 0, b_alta: 0, b_broadway: 0, b_conect: 0 }
  }
  const valores = tablero.map(valorDe)
  const palos = tablero.map((c) => c[1]!)
  const repeticiones = new Array<number>(15).fill(0)
  for (const v of valores) repeticiones[v]! += 1
  const maxRep = Math.max(...repeticiones)
  const unicos = new Set(valores)
  if (valores.includes(14)) unicos.add(1)
  const conteoPalos = (s: string) => palos.filter((p) => p === s).length
  return {
    b_n: tablero.length,
    b_pareada: Number(maxRep >= 2),
    b_trio: Number(maxRep >= 3),
    b_max_palo: Math.max(...[...new Set(palos)].map(conteoPalos)),
    b_alta: Math.max(...valores),
    b_broadway: valores.filter((v) => v >= 10).length,
    b_conect: Math.max(...RANGOS_LISTA.map((lo) => [0, 1, 2, 3, 4].filter((d) => unicos.has(lo + d)).length)),
  }
}

type VariablesCartas = Pick<
  Variables,
  'c_alta' | 'c_baja' | 'c_pareja' | 'c_suited' | 'c_gap' | 'c_fuerza' | 'c_clase' | 'c_proy_color' | 'c_proy_escalera' | 'c_eq_pre' | 'c_equity'
>

/**
 * Variables de las cartas PRIVADAS del jugador que decide (`variables_cartas`).
 * `numRivales` = jugadores activos − 1 (se limita a 1..4 como en el entrenamiento).
 */
export function variablesCartas(
  misCartas: readonly Carta[],
  mesa: readonly Carta[],
  numRivales: number,
  ctx: ContextoVariables,
): VariablesCartas {
  const valores = misCartas.map(valorDe).sort((a, b) => b - a) as [number, number]
  const suited = misCartas[0]![1] === misCartas[1]![1]
  const rivales = Math.max(1, Math.min(numRivales, MAX_RIVALES))
  // La clave de la tabla sale de las cartas reales: un par nunca es "suited"
  const cEqPre = equityPreflop(ctx.tabla, misCartas[0]!, misCartas[1]!, rivales)
  const base = {
    c_alta: valores[0],
    c_baja: valores[1],
    c_pareja: Number(valores[0] === valores[1]),
    c_suited: Number(suited),
    c_gap: valores[0] - valores[1],
    c_eq_pre: cEqPre,
  }
  if (mesa.length === 0) {
    return { ...base, c_fuerza: 0.0, c_clase: 10, c_proy_color: 0, c_proy_escalera: 0, c_equity: cEqPre }
  }

  const puntaje = evaluarEnteros([...misCartas, ...mesa].map(cartaAEntero))
  const todas = [...misCartas, ...mesa]
  const palos = todas.map((c) => c[1]!)
  const valoresTodos = new Set(todas.map((c) => VALOR_RANGO[c[0]!]!))
  if (todas.some((c) => c[0] === 'A')) valoresTodos.add(1)
  const palosPropios = [misCartas[0]![1]!, misCartas[1]![1]!]
  const proyColor = mesa.length < 5 && [...new Set(palos)].some((s) => palos.filter((p) => p === s).length === 4 && palosPropios.includes(s))
  const proyEscalera =
    mesa.length < 5 &&
    RANGOS_LISTA.some((lo) => [0, 1, 2, 3, 4].filter((d) => valoresTodos.has(lo + d)).length === 4)

  let cEquity: number
  if (ctx.equity === 'omitir') cEquity = NaN
  else if (typeof ctx.equity === 'number') cEquity = ctx.equity
  else cEquity = equityMonteCarlo(misCartas, mesa, rivales, { simulaciones: ctx.simulaciones, rng: ctx.rng })

  return {
    ...base,
    c_fuerza: 1 - puntaje / 7462,
    c_clase: claseDePuntaje(puntaje),
    c_proy_color: Number(proyColor),
    c_proy_escalera: Number(proyEscalera),
    c_equity: cEquity,
  }
}

/** Datos crudos de la foto de la mesa para un asiento (antes de actuar). */
export interface FotoDecision {
  asiento: number
  /** Fichas que debe pagar para seguir. */
  aPagar: number
  bote: number
  stack: number
  /** to_call / (bote + to_call), 0 si no hay nada que pagar. */
  potOdds: number
  /** Jugadores que siguen en la mano (incluye al que decide). */
  nActivos: number
  /** Rivales para el equity: min(activos − 1, 4), mínimo 1. */
  rivales: number
}

/** Foto numérica de la mesa para `asiento`, antes de que actúe. */
export function fotoDecision(estado: EstadoMano, asiento: number): FotoDecision {
  const aPagar = Math.max(0.0, estado.apuestaAlta - estado.puesto[asiento]!)
  const bote = estado.bote
  const nActivos = contarActivos(estado)
  return {
    asiento,
    aPagar,
    bote,
    stack: estado.stacks[asiento]!,
    potOdds: bote + aPagar > 0 ? aPagar / (bote + aPagar) : 0.0,
    nActivos,
    rivales: Math.max(1, Math.min(nActivos - 1, MAX_RIVALES)),
  }
}

/**
 * Las 47 variables de la decisión de `asiento` en el estado actual (la foto se toma ANTES de que actúe).
 * Equivale a la fila que arma `reconstruir_decisiones_v4`. Exige que el asiento tenga cartas privadas.
 */
export function extraerVariables(estado: EstadoMano, asiento: number, ctx: ContextoVariables): Variables {
  const misCartas = estado.cartasPrivadas[asiento]
  if (!misCartas) throw new Error(`El asiento ${asiento} no tiene cartas privadas`)
  const n = estado.n
  const bb = estado.bb
  const pid = asiento

  const toCall = Math.max(0.0, estado.apuestaAlta - estado.puesto[pid]!)
  const stack = estado.stacks[pid]!
  const bote = estado.bote
  const activos: number[] = []
  for (let q = 0; q < n; q++) if (estado.activos[q]) activos.push(q)
  const rivalesFichas = activos.filter((q) => q !== pid).map((q) => estado.stacks[q]! + estado.puesto[q]!)
  const efectivo = rivalesFichas.length > 0 ? Math.min(stack + estado.puesto[pid]!, Math.max(...rivalesFichas)) : stack
  const orden = estado.calle === 0 ? estado.ordenPre : estado.ordenPost
  const detras = activos.filter((q) => q !== pid && estado.stacks[q]! > 0 && orden[q]! > orden[pid]!).length

  const f: Variables = {
    calle: estado.calle,
    bote_bb: bote / bb,
    to_call_bb: toCall / bb,
    stack_bb: stack / bb,
    pot_odds: bote + toCall > 0 ? toCall / (bote + toCall) : 0.0,
    n_activos: activos.length,
    n_allin: activos.filter((q) => estado.stacks[q]! <= 0).length,
    detras,
    pos_pre: estado.ordenPre[pid]! / (n - 1),
    pos_post: estado.ordenPost[pid]! / (n - 1),
    es_sb: Number(pid === 0),
    es_bb: Number(pid === 1),
    es_boton: Number(pid === n - 1),
    eff_bb: efectivo / bb,
    spr: bote > 0 ? efectivo / bote : 0.0,
    call_vs_bote: bote > 0 ? toCall / bote : 0.0,
    call_es_allin: Number(toCall > 0 && toCall >= stack),
    invertido_bb: (estado.inicial[pid]! - stack) / bb,
    subidas_calle: estado.subidasCalle,
    callers_calle: estado.callersCalle,
    checks_calle: estado.checksCalle,
    subidas_pre: estado.subidasPre,
    ult_apuesta_vs_bote: estado.ultApuesta,
    ya_actuo_calle: estado.actuoCalle[pid]!,
    ya_subio_calle: estado.subioCalle[pid]!,
    es_agresor_pre: Number(estado.agresorPre === pid),
    es_agresor_prev: Number(estado.agresorPrev === pid),
    hay_agresor_prev: Number(estado.agresorPrev !== null),
    ...texturaMesa(estado.tablero),
    // es_pluribus: el entrenamiento lo marca con el nombre; para el jugador humano de la app siempre es 0
    es_pluribus: Number(ctx.esPluribus ?? estado.jugadores[pid] === 'Pluribus'),
    ...variablesCartas(misCartas, estado.tablero, activos.length - 1, ctx),
  }
  return f
}

/** Variables en el orden del modelo, como arreglo (para armar el vector de entrada). */
export function variablesAArreglo(v: Variables, orden: readonly string[] = NOMBRES_VARIABLES): number[] {
  return orden.map((nombre) => v[nombre as NombreVariable])
}

/** Inverso de `variablesAArreglo`. */
export function arregloAVariables(valores: ArrayLike<number>, orden: readonly string[] = NOMBRES_VARIABLES): Variables {
  const salida: Record<string, number> = {}
  orden.forEach((nombre, i) => { salida[nombre] = valores[i]! })
  return salida as Variables
}
