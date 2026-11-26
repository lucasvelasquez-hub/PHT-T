import { describe, expect, it } from 'vitest'
import {
  CLAVE, CLAVE_MAZO_LEGADO, crearProgreso, diaLocal, interpretar, marcarRacha, nombreValido, rachaVigente, rangoDe,
  type Almacenamiento,
} from './progreso.ts'

/** localStorage simulado en memoria. */
function almacenSimulado(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial))
  const a: Almacenamiento & { datos: Map<string, string> } = {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => { datos.set(k, v) },
  }
  return a
}
const fecha = (iso: string) => new Date(`${iso}T12:00:00`)

describe('rangoDe', () => {
  it('asigna rango y ficha en cada umbral', () => {
    expect(rangoDe(0)).toEqual({ indice: 0, nombre: 'Novato', ficha: 1, xpMin: 0, xpSiguiente: 1000 })
    expect(rangoDe(999).nombre).toBe('Novato')
    expect(rangoDe(1000)).toMatchObject({ nombre: 'Aprendiz', ficha: 5, xpSiguiente: 3000 })
    expect(rangoDe(3000)).toMatchObject({ nombre: 'Habitual', ficha: 10 })
    expect(rangoDe(6000)).toMatchObject({ nombre: 'Regular', ficha: 25 })
    expect(rangoDe(10000)).toMatchObject({ nombre: 'Profesional', ficha: 50 })
    expect(rangoDe(14999).nombre).toBe('Profesional')
  })
  it('Élite es el último: no hay siguiente', () => {
    expect(rangoDe(15000)).toMatchObject({ nombre: 'Élite', ficha: 100, xpSiguiente: null })
    expect(rangoDe(999999).nombre).toBe('Élite')
  })
  it('valores raros no rompen', () => {
    expect(rangoDe(-50).nombre).toBe('Novato')
    expect(rangoDe(Number.NaN).nombre).toBe('Novato')
  })
})

