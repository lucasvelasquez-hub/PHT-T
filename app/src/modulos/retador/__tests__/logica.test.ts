import { describe, expect, it } from 'vitest'
import {
  DATOS_INICIALES, MANOS_RETO, MANOS_SESION, botonDeMano, cerrarSesion, decisionARevisar, divisionDeElite, estiloFrenteElite,
  formatearCarta, formatearFichas, hashTexto, leerDatos, mejorDeHoy, mejorDecision, nivelDePuntaje, precisionMedia,
  puntajeDecision, resumirSesion, semillaDeMano, semillaDelDia, sesionVigente, type DatosRetador, type DecisionRegistrada,
  type ProbabilidadesElite,
} from '../logica.ts'

const elite = (fold: number, checkCall: number, betRaise: number): ProbabilidadesElite => ({ fold, checkCall, betRaise })
const dec = (puntos: number, e: ProbabilidadesElite, accion: DecisionRegistrada['accion'] = 'cc', mano = 1): DecisionRegistrada =>
  ({ mano, calle: 0, posicion: 'BTN', accion, puntos, elite: e })

describe('puntaje de una decisión', () => {
  it('es 100 × la probabilidad de la élite para la acción elegida, redondeado', () => {
    expect(puntajeDecision('cbr', elite(0.1, 0.2, 0.7))).toBe(70)
    expect(puntajeDecision('f', elite(0.1, 0.2, 0.7))).toBe(10)
    expect(puntajeDecision('cc', elite(0.333, 0.3336, 0.3334))).toBe(33)
    expect(puntajeDecision('cc', elite(0.1, 0.205, 0.695))).toBe(21)
  })
  it('da 0 si la élite no hace eso nunca, y tolera cifras fuera de rango', () => {
    expect(puntajeDecision('f', elite(0, 0.4, 0.6))).toBe(0)
    expect(puntajeDecision('f', elite(1.3, 0, 0))).toBe(100)
    expect(puntajeDecision('f', elite(Number.NaN, 0, 0))).toBe(0)
  })
  it('las etiquetas cambian en 60 y en 30', () => {
    expect(nivelDePuntaje(100)).toBe('alto')
    expect(nivelDePuntaje(60)).toBe('alto')
    expect(nivelDePuntaje(59)).toBe('medio')
    expect(nivelDePuntaje(30)).toBe('medio')
    expect(nivelDePuntaje(29)).toBe('bajo')
    expect(nivelDePuntaje(0)).toBe('bajo')
  })
})

describe('precisión élite', () => {
  it('es el promedio de los puntajes', () => {
    expect(precisionMedia([])).toBeNull()
    expect(precisionMedia([dec(70, elite(0, 0, 1)), dec(20, elite(0, 0, 1)), dec(45, elite(0, 0, 1))])).toBe(45)
    expect(precisionMedia([dec(70, elite(0, 0, 1)), dec(71, elite(0, 0, 1))])).toBe(71)
  })
})

describe('mejor decisión y decisión a revisar', () => {
  it('la mejor es la que coincide con la élite donde estaba más dividida, no la más obvia', () => {
    const obvia = dec(98, elite(0.98, 0.01, 0.01), 'f', 1)
    const dividida = dec(62, elite(0.1, 0.62, 0.28), 'cc', 2)
    const baja = dec(10, elite(0.1, 0.1, 0.8), 'f', 3)
    expect(divisionDeElite(dividida.elite)).toBeGreaterThan(divisionDeElite(obvia.elite))
    expect(mejorDecision([obvia, dividida, baja])).toBe(dividida)
  })
  it('si ninguna llega a 60 toma la de más puntos, pero solo si pasa de 30', () => {
    const a = dec(45, elite(0.3, 0.45, 0.25), 'cc', 1)
    const b = dec(40, elite(0.4, 0.4, 0.2), 'f', 2)
    expect(mejorDecision([b, a])).toBe(a)
    expect(mejorDecision([dec(20, elite(0.8, 0.2, 0), 'cc'), dec(5, elite(0.9, 0.05, 0.05), 'cc')])).toBeNull()
    expect(mejorDecision([])).toBeNull()
  })
  it('a revisar es la de menos puntos, y no aparece si todas fueron como la élite', () => {
    const a = dec(12, elite(0.12, 0.3, 0.58), 'f', 1)
    const b = dec(3, elite(0.03, 0.2, 0.77), 'f', 2)
    expect(decisionARevisar([a, b])).toBe(b)
    expect(decisionARevisar([dec(80, elite(0.8, 0.1, 0.1), 'f'), dec(60, elite(0.6, 0.2, 0.2), 'f')])).toBeNull()
  })
  it('a revisar, ante un empate, toma aquella donde la élite estaba más segura', () => {
    const a = dec(0, elite(0, 0.5, 0.5), 'f', 1)
    const b = dec(0, elite(0, 0.05, 0.95), 'f', 2)
    expect(decisionARevisar([a, b])).toBe(b)
  })
})

