/**
 * Ayudas compartidas por las pruebas: lectura de los archivos de `modelo_transformado/`.
 * (Los tests corren en Node, así que leen del disco; en el navegador esos archivos se piden por fetch.)
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const CARPETA_DATOS = join(import.meta.dirname, '..', '..', '..', 'modelo_transformado')

export function leerJson<T = any>(nombre: string): T {
  return JSON.parse(readFileSync(join(CARPETA_DATOS, nombre), 'utf-8')) as T
}

export function leerBytes(nombre: string): Uint8Array {
  return new Uint8Array(readFileSync(join(CARPETA_DATOS, nombre)))
}

/** Línea de reporte con un prefijo fijo, para encontrar fácil las cifras en la salida de Vitest. */
export function reportar(prueba: string, texto: string): void {
  console.log(`[REPORTE ${prueba}] ${texto}`)
}
