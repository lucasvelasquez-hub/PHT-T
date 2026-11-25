// Corre Vitest y escribe la sección 5.2 de modelo_transformado/CONVERSION_Y_VERIFICACION.md con las cifras
// que imprimen las pruebas (líneas "[REPORTE ...]"). Nada se escribe a mano: si alguna prueba falla, no se toca el archivo.
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const raiz = join(import.meta.dirname, '..')
const ruta = join(raiz, 'modelo_transformado', 'CONVERSION_Y_VERIFICACION.md')
const r = spawnSync('npx', ['vitest', 'run', '--reporter=verbose'], { cwd: raiz, encoding: 'utf-8', shell: true, maxBuffer: 1 << 28 })
const salida = (r.stdout ?? '') + (r.stderr ?? '')
if (r.status !== 0) {
  console.error(salida.split('\n').slice(-40).join('\n'))
  console.error('\nHay pruebas que fallan: no se modifica el informe.')
  process.exit(1)
}
const reportes = new Map()
for (const linea of salida.split('\n')) {
  const m = /^\[REPORTE ([^\]]+)\] (.*)$/.exec(linea.trim())
  if (m) reportes.set(m[1] + (reportes.has(m[1]) ? ' (2)' : ''), m[2])
}
const resumen = /Tests\s+(\d+) passed/.exec(salida)?.[1]
const archivos = /Test Files\s+(\d+) passed/.exec(salida)?.[1]
const version = (n) => JSON.parse(readFileSync(join(raiz, 'node_modules', n, 'package.json'), 'utf-8')).version

const filas = [
  ['5', 'Variables: golden (1,000 situaciones)', '46 variables idénticas; c_equity preflop idéntica; c_equity postflop dentro de ±4 errores estándar', 'P5-golden'],
  ['5', 'Variables: banco de manos reales', '46 variables en todas las decisiones (tolerancia: redondeo del banco a 5 decimales)', 'P5-banco'],
  ['6', 'Evaluador vs treys (3,000 manos)', 'Puntaje y clase 100 % iguales', 'P6'],
  ['7', 'Equity vs Python (200 situaciones)', '\\|equity_ts − equity_py\\| ≤ 4 × √(ee_py² + ee_ts²) en todas', 'P7'],
  ['8', 'Predicción final vs Keras (onnxruntime-node)', 'Diferencia ≤ 1e-5 y misma acción en el 100 %', 'P8'],
  ['8', 'Predicción final vs Keras (onnxruntime-web, wasm)', 'Diferencia ≤ 1e-5 y misma acción en el 100 %', 'P8 (2)'],
  ['extra', 'Turnos y calles contra manos reales', 'El turno y el reparto de calle del motor coinciden con el PHH', 'Turnos'],
  ['extra', 'Manos generadas con acciones legales', 'Fichas conservadas; mismas 47 variables en vivo que al reconstruir el PHH', 'Vivo'],
  ['extra', 'Servicio del Worker (analizar)', 'Variables + equity + red + lectura conjunta', 'Servicio'],
]
const celda = (t) => (t ?? '(sin cifra)').split(' | ').join('<br>').replaceAll('|', '\\|')
const tabla = filas.map(([n, p, c, k]) => `| ${n} | ${p} | ${c} | ${celda(reportes.get(k))} |`).join('\n')

const seccion = `### 5.2 App (pruebas 5–8)
Cifras impresas por Vitest sobre el motor TypeScript de \`app/src/motor/\` (generado con \`npm run informe\` en \`app/\`; ninguna cifra se escribe a mano). Resultado de Vitest: **${resumen} pruebas aprobadas en ${archivos} archivos**. Versiones: vitest ${version('vitest')}, onnxruntime-web ${version('onnxruntime-web')}, onnxruntime-node ${version('onnxruntime-node')}.

| # | Prueba | Criterio | Resultado |
|---|---|---|---|
${tabla}

- La prueba 5 parte de los datos CRUDOS de cada mano (acciones PHH, stacks, ciegas y cartas), recalcula las variables con el motor TypeScript y las compara con las que calculó Python (golden = parquet de test, verificado en el Notebook 13).
- \`c_equity\` postflop es Monte Carlo (150 simulaciones en Python, más en TypeScript): se compara dentro del margen estadístico; no se reproduce bit a bit.
- La prueba 8 se corre con el mismo \`modelo4.onnx\` en dos entornos: onnxruntime-node (CPU) y onnxruntime-web (wasm, el que usa el navegador).

`
const md = readFileSync(ruta, 'utf-8')
const ini = md.indexOf('### 5.2 App')
const fin = md.indexOf('### 5.3')
if (ini < 0 || fin < 0) throw new Error('No se encontraron las secciones 5.2 y 5.3')
writeFileSync(ruta, md.slice(0, ini) + seccion + md.slice(fin))
console.log('Sección 5.2 actualizada.')
