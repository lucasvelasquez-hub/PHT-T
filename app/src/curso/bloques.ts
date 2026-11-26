/** Lectura de los bloques ```caso y ```pregunta (formato clave: valor, con sublíneas con sangría). */
import type { Caso, Calle, Posicion, Pregunta } from './tipos.ts'

export interface BloqueCrudo { tipo: string; lineas: string[] }

/** Extrae los bloques con valla (```tipo ... ```) de un texto markdown. */
export function extraerBloques(texto: string, tipos: string[]): BloqueCrudo[] {
  const salida: BloqueCrudo[] = []
  let actual: BloqueCrudo | null = null
  for (const linea of texto.replace(/\r\n?/g, '\n').split('\n')) {
    if (!actual) {
      const m = /^\s*`{3,}\s*(\w+)\s*$/.exec(linea)
      if (m && tipos.includes(m[1]!)) actual = { tipo: m[1]!, lineas: [] }
    } else if (/^\s*`{3,}\s*$/.test(linea)) {
      salida.push(actual)
      actual = null
    } else {
      actual.lineas.push(linea)
    }
  }
  return salida
}

export interface CamposCrudos { planos: Record<string, string>; anidados: Record<string, Record<string, string>> }

/** `clave: valor`; si el valor está vacío, las líneas siguientes con sangría son `sub: valor`. */
export function leerCampos(lineas: string[]): CamposCrudos {
  const planos: Record<string, string> = {}
  const anidados: Record<string, Record<string, string>> = {}
  let padre: string | null = null
  for (const linea of lineas) {
    if (!linea.trim()) continue
    const sangria = /^\s+/.test(linea)
    const m = /^\s*([^:]+?)\s*:\s*(.*?)\s*$/.exec(linea)
    if (!m) continue
    if (sangria && padre) anidados[padre]![m[1]!] = m[2]!
    else if (!sangria) {
      if (m[2] === '') { padre = m[1]!; anidados[padre] = {} } else { padre = null; planos[m[1]!] = m[2]! }
    }
  }
  return { planos, anidados }
}

/** '[a, b, c]' -> ['a','b','c']; 'a' -> ['a']. */
export function leerLista(valor: string | undefined): string[] {
  if (!valor) return []
  const v = valor.trim().replace(/^\[/, '').replace(/\]$/, '')
  return v.split(',').map((s) => s.trim()).filter(Boolean)
}

export function leerCaso(lineas: string[], archivo?: string): Caso {
  const { planos: p, anidados: a } = leerCampos(lineas)
  const num = (v: string | undefined) => (v === undefined || v === '' ? undefined : Number(v.replace(',', '.')))
  return {
    id: p.id ?? '',
    titulo: p.titulo ?? '',
    tipo: (p.tipo ?? '') as Caso['tipo'],
    calle: (p.calle ?? '') as Calle,
    heroe: (p.heroe ?? '') as Posicion,
    cartasHeroe: p.cartas_heroe ?? '',
    mesa: p.mesa ?? '',
    stacks: p.stacks ?? '',
    accion: (a.accion ?? {}) as Caso['accion'],
    boteEsperado: num(p.bote_esperado),
    pregunta: p.pregunta ?? '',
    formato: (p.formato ?? '') as Caso['formato'],
    opciones: leerLista(p.opciones),
    correcta: leerLista(p.correcta),
    explicacion: p.explicacion ?? '',
    porOpcion: a.por_opcion ?? {},
    archivo,
  }
}

export function leerPregunta(lineas: string[]): Pregunta {
  const { planos: p } = leerCampos(lineas)
  const formato = (p.formato === 'opciones' ? 'opciones' : 'numero') as Pregunta['formato']
  const bruta = p.correcta ?? ''
  const n = Number(bruta.replace(',', '.'))
  return {
    id: p.id ?? '',
    leccion: p.leccion ?? '',
    enunciado: p.enunciado ?? '',
    formato,
    opciones: formato === 'opciones' ? leerLista(p.opciones) : undefined,
    correcta: formato === 'numero' && bruta !== '' && !Number.isNaN(n) ? n : bruta,
    tolerancia: p.tolerancia !== undefined ? Number(p.tolerancia.replace(',', '.')) : undefined,
    unidad: p.unidad,
    explicacion: p.explicacion ?? '',
  }
}
