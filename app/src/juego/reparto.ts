/**
 * reparto.ts: quién gana el bote al terminar la mano.
 *
 * Funciona con botes laterales (aunque con 100 bb para todos no se dan): cada nivel de aportación forma un bote
 * que se disputan solo los que siguen en la mano y pusieron al menos ese nivel. Un empate divide el bote; las
 * fichas sobrantes van al primer asiento después del botón (en el motor, el asiento con el número más bajo).
 */
import { NOMBRES_CLASE, claseDePuntaje, contarActivos, evaluar, type EstadoMano } from '../motor/index.ts'

export interface Reparto {
  /** Fichas que se lleva cada asiento del motor. */
  premios: number[]
  /** Asientos del motor que se llevaron algo. */
  ganadores: number[]
  /** Puntaje de cada asiento que llegó al showdown (menor = mejor); null para el resto. */
  puntajes: (number | null)[]
  showdown: boolean
  /** Nombre de la mejor mano entre los ganadores (solo con showdown). */
  nombreMano: string | null
}

export function repartirBote(estado: EstadoMano, tableroCompleto: readonly string[]): Reparto {
  const n = estado.n
  const premios = new Array<number>(n).fill(0)
  const activos = estado.activos.map((a, i) => (a ? i : -1)).filter((i) => i >= 0)
  const showdown = contarActivos(estado) > 1
  const puntajes = new Array<number | null>(n).fill(null)

  if (!showdown) {
    const unico = activos[0]!
    premios[unico] = estado.bote
    return { premios, ganadores: [unico], puntajes, showdown, nombreMano: null }
  }

  for (const i of activos) puntajes[i] = evaluar(estado.cartasPrivadas[i]!, tableroCompleto)
  const aporte = estado.inicial.map((x, i) => x - estado.stacks[i]!)
  const niveles = [...new Set(aporte.filter((x, i) => x > 0 && estado.activos[i]))].sort((a, b) => a - b)
  const maxAportes = Math.max(...aporte)
  if (niveles[niveles.length - 1] !== maxAportes) niveles.push(maxAportes) // fichas de más: se reparten con el último nivel

  let previo = 0
  for (const nivel of niveles) {
    let bote = 0
    for (let i = 0; i < n; i++) bote += Math.max(0, Math.min(aporte[i]!, nivel) - Math.min(aporte[i]!, previo))
    previo = nivel
    if (bote <= 0) continue
    let candidatos = activos.filter((i) => aporte[i]! >= nivel)
    if (candidatos.length === 0) candidatos = activos
    const mejor = Math.min(...candidatos.map((i) => puntajes[i]!))
    const ganan = candidatos.filter((i) => puntajes[i] === mejor).sort((a, b) => a - b)
    const parte = Math.floor(bote / ganan.length)
    let resto = bote - parte * ganan.length
    for (const g of ganan) {
      premios[g]! += parte + (resto > 0 ? 1 : 0)
      if (resto > 0) resto--
    }
  }

  const ganadores = premios.map((p, i) => (p > 0 ? i : -1)).filter((i) => i >= 0)
  const mejorGlobal = Math.min(...ganadores.map((i) => puntajes[i] ?? Infinity))
  const nombreMano = Number.isFinite(mejorGlobal) ? NOMBRES_CLASE[claseDePuntaje(mejorGlobal)]! : null
  return { premios, ganadores, puntajes, showdown, nombreMano }
}
