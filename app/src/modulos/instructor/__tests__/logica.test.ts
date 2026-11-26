import { describe, expect, it } from 'vitest'
import {
  calificarCaso, calificarDecision, cartasATexto, calificarPregunta, desplazamiento, ESTADO_INICIAL, estrellas, estrellasDeModulo, leerNumero,
  nodoSiguienteA, nodosDeModulo, normalizarEstado, porcentaje, registrarRepaso, semillaDeCaso, siguienteRecomendado, textoDeAccion,
  type EstadoInstructor, type ItemRepaso, type ModuloMin,
} from '../logica.ts'

const mod = (numero: number, lecciones: number, evaluacion = 2, casos = 3): ModuloMin => ({
  numero,
  lecciones: Array.from({ length: lecciones }, (_, i) => ({ id: `M${String(numero).padStart(2, '0')}_L${String(i + 1).padStart(2, '0')}` })),
  evaluacion: Array.from({ length: evaluacion }, (_, i) => ({ id: `m${numero}-p${i}` })),
  casos: Array.from({ length: casos }, (_, i) => ({ id: `m${numero}-c${i}` })),
})

describe('estrellas', () => {
  const base = { leccionesHechas: 0, leccionesTotal: 4, evaluacionPct: null, casos: null }
  it('0 sin nada', () => expect(estrellas(base)).toBe(0))
  it('1 al completar las lecciones', () => {
    expect(estrellas({ ...base, leccionesHechas: 3 })).toBe(0)
    expect(estrellas({ ...base, leccionesHechas: 4 })).toBe(1)
  })
  it('la evaluación da estrella desde el 80 %', () => {
    expect(estrellas({ ...base, evaluacionPct: 79 })).toBe(0)
    expect(estrellas({ ...base, evaluacionPct: 80 })).toBe(1)
    expect(estrellas({ ...base, leccionesHechas: 4, evaluacionPct: 90 })).toBe(2)
  })
  it('los casos dan estrella con 2/3 o más', () => {
    expect(estrellas({ ...base, casos: { aciertos: 3, total: 6 } })).toBe(0)
    expect(estrellas({ ...base, casos: { aciertos: 4, total: 6 } })).toBe(1)
    expect(estrellas({ ...base, casos: { aciertos: 2, total: 3 } })).toBe(1)
    expect(estrellas({ ...base, casos: { aciertos: 1, total: 2 } })).toBe(0)
    expect(estrellas({ ...base, casos: { aciertos: 2, total: 2 } })).toBe(1)
  })
  it('tres estrellas con todo', () => {
    expect(estrellas({ leccionesHechas: 4, leccionesTotal: 4, evaluacionPct: 100, casos: { aciertos: 6, total: 6 } })).toBe(3)
  })
  it('un módulo sin lecciones no regala la primera estrella', () => {
    expect(estrellas({ leccionesHechas: 0, leccionesTotal: 0, evaluacionPct: null, casos: null })).toBe(0)
  })
  it('estrellasDeModulo lee el estado guardado', () => {
    const m = mod(4, 2, 5, 6)
    const e: EstadoInstructor = { ...ESTADO_INICIAL, lecciones: ['M04_L01', 'M04_L02'], evaluaciones: { '4': 85 }, pruebas: { '4': { aciertos: 3, total: 6 } } }
    expect(estrellasDeModulo(e, m)).toBe(2)
    expect(estrellasDeModulo({ ...e, pruebas: { '4': { aciertos: 4, total: 6 } } }, m)).toBe(3)
  })
})

