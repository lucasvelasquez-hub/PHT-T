/** Traduce un Caso a un EstadoMano del motor y lo valida. No modifica el motor. */
import { aplicarAccion, accionesLegales, crearMano, repartirCalle, repartirPrivadas, turnoActual, type EstadoMano } from '../motor/mano.ts'
import type { Calle, Caso, Posicion } from './tipos.ts'

/** Asientos del motor: 0 = SB, 1 = BB, luego UTG, HJ, CO, BTN. */
export const ASIENTO: Record<Posicion, number> = { SB: 0, BB: 1, UTG: 2, HJ: 3, CO: 4, BTN: 5 }
const POSICIONES = Object.keys(ASIENTO) as Posicion[]
const CALLES: Calle[] = ['preflop', 'flop', 'turn', 'river']
const CARTAS_MESA: Record<Calle, number> = { preflop: 0, flop: 3, turn: 4, river: 5 }
const RE_CARTA = /^[2-9TJQKA][shdc]$/
const CIEGAS = [0.5, 1, 0, 0, 0, 0]

function separar(texto: string): string[] { return texto.trim().split(/\s+/).filter(Boolean) }

function leerStacks(texto: string): number[] {
  const stacks = new Array<number>(6).fill(100)
  const t = texto.trim()
  if (!t) return stacks
  if (/^\d+(\.\d+)?$/.test(t)) return stacks.fill(Number(t))
  let resto = 100
  const nombradas = new Set<string>()
  for (const parte of t.split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\w+)\s+(\d+(?:\.\d+)?)$/.exec(parte)
    if (!m) throw new Error(`stacks ilegible: "${parte}"`)
    const nombre = m[1]!.toUpperCase()
    if (nombre === 'RESTO') resto = Number(m[2])
    else if (nombre in ASIENTO) { stacks[ASIENTO[nombre as Posicion]] = Number(m[2]); nombradas.add(nombre) }
    else throw new Error(`posición desconocida en stacks: "${m[1]}"`)
  }
  // 'resto' rellena las posiciones no nombradas
  for (const pos of POSICIONES) if (!nombradas.has(pos)) stacks[ASIENTO[pos]] = resto
  return stacks
}

interface PasoAccion { asientos: number[]; verbo: string; cantidad?: number }

function leerPasos(linea: string): PasoAccion[] {
  const pasos: PasoAccion[] = []
  for (const trozo of linea.split(';').map((s) => s.trim()).filter(Boolean)) {
    const m = /^([A-Za-z]+(?:\s*,\s*[A-Za-z]+)*)\s+(fold|check|paga|apuesta|sube|all-in)(?:\s+(\d+(?:\.\d+)?))?$/i.exec(trozo)
    if (!m) throw new Error(`acción ilegible: "${trozo}"`)
    const asientos = m[1]!.split(',').map((s) => {
      const pos = s.trim().toUpperCase() as Posicion
      if (!(pos in ASIENTO)) throw new Error(`posición desconocida: "${s.trim()}"`)
      return ASIENTO[pos]
    })
    const verbo = m[2]!.toLowerCase()
    const cantidad = m[3] !== undefined ? Number(m[3]) : undefined
    if ((verbo === 'apuesta' || verbo === 'sube') && cantidad === undefined) throw new Error(`"${verbo}" necesita una cantidad: "${trozo}"`)
    if (asientos.length > 1 && verbo !== 'fold') throw new Error(`solo "fold" se puede agrupar: "${trozo}"`)
    pasos.push({ asientos, verbo, cantidad })
  }
  return pasos
}

function nombreDe(asiento: number): string { return POSICIONES[asiento]! }

