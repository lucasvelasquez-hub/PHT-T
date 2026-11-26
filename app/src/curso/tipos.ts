/** Tipos públicos del curso (contrato §3.5). */
export interface Curso { modulos: Modulo[] }

export interface Modulo {
  id: string // 'M04'
  numero: number
  titulo: string
  lecciones: Leccion[]
  evaluacion: Pregunta[]
  casos: Caso[]
}

export interface Leccion {
  id: string // 'M04_L02'
  modulo: number
  numero: number
  titulo: string
  minutos: number
  pantallas: Pantalla[]
}

/** Un apartado "## ..." de la lección, ya convertido a HTML. */
export interface Pantalla { titulo: string; html: string }

export interface Pregunta {
  id: string
  leccion: string
  enunciado: string
  formato: 'opciones' | 'numero'
  opciones?: string[]
  correcta: string | number
  tolerancia?: number
  unidad?: string
  explicacion: string
}

export type Calle = 'preflop' | 'flop' | 'turn' | 'river'
export type Posicion = 'SB' | 'BB' | 'UTG' | 'HJ' | 'CO' | 'BTN'

/** Caso de "Prueba en vivo" (REQUISITOS §5). Los campos van en camelCase; las cantidades, en bb. */
export interface Caso {
  id: string // 'm04-c01'
  titulo: string
  tipo: 'matematica' | 'concepto'
  calle: Calle
  heroe: Posicion
  cartasHeroe: string // 'Ah 5h'
  mesa: string // 'Kh 9h 2c' ('' en preflop)
  stacks: string // texto original; vacío = 100 para todos
  /** Una entrada por calle, tal como se escribió ('UTG, HJ fold; CO sube 2.5; ...'). */
  accion: Partial<Record<Calle, string>>
  boteEsperado?: number
  pregunta: string
  formato: 'decision' | 'opciones'
  opciones: string[]
  correcta: string[]
  explicacion: string
  porOpcion: Record<string, string>
  /** Archivo de origen, para listar errores. */
  archivo?: string
}
