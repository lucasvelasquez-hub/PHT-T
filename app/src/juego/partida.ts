/**
 * partida.ts: UNA mano completa, sin React. La interfaz (MesaEnVivo) y las pruebas la manejan con las mismas funciones.
 *
 *   crear → [ turno → (rival) decidirRival | (héroe) analizarHeroe + aplicar → repartirSiguienteCalle ]* → resolver
 *
 * Reglas de los rivales (docs/features/mano-completa/design.md): se calcula la lectura con el Modelo 4 y se SORTEA
 * la acción con las probabilidades de la élite. Fold con el check gratis pasa; Bet/Raise sin poder subir paga.
 * El tamaño de la subida sale de `tamanos_pluribus.json`. Todo el azar sale de `crearAzar(semilla)`.
 */
import {
  BARAJA, accionesLegales, aplicarAccion, contarActivos, crearMano, faseRonda, repartirCalle, repartirPrivadas, turnoActual,
  type Accion, type EstadoMano, type FaseRonda,
} from '../motor/index.ts'
import { lecturaDeAnalisis, type Analista, type AnalisisDecision } from './analista.ts'
import { barajar, crearAzar, enteroDe } from './azar.ts'
import { repartirBote, type Reparto } from './reparto.ts'
import { elegirSubida } from './tamanos.ts'
import type {
  DecisionHeroe, EscenarioInicial, EventoHistorial, GuionMano, HistorialMano, PasoGuion, ResultadoMano,
} from './tipos.ts'

export const JUGADORES = 6
export const STACK_INICIAL_BB = 100
export const CIEGAS_BB: [number, number] = [0.5, 1]
const BB_FICHAS = 100
/** Simulaciones de Monte Carlo (postflop). Preflop se lee de la tabla y no simula. */
export const SIMULACIONES_HEROE = 3000
export const SIMULACIONES_RIVAL = 600

/** Nombres de los rivales en la mesa (asientos 1..5); todos tienen avatar en public/assets/avatares. */
export const NOMBRES_RIVALES = ['MrBlue', 'MrOrange', 'MrPink', 'MrWhite', 'MrBlonde']
const POSICIONES = ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'] as const

export interface ConfigPartida {
  semilla: number
  boton: number
  escenarioInicial?: EscenarioInicial
  guion?: GuionMano
  nombreHeroe?: string
  rivales?: string[]
}

export interface DecisionRival {
  accion: Accion
  lectura: AnalisisDecision | null
}

const mod = (a: number, n: number) => ((a % n) + n) % n

export class Partida {
  readonly estado: EstadoMano
  /** Asiento del motor del héroe. */
  readonly heroe: number
  readonly semilla: number
  /** Asiento de la mesa con el botón. */
  readonly boton: number
  readonly nombres: string[]
  /** Las 5 cartas comunitarias (las visibles hasta ahora están en `estado.tablero`). */
  readonly tablero: string[]
  readonly azar: () => number
  readonly guion: GuionMano | undefined
  readonly historial: EventoHistorial[] = []
  private readonly n: number
  private pasoGuion = 0
  private resultado: (ResultadoMano & { reparto: Reparto }) | null = null

