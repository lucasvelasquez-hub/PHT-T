/** Lectura de lecciones, casos y evaluaciones del Módulo 1 con import.meta.glob (?raw). */
import { marked } from 'marked'
import { extraerBloques, leerCaso, leerPregunta } from './bloques.ts'
import type { Caso, Curso, Leccion, Modulo, Pantalla, Pregunta } from './tipos.ts'

// Si las carpetas de casos o evaluaciones están vacías, el glob devuelve {} y no pasa nada.
const RAW_LECCIONES = import.meta.glob('../../contenido_modulo1/curso/lecciones/M*_L*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const RAW_CASOS = import.meta.glob('../../contenido_modulo1/casos/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const RAW_EVALUACIONES = import.meta.glob('../../contenido_modulo1/evaluaciones/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function nombreArchivo(ruta: string): string { return ruta.split('/').pop()!.replace(/\.md$/, '') }

/** Convierte markdown en línea o de bloque a HTML. */
function aHtml(md: string): string { return marked.parse(md, { async: false, gfm: true }) as string }

export interface LeccionLeida { leccion: Leccion; avisos: string[] }

/** Lee una lección. `avisos` lista lo que tiene formato raro (no lanza). */
export function leerLeccion(id: string, texto: string): LeccionLeida {
  const avisos: string[] = []
  const lineas = texto.replace(/\r\n?/g, '\n').split('\n')
  const m = /^M(\d+)_L(\d+)$/.exec(id)
  const modulo = m ? Number(m[1]) : 0
  const numeroArchivo = m ? Number(m[2]) : 0

  const t = /^#\s+(\d+)\.(\d+)\s+(.+?)\s*$/.exec(lineas[0] ?? '')
  if (!t) avisos.push('la primera línea no es "# N.M Título"')
  else if (Number(t[1]) !== modulo || Number(t[2]) !== numeroArchivo) avisos.push(`el título dice ${t[1]}.${t[2]} y el archivo es ${modulo}.${numeroArchivo}`)
  const titulo = t ? t[3]! : id

  const sub = lineas.find((l, i) => i > 0 && l.trim() !== '') ?? ''
  const mm = /(\d+)\s*minutos?/i.exec(sub)
  if (!sub.startsWith('*') || !mm) avisos.push('la línea de módulo/lección/minutos no tiene el formato esperado')
  const minutos = mm ? Number(mm[1]) : 0

  // Pantallas: cada "## " fuera de bloques de código.
  const pantallas: Pantalla[] = []
  let actual: { titulo: string; cuerpo: string[] } | null = null
  let enCodigo = false
  for (const l of lineas) {
    if (/^\s*```/.test(l)) enCodigo = !enCodigo
    const h = !enCodigo ? /^##\s+(.+?)\s*$/.exec(l) : null
    if (h) {
      if (actual) pantallas.push({ titulo: actual.titulo, html: aHtml(actual.cuerpo.join('\n')) })
      actual = { titulo: h[1]!, cuerpo: [] }
    } else if (actual) actual.cuerpo.push(l)
  }
  if (actual) pantallas.push({ titulo: actual.titulo, html: aHtml(actual.cuerpo.join('\n')) })
  if (!pantallas.length) avisos.push('no tiene apartados "## "')

  return { leccion: { id, modulo, numero: numeroArchivo, titulo, minutos, pantallas }, avisos }
}

export interface ContenidoLeido {
  lecciones: LeccionLeida[]
  casos: Caso[]
  preguntas: { archivo: string; pregunta: Pregunta }[]
}

/** Lee todo el contenido sin armar módulos. Sirve a `cargarCurso` y a la validación. */
export function leerContenido(): ContenidoLeido {
  const lecciones = Object.entries(RAW_LECCIONES)
    .map(([ruta, txt]) => ({ id: nombreArchivo(ruta), txt }))
    .filter((x) => /^M\d+_L\d+$/.test(x.id))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((x) => leerLeccion(x.id, x.txt))
  const casos: Caso[] = []
  for (const [ruta, txt] of Object.entries(RAW_CASOS)) {
    for (const b of extraerBloques(txt, ['caso'])) casos.push(leerCaso(b.lineas, nombreArchivo(ruta)))
  }
  const preguntas: ContenidoLeido['preguntas'] = []
  for (const [ruta, txt] of Object.entries(RAW_EVALUACIONES)) {
    for (const b of extraerBloques(txt, ['pregunta'])) preguntas.push({ archivo: nombreArchivo(ruta), pregunta: leerPregunta(b.lineas) })
  }
  return { lecciones, casos, preguntas }
}

/** Número de módulo a partir de un id 'm04-c01', 'M04_L02' o un archivo 'M04_casos'. */
function moduloDe(texto: string): number { const m = /(\d{2})/.exec(texto); return m ? Number(m[1]) : -1 }

export async function cargarCurso(): Promise<Curso> {
  const { lecciones, casos, preguntas } = leerContenido()
  const modulos = new Map<number, Modulo>()
  const obtener = (n: number): Modulo => {
    let mod = modulos.get(n)
    if (!mod) {
      mod = { id: `M${String(n).padStart(2, '0')}`, numero: n, titulo: `Módulo ${n}`, lecciones: [], evaluacion: [], casos: [] }
      modulos.set(n, mod)
    }
    return mod
  }
  for (const { leccion } of lecciones) obtener(leccion.modulo).lecciones.push(leccion)
  for (const c of casos) obtener(moduloDe(c.id)).casos.push(c)
  for (const { pregunta } of preguntas) obtener(moduloDe(pregunta.id)).evaluacion.push(pregunta)
  for (const mod of modulos.values()) mod.lecciones.sort((a, b) => a.numero - b.numero)
  return { modulos: [...modulos.values()].filter((m) => m.numero >= 0).sort((a, b) => a.numero - b.numero) }
}
