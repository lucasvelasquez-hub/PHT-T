/**
 * Creditos: el texto de atribución que exige la licencia LGPL 3.0 del mazo (Vectorized Playing Cards 3.2,
 * Chris Aguilar), más la línea de las imágenes generadas con IA. Se muestra dentro de la hoja de ajustes.
 */
export function Creditos() {
  return (
    <section className="creditos" aria-labelledby="creditos-titulo">
      <h3 id="creditos-titulo" className="hoja__subtitulo">Créditos</h3>
      <p className="creditos__texto">
        Cartas: Vectorized Playing Cards 3.2 — Copyright 2011, 2024 Chris Aguilar — conjurenation@gmail.com — Licensed under LGPL 3.0 (
        <a href="https://www.gnu.org/licenses/lgpl-3.0.html" target="_blank" rel="noreferrer noopener">https://www.gnu.org/licenses/lgpl-3.0.html</a>
        ) —{' '}
        <a href="https://totalnonsense.com/open-source-vector-playing-cards/" target="_blank" rel="noreferrer noopener">https://totalnonsense.com/open-source-vector-playing-cards/</a>
      </p>
      <p className="creditos__texto">Imágenes generadas con IA para Next Chip: mesa, fichas y avatares. El dorso de las cartas es diseño propio.</p>
      <p className="creditos__texto creditos__texto--suave">
        Manos reales: Pluribus (Brown y Sandholm, Science 2019), licencia MIT. Tipografía: Barlow, licencia SIL OFL.
      </p>
    </section>
  )
}
