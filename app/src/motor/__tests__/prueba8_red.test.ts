/**
 * Prueba 8: preparación (TypeScript) + ONNX sobre las variables del golden dan las MISMAS probabilidades que
 * Keras en Python: diferencia máxima ≤ 1e-5 y misma acción elegida en el 100 % de las 1,000 situaciones.
 * Se corre con onnxruntime-node y con onnxruntime-web (wasm, el mismo que usa el navegador).
 */
import { describe, expect, it } from 'vitest'
import { argmax, crearRed, type Ort, type RedOnnx } from '../red.ts'
import { prepararLote, type Preparacion } from '../preparacion.ts'
import { leerBytes, leerJson, reportar } from './ayudas.ts'

interface Situacion {
  id: number
  variables: Record<string, number>
  vector_preparado: number[]
  probabilidades_keras: number[]
}

const prep = leerJson<Preparacion>('modelo4_preparacion.json')
const golden = leerJson<{ situaciones: Situacion[] }>('referencia_golden.json')

async function evaluarRed(nombre: string, ort: Ort, proveedores: string[]): Promise<void> {
  const red: RedOnnx = await crearRed(ort, leerBytes('modelo4.onnx'), prep, { proveedores })
  const sit = golden.situaciones
  const filas = sit.map((s) => s.variables)
  const t0 = Date.now()
  const probs = await red.predecir(filas)
  const ms = Date.now() - t0

  let difProb = 0
  let coincide = 0
  let sumaDif = 0
  for (let i = 0; i < sit.length; i++) {
    const k = sit[i]!.probabilidades_keras
    const p = probs[i]!
    const dif = Math.max(Math.abs(p.fold - Math.fround(k[0]!)), Math.abs(p.call - Math.fround(k[1]!)), Math.abs(p.raise - Math.fround(k[2]!)))
    difProb = Math.max(difProb, dif)
    sumaDif += dif
    const argK = k[0]! >= k[1]! && k[0]! >= k[2]! ? 0 : k[1]! >= k[2]! ? 1 : 2
    if (argmax(p) === argK) coincide++
  }

  // Informativo: el vector preparado por TypeScript contra el de Python (sklearn en float32)
  const d = prep.n_variables
  const vectores = prepararLote(filas, prep)
  let difVec = 0
  sit.forEach((s, i) => {
    for (let j = 0; j < d; j++) difVec = Math.max(difVec, Math.abs(vectores[i * d + j]! - Math.fround(s.vector_preparado[j]!)))
  })

  reportar(
    'P8',
    `${nombre} | situaciones=${sit.length} | diferencia máxima de probabilidad vs Keras=${difProb.toExponential(2)} (criterio ≤ 1e-5) | diferencia media=${(sumaDif / sit.length).toExponential(2)} | ` +
      `misma acción ${coincide}/${sit.length} (${((coincide / sit.length) * 100).toFixed(2)} %) | informativo: vector preparado TS vs Python máx=${difVec.toExponential(2)} | inferencia del lote: ${ms} ms`,
  )
  expect(sit.length).toBe(1000)
  expect(difProb).toBeLessThanOrEqual(1e-5)
  expect(coincide).toBe(sit.length)
  // Las probabilidades suman 1
  for (const p of probs) expect(Math.abs(p.fold + p.call + p.raise - 1)).toBeLessThan(1e-5)
  await red.liberar()
}

describe('Prueba 8 · preparación + ONNX vs Keras', () => {
  it('onnxruntime-node', async () => {
    const ort = (await import('onnxruntime-node')) as unknown as Ort
    await evaluarRed('onnxruntime-node', ort, ['cpu'])
  })

  it('onnxruntime-web (wasm)', async () => {
    const ort = (await import('onnxruntime-web')) as unknown as Ort
    await evaluarRed('onnxruntime-web (wasm)', ort, ['wasm'])
  })

  it('la preparación aplica log1p con tope en 0 solo a las 7 variables de dinero', () => {
    expect(prep.variables_log).toEqual(['bote_bb', 'to_call_bb', 'stack_bb', 'eff_bb', 'spr', 'invertido_bb', 'ult_apuesta_vs_bote'])
    const fila = Object.fromEntries(prep.variables.map((v, i) => [v, prep.escalador.mean[i]!]))
    // Una variable con log1p: con x = 0 el resultado es (0 − media)/escala; con x negativo, igual (tope en 0)
    const a = prepararLote([{ ...fila, bote_bb: 0 }], prep)
    const b = prepararLote([{ ...fila, bote_bb: -5 }], prep)
    expect(a[prep.variables.indexOf('bote_bb')]).toBe(b[prep.variables.indexOf('bote_bb')])
  })
})
