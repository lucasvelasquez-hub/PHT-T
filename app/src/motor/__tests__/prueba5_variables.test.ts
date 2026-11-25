/**
 * Prueba 5: las 47 variables que calcula la app desde los datos CRUDOS de cada mano coinciden con Python.
 *
 *  - referencia_golden.json (1,000 situaciones): las 46 variables deterministas deben ser IGUALES bit a bit
 *    (float64 exacto). `c_equity` preflop también es exacta (sale de la tabla). `c_equity` postflop es Monte
 *    Carlo (150 simulaciones en Python): se compara dentro del margen estadístico (±4 errores estándar).
 *  - banco_manos_reales.json (1,849 manos, 16,599 decisiones): las 46 deterministas contra los valores del
 *    banco, que están redondeados a 5 decimales (diferencia permitida: medio redondeo = 5e-6).
 */
import { describe, expect, it } from 'vitest'
import { crearRng, simularEquity, type TablaPreflop } from '../equidad.ts'
import { manoDeBanco, parsearPHH, reconstruirDecisiones, CODIGO_ACCION, type ManoCruda, type ManoDeBanco } from '../phh.ts'
import { NOMBRES_VARIABLES, variablesCartas, type ContextoVariables } from '../variables.ts'
import { leerJson, reportar } from './ayudas.ts'

const tabla = leerJson<TablaPreflop>('equity_preflop_169.json')
const SIN_EQUITY: ContextoVariables = { tabla, equity: 'omitir' }
const DETERMINISTAS = NOMBRES_VARIABLES.filter((v) => v !== 'c_equity')

interface SituacionGolden {
  id: number; hand_key: number; indice_accion: number; orden_decision: number; asiento: string
  cartas: string; mesa: string; calle: number; accion_real: number
  variables: Record<string, number>
}
interface ManoGolden {
  archivo: string; texto_phh: string; jugadores: string[]; stacks_iniciales: number[]
  ciegas_o_straddles: number[]; acciones: string[]
}