  constructor(cfg: ConfigPartida) {
    this.semilla = cfg.semilla
    this.azar = crearAzar(cfg.semilla)
    this.guion = cfg.guion
    const esc = cfg.escenarioInicial
    this.n = esc ? esc.estado.n : JUGADORES
    const nombreHeroe = cfg.nombreHeroe ?? 'Tú'
    const rivales = cfg.rivales ?? NOMBRES_RIVALES

    if (esc) {
      const e = structuredClone(esc.estado)
      this.estado = e
      this.heroe = esc.asientoHeroe
      if (e.tablero.length !== esc.tablero.length || e.tablero.some((c, i) => c !== esc.tablero[i])) {
        throw new Error('EscenarioInicial incoherente: `estado.tablero` debe coincidir con `tablero`')
      }
      this.boton = mod(e.n - 1 - this.heroe, e.n)
      this.nombres = this.nombresMesa(e.n, nombreHeroe, rivales)
      const usadas = new Set<string>([...esc.cartasHeroe, ...esc.tablero, ...Object.values(esc.cartasRivales ?? {}).flat()])
      const libres = barajar(BARAJA.filter((c) => !usadas.has(c)), this.azar)
      repartirPrivadas(e, this.heroe, esc.cartasHeroe)
      for (let k = 1; k < e.n; k++) {
        const s = this.motorDe(k)
        const dadas = esc.cartasRivales?.[s]
        repartirPrivadas(e, s, dadas ?? [libres.pop()!, libres.pop()!])
      }
      this.tablero = [...esc.tablero]
      while (this.tablero.length < 5) this.tablero.push(libres.pop()!)
    } else {
      this.boton = mod(cfg.boton, JUGADORES)
      this.heroe = mod(-this.boton - 1, JUGADORES)
      this.nombres = this.nombresMesa(JUGADORES, nombreHeroe, rivales)
      const nombresMotor = Array.from({ length: JUGADORES }, (_, s) => this.nombres[this.fisicoDe(s)]!)
      const e = crearMano({
        jugadores: nombresMotor,
        stacks: new Array<number>(JUGADORES).fill(STACK_INICIAL_BB * BB_FICHAS),
        ciegas: [CIEGAS_BB[0] * BB_FICHAS, CIEGAS_BB[1] * BB_FICHAS, 0, 0, 0, 0],
      })
      this.estado = e
      const g = cfg.guion
      const usadas = new Set<string>(g ? [...g.cartasHeroe, ...g.tablero, ...Object.values(g.cartasRivales ?? {}).flat()] : [])
      const mazo = barajar(BARAJA.filter((c) => !usadas.has(c)), this.azar)
      for (let k = 0; k < JUGADORES; k++) {
        const s = this.motorDe(k)
        const dadas = k === 0 ? g?.cartasHeroe : g?.cartasRivales?.[k]
        repartirPrivadas(e, s, dadas ?? [mazo.pop()!, mazo.pop()!])
      }
      this.tablero = g ? [...g.tablero] : [mazo.pop()!, mazo.pop()!, mazo.pop()!, mazo.pop()!, mazo.pop()!]
    }
    this.estado.jugadores = Array.from({ length: this.estado.n }, (_, s) => this.nombres[this.fisicoDe(s)]!)
  }

  private nombresMesa(n: number, heroe: string, rivales: string[]): string[] {
    return Array.from({ length: n }, (_, k) => (k === 0 ? heroe : rivales[(k - 1) % rivales.length]!))
  }

  // --- Asientos --------------------------------------------------------------------------------------------------
  /** Asiento del motor → asiento de la mesa (0 = héroe). */
  fisicoDe(s: number): number { return mod(s - this.heroe, this.n) }
  /** Asiento de la mesa → asiento del motor. */
  motorDe(f: number): number { return mod(this.heroe + f, this.n) }
  get posicionHeroe(): DecisionHeroe['posicion'] { return POSICIONES[this.heroe]! }

  // --- Estado de la mano -----------------------------------------------------------------------------------------
  fase(): FaseRonda { return faseRonda(this.estado) }
  turno(): number | null { return turnoActual(this.estado) }
  get heroeSigue(): boolean { return this.estado.activos[this.heroe]! }
  get calle(): 0 | 1 | 2 | 3 { return this.estado.calle as 0 | 1 | 2 | 3 }

  /** El paso del guion que corresponde al turno actual (null si no hay guion o ya se acabó). */
  pasoDelGuion(): PasoGuion | null {
    const p = this.guion?.acciones[this.pasoGuion]
    const t = this.turno()
    return p && t !== null && this.motorDe(p.asiento) === t ? p : null
  }

  // --- Lecturas y decisiones -------------------------------------------------------------------------------------
  /** Lectura de la decisión del héroe (equity, red y lectura conjunta). */
  analizarHeroe(analista: Analista): Promise<AnalisisDecision> {
    return analista.analizar(this.estado, this.heroe, SIMULACIONES_HEROE, enteroDe(this.azar))
  }

  /** Decide un rival: sigue el guion si lo hay; si no, calcula la lectura y sortea con las probabilidades de la élite. */
  async decidirRival(analista: Analista, asiento: number): Promise<DecisionRival> {
    const paso = this.pasoDelGuion()
    if (paso) {
      const a = this.accionDePaso(paso, asiento)
      if (a) return { accion: a, lectura: null }
    }
    const lectura = await analista.analizar(this.estado, asiento, SIMULACIONES_RIVAL, enteroDe(this.azar))
    const p = lectura.prediccion
    const u = this.azar()
    const legales = accionesLegales(this.estado, asiento)
    let accion: Accion
    if (u < p.fold) accion = { asiento, tipo: 'f' }
    else if (u < p.fold + p.call) accion = { asiento, tipo: 'cc' }
    else accion = { asiento, tipo: 'cbr' }
    if (accion.tipo === 'f' && legales.puedeCheck) accion = { asiento, tipo: 'cc' }
    if (accion.tipo === 'cbr') {
      const hasta = legales.subir ? elegirSubida(this.estado, asiento, this.azar) : null
      accion = hasta === null ? { asiento, tipo: 'cc' } : { asiento, tipo: 'cbr', hasta }
    }
    return { accion, lectura }
  }

