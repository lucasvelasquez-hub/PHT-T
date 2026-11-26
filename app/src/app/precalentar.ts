/**
 * Precalentamiento del motor: al mostrar la portada se llama una vez a `precalentarMotor()` de `src/juego/index.ts`
 * (si el frente Juego ya lo exporta). Con `import.meta.glob` el import es dinámico y no falla si falta el archivo o la función.
 */
const cargadores = import.meta.glob('../juego/index.ts') as Record<string, () => Promise<{ precalentarMotor?: () => unknown }>>
let hecho = false

export function precalentar(): void {
  if (hecho) return
  hecho = true
  const cargar = Object.values(cargadores)[0]
  if (!cargar) return
  cargar()
    .then((m) => m.precalentarMotor?.())
    .catch(() => { /* sin motor todavía: no pasa nada */ })
}
