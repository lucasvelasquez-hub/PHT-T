/**
 * La mano de demo (hand_key 1687, decisión del flop de MrBlue) se arma bien desde el banco, y las lecturas
 * calculadas EN VIVO (equity Monte Carlo + red ONNX + lectura conjunta) coinciden con las que guardó el banco.
 */
import { describe, expect, it } from 'vitest'
import { crearServicio, type Ort } from '../../motor/index.ts'
import { leerBytes, leerJson, reportar } from '../../motor/__tests__/ayudas.ts'
import { comentarioDe } from '../datos/comentario.ts'
import { construirEscenario, type BancoManos } from '../datos/escenario.ts'

describe('Mesa de demo: mano 1687', () => {
  const banco = leerJson<BancoManos>('banco_manos_reales.json')
  const e = construirEscenario(banco, 1687)

  it('arma la mesa como la mano real', () => {
    expect(e.heroe.nombre).toBe('MrBlue')
    expect(e.cartasHeroe).toEqual(['Qd', '8c'])
    expect(e.tablero).toEqual(['7h', 'Qs', 'Kc'])
    expect(e.calle).toBe('FLOP')
    expect(e.boteBB).toBe(13)
    expect(e.aPagarBB).toBe(6.5)
    expect(e.rivales.map((r) => r.nombre)).toEqual(['MrOrange', 'MrPink', 'Pluribus', 'MrWhite', 'MrBlonde'])
    const pluribus = e.rivales[2]!
    expect(pluribus.etiqueta).toBe('BET')
    expect(pluribus.apuestaBB).toBe(6.5)
    expect(e.rivales.map((r) => r.activo)).toEqual([true, false, true, false, false])
  })

  it('las lecturas en vivo coinciden con las del banco', async () => {
    const servicio = crearServicio({
      ort: async () => (await import('onnxruntime-web')) as unknown as Ort,
      json: async (n) => leerJson(n),
      bytes: async (n) => leerBytes(n),
      proveedores: ['wasm'],
    })
    const r = await servicio.manejar({ tipo: 'analizar', estado: e.estado, asiento: e.heroe.indice, simulaciones: 12000, semilla: 1687 })
    const m = banco.manos.find((x) => x.k === 1687)!
    const dec = m.d.find((x) => x[0] === e.indiceDecision)!
    const orden = banco.meta.orden_variables

    // 1) Las 46 variables deterministas (todas menos la equity Monte Carlo) son idénticas a las del banco.
    for (const [i, nombre] of orden.entries()) {
      if (nombre === 'c_equity') continue
      expect(Math.abs(r.variables[nombre as keyof typeof r.variables] - dec[2][i]!), nombre).toBeLessThan(2e-4)
    }
    // 2) La red con las variables del banco reproduce sus probabilidades (mismo ONNX).
    const { predicciones } = await servicio.manejar({ tipo: 'predecir', filas: [dec[2]] })
    expect(Math.abs(predicciones[0]!.fold - e.banco.prediccion.fold)).toBeLessThan(2e-4)
    expect(Math.abs(predicciones[0]!.call - e.banco.prediccion.call)).toBeLessThan(2e-4)
    // 3) La equity del banco es un Monte Carlo corto (0.61667 = 185/300, error estándar ~0.03): la de aquí cae
    //    dentro de ese margen. La red depende de la equity, así que sus % se mueven con ella.
    const eqVivo = r.variables.c_equity
    reportar('UI', `equity vivo ${eqVivo.toFixed(4)} (banco ${e.banco.equity}); élite vivo F/C/R ${r.prediccion.fold.toFixed(4)}/${r.prediccion.call.toFixed(4)}/${r.prediccion.raise.toFixed(4)} (banco ${e.banco.prediccion.fold}/${e.banco.prediccion.call}/${e.banco.prediccion.raise}); red con variables del banco ${predicciones[0]!.fold.toFixed(5)}`)
    expect(Math.abs(eqVivo - e.banco.equity)).toBeLessThan(2 * 0.03)
    expect(Math.abs(r.variables.pot_odds - e.banco.potOdds)).toBeLessThan(1e-4)
    expect(r.lectura.codigo).toBe('matematica_paga_elite_se_retira')
    const linea = comentarioDe(r.lectura, r.prediccion)
    expect(linea).toMatch(/[0-9]+\s% de ganar.*[0-9]+\s%/)
    expect(linea).not.toMatch(/[oó]ptim|correcta|gto|[^a-z]ev[^a-z]/i)
  })
})