function aplicarPaso(estado: EstadoMano, asiento: number, paso: PasoAccion): void {
  const legales = accionesLegales(estado, asiento)
  const pos = nombreDe(asiento)
  const hayApuesta = estado.calle === 0 || estado.apuestaAlta > 0
  switch (paso.verbo) {
    case 'fold':
      aplicarAccion(estado, { asiento, tipo: 'f' }, { validar: true }); break
    case 'check':
      if (legales.aPagar > 0) throw new Error(`${pos} no puede hacer check: debe pagar ${legales.aPagar}`)
      aplicarAccion(estado, { asiento, tipo: 'cc' }, { validar: true }); break
    case 'paga':
      if (legales.aPagar <= 0) throw new Error(`${pos} no tiene nada que pagar (usa check)`)
      aplicarAccion(estado, { asiento, tipo: 'cc' }, { validar: true }); break
    case 'apuesta':
      if (hayApuesta) throw new Error(`${pos} "apuesta" pero ya hay una apuesta (usa sube)`)
      aplicarAccion(estado, { asiento, tipo: 'cbr', hasta: paso.cantidad }, { validar: true }); break
    case 'sube':
      if (!hayApuesta) throw new Error(`${pos} "sube" pero no hay apuesta (usa apuesta)`)
      aplicarAccion(estado, { asiento, tipo: 'cbr', hasta: paso.cantidad }, { validar: true }); break
    case 'all-in':
      if (legales.subir) aplicarAccion(estado, { asiento, tipo: 'cbr', hasta: legales.subir.max }, { validar: true })
      else aplicarAccion(estado, { asiento, tipo: 'cc' }, { validar: true })
      break
  }
}

/** Reparte hasta la calle del caso y aplica todas las acciones. Lanza Error con el motivo si algo no encaja. */
export function construirEscenarioCaso(c: Caso): { estado: EstadoMano; asientoHeroe: number; cartasHeroe: [string, string]; tablero: string[] } {
  if (!(c.heroe in ASIENTO)) throw new Error(`heroe desconocido: "${c.heroe}"`)
  const idxCalle = CALLES.indexOf(c.calle)
  if (idxCalle < 0) throw new Error(`calle desconocida: "${c.calle}"`)
  const asientoHeroe = ASIENTO[c.heroe]
  const cartasHeroe = separar(c.cartasHeroe)
  const tablero = separar(c.mesa)
  if (cartasHeroe.length !== 2) throw new Error(`cartas_heroe debe tener 2 cartas, tiene ${cartasHeroe.length}`)

  const estado = crearMano({
    jugadores: POSICIONES.map((p) => p as string),
    stacks: leerStacks(c.stacks),
    ciegas: CIEGAS,
  })
  repartirPrivadas(estado, asientoHeroe, cartasHeroe)
  // Si la mesa trae un número equivocado de cartas, validarCaso lo informa; aquí repartimos lo que haya.
  let usadas = 0
  for (let i = 0; i <= idxCalle; i++) {
    if (i > 0) {
      const n = CARTAS_MESA[CALLES[i]!] - CARTAS_MESA[CALLES[i - 1]!]
      repartirCalle(estado, tablero.slice(usadas, usadas + n))
      usadas += n
    }
    const linea = c.accion[CALLES[i]!]
    if (!linea) continue
    for (const paso of leerPasos(linea)) {
      for (const asiento of paso.asientos) {
        try { aplicarPaso(estado, asiento, paso) } catch (e) {
          throw new Error(`${CALLES[i]}: ${(e as Error).message}`)
        }
      }
    }
  }
  return { estado, asientoHeroe, cartasHeroe: [cartasHeroe[0]!, cartasHeroe[1]!], tablero }
}

/** Opciones `decision` legales en ese momento (nombres en inglés, como en la mesa). */
function opcionesLegales(estado: EstadoMano, asiento: number): string[] {
  const l = accionesLegales(estado, asiento)
  const o: string[] = []
  if (l.puedeFold) o.push('Fold')
  if (l.puedeCheck) o.push('Check')
  if (l.aPagar > 0) o.push('Call')
  if (l.subir) o.push(l.aPagar > 0 ? 'Raise' : 'Bet', 'All-in')
  return o
}

