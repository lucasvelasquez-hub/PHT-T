import { describe, expect, it } from 'vitest'
import { extraerBloques, leerCaso, leerPregunta } from '../bloques.ts'
import { construirEscenarioCaso, validarCaso } from '../escenario.ts'
import { leerLeccion } from '../carga.ts'
import { turnoActual } from '../../motor/mano.ts'

const EJEMPLO = `
\`\`\`caso
id: u07-c02
titulo: Proyecto de color frente a una apuesta pequeña
tipo: matematica
calle: flop
heroe: BTN
cartas_heroe: Ah 5h
mesa: Kh 9h 2c
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB fold
  flop: CO apuesta 3
bote_esperado: 9.5
pregunta: El CO apuesta 3 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: [Call, Raise]
explicacion: Pagar cuesta 3 para ganar 9.5.
por_opcion:
  Fold: Retirarte regala la mano.
\`\`\`
`

function caso(texto = EJEMPLO) { return leerCaso(extraerBloques(texto, ['caso'])[0]!.lineas, 'prueba') }
function con(cambios: Record<string, string>) {
  let t = EJEMPLO
  for (const [de, a] of Object.entries(cambios)) t = t.replace(de, a)
  return caso(t)
}

describe('casos', () => {
  it('el ejemplo de REQUISITOS 5.5 es válido y el bote es 9.5', () => {
    const c = caso()
    expect(c.correcta).toEqual(['Call', 'Raise'])
    expect(c.porOpcion.Fold).toContain('regala')
    expect(validarCaso(c)).toEqual([])
    const e = construirEscenarioCaso(c)
    expect(e.estado.bote).toBe(9.5)
    expect(e.estado.tablero).toEqual(['Kh', '9h', '2c'])
    expect(turnoActual(e.estado)).toBe(e.asientoHeroe)
    expect(e.asientoHeroe).toBe(5)
    expect(e.cartasHeroe).toEqual(['Ah', '5h'])
  })

  it('detecta bote distinto', () => {
    expect(validarCaso(con({ 'bote_esperado: 9.5': 'bote_esperado: 10' })).join()).toMatch(/bote_esperado/)
  })

  it('detecta Check ilegal entre las opciones decision', () => {
    expect(validarCaso(con({ '[Fold, Call, Raise]': '[Fold, Check, Raise]' })).join()).toMatch(/"Check" ilegal/)
  })

  it('detecta acciones ilegales (fuera de turno, check con apuesta, subida mínima)', () => {
    expect(validarCaso(con({ 'UTG, HJ fold; CO sube 2.5': 'UTG, HJ fold; BTN sube 2.5' })).join()).toMatch(/acción ilegal/)
    expect(validarCaso(con({ 'flop: CO apuesta 3': 'flop: CO check; BTN apuesta 3' })).join()).toMatch(/no le toca al héroe/)
    expect(validarCaso(con({ 'CO sube 2.5': 'CO sube 1.2' })).join()).toMatch(/acción ilegal/)
    expect(validarCaso(con({ 'BTN paga; SB fold': 'BTN check; SB fold' })).join()).toMatch(/no puede hacer check/)
  })

  it('detecta cartas repetidas, mal escritas y mesa con el número equivocado', () => {
    expect(validarCaso(con({ 'Kh 9h 2c': 'Kh 9h Ah' })).join()).toMatch(/repetida/)
    expect(validarCaso(con({ 'Kh 9h 2c': 'Kh 9h 2x' })).join()).toMatch(/mal escrita/)
    expect(validarCaso(con({ 'Kh 9h 2c': 'Kh 9h 2c 3d' })).join()).toMatch(/necesita 3 cartas/)
  })

  it('preflop con ciegas, stacks cortos y all-in', () => {
    const c = leerCaso([
      'id: m01-c01', 'titulo: t', 'tipo: concepto', 'calle: preflop', 'heroe: BB', 'cartas_heroe: Ad Kd',
      'stacks: BTN 20, resto 100',
      'accion:', '  preflop: UTG, HJ, CO fold; BTN all-in; SB fold',
      'bote_esperado: 21.5', 'pregunta: ¿Qué haces?', 'formato: decision', 'opciones: [Fold, Call, Raise]',
      'correcta: [Call]', 'explicacion: x',
    ])
    expect(validarCaso(c)).toEqual([])
    expect(construirEscenarioCaso(c).estado.bote).toBe(21.5)
    // Con stack 20 y all-in, el héroe puede subir; con un all-in más corto que la ciega no.
    expect(validarCaso({ ...c, opciones: ['Fold', 'Check'], correcta: ['Fold'] }).join()).toMatch(/"Check" ilegal/)
  })

  it('detecta si no le toca al héroe', () => {
    expect(validarCaso(con({ 'CO sube 2.5; BTN paga; SB fold; BB fold': 'CO sube 2.5' })).join()).toMatch(/acción ilegal/)
  })
})

describe('preguntas y lecciones', () => {
  it('lee una pregunta numérica y una de opciones', () => {
    const [a, b] = extraerBloques(
      '```pregunta\nid: m04-p02\nleccion: M04_L02\nformato: numero\nenunciado: ¿?\ncorrecta: 25\ntolerancia: 1\nunidad: %\nexplicacion: ok\n```\n' +
      '```pregunta\nid: m04-p03\nleccion: M04_L02\nformato: opciones\nenunciado: ¿?\nopciones: [A, B, C]\ncorrecta: B\nexplicacion: ok\n```',
      ['pregunta'],
    )
    const p = leerPregunta(a!.lineas)
    expect(p).toMatchObject({ id: 'm04-p02', formato: 'numero', correcta: 25, tolerancia: 1, unidad: '%' })
    expect(leerPregunta(b!.lineas)).toMatchObject({ formato: 'opciones', opciones: ['A', 'B', 'C'], correcta: 'B' })
  })

  it('divide una lección en pantallas y lee minutos', () => {
    const { leccion, avisos } = leerLeccion('M04_L02', '# 4.2 Pot odds\n\n*Módulo 4 · Lección 2 · 8 minutos*\n\n## Gancho\n\nHola **mundo**\n\n## La idea\n\n> cita\n')
    expect(avisos).toEqual([])
    expect(leccion).toMatchObject({ id: 'M04_L02', modulo: 4, numero: 2, titulo: 'Pot odds', minutos: 8 })
    expect(leccion.pantallas.map((p) => p.titulo)).toEqual(['Gancho', 'La idea'])
    expect(leccion.pantallas[0]!.html).toContain('<strong>mundo</strong>')
  })
})
