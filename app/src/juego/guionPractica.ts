/**
 * guionPractica.ts: la mano de práctica de la bienvenida (`ManoGuiada`).
 *
 * El jugador está en el botón (D) con A♥ Q♥. El rival de CO sube, el jugador iguala; en el flop (Q♣ 7♦ 2♠) hay pareja
 * de reinas: el rival apuesta, el jugador sube y paga el rival; turn y river pasan, y en el showdown gana con pareja de reinas.
 * Toca los tres botones (CALL, RAISE y CHECK) y llega al showdown sin que nadie tenga que decidir por su cuenta.
 * Asientos de la mesa: 0 = jugador (botón), 1 = SB, 2 = BB, 3 = UTG, 4 = HJ, 5 = CO.
 */
import type { GuionMano } from './tipos.ts'

export const GUION_PRACTICA: GuionMano = {
  boton: 0,
  cartasHeroe: ['Ah', 'Qh'],
  cartasRivales: { 5: ['Kc', 'Jc'], 2: ['Td', '8d'] },
  tablero: ['Qc', '7d', '2s', '5c', '9h'],
  introduccion: 'Primera mano de práctica. Estás en el botón (D): actúas último después del flop. Tus cartas: A♥ Q♥.',
  acciones: [
    { asiento: 3, tipo: 'f' },
    { asiento: 4, tipo: 'f' },
    { asiento: 5, tipo: 'cbr', hastaBB: 2.5 },
    { asiento: 0, tipo: 'cc', ayuda: 'El jugador de CO subió a 2.5 BB. Para seguir en la mano tienes que igualar su apuesta: toca CALL.' },
    { asiento: 1, tipo: 'f' },
    { asiento: 2, tipo: 'cc' },
    // Flop: Q♣ 7♦ 2♠
    { asiento: 2, tipo: 'cc' },
    { asiento: 5, tipo: 'cbr', hastaBB: 4, ayuda: 'Salió el flop y apostó el de CO: 4 BB.' },
    { asiento: 0, tipo: 'cbr', hastaBB: 12, ayuda: 'Tienes pareja de reinas con As de kicker. Toca RAISE para subir la apuesta.' },
    { asiento: 2, tipo: 'f' },
    { asiento: 5, tipo: 'cc' },
    // Turn: 5♣
    { asiento: 5, tipo: 'cc' },
    { asiento: 0, tipo: 'cc', ayuda: 'Nadie ha apostado: pasar es gratis. Toca CHECK.' },
    // River: 9♥
    { asiento: 5, tipo: 'cc' },
    { asiento: 0, tipo: 'cc', ayuda: 'Última calle. Toca CHECK otra vez: se muestran las cartas y se decide el bote.' },
  ],
}