/** Lista de errores del caso; vacía si está bien. */
export function validarCaso(c: Caso): string[] {
  const errores: string[] = []
  const falta = (campo: string, v: unknown) => { if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) errores.push(`falta el campo "${campo}"`) }
  falta('id', c.id); falta('titulo', c.titulo); falta('tipo', c.tipo); falta('calle', c.calle); falta('heroe', c.heroe)
  falta('cartas_heroe', c.cartasHeroe); falta('pregunta', c.pregunta); falta('formato', c.formato)
  falta('opciones', c.opciones); falta('correcta', c.correcta); falta('explicacion', c.explicacion)
  if (c.id && !/^[a-z]\d{2}-c\d{2}$/i.test(c.id)) errores.push(`id con formato raro: "${c.id}" (se espera mNN-cMM)`)
  if (c.tipo && c.tipo !== 'matematica' && c.tipo !== 'concepto') errores.push(`tipo desconocido: "${c.tipo}"`)
  if (c.formato && c.formato !== 'decision' && c.formato !== 'opciones') errores.push(`formato desconocido: "${c.formato}"`)
  if (c.heroe && !(c.heroe in ASIENTO)) errores.push(`heroe desconocido: "${c.heroe}"`)
  const idxCalle = CALLES.indexOf(c.calle)
  if (c.calle && idxCalle < 0) errores.push(`calle desconocida: "${c.calle}"`)

  // Cartas: formato, repetidas y cantidad de mesa
  const heroe = separar(c.cartasHeroe)
  const mesa = separar(c.mesa)
  let basicoMal = !(c.heroe in ASIENTO) || idxCalle < 0
  if (c.cartasHeroe && heroe.length !== 2) { errores.push(`cartas_heroe debe tener 2 cartas (tiene ${heroe.length})`); basicoMal = true }
  const todas = [...heroe, ...mesa]
  for (const carta of todas) if (!RE_CARTA.test(carta)) { errores.push(`carta mal escrita: "${carta}"`); basicoMal = true }
  const vistas = new Set<string>()
  for (const carta of todas) {
    if (vistas.has(carta)) { errores.push(`carta repetida: "${carta}"`); basicoMal = true }
    vistas.add(carta)
  }
  if (idxCalle >= 0 && mesa.length !== CARTAS_MESA[c.calle]) {
    errores.push(`la calle ${c.calle} necesita ${CARTAS_MESA[c.calle]} cartas de mesa y hay ${mesa.length}`)
    basicoMal = true
  }

  // Opciones y correcta
  if (c.formato === 'opciones' && (c.opciones.length < 2 || c.opciones.length > 4)) errores.push(`formato opciones necesita de 2 a 4 respuestas (hay ${c.opciones.length})`)
  for (const k of c.correcta) if (!c.opciones.some((o) => o.toLowerCase() === k.toLowerCase())) errores.push(`correcta "${k}" no está en opciones`)
  for (const k of Object.keys(c.porOpcion)) if (!c.opciones.some((o) => o.toLowerCase() === k.toLowerCase())) errores.push(`por_opcion "${k}" no está en opciones`)

  // Si lo básico falla, no intentamos simular
  if (basicoMal) return errores

  let esc: ReturnType<typeof construirEscenarioCaso>
  try { esc = construirEscenarioCaso(c) } catch (e) {
    errores.push(`acción ilegal: ${(e as Error).message}`)
    return errores
  }
  const { estado, asientoHeroe } = esc
  const turno = turnoActual(estado)
  if (turno !== asientoHeroe) {
    errores.push(`al terminar la acción no le toca al héroe (${c.heroe}); le toca a ${turno === null ? 'nadie (la ronda terminó)' : nombreDe(turno)}`)
    return errores
  }
  if (estado.calle !== idxCalle) errores.push(`la acción deja la mano en la calle ${CALLES[estado.calle]}, no en ${c.calle}`)
  if (c.boteEsperado !== undefined && Math.abs(estado.bote - c.boteEsperado) > 1e-6) {
    errores.push(`bote_esperado ${c.boteEsperado} pero la acción da ${estado.bote}`)
  }
  if (c.formato === 'decision') {
    const legales = opcionesLegales(estado, asientoHeroe)
    for (const o of c.opciones) {
      if (!legales.some((l) => l.toLowerCase() === o.toLowerCase())) errores.push(`opción "${o}" ilegal en ese momento (legales: ${legales.join(', ')})`)
    }
  }
  return errores
}