describe('calificar preguntas', () => {
  it('opciones: compara el texto sin importar espacios ni mayúsculas', () => {
    const p = { id: 'a', formato: 'opciones' as const, correcta: 'Gana el rival con escalera' }
    expect(calificarPregunta(p, 'Gana el rival con escalera')).toBe(true)
    expect(calificarPregunta(p, '  gana el  rival con escalera ')).toBe(true)
    expect(calificarPregunta(p, 'Gana tú')).toBe(false)
  })
  it('numero: usa la tolerancia', () => {
    const p = { id: 'b', formato: 'numero' as const, correcta: 25, tolerancia: 1 }
    expect(calificarPregunta(p, '25')).toBe(true)
    expect(calificarPregunta(p, '24')).toBe(true)
    expect(calificarPregunta(p, '26,0')).toBe(true)
    expect(calificarPregunta(p, '26.5')).toBe(false)
    expect(calificarPregunta(p, 27)).toBe(false)
  })
  it('numero: sin tolerancia pide el valor exacto y acepta decimales', () => {
    const p = { id: 'c', formato: 'numero' as const, correcta: 17.5 }
    expect(calificarPregunta(p, '17.5')).toBe(true)
    expect(calificarPregunta(p, '17,5 bb')).toBe(false)
    expect(calificarPregunta(p, '17')).toBe(false)
  })
  it('numero: texto que no es número no acierta', () => {
    const p = { id: 'd', formato: 'numero' as const, correcta: 45, tolerancia: 0 }
    expect(calificarPregunta(p, '')).toBe(false)
    expect(calificarPregunta(p, 'abc')).toBe(false)
  })
  it('leerNumero acepta $, % y coma decimal', () => {
    expect(leerNumero('$45')).toBe(45)
    expect(leerNumero('16,7 %')).toBe(16.7)
    expect(leerNumero('-3')).toBe(-3)
    expect(leerNumero('1,2,3')).toBeNull()
    expect(leerNumero('')).toBeNull()
  })
  it('porcentaje', () => {
    expect(porcentaje(8, 10)).toBe(80)
    expect(porcentaje(2, 3)).toBe(67)
    expect(porcentaje(0, 0)).toBe(0)
  })
})

describe('calificar casos', () => {
  const caso = { id: 'm04-c01', opciones: ['Fold', 'Call', 'Raise'], correcta: ['Fold'] }
  it('traduce la acción de la mesa al texto de la opción', () => {
    expect(textoDeAccion('f', caso.opciones)).toBe('Fold')
    expect(textoDeAccion('cc', caso.opciones)).toBe('Call')
    expect(textoDeAccion('cbr', caso.opciones)).toBe('Raise')
    expect(textoDeAccion('cc', ['Check', 'Bet'])).toBe('Check')
    expect(textoDeAccion('cbr', ['Check', 'Bet'])).toBe('Bet')
  })
  it('acierta con la acción esperada y falla con otra', () => {
    expect(calificarDecision(caso, 'f')).toEqual({ texto: 'Fold', acierto: true })
    expect(calificarDecision(caso, 'cc')).toEqual({ texto: 'Call', acierto: false })
  })
  it('admite varias respuestas esperadas', () => {
    const c = { ...caso, correcta: ['Fold', 'Call'] }
    expect(calificarDecision(c, 'cc').acierto).toBe(true)
    expect(calificarDecision(c, 'cbr').acierto).toBe(false)
    expect(calificarCaso(c, 'call')).toBe(true)
  })
})

describe('repaso', () => {
  const item = { tipo: 'pregunta' as const, id: 'm04-p02', modulo: 4 }
  it('un fallo mete el ítem con 0 aciertos', () => {
    expect(registrarRepaso([], item, false)).toEqual([{ ...item, aciertos: 0 }])
  })
  it('sale al acertar dos veces', () => {
    let r: ItemRepaso[] = registrarRepaso([], item, false)
    r = registrarRepaso(r, item, true)
    expect(r).toEqual([{ ...item, aciertos: 1 }])
    r = registrarRepaso(r, item, true)
    expect(r).toEqual([])
  })
  it('un fallo en medio reinicia la cuenta y no duplica', () => {
    let r: ItemRepaso[] = registrarRepaso([], item, false)
    r = registrarRepaso(r, item, true)
    r = registrarRepaso(r, item, false)
    expect(r).toEqual([{ ...item, aciertos: 0 }])
  })
  it('acertar algo que no estaba en el repaso no cambia nada', () => {
    const r: ItemRepaso[] = []
    expect(registrarRepaso(r, item, true)).toBe(r)
  })
  it('distingue preguntas y casos con el mismo id y no modifica la lista original', () => {
    const original: ItemRepaso[] = [{ ...item, aciertos: 1 }]
    const r = registrarRepaso(original, { tipo: 'caso', id: 'm04-p02', modulo: 4 }, false)
    expect(r).toHaveLength(2)
    expect(original).toEqual([{ ...item, aciertos: 1 }])
  })
})

