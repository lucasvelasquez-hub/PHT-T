import { describe, expect, it } from 'vitest'
import { hashDesdeRuta, rutaDesdeHash, type Ruta } from './navegacion.ts'

describe('navegación por hash', () => {
  const rutas: Ruta[] = [
    { pantalla: 'portada' }, { pantalla: 'bienvenida' }, { pantalla: 'inicio' }, { pantalla: 'retador' },
    { pantalla: 'instructor' }, { pantalla: 'instructor', leccion: 'M04_L02' },
    { pantalla: 'analista' }, { pantalla: 'analista', mano: 12 }, { pantalla: 'ajustes' }, { pantalla: 'creditos' },
  ]
  it('ida y vuelta de todas las rutas', () => {
    for (const r of rutas) expect(rutaDesdeHash(hashDesdeRuta(r))).toEqual(r)
  })
  it('hash vacío o desconocido cae en la portada', () => {
    expect(rutaDesdeHash('')).toEqual({ pantalla: 'portada' })
    expect(rutaDesdeHash('#')).toEqual({ pantalla: 'portada' })
    expect(rutaDesdeHash('#/nada')).toEqual({ pantalla: 'portada' })
  })
  it('acepta el hash sin barra y un número de mano inválido se ignora', () => {
    expect(rutaDesdeHash('#inicio')).toEqual({ pantalla: 'inicio' })
    expect(rutaDesdeHash('#/analista/abc')).toEqual({ pantalla: 'analista' })
    expect(rutaDesdeHash('#/analista/-3')).toEqual({ pantalla: 'analista' })
    expect(rutaDesdeHash('#/instructor/%E0%A4%A')).toEqual({ pantalla: 'instructor' })
  })
})
