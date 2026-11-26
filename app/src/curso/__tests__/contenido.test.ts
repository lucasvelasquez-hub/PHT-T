/**
 * Valida TODO el contenido real del Módulo 1: lecciones, casos y evaluaciones.
 * Se corre con `npm run validar-curso`. Los errores se listan por archivo.
 */
import { describe, expect, it } from 'vitest'
import { cargarCurso } from '../carga.ts'
import { leerContenido } from '../carga.ts'
import { validarCaso } from '../escenario.ts'

describe('contenido real del curso', () => {
  const contenido = leerContenido()

  it('las 66 lecciones cargan con título, minutos y pantallas', () => {
    const errores: string[] = []
    for (const { leccion, avisos } of contenido.lecciones) {
      for (const a of avisos) errores.push(`${leccion.id}: ${a}`)
      if (!leccion.minutos) errores.push(`${leccion.id}: sin minutos`)
      if (!leccion.pantallas.length) errores.push(`${leccion.id}: sin pantallas`)
    }
    const pantallas = contenido.lecciones.reduce((s, l) => s + l.leccion.pantallas.length, 0)
    process.stdout.write(`Lecciones: ${contenido.lecciones.length}, pantallas: ${pantallas}, casos: ${contenido.casos.length}, preguntas: ${contenido.preguntas.length}
`)
    expect(errores, errores.join('\n')).toEqual([])
    expect(contenido.lecciones.length).toBe(66)
  })

  it('los casos son válidos (si ya existen)', () => {
    const errores: string[] = []
    const ids = new Set<string>()
    for (const c of contenido.casos) {
      if (ids.has(c.id)) errores.push(`${c.archivo}: id repetido ${c.id}`)
      ids.add(c.id)
      for (const e of validarCaso(c)) errores.push(`${c.archivo} [${c.id || '?'}]: ${e}`)
    }
    expect(errores, '\n' + errores.join('\n')).toEqual([])
  })

  it('las preguntas de evaluación son válidas (si ya existen)', () => {
    const errores: string[] = []
    const ids = new Set<string>()
    const lecciones = new Set(contenido.lecciones.map((l) => l.leccion.id))
    for (const { archivo, pregunta: p } of contenido.preguntas) {
      const donde = `${archivo} [${p.id || '?'}]`
      if (ids.has(p.id)) errores.push(`${donde}: id repetido`)
      ids.add(p.id)
      if (!p.id || !p.enunciado || !p.explicacion) errores.push(`${donde}: faltan id, enunciado o explicacion`)
      if (!lecciones.has(p.leccion)) errores.push(`${donde}: la lección "${p.leccion}" no existe`)
      if (p.formato === 'numero' && typeof p.correcta !== 'number') errores.push(`${donde}: correcta no es un número ("${p.correcta}")`)
      if (p.formato === 'opciones') {
        if (!p.opciones || p.opciones.length < 2) errores.push(`${donde}: faltan opciones`)
        else if (!p.opciones.includes(String(p.correcta))) errores.push(`${donde}: correcta "${p.correcta}" no es una de las opciones`)
      }
    }
    expect(errores, '\n' + errores.join('\n')).toEqual([])
  })

  it('cargarCurso arma los módulos', async () => {
    const curso = await cargarCurso()
    expect(curso.modulos.reduce((s, m) => s + m.lecciones.length, 0)).toBe(66)
  })
})