describe('tu estilo frente a la élite', () => {
  const ronda = (acciones: DecisionRegistrada['accion'][], e: ProbabilidadesElite) => acciones.map((a, i) => dec(0, e, a, i + 1))

  it('dice "más agresivo" cuando la diferencia llega a 10 puntos', () => {
    // el jugador sube 6 de 10 (60 %); la élite habría subido 40 %
    const ds = ronda(['cbr', 'cbr', 'cbr', 'cbr', 'cbr', 'cbr', 'cc', 'cc', 'cc', 'f'], elite(0.2, 0.4, 0.4))
    const e = estiloFrenteElite(ds)
    expect(e.jugador.raise).toBe(60)
    expect(e.elite.raise).toBe(40)
    expect(e.raise).toBe('mas')
    expect(e.titulo).toContain('más agresivo')
  })
  it('dice "más pasivo" cuando sube 10 puntos menos', () => {
    const ds = ronda(['cc', 'cc', 'cc', 'cc', 'cc', 'cc', 'cc', 'cc', 'cbr', 'cbr'], elite(0.1, 0.4, 0.5))
    const e = estiloFrenteElite(ds)
    expect(e.raise).toBe('menos')
    expect(e.titulo).toContain('más pasivo')
  })
  it('9 puntos de diferencia todavía es "parecido"', () => {
    // sube 5 de 10 (50 %) frente a 41 %
    const ds = ronda(['cbr', 'cbr', 'cbr', 'cbr', 'cbr', 'cc', 'cc', 'cc', 'cc', 'cc'], elite(0.18, 0.41, 0.41))
    expect(estiloFrenteElite(ds).raise).toBe('parecido')
  })
  it('compara también los Fold', () => {
    const ds = ronda(['f', 'f', 'f', 'f', 'f', 'f', 'cc', 'cc', 'cc', 'cc'], elite(0.3, 0.5, 0.2))
    const e = estiloFrenteElite(ds)
    expect(e.jugador.fold).toBe(60)
    expect(e.elite.fold).toBe(30)
    expect(e.fold).toBe('mas')
  })
  it('con muy pocas decisiones no saca ninguna frase', () => {
    const e = estiloFrenteElite(ronda(['cbr', 'cbr'], elite(0, 0, 1)))
    expect(e.suficiente).toBe(false)
    expect(e.fraseRaise).toBe('')
    expect(e.raise).toBe('parecido')
  })
})

describe('reto del día', () => {
  it('la semilla sale solo de la fecha local: mismo día, mismas manos', () => {
    const a = semillaDelDia(new Date(2026, 10, 26, 8, 0, 0))
    const b = semillaDelDia(new Date(2026, 10, 26, 23, 59, 0))
    const c = semillaDelDia(new Date(2026, 10, 27, 0, 1, 0))
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(Number.isInteger(a)).toBe(true)
    expect(a).toBeGreaterThanOrEqual(0)
    expect(a).toBeLessThan(2 ** 31)
  })
  it('las manos de un mismo reto tienen semillas distintas y repetibles, y el botón rota', () => {
    const base = semillaDelDia(new Date(2026, 10, 26))
    const semillas = Array.from({ length: MANOS_RETO }, (_, i) => semillaDeMano(base, i))
    expect(new Set(semillas).size).toBe(MANOS_RETO)
    expect(semillas).toEqual(Array.from({ length: MANOS_RETO }, (_, i) => semillaDeMano(base, i)))
    const botones = Array.from({ length: 6 }, (_, i) => botonDeMano(base, i))
    expect(new Set(botones).size).toBe(6)
    expect(botonDeMano(base, 6)).toBe(botonDeMano(base, 0))
    for (const b of botones) expect(b >= 0 && b <= 5).toBe(true)
  })
  it('hashTexto es estable', () => {
    expect(hashTexto('hola')).toBe(hashTexto('hola'))
    expect(hashTexto('hola')).not.toBe(hashTexto('hola!'))
  })
})

