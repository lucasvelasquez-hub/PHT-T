/**
 * geometria.ts: dónde va cada pieza de la mesa.
 *
 * Todo se mide en píxeles de la IMAGEN de la mesa (1080×1920 en celular, 1920×1080 en PC). Una sola función
 * (`calcularEscena`) convierte esas coordenadas a pantalla con la misma cuenta que usa el fondo, así las cartas,
 * el bote y los avatares quedan sobre el paño en cualquier tamaño de ventana.
 */

export type Modo = 'movil' | 'escritorio'

export interface Punto { x: number; y: number }

/** Plano de una mesa: coordenadas en píxeles de su imagen. */
export interface Plano {
  modo: Modo
  /** Tamaño de la imagen de fondo. */
  W: number
  H: number
  src: string
  /** 5 rivales de izquierda a derecha (centro del avatar). */
  asientos: Punto[]
  /** Dónde cae la apuesta de cada rival (centro del grupo de fichas), en el mismo orden. */
  apuestas: Punto[]
  /** Diámetro del avatar. */
  avatar: number
  /** Tamaño de letra base de las píldoras (px de imagen). */
  fuente: number
  tablero: { cx: number[]; yb: number; w: number; inclinacion: number }
  /** Grupo de fichas del bote y su píldora. */
  bote: Punto
  botePildora: Punto
  fichaBote: number
  fichaApuesta: number
  heroe: { cx: [number, number]; yb: number; w: number; inclinacion: number; giro: [number, number] }
  heroePildora: Punto
  logo: Punto & { w: number }
  /** De dónde salen las cartas al repartir. */
  mazo: Punto
}

export const PLANO_MOVIL: Plano = {
  modo: 'movil',
  W: 1080,
  H: 1920,
  src: '/assets/mesa/mesa_movil.webp',
  asientos: [{ x: 150, y: 545 }, { x: 305, y: 335 }, { x: 540, y: 262 }, { x: 775, y: 335 }, { x: 930, y: 545 }],
  apuestas: [{ x: 320, y: 612 }, { x: 405, y: 545 }, { x: 540, y: 522 }, { x: 675, y: 545 }, { x: 760, y: 612 }],
  avatar: 146,
  fuente: 30,
  tablero: { cx: [172, 356, 540, 724, 908], yb: 852, w: 170, inclinacion: 43 },
  bote: { x: 540, y: 975 },
  botePildora: { x: 540, y: 1080 },
  fichaBote: 92,
  fichaApuesta: 76,
  heroe: { cx: [455, 625], yb: 1375, w: 190, inclinacion: 30, giro: [-6, 5] },
  heroePildora: { x: 540, y: 1428 },
  logo: { x: 540, y: 612, w: 420 },
  mazo: { x: 540, y: 560 },
}

export const PLANO_ESCRITORIO: Plano = {
  modo: 'escritorio',
  W: 1920,
  H: 1080,
  src: '/assets/mesa/mesa_escritorio.webp',
  asientos: [{ x: 130, y: 430 }, { x: 350, y: 305 }, { x: 620, y: 235 }, { x: 890, y: 305 }, { x: 1110, y: 430 }],
  apuestas: [{ x: 215, y: 540 }, { x: 430, y: 385 }, { x: 620, y: 366 }, { x: 810, y: 385 }, { x: 1025, y: 540 }],
  avatar: 106,
  fuente: 18,
  tablero: { cx: [340, 480, 620, 760, 900], yb: 565, w: 118, inclinacion: 50 },
  bote: { x: 620, y: 650 },
  botePildora: { x: 620, y: 718 },
  fichaBote: 66,
  fichaApuesta: 56,
  heroe: { cx: [556, 684], yb: 925, w: 140, inclinacion: 36, giro: [-6, 5] },
  heroePildora: { x: 620, y: 968 },
  logo: { x: 620, y: 412, w: 330 },
  mazo: { x: 620, y: 395 },
}

/** Escena calculada para un tamaño de ventana. */
export interface Escena {
  plano: Plano
  /** Píxeles de pantalla por píxel de imagen. */
  s: number
  /** Esquina superior izquierda de la imagen en pantalla. */
  ox: number
  oy: number
  /** Alto reservado abajo para el panel (celular) o la barra de acciones (PC). */
  reservado: number
  anchoViewport: number
  altoViewport: number
  /** Alto de la barra superior. */
  barraSuperior: number
}

export const ALTO_BARRA_SUPERIOR = 52
const BAJO_CELULAR = { vacio: 4, anclaInferior: 1456, anclaSuperior: 185 }

const acotar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function modoPara(ancho: number, alto: number): Modo {
  return ancho >= 900 && ancho / alto >= 1.15 ? 'escritorio' : 'movil'
}

export function calcularEscena(ancho: number, alto: number): Escena {
  const modo = modoPara(ancho, alto)
  if (modo === 'escritorio') {
    const plano = PLANO_ESCRITORIO
    const reservado = 92
    const s = Math.min(ancho / plano.W, (alto - reservado) / plano.H)
    return { plano, s, ox: 0, oy: 0, reservado, anchoViewport: ancho, altoViewport: alto, barraSuperior: ALTO_BARRA_SUPERIOR }
  }
  const plano = PLANO_MOVIL
  const reservado = acotar(alto * 0.29, 232, 300)
  const altoEscena = alto - reservado
  const sAncho = ancho / plano.W
  const sAlto = (altoEscena - ALTO_BARRA_SUPERIOR - 30 - BAJO_CELULAR.vacio) / (BAJO_CELULAR.anclaInferior - BAJO_CELULAR.anclaSuperior)
  // El fondo cubre el ancho (con un poco de margen de recorte); el alto manda si la pantalla es corta.
  const s = acotar(sAlto, sAncho * 0.66, sAncho * 1.08)
  return {
    plano, s,
    ox: (ancho - plano.W * s) / 2,
    oy: altoEscena - BAJO_CELULAR.vacio - BAJO_CELULAR.anclaInferior * s,
    reservado, anchoViewport: ancho, altoViewport: alto, barraSuperior: ALTO_BARRA_SUPERIOR,
  }
}

/** Convierte un punto de la imagen a pantalla. */
export const aPantalla = (e: Escena, p: Punto): Punto => ({ x: e.ox + p.x * e.s, y: e.oy + p.y * e.s })

/** Tamaño de letra legible: proporcional a la mesa, con piso. */
export const letra = (e: Escena, factor = 1, piso = e.s < 0.3 ? 10 : 11) => Math.max(piso, e.plano.fuente * e.s * factor)
