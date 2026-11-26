/**
 * vista.ts: de una `Partida` (estado del motor) a lo que dibuja la mesa.
 * Los asientos de la mesa son 0 = héroe y 1..5 = rivales en el sentido del reloj (ver tipos.ts).
 */
import { datosAsiento, type DatosAsiento, type EscenarioMesa } from '../ui/datos/escenario.ts'
import type { Partida } from './partida.ts'

export const NOMBRES_CALLE = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'] as const

export interface OpcionesVista {
  /** Asiento de la mesa al que le toca (o que "piensa"). */
  turno: number | null
  /** Muestra las cartas de los que siguen en la mano (showdown). */
  reveladas: boolean
  /** Asientos de la mesa que se llevan el bote. */
  ganadores: number[]
  /** Texto en la pestaña de cada asiento de la mesa. */
  notas: Record<number, string>
}

export const SIN_OPCIONES: OpcionesVista = { turno: null, reveladas: false, ganadores: [], notas: {} }

export function escenarioDe(p: Partida, o: OpcionesVista = SIN_OPCIONES): EscenarioMesa {
  const e = p.estado
  const datos = (f: number): DatosAsiento => {
    const s = p.motorDe(f)
    const d = datosAsiento(e, s)
    const privadas = e.cartasPrivadas[s]
    return {
      ...d,
      ...(o.reveladas && f > 0 && d.activo && privadas ? { cartas: [privadas[0]!, privadas[1]!] as [string, string] } : {}),
      ...(o.turno === f ? { turno: true } : {}),
      ...(o.ganadores.includes(f) ? { ganador: true } : {}),
      ...(o.notas[f] ? { nota: o.notas[f] } : {}),
    }
  }
  const mano = e.cartasPrivadas[p.heroe]!
  return {
    heroe: datos(0),
    cartasHeroe: [mano[0]!, mano[1]!],
    tablero: [...e.tablero],
    rivales: Array.from({ length: e.n - 1 }, (_, k) => datos(k + 1)),
  }
}