describe('racha', () => {
  const vacia = { actual: 0, mejor: 0, ultimoDia: null }
  it('la primera actividad empieza en 1', () => {
    expect(marcarRacha(vacia, '2026-11-26')).toEqual({ actual: 1, mejor: 1, ultimoDia: '2026-11-26' })
  })
  it('el mismo día no suma', () => {
    const r = { actual: 3, mejor: 3, ultimoDia: '2026-11-26' }
    expect(marcarRacha(r, '2026-11-26')).toBe(r)
  })
  it('el día siguiente suma 1, también al cruzar mes y año', () => {
    expect(marcarRacha({ actual: 3, mejor: 3, ultimoDia: '2026-11-26' }, '2026-11-27').actual).toBe(4)
    expect(marcarRacha({ actual: 2, mejor: 2, ultimoDia: '2026-11-30' }, '2026-12-01').actual).toBe(3)
    expect(marcarRacha({ actual: 5, mejor: 5, ultimoDia: '2026-12-31' }, '2027-01-01').actual).toBe(6)
  })
  it('si se rompe vuelve a 1 y conserva la mejor', () => {
    expect(marcarRacha({ actual: 7, mejor: 7, ultimoDia: '2026-11-20' }, '2026-11-26')).toEqual({ actual: 1, mejor: 7, ultimoDia: '2026-11-26' })
  })
  it('la mejor racha sube con la actual', () => {
    expect(marcarRacha({ actual: 4, mejor: 4, ultimoDia: '2026-11-25' }, '2026-11-26').mejor).toBe(5)
  })
  it('rachaVigente muestra 0 si pasó más de un día', () => {
    const r = { actual: 6, mejor: 6, ultimoDia: '2026-11-24' }
    expect(rachaVigente(r, '2026-11-24')).toBe(6)
    expect(rachaVigente(r, '2026-11-25')).toBe(6)
    expect(rachaVigente(r, '2026-11-26')).toBe(0)
  })
  it('diaLocal usa el día local con ceros', () => {
    expect(diaLocal(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('nombreValido', () => {
  it('recorta, compacta espacios y limita a 16', () => {
    expect(nombreValido('  Lucas  ')).toBe('Lucas')
    expect(nombreValido('a   b')).toBe('a b')
    expect(nombreValido('x'.repeat(30))).toBe('x'.repeat(16))
    expect(nombreValido('   ')).toBeNull()
  })
})

describe('guardado en localStorage', () => {
  it('guarda todo en la clave nextchip.v1 con version 1', () => {
    const a = almacenSimulado()
    const p = crearProgreso(() => a, () => fecha('2026-11-26'))
    p.definirPerfil({ nombre: 'Ana', invitado: false })
    const guardado = JSON.parse(a.datos.get(CLAVE)!)
    expect(guardado.version).toBe(1)
    expect(guardado.perfil).toEqual({ nombre: 'Ana', invitado: false })
  })

  it('lo guardado sobrevive a una "recarga" (nuevo almacén sobre el mismo storage)', () => {
    const a = almacenSimulado()
    const p1 = crearProgreso(() => a, () => fecha('2026-11-26'))
    p1.definirPerfil({ nombre: 'Ana', invitado: false })
    p1.sumarXP(1200)
    p1.marcarBienvenidaVista()
    p1.cambiarAjuste('sonido', false)
    p1.guardarSeccion('instructor', { leccion: 'M04_L02', pantalla: 3 })

    const p2 = crearProgreso(() => a, () => fecha('2026-11-26'))
    const v = p2.leer()
    expect(v.perfil).toEqual({ nombre: 'Ana', invitado: false })
    expect(v.xp).toBe(1200)
    expect(v.rango.nombre).toBe('Aprendiz')
    expect(v.bienvenidaVista).toBe(true)
    expect(v.ajustes.sonido).toBe(false)
    expect(p2.leerSeccion('instructor')).toEqual({ leccion: 'M04_L02', pantalla: 3 })
    expect(p2.leerSeccion('retador')).toBeNull()
  })

  it('sumarXP marca la racha y avisa si sube de rango; la XP nunca baja', () => {
    const a = almacenSimulado()
    const p = crearProgreso(() => a, () => fecha('2026-11-26'))
    expect(p.sumarXP(900)).toMatchObject({ subioDeRango: false, rango: { nombre: 'Novato' } })
    expect(p.sumarXP(100)).toMatchObject({ subioDeRango: true, rango: { nombre: 'Aprendiz' } })
    p.sumarXP(-500)
    expect(p.leer().xp).toBe(1000)
    expect(p.leer().racha).toEqual({ actual: 1, mejor: 1 })
  })

  it('la racha crece en días seguidos y se reinicia sin culpa', () => {
    const a = almacenSimulado()
    let hoy = '2026-11-24'
    const p = crearProgreso(() => a, () => fecha(hoy))
    p.sumarXP(10)
    hoy = '2026-11-25'; p.sumarXP(10)
    hoy = '2026-11-26'; p.sumarXP(10)
    expect(p.leer().racha).toEqual({ actual: 3, mejor: 3 })
    hoy = '2026-11-29'
    expect(p.leer().racha.actual).toBe(0) // pasaron días: ya no se muestra
    p.sumarXP(10)
    expect(p.leer().racha).toEqual({ actual: 1, mejor: 3 })
  })

  it('invitado queda como Invitado; un nombre vacío también', () => {
    const p = crearProgreso(() => almacenSimulado())
    p.definirPerfil({ nombre: 'loquesea', invitado: true })
    expect(p.leer().perfil).toEqual({ nombre: 'Invitado', invitado: true })
    p.definirPerfil({ nombre: '   ', invitado: false })
    expect(p.leer().perfil).toEqual({ nombre: 'Invitado', invitado: true })
    p.definirPerfil({ nombre: 'Ana', invitado: false })
    expect(p.leer().perfil).toEqual({ nombre: 'Ana', invitado: false })
  })

  it('avisa a los suscriptores y entrega la misma instantánea si nada cambió', () => {
    const p = crearProgreso(() => almacenSimulado())
    let avisos = 0
    const baja = p.suscribir(() => { avisos++ })
    const antes = p.leer()
    expect(p.leer()).toBe(antes)
    p.sumarXP(5)
    expect(avisos).toBe(1)
    expect(p.leer()).not.toBe(antes)
    baja()
    p.sumarXP(5)
    expect(avisos).toBe(1)
  })

  it('datos dañados o de una versión rara no rompen: se empieza de cero', () => {
    for (const texto of ['{no es json', '[]', '42', 'null', '{"xp":"mucho","perfil":7,"ajustes":3}']) {
      const p = crearProgreso(() => almacenSimulado({ [CLAVE]: texto }))
      const v = p.leer()
      expect(v.xp).toBe(0)
      expect(v.perfil).toBeNull()
      expect(v.ajustes).toEqual({ sonido: true, musica: false, mazo4colores: false })
    }
  })

  it('interpretar descarta lo inválido y conserva lo válido', () => {
    const g = interpretar(JSON.stringify({ version: 0, xp: -5, perfil: { nombre: 'Luz', invitado: false }, ajustes: { sonido: 'si', musica: true }, racha: { actual: 2, mejor: 1, ultimoDia: 'ayer' } }))
    expect(g.xp).toBe(0)
    expect(g.perfil).toEqual({ nombre: 'Luz', invitado: false })
    expect(g.ajustes).toEqual({ sonido: true, musica: true, mazo4colores: false })
    expect(g.racha.ultimoDia).toBeNull()
  })

  it('sin almacenamiento (ventana privada) funciona en memoria y lo avisa', () => {
    const roto: Almacenamiento = { getItem: () => { throw new Error('bloqueado') }, setItem: () => { throw new Error('bloqueado') } }
    const p = crearProgreso(() => roto)
    p.definirPerfil({ nombre: 'Ana', invitado: false })
    p.sumarXP(50)
    expect(p.leer().xp).toBe(50)
    expect(p.leer().perfil?.nombre).toBe('Ana')
    expect(p.leer().guardaEnNavegador).toBe(false)
    const nulo = crearProgreso(() => { throw new Error('sin localStorage') })
    nulo.sumarXP(1)
    expect(nulo.leer().xp).toBe(1)
  })
})

describe('mazo de 4 colores (migración desde la mesa)', () => {
  it('toma el valor de la clave antigua y lo refleja de vuelta al cambiarlo', () => {
    const a = almacenSimulado({ [CLAVE_MAZO_LEGADO]: '1' })
    const p = crearProgreso(() => a)
    expect(p.leer().ajustes.mazo4colores).toBe(true)
    p.cambiarAjuste('mazo4colores', false)
    expect(a.datos.get(CLAVE_MAZO_LEGADO)).toBe('0')
    p.cambiarAjuste('mazo4colores', true)
    expect(a.datos.get(CLAVE_MAZO_LEGADO)).toBe('1')
    expect(JSON.parse(a.datos.get(CLAVE)!).ajustes.mazo4colores).toBe(true)
  })
  it('sincronizarMazo recoge un cambio hecho desde la hoja de ajustes de la mesa', () => {
    const a = almacenSimulado()
    const p = crearProgreso(() => a)
    expect(p.leer().ajustes.mazo4colores).toBe(false)
    a.setItem(CLAVE_MAZO_LEGADO, '1')
    p.sincronizarMazo()
    expect(p.leer().ajustes.mazo4colores).toBe(true)
  })
})
