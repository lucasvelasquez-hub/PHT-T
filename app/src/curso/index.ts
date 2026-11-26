/** API pública del curso (contrato §3.5). */
export type { Curso, Modulo, Leccion, Pantalla, Pregunta, Caso } from './tipos.ts'
export { cargarCurso } from './carga.ts'
export { construirEscenarioCaso, validarCaso } from './escenario.ts'