  /** La acción del guion como acción del motor, ajustada a lo legal; null si no se puede cumplir. */
  accionDePaso(paso: PasoGuion, asiento: number): Accion | null {
    const l = accionesLegales(this.estado, asiento)
    if (paso.tipo === 'f') return l.puedeFold ? { asiento, tipo: 'f' } : { asiento, tipo: 'cc' }
    if (paso.tipo === 'cc') return { asiento, tipo: 'cc' }
    if (!l.subir) return null
    const hasta = Math.min(Math.max(Math.round((paso.hastaBB ?? 0) * this.estado.bb), l.subir.min), l.subir.max)
    return { asiento, tipo: 'cbr', hasta }
  }

  /** Aplica una acción (validada por el motor) y la anota en el historial. */
  aplicar(accion: Accion, analisis: AnalisisDecision | null = null) {
    const calle = this.calle
    const ev = aplicarAccion(this.estado, accion, { validar: true })
    const bb = this.estado.bb
    this.historial.push({
      asiento: this.fisicoDe(accion.asiento),
      tipo: accion.tipo,
      hastaBB: ev.hasta / bb,
      pagoBB: ev.pago / bb,
      boteBB: ev.bote / bb,
      calle,
      lectura: analisis ? lecturaDeAnalisis(analisis) : null,
    })
    if (this.guion && this.guion.acciones[this.pasoGuion]) this.pasoGuion++
    return ev
  }

  /** La decisión del héroe tal como la reciben el Retador y el Analista. */
  decisionHeroe(accion: Accion, analisis: AnalisisDecision): DecisionHeroe {
    return {
      accion: accion.tipo,
      ...(accion.tipo === 'cbr' ? { hasta: accion.hasta } : {}),
      calle: this.calle,
      posicion: this.posicionHeroe,
      lectura: lecturaDeAnalisis(analisis),
    }
  }

  /** Reparte la siguiente calle del tablero ya decidido (flop = 3 cartas, turn y river = 1). */
  repartirSiguienteCalle(): string[] {
    const hay = this.estado.tablero.length
    const nuevas = this.tablero.slice(hay, hay === 0 ? 3 : hay + 1)
    repartirCalle(this.estado, nuevas)
    return nuevas
  }

  /** Reparte el bote. Deja los stacks finales en el estado y el bote en 0. Se puede llamar una sola vez. */
  resolver(): ResultadoMano & { reparto: Reparto } {
    if (this.resultado) return this.resultado
    const e = this.estado
    const boteFinal = e.bote
    const reparto = repartirBote(e, this.tablero)
    reparto.premios.forEach((p, s) => { e.stacks[s]! += p })
    e.bote = 0
    e.puesto.fill(0) // la mano terminó: no quedan apuestas delante de nadie
    const cartas: Record<number, [string, string]> = {}
    for (let s = 0; s < e.n; s++) {
      const c = e.cartasPrivadas[s]!
      cartas[this.fisicoDe(s)] = [c[0]!, c[1]!]
    }
    const historial: HistorialMano = {
      origen: 'generada',
      semilla: this.semilla,
      boton: this.boton,
      ciegasBB: CIEGAS_BB,
      stackInicialBB: e.inicial[this.heroe]! / e.bb,
      nombres: this.nombres,
      cartas,
      tablero: this.tablero,
      acciones: this.historial,
    }
    this.resultado = {
      netoBB: (e.stacks[this.heroe]! - e.inicial[this.heroe]!) / e.bb,
      ganadores: reparto.ganadores.map((s) => this.fisicoDe(s)).sort((a, b) => a - b),
      cartas,
      historial,
      showdown: reparto.showdown,
      boteBB: boteFinal / e.bb,
      ...(reparto.nombreMano ? { nombreMano: reparto.nombreMano } : {}),
      reparto,
    }
    return this.resultado
  }

  get activos(): number { return contarActivos(this.estado) }
}

/**
 * Juega la mano hasta el final. El héroe elige con `elegirHeroe` (acción legal). Sirve para las pruebas y para "Saltar".
 */
export async function jugarHastaElFinal(
  p: Partida,
  analista: Analista,
  elegirHeroe: (p: Partida) => Accion | Promise<Accion>,
): Promise<ResultadoMano> {
  for (let paso = 0; paso < 500; paso++) {
    const fase = p.fase()
    if (fase === 'esperando_accion') {
      const s = p.turno()!
      if (s === p.heroe) {
        const analisis = await p.analizarHeroe(analista)
        p.aplicar(await elegirHeroe(p), analisis)
      } else {
        const d = await p.decidirRival(analista, s)
        p.aplicar(d.accion, d.lectura)
      }
    } else if (fase === 'repartir_calle') {
      p.repartirSiguienteCalle()
    } else {
      return p.resolver()
    }
  }
  throw new Error('La mano no terminó (más de 500 pasos)')
}