describe('recorrido', () => {
  const modulos = [mod(0, 2), mod(1, 1)]
  it('los nodos van lecciones, evaluación y prueba', () => {
    expect(nodosDeModulo(modulos[0]!).map((n) => n.tipo)).toEqual(['leccion', 'leccion', 'evaluacion', 'prueba'])
    expect(nodosDeModulo(mod(2, 1, 0, 0)).map((n) => n.tipo)).toEqual(['leccion'])
  })
  it('recomienda el primer nodo sin hacer', () => {
    expect(siguienteRecomendado(modulos, ESTADO_INICIAL)).toEqual({ tipo: 'leccion', modulo: 0, id: 'M00_L01' })
    const e = { ...ESTADO_INICIAL, lecciones: ['M00_L01', 'M00_L02'] }
    expect(siguienteRecomendado(modulos, e)).toEqual({ tipo: 'evaluacion', modulo: 0 })
    const f = { ...e, evaluaciones: { '0': 50 }, pruebas: { '0': { aciertos: 1, total: 3 } } }
    expect(siguienteRecomendado(modulos, f)).toEqual({ tipo: 'leccion', modulo: 1, id: 'M01_L01' })
  })
  it('devuelve null cuando todo está hecho', () => {
    const e: EstadoInstructor = {
      ...ESTADO_INICIAL, lecciones: ['M00_L01', 'M00_L02', 'M01_L01'],
      evaluaciones: { '0': 100, '1': 100 }, pruebas: { '0': { aciertos: 3, total: 3 }, '1': { aciertos: 3, total: 3 } },
    }
    expect(siguienteRecomendado(modulos, e)).toBeNull()
  })
  it('el nodo siguiente cruza de módulo y termina en null', () => {
    expect(nodoSiguienteA(modulos, { tipo: 'leccion', modulo: 0, id: 'M00_L02' })).toEqual({ tipo: 'evaluacion', modulo: 0 })
    expect(nodoSiguienteA(modulos, { tipo: 'prueba', modulo: 0 })).toEqual({ tipo: 'leccion', modulo: 1, id: 'M01_L01' })
    expect(nodoSiguienteA(modulos, { tipo: 'prueba', modulo: 1 })).toBeNull()
  })
  it('el zigzag se repite cada 8 nodos', () => {
    expect(desplazamiento(0)).toBe(0)
    expect(desplazamiento(2)).toBe(1)
    expect(desplazamiento(8)).toBe(desplazamiento(0))
  })
})

describe('estado guardado y semilla', () => {
  it('lo dañado vuelve al estado inicial', () => {
    expect(normalizarEstado(null)).toEqual(ESTADO_INICIAL)
    expect(normalizarEstado('texto')).toEqual(ESTADO_INICIAL)
    expect(normalizarEstado({ lecciones: 5, evaluaciones: [], repaso: 'x', ultimo: 3 })).toEqual(ESTADO_INICIAL)
  })
  it('conserva lo válido y descarta lo roto', () => {
    const e = normalizarEstado({
      lecciones: ['M00_L01', 'M00_L01', 7],
      evaluaciones: { '0': 150, '1': 'x' },
      pruebas: { '0': { aciertos: 9, total: 3 }, '1': { aciertos: 1, total: 0 } },
      repaso: [{ tipo: 'caso', id: 'm01-c01', modulo: 1, aciertos: 1 }, { tipo: 'otro', id: 'z', modulo: 1 }],
      ultimo: { modulo: 3, leccion: 'M03_L02', pantalla: 'leccion', indice: 2 },
    })
    expect(e.lecciones).toEqual(['M00_L01'])
    expect(e.evaluaciones).toEqual({ '0': 100 })
    expect(e.pruebas).toEqual({ '0': { aciertos: 3, total: 3 } })
    expect(e.repaso).toEqual([{ tipo: 'caso', id: 'm01-c01', modulo: 1, aciertos: 1 }])
    expect(e.ultimo).toEqual({ modulo: 3, leccion: 'M03_L02', pantalla: 'leccion', indice: 2 })
  })
  it('la semilla del caso es estable', () => {
    expect(semillaDeCaso('m04-c01')).toBe(semillaDeCaso('m04-c01'))
    expect(semillaDeCaso('m04-c01')).not.toBe(semillaDeCaso('m04-c02'))
  })
})

describe('cartas en texto', () => {
  it('cambia las letras de palo por símbolos', () => {
    expect(cartasATexto('Ah 5h')).toBe('A♥ 5♥')
    expect(cartasATexto('Kh 9h 2c')).toBe('K♥ 9♥ 2♣')
    expect(cartasATexto('')).toBe('')
  })
})
