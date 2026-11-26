/** Títulos de los módulos, copiados de las líneas "### Módulo N — …" de contenido_modulo1/curso/ESTRUCTURA_CURRICULAR.md §4 (sin marcas de cursiva). */
export const TITULOS_MODULO: Readonly<Record<number, string>> = {
  0: 'Primeros pasos antes de tu primera mano',
  1: 'La mesa, el EV y la suerte',
  2: 'Abrir el bote antes del flop',
  3: 'Matemáticas de bolsillo: outs y regla del 2 y del 4',
  4: '¿Pago o me retiro? Equity, pot odds e implied odds',
  5: 'Defender antes del flop y set-mining',
  6: 'La apuesta de continuación (c-bet)',
  7: 'Apostar por valor',
  8: 'Defensa después del flop',
  9: 'Faroles y semifaroles',
  10: '3-bet y botes grandes',
  11: 'Mente y hábitos',
  12: 'Puente a GTO',
}

/** El módulo 12 es opcional (así lo dice la estructura curricular). */
export const MODULO_OPCIONAL = 12

export function tituloDeModulo(numero: number, respaldo = ''): string {
  return TITULOS_MODULO[numero] ?? (respaldo || `Módulo ${numero}`)
}
