/**
 * lectura.ts: la "lectura conjunta" del `entrenador_inteligente` (Notebook 12).
 *
 * Junta dos cosas sobre la misma situación:
 *   - el MOTOR MATEMÁTICO: la equity contra manos aleatorias y el precio de la apuesta (pot odds);
 *   - la RED NEURONAL (Modelo 4): lo que harían jugadores de élite.
 * y dice si coinciden o no. Mismas reglas y mismos umbrales que el Python.
 *
 * REGLA DE REDACCIÓN: aquí se describe "lo que harían jugadores de élite". Nunca se habla de jugada
 * "óptima", "correcta" ni de GTO: la red imita a los jugadores de las manos de Pluribus, no resuelve el juego.
 */
import { argmax, type Prediccion } from './red.ts'

/** Nombres de las tres acciones, en el orden de salida de la red. */
export const NOMBRES_ACCIONES = ['Fold', 'Check/Call', 'Bet/Raise'] as const
export type NombreAccion = (typeof NOMBRES_ACCIONES)[number]

export type CodigoLectura =
  /** Nadie apostó: pasar es gratis. */
  | 'sin_apuesta'
  /** La matemática permite pagar, pero la élite suele retirarse. */
  | 'matematica_paga_elite_se_retira'
  /** La matemática permite continuar y la élite también continúa. */
  | 'coinciden_continuar'
  /** El precio es alto y la élite se retira. */
  | 'coinciden_retirarse'
  /** El precio no compensa, pero la élite continúa (farol, posición o ganancias futuras). */
  | 'precio_alto_elite_continua'

export interface LecturaConjunta {
  codigo: CodigoLectura
  /** Acción más probable según la red. */
  jugadaElite: NombreAccion
  /** Equity del jugador contra manos aleatorias, en %. */
  equityPct: number
  /** Equity mínima para pagar (pot odds), en %. Null si no hay apuesta que pagar. */
  equityMinimaPct: number | null
  /** ¿La equity alcanza para pagar? Null si no hay apuesta que pagar. */
  rentable: boolean | null
  /** "RENTABLE PAGAR" / "NO RENTABLE PAGAR", o null si no hay apuesta que pagar. */
  veredictoMatematico: string | null
  /** Frase corta para el titular. */
  titulo: string
  /** Explicación completa. */
  texto: string
}

export interface EntradaLectura {
  /** Equity en 0..1 (la variable c_equity). */
  equity: number
  /** Pot odds en 0..1 (la variable pot_odds = a_pagar / (bote + a_pagar)). */
  potOdds: number
  /** Fichas que hay que pagar para seguir. */
  aPagar: number
  /** Probabilidades de la red. */
  prediccion: Prediccion
}

/** Lectura conjunta de una situación (misma lógica que el bloque "3. LECTURA CONJUNTA" del Python). */
export function lecturaConjunta(e: EntradaLectura): LecturaConjunta {
  const jugadaElite = NOMBRES_ACCIONES[argmax(e.prediccion)]
  const equityPct = e.equity * 100
  const minimaPct = e.potOdds * 100
  const rentable = equityPct >= minimaPct

  if (e.aPagar <= 0) {
    return {
      codigo: 'sin_apuesta', jugadaElite, equityPct, equityMinimaPct: null, rentable: null, veredictoMatematico: null,
      titulo: 'Nadie ha apostado: pasar es gratis',
      texto: `Sin apuesta que pagar, la élite elegiría sobre todo: ${jugadaElite}.`,
    }
  }

  const base = {
    jugadaElite, equityPct, equityMinimaPct: minimaPct, rentable,
    veredictoMatematico: rentable ? 'RENTABLE PAGAR' : 'NO RENTABLE PAGAR',
  }
  if (rentable && jugadaElite === 'Fold') {
    return {
      ...base, codigo: 'matematica_paga_elite_se_retira',
      titulo: 'La matemática dice pagar, pero la élite suele retirarse',
      texto:
        'La matemática dice pagar, pero la élite suele retirarse: la equity se mide contra manos aleatorias, ' +
        'y quien apuesta normalmente no tiene una mano aleatoria.',
    }
  }
  if (rentable) {
    return {
      ...base, codigo: 'coinciden_continuar',
      titulo: 'Coinciden: la matemática permite continuar',
      texto: `Coinciden: la matemática permite continuar y la élite elegiría ${jugadaElite}.`,
    }
  }
  if (jugadaElite === 'Fold') {
    return {
      ...base, codigo: 'coinciden_retirarse',
      titulo: 'Coinciden: el precio es demasiado alto',
      texto: 'Coinciden: el precio es demasiado alto y la élite se retiraría.',
    }
  }
  return {
    ...base, codigo: 'precio_alto_elite_continua',
    titulo: 'El precio no compensa, pero la élite continúa',
    texto: `El precio no compensa, pero la élite elegiría ${jugadaElite}: farol, posición o ganancias futuras.`,
  }
}
