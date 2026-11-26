import { describe, expect, it } from 'vitest'
import { crearSonido, EVENTOS, type Reproductor } from './sonido.ts'

function falso(falla: 'ninguna' | 'play' | 'crear' = 'ninguna') {
  const jugados: string[] = []
  const crear = (url: string): Reproductor => {
    if (falla === 'crear') throw new Error('sin audio')
    const r: Reproductor = {
      volume: 1, currentTime: 0,
      play: () => (falla === 'play' ? Promise.reject(new Error('archivo inexistente')) : (jugados.push(url), Promise.resolve())),
      cloneNode: () => r,
      addEventListener: () => {},
      load: () => {},
    }
    return r
  }
  return { crear, jugados }
}

describe('sonido', () => {
  it('reproduce el archivo del evento', () => {
    const f = falso()
    crearSonido({ activo: () => true, crear: f.crear }).reproducir('ficha')
    expect(f.jugados).toEqual(['/sonidos/ficha.mp3'])
  })
  it('no suena si el ajuste está apagado', () => {
    const f = falso()
    crearSonido({ activo: () => false, crear: f.crear }).reproducir('ficha')
    expect(f.jugados).toEqual([])
  })
  it('no falla si el archivo no existe (play rechaza) ni si no hay audio', async () => {
    const s = crearSonido({ activo: () => true, crear: falso('play').crear })
    expect(() => s.reproducir('carta')).not.toThrow()
    await Promise.resolve()
    expect(() => crearSonido({ activo: () => true, crear: falso('crear').crear }).reproducir('carta')).not.toThrow()
    expect(() => crearSonido({ activo: () => { throw new Error('x') }, crear: falso().crear }).reproducir('carta')).not.toThrow()
  })
  it('precarga todos los eventos', () => {
    const urls: string[] = []
    const s = crearSonido({ activo: () => true, crear: (u) => { urls.push(u); return falso().crear(u) } })
    s.precargar()
    expect(urls).toHaveLength(EVENTOS.length)
    expect(urls).toContain('/sonidos/subir_rango.mp3')
  })
})