describe('Prueba 5 · variables de la app vs Python', () => {
  const golden = leerJson<{
    metadatos: { orden_variables: string[] }
    manos: Record<string, ManoGolden>
    situaciones: SituacionGolden[]
  }>('referencia_golden.json')

  it('el orden de las 47 variables coincide con el golden y con modelo4_preparacion.json', () => {
    const prep = leerJson<{ variables: string[] }>('modelo4_preparacion.json')
    expect([...NOMBRES_VARIABLES]).toEqual(golden.metadatos.orden_variables)
    expect([...NOMBRES_VARIABLES]).toEqual(prep.variables)
    expect(NOMBRES_VARIABLES.length).toBe(47)
  })

  it('parsearPHH lee el texto PHH igual que los campos estructurados del golden', () => {
    for (const [k, m] of Object.entries(golden.manos)) {
      const p = parsearPHH(m.texto_phh, Number(k))
      expect(p.jugadores).toEqual(m.jugadores)
      expect(p.stacksIniciales).toEqual(m.stacks_iniciales)
      expect(p.ciegas).toEqual(m.ciegas_o_straddles)
      expect(p.acciones).toEqual(m.acciones)
    }
  })

  it('golden: 1,000 situaciones, 46 variables idénticas y c_equity dentro del margen', () => {
    const cache = new Map<string, ReturnType<typeof reconstruirDecisiones>>()
    const crudaDe = (k: number): ManoCruda => {
      const m = golden.manos[String(k)]!
      return { jugadores: m.jugadores, stacksIniciales: m.stacks_iniciales, ciegas: m.ciegas_o_straddles, acciones: m.acciones, claveMano: k }
    }
    let variablesComparadas = 0
    const diferencias: string[] = []
    let preflopEquityIguales = 0
    let preflopTotal = 0
    const zs: number[] = []
    const SIMS_TS = 4000
    const SIMS_PY = 150
    const t0 = Date.now()

    for (const s of golden.situaciones) {
      const clave = String(s.hand_key)
      if (!cache.has(clave)) cache.set(clave, reconstruirDecisiones(crudaDe(s.hand_key), SIN_EQUITY))
      const dec = cache.get(clave)!.decisiones.find((d) => d.indiceAccion === s.indice_accion)
      if (!dec) { diferencias.push(`id ${s.id}: no se encontró la decisión en el índice ${s.indice_accion}`); continue }
      if (dec.cartas !== s.cartas || dec.mesa !== s.mesa || dec.calle !== s.calle || dec.accion !== s.accion_real) {
        diferencias.push(`id ${s.id}: cartas/mesa/calle/acción distintas`)
      }
      for (const nombre of DETERMINISTAS) {
        variablesComparadas++
        const ts = dec.variables[nombre]
        const py = s.variables[nombre]!
        if (!Object.is(ts, py) && ts !== py) diferencias.push(`id ${s.id} ${nombre}: ts=${ts} py=${py}`)
      }
      // c_equity
      if (s.calle === 0) {
        preflopTotal++
        if (dec.variables.c_equity === s.variables.c_equity) preflopEquityIguales++
        else diferencias.push(`id ${s.id} c_equity preflop: ts=${dec.variables.c_equity} py=${s.variables.c_equity}`)
      } else {
        // Monte Carlo con la misma situación (cartas, mesa y rivales que usó la decisión)
        const r = simularEquity(dec.cartas.match(/../g)!, dec.mesa.match(/../g)!, dec.foto.rivales, { simulaciones: SIMS_TS, rng: crearRng(5000 + s.id) })
        const varianza = r.errorEstandar ** 2 * SIMS_TS
        const se = Math.sqrt(varianza / SIMS_PY + r.errorEstandar ** 2)
        const diff = r.equity - s.variables.c_equity!
        zs.push(se === 0 ? (diff === 0 ? 0 : Infinity) : diff / se)
      }
    }
    const abs = zs.map(Math.abs)
    const zMax = Math.max(...abs)
    const zMedio = zs.reduce((a, b) => a + b, 0) / zs.length
    const z2 = zs.reduce((a, b) => a + b * b, 0) / zs.length
    reportar(
      'P5-golden',
      `situaciones=${golden.situaciones.length} | manos=${cache.size} | variables deterministas comparadas=${variablesComparadas} (46 por situación) | diferencias=${diferencias.length} | ` +
        `c_equity preflop idéntica ${preflopEquityIguales}/${preflopTotal} | c_equity postflop (MC): n=${zs.length}, |z| máx=${zMax.toFixed(2)}, z medio=${zMedio.toFixed(3)}, z² medio=${z2.toFixed(2)} (esperado ≈ 1; TS ${SIMS_TS} sims vs Python ${SIMS_PY}) | ${((Date.now() - t0) / 1000).toFixed(1)} s`,
    )
    expect(golden.situaciones.length).toBe(1000)
    expect(diferencias).toEqual([])
    expect(preflopEquityIguales).toBe(preflopTotal)
    expect(zMax).toBeLessThanOrEqual(4)
    expect(Math.abs(zMedio)).toBeLessThan(0.2) // sin sesgo: 5 errores estándar de la media de ~750 valores
  })

  it('banco de manos reales: 46 variables en todas las decisiones (tolerancia = redondeo a 5 decimales)', () => {
    const banco = leerJson<{ meta: { n_manos: number; n_decisiones: number; orden_variables: string[] }; manos: (ManoDeBanco & { d: [number, number, number[], number[]][] })[] }>(
      'banco_manos_reales.json',
    )
    const orden = banco.meta.orden_variables
    expect(orden).toEqual([...NOMBRES_VARIABLES])
    let decisiones = 0
    let maxDif = 0
    let peor = ''
    const problemas: string[] = []
    const t0 = Date.now()
    for (const m of banco.manos) {
      const { decisiones: dec } = reconstruirDecisiones(manoDeBanco(m), SIN_EQUITY)
      if (dec.length !== m.d.length) { problemas.push(`mano ${m.k}: ${dec.length} decisiones vs ${m.d.length}`); continue }
      dec.forEach((d, i) => {
        const [indiceA, accionReal, vars] = m.d[i]!
        decisiones++
        if (indiceA !== i || accionReal !== CODIGO_ACCION[d.tipo]) problemas.push(`mano ${m.k} decisión ${i}: índice/acción distintos`)
        orden.forEach((nombre, j) => {
          if (nombre === 'c_equity') return
          const dif = Math.abs(d.variables[nombre as keyof typeof d.variables] - vars[j]!)
          if (dif > maxDif) { maxDif = dif; peor = `mano ${m.k} dec ${i} ${nombre}` }
          if (dif > 5.1e-6) problemas.push(`mano ${m.k} dec ${i} ${nombre}: ts=${d.variables[nombre as keyof typeof d.variables]} banco=${vars[j]}`)
        })
        if (d.calle === 0 && Math.abs(d.variables.c_equity - vars[orden.indexOf('c_equity')]!) > 5.1e-6) {
          problemas.push(`mano ${m.k} dec ${i} c_equity preflop distinta`)
        }
      })
    }
    reportar(
      'P5-banco',
      `manos=${banco.manos.length} | decisiones=${decisiones} (esperadas ${banco.meta.n_decisiones}) | diferencia máxima en las 46 variables=${maxDif.toExponential(2)} (${peor}; límite 5e-6 por el redondeo del banco) | problemas=${problemas.length} | ${((Date.now() - t0) / 1000).toFixed(1)} s`,
    )
    expect(banco.manos.length).toBe(banco.meta.n_manos)
    expect(decisiones).toBe(banco.meta.n_decisiones)
    expect(problemas.slice(0, 10)).toEqual([])
  })

  it('variablesCartas: AcKc en Qc9c2s contra 1 rival (ejemplo del Notebook 12)', () => {
    const v = variablesCartas(['Ac', 'Kc'], ['Qc', '9c', '2s'], 1, { tabla, simulaciones: 3000, rng: crearRng(1) })
    expect(v.c_alta).toBe(14)
    expect(v.c_baja).toBe(13)
    expect(v.c_suited).toBe(1)
    expect(v.c_proy_color).toBe(1)
    expect(v.c_equity).toBeGreaterThan(0.5)
  })
})
