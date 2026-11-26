/**
 * Puerta de entrada del frente Juego (sección 3.4 de docs/CONTRATOS_JUGABILIDAD.md): la mesa en vivo.
 *
 *   <MesaEnVivo semilla boton mostrarLecturas ... />   una mano completa jugable
 *   <ManoGuiada onTerminar />                          la mano de práctica de la bienvenida
 *   crearAzar(semilla)                                 números repetibles en [0, 1)
 *   precalentarMotor()                                 carga la red y la tabla en segundo plano (idempotente)
 */
export { crearAzar } from './azar.ts'
export { precalentarMotor } from './analista.ts'
export { MesaEnVivo } from './MesaEnVivo.tsx'
export { ManoGuiada } from './ManoGuiada.tsx'
export { GUION_PRACTICA } from './guionPractica.ts'
export type {
  DecisionHeroe, EscenarioInicial, EventoHistorial, GuionMano, HistorialMano, LecturaDecision, PasoGuion, PropsMesaEnVivo, ResultadoMano,
} from './tipos.ts'
