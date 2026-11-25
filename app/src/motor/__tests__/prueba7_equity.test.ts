/**
 * Prueba 7: el Monte Carlo de la app da la misma equity que Python en las 200 situaciones de prueba_equity.json
 * (20,000 simulaciones en Python). Criterio: |equity_ts − equity_py| ≤ 4 × sqrt(se_py² + se_ts²) en TODAS.
 * Como no se reproduce bit a bit (otro generador aleatorio), se compara dentro del margen estadístico.
 */
import { describe, expect, it } from 'vitest'
import { crearRng, simularEquity } from '../equidad.ts'
import { leerJson, reportar } from './ayudas.ts'

interface SituacionEq {
  id: number; calle: number; rivales: number; cartas: string[]; mesa: string[]
  equity: number; error_estandar: number
}

const SIMULACIONES_TS = 20000

describe('Prueba 7 · equity TypeScript vs Python', () => {
  it('las 200 situaciones caen dentro de ±4 errores estándar combinados', () => {
    const datos = leerJson<{ situaciones: SituacionEq[] }>('prueba_equity.json')
    const t0 = Date.now()
    const zs: number[] = []
    const fallos: string[] = []
    const porCalle: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [] }
    for (const s of datos.situaciones) {
      const r = simularEquity(s.cartas, s.mesa, s.rivales, { simulaciones: SIMULACIONES_TS, rng: crearRng(7000 + s.id) })
      const se = Math.sqrt(s.error_estandar ** 2 + r.errorEstandar ** 2)
      // Si los dos errores son 0 (por ejemplo, el río con la mejor mano posible) basta con que coincidan
      const z = se === 0 ? (r.equity === s.equity ? 0 : Infinity) : (r.equity - s.equity) / se
      zs.push(z)
      porCalle[s.calle]!.push(Math.abs(z))
      if (Math.abs(z) > 4) fallos.push(`id ${s.id}: ts=${r.equity.toFixed(4)} py=${s.equity.toFixed(4)} z=${z.toFixed(2)}`)
    }
    const abs = zs.map(Math.abs)
    const zMax = Math.max(...abs)
    const media = abs.reduce((a, b) => a + b, 0) / abs.length
    const sesgo = zs.reduce((a, b) => a + b, 0) / zs.length
    const maxPorCalle = Object.entries(porCalle).map(([c, v]) => `calle ${c}: ${Math.max(...v).toFixed(2)}`).join(' | ')
    reportar('P7', `situaciones=${zs.length} | simulaciones TS=${SIMULACIONES_TS} (Python 20000) | |z| máximo=${zMax.toFixed(3)} | |z| promedio=${media.toFixed(3)} (esperado ≈ 0.8) | z medio con signo=${sesgo.toFixed(3)} | ${maxPorCalle} | fuera de ±4: ${fallos.length} | ${((Date.now() - t0) / 1000).toFixed(1)} s`)
    expect(zs.length).toBe(200)
    expect(fallos).toEqual([])
  })

  it('es reproducible con la misma semilla y distinto con otra', () => {
    const a = simularEquity(['Ac', 'Kc'], ['Qc', '9c', '2s'], 1, { simulaciones: 500, rng: crearRng(1) })
    const b = simularEquity(['Ac', 'Kc'], ['Qc', '9c', '2s'], 1, { simulaciones: 500, rng: crearRng(1) })
    const c = simularEquity(['Ac', 'Kc'], ['Qc', '9c', '2s'], 1, { simulaciones: 500, rng: crearRng(2) })
    expect(a).toEqual(b)
    expect(a.equity).not.toBe(c.equity)
  })
})