describe('resumen, récord y lo guardado', () => {
  const diez = Array.from({ length: MANOS_SESION }, (_, i) => dec(60 + (i % 2) * 10, elite(0.1, 0.2, 0.7), 'cbr', i + 1))

  it('resume precisión, fichas y XP', () => {
    const r = resumirSesion('sesion', diez, 4.5)
    expect(r.precision).toBe(65)
    expect(r.fichasBB).toBe(4.5)
    expect(r.xp).toBe(650)
    expect(r.n).toBe(10)
  })

  it('la primera sesión fija el récord y una mejor lo bate; una peor no', () => {
    const r1 = resumirSesion('sesion', diez, 0)
    const a = cerrarSesion(DATOS_INICIALES, r1, '2026-11-26')
    expect(a.datos.record).toBe(65)
    expect(a.record).toEqual({ anterior: null, batido: true, primero: true })
    const peor = resumirSesion('sesion', diez.map((d) => ({ ...d, puntos: 20 })), 0)
    const b = cerrarSesion(a.datos, peor, '2026-11-26')
    expect(b.datos.record).toBe(65)
    expect(b.record.batido).toBe(false)
    const mejor = resumirSesion('sesion', diez.map((d) => ({ ...d, puntos: 90 })), 0)
    const c = cerrarSesion(a.datos, mejor, '2026-11-26')
    expect(c.datos.record).toBe(90)
    expect(c.record).toEqual({ anterior: 65, batido: true, primero: false })
  })

  it('el reto guarda el mejor del día, sin tocar el récord de la sesión', () => {
    const inicio: DatosRetador = { ...DATOS_INICIALES, record: 80 }
    const reto = resumirSesion('reto', diez.slice(0, 5), 1)
    const a = cerrarSesion(inicio, reto, '2026-11-26')
    expect(a.datos.record).toBe(80)
    expect(mejorDeHoy(a.datos, '2026-11-26')).toBe(a.datos.mejorReto!.puntaje)
    expect(mejorDeHoy(a.datos, '2026-11-27')).toBeNull()
    // al día siguiente, el primero vuelve a contar
    const b = cerrarSesion(a.datos, reto, '2026-11-27')
    expect(b.record.primero).toBe(true)
  })

  it('cerrar la sesión limpia lo que estaba en curso y no cambia los datos originales', () => {
    const datos: DatosRetador = { ...DATOS_INICIALES, enCurso: { tipo: 'sesion', semillaBase: 1, total: 10, siguiente: 3, decisiones: [], fichasBB: 0 } }
    const { datos: nuevos } = cerrarSesion(datos, resumirSesion('sesion', diez, 0), '2026-11-26')
    expect(nuevos.enCurso).toBeNull()
    expect(datos.enCurso).not.toBeNull()
  })

  it('un reto guardado de otro día ya no vale', () => {
    const datos: DatosRetador = { ...DATOS_INICIALES, enCurso: { tipo: 'reto', dia: '2026-11-25', semillaBase: 1, total: 5, siguiente: 2, decisiones: [], fichasBB: 0 } }
    expect(sesionVigente(datos, '2026-11-25')).not.toBeNull()
    expect(sesionVigente(datos, '2026-11-26')).toBeNull()
  })

  it('lee lo guardado con tolerancia', () => {
    expect(leerDatos(null)).toEqual(DATOS_INICIALES)
    expect(leerDatos('basura')).toEqual(DATOS_INICIALES)
    const datos = leerDatos({
      record: 71.4, mejorReto: { dia: '2026-11-26', puntaje: 55 }, avisoSubidaVisto: true,
      enCurso: {
        tipo: 'sesion', semillaBase: 123, total: 10, siguiente: 4, fichasBB: -2.5,
        decisiones: [
          { mano: 1, calle: 0, posicion: 'BTN', accion: 'cbr', puntos: 70, elite: { fold: 0.1, checkCall: 0.2, betRaise: 0.7 }, cartas: ['Ah', 'Kd'] },
          { mano: 2, calle: 9, posicion: 'BTN', accion: 'cbr', puntos: 70, elite: { fold: 0.1, checkCall: 0.2, betRaise: 0.7 } },
        ],
      },
    })
    expect(datos.record).toBe(71)
    expect(datos.avisoSubidaVisto).toBe(true)
    expect(datos.enCurso?.decisiones).toHaveLength(1) // la dañada se descarta
    expect(datos.enCurso?.siguiente).toBe(4)
    expect(leerDatos({ enCurso: { tipo: 'otra' } }).enCurso).toBeNull()
  })
})

describe('texto', () => {
  it('formatea cartas y fichas', () => {
    expect(formatearCarta('Ah')).toBe('A♥')
    expect(formatearCarta('Td')).toBe('10♦')
    expect(formatearFichas(0)).toBe('0')
    expect(formatearFichas(4.5)).toBe('+4.5')
    expect(formatearFichas(-3)).toBe('−3')
    expect(formatearFichas(0.04)).toBe('0')
  })
})
