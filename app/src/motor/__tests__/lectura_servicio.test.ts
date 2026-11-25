/**
 * Lectura conjunta (misma lógica que el Notebook 12) y servicio del Worker (probado en Node, sin Worker).
 */
import { describe, expect, it } from 'vitest'
import { lecturaConjunta, type CodigoLectura } from '../lectura.ts'
import { crearMano, repartirCalle, repartirPrivadas, aplicarAccion } from '../mano.ts'
import { crearServicio } from '../servicio.ts'
import type { Ort } from '../red.ts'
import { leerBytes, leerJson, reportar } from './ayudas.ts'

const palabrasProhibidas = /[oó]ptim|correcta|gto/i

describe('Lectura conjunta', () => {
  const p = (fold: number, call: number, raise: number) => ({ fold, call, raise })
  const casos: [string, Parameters<typeof lecturaConjunta>[0], CodigoLectura][] = [
    ['sin apuesta', { equity: 0.5, potOdds: 0, aPagar: 0, prediccion: p(0.1, 0.2, 0.7) }, 'sin_apuesta'],
    ['rentable y la élite se retira', { equity: 0.45, potOdds: 0.3, aPagar: 100, prediccion: p(0.8, 0.15, 0.05) }, 'matematica_paga_elite_se_retira'],
    ['rentable y la élite continúa', { equity: 0.6, potOdds: 0.3, aPagar: 100, prediccion: p(0.1, 0.8, 0.1) }, 'coinciden_continuar'],
    ['no rentable y la élite se retira', { equity: 0.2, potOdds: 0.3, aPagar: 100, prediccion: p(0.9, 0.05, 0.05) }, 'coinciden_retirarse'],
    ['no rentable pero la élite continúa', { equity: 0.2, potOdds: 0.3, aPagar: 100, prediccion: p(0.1, 0.2, 0.7) }, 'precio_alto_elite_continua'],
    ['equity justo igual a pot odds cuenta como rentable', { equity: 0.3, potOdds: 0.3, aPagar: 100, prediccion: p(0.1, 0.8, 0.1) }, 'coinciden_continuar'],
  ]
  for (const [nombre, entrada, codigo] of casos) {
    it(nombre, () => {
      const l = lecturaConjunta(entrada)
      expect(l.codigo).toBe(codigo)
      expect(l.texto + l.titulo).not.toMatch(palabrasProhibidas)
    })
  }

  it('el empate de probabilidades elige la primera acción (como numpy.argmax)', () => {
    expect(lecturaConjunta({ equity: 0.5, potOdds: 0, aPagar: 0, prediccion: p(0.4, 0.4, 0.2) }).jugadaElite).toBe('Fold')
  })
})

describe('Servicio del Worker (en Node)', () => {
  const servicio = crearServicio({
    ort: async () => (await import('onnxruntime-web')) as unknown as Ort,
    json: async (n) => leerJson(n),
    bytes: async (n) => leerBytes(n),
    proveedores: ['wasm'],
  })

  it('iniciar, equity (tabla y Monte Carlo) y predecir', async () => {
    const ini = await servicio.manejar({ tipo: 'iniciar', modelos: [4, 1] })
    expect(ini.modelosCargados).toEqual([1, 4])
    const pre = await servicio.manejar({ tipo: 'equity', cartas: ['As', 'Ad'], mesa: [], rivales: 1 })
    expect(pre.origen).toBe('tabla')
    expect(pre.equity).toBeGreaterThan(0.84)
    const post = await servicio.manejar({ tipo: 'equity', cartas: ['Ac', 'Kc'], mesa: ['Qc', '9c', '2s'], rivales: 1, simulaciones: 3000, semilla: 3 })
    expect(post.origen).toBe('monte_carlo')
    expect(post.equity).toBeGreaterThan(0.6)
    expect(post.equity).toBeLessThan(0.85)
    const golden = leerJson<{ situaciones: { variables: Record<string, number>; probabilidades_keras: number[] }[] }>('referencia_golden.json')
    const s = golden.situaciones[10]!
    const { predicciones } = await servicio.manejar({ tipo: 'predecir', filas: [s.variables] })
    expect(Math.abs(predicciones[0]!.fold - s.probabilidades_keras[0]!)).toBeLessThan(1e-5)
  })

  it('analizar: variables + equity + red + lectura de una decisión en vivo', async () => {
    const manos = ['AhKh', 'QsJs', '7c2d', '9h9d', 'Ts8s', 'KcQd']
    const e2 = crearMano({ jugadores: ['A', 'B', 'C', 'D', 'E', 'F'], stacks: new Array(6).fill(10000), ciegas: [50, 100, 0, 0, 0, 0] })
    manos.forEach((m, i) => repartirPrivadas(e2, i, [m.slice(0, 2), m.slice(2)]))
    for (const a of [2, 3, 4]) aplicarAccion(e2, { asiento: a, tipo: 'f' })
    aplicarAccion(e2, { asiento: 5, tipo: 'cbr', hasta: 300 })
    aplicarAccion(e2, { asiento: 0, tipo: 'f' })
    aplicarAccion(e2, { asiento: 1, tipo: 'cc' })
    repartirCalle(e2, ['Ah', '7s', '2h'])
    aplicarAccion(e2, { asiento: 1, tipo: 'cc' }) // la ciega grande pasa
    const r = await servicio.manejar({ tipo: 'analizar', estado: e2, asiento: 5, simulaciones: 2000, semilla: 11 })
    reportar('Servicio', `analizar → equity=${(r.variables.c_equity * 100).toFixed(1)} % | pot_odds=${r.variables.pot_odds} | red=${JSON.stringify(r.prediccion)} | lectura=${r.lectura.codigo}`)
    expect(r.variables.calle).toBe(1)
    expect(r.variables.c_equity).toBeGreaterThan(0)
    expect(r.prediccion.fold + r.prediccion.call + r.prediccion.raise).toBeCloseTo(1, 5)
    expect(r.lectura.codigo).toBe('sin_apuesta') // nadie apostó en el flop
    // Mismo estado y semilla -> mismo resultado (reproducible)
    const r2 = await servicio.manejar({ tipo: 'analizar', estado: e2, asiento: 5, simulaciones: 2000, semilla: 11 })
    expect(r2.variables.c_equity).toBe(r.variables.c_equity)
  })
})
