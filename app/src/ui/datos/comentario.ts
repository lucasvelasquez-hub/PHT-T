/**
 * comentario.ts: la línea del comentarista, en español y sin veredicto.
 *
 * Parte del código de `lecturaConjunta` (motor) y le pone las cifras de la mano. Nunca dice "jugada óptima",
 * "correcta", GTO ni habla de EV: describe lo que dice la matemática y lo que harían jugadores de élite.
 */
import type { LecturaConjunta, Prediccion } from '../../motor/index.ts'
import { pct } from './formato.ts'

export function comentarioDe(lectura: LecturaConjunta, p: Prediccion): string {
  const P = ' %' // espacio duro: la cifra y el signo % no se separan al cortar la línea
  const eq = Math.round(lectura.equityPct)
  const fold = pct(p.fold)
  const sigue = 100 - fold
  switch (lectura.codigo) {
    case 'matematica_paga_elite_se_retira':
      return `La matemática te da ${eq}${P} de ganar, pero la élite se retira el ${fold}${P} de las veces aquí.`
    case 'coinciden_continuar':
      return `La matemática te da ${eq}${P} de ganar y la élite sigue en la mano el ${sigue}${P} de las veces aquí: coinciden.`
    case 'coinciden_retirarse':
      return `Con ${eq}${P} de ganar el precio no compensa, y la élite se retira el ${fold}${P} de las veces aquí: coinciden.`
    case 'precio_alto_elite_continua':
      return `El precio no compensa (${eq}${P} contra ${Math.round(lectura.equityMinimaPct ?? 0)}${P} necesario), pero la élite sigue el ${sigue}${P} de las veces aquí.`
    case 'sin_apuesta':
      return `Nadie ha apostado: pasar es gratis. La élite elegiría sobre todo ${lectura.jugadaElite}.`
  }
}
