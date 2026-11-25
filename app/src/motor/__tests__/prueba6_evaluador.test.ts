/**
 * Prueba 6: el evaluador de la app coincide 100 % con treys en las 3,000 manos de prueba_evaluador.json
 * (1,000 de 5 cartas, 1,000 de 6 y 1,000 de 7), tanto en puntaje como en clase de mano.
 */
import { describe, expect, it } from 'vitest'
import { cartaAEntero, enteroACarta, BARAJA } from '../cartas.ts'
import { claseDePuntaje, evaluar, evaluarEnteros } from '../evaluador.ts'
import { leerJson, reportar } from './ayudas.ts'

interface ManoEval { cartas: string[]; puntaje: number; clase: number }

describe('Prueba 6 · evaluador vs treys', () => {
  const datos = leerJson<{ manos: ManoEval[] }>('prueba_evaluador.json')

  it('puntaje y clase idénticos en las 3,000 manos', () => {
    let malPuntaje = 0
    let malClase = 0
    const porN: Record<number, number> = {}
    for (const m of datos.manos) {
      const puntaje = evaluarEnteros(m.cartas.map(cartaAEntero))
      if (puntaje !== m.puntaje) malPuntaje++
      if (claseDePuntaje(puntaje) !== m.clase) malClase++
      porN[m.cartas.length] = (porN[m.cartas.length] ?? 0) + 1
    }
    reportar('P6', `manos=${datos.manos.length} (por nº de cartas ${JSON.stringify(porN)}) | puntajes distintos=${malPuntaje} | clases distintas=${malClase}`)
    expect(datos.manos.length).toBe(3000)
    expect(malPuntaje).toBe(0)
    expect(malClase).toBe(0)
  })

  it('el puntaje no depende del orden de las cartas', () => {
    for (const m of datos.manos.filter((_, i) => i % 50 === 0)) {
      expect(evaluarEnteros(m.cartas.slice().reverse().map(cartaAEntero))).toBe(m.puntaje)
    }
  })

  it('escalera real = puntaje 1 y clase 0; la peor mano = 7462 y clase 9', () => {
    const real = evaluar(['As', 'Ks'], ['Qs', 'Js', 'Ts'])
    expect(real).toBe(1)
    expect(claseDePuntaje(real)).toBe(0)
    const peor = evaluar(['7s', '5d'], ['4c', '3h', '2s'])
    expect(peor).toBe(7462)
    expect(claseDePuntaje(peor)).toBe(9)
  })

  it('la codificación de cartas es reversible', () => {
    for (const c of BARAJA) expect(enteroACarta(cartaAEntero(c))).toBe(c)
    // Valor conocido de treys: Card.new('As') = 268442665
    expect(cartaAEntero('As')).toBe(268442665)
  })
})
