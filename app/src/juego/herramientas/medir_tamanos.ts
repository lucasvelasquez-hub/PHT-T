/**
 * Mide con qué frecuencia se usa cada tamaño de subida en el banco de manos reales y guarda el resultado en
 * `src/juego/tamanos_pluribus.json`.
 *
 *   node src/juego/herramientas/medir_tamanos.ts
 *
 * Cada Bet/Raise se clasifica en el botón más cercano de su contexto; las subidas que ponen todo el stack son all-in.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  accionesLegales, aplicarAccion, crearMano, repartirCalle, repartirPrivadas, separarCartas, type TipoAccion,
} from '../../motor/index.ts'
import { contextoDe, medidaDe, opcionMasCercana, OPCIONES_POR_CONTEXTO, type ContextoSubida } from '../tamanosCalculo.ts'

const raiz = join(import.meta.dirname, '..', '..', '..')
const banco = JSON.parse(readFileSync(join(raiz, 'modelo_transformado', 'banco_manos_reales.json'), 'utf-8'))
const TIPOS: TipoAccion[] = ['f', 'cc', 'cbr']
const CONTEXTOS: ContextoSubida[] = ['pre_abierta', 'pre_contra_subida', 'post_apuesta', 'post_subida']

type Cuentas = Record<ContextoSubida, Record<string, number>>
const vacio = (): Cuentas =>
  Object.fromEntries(CONTEXTOS.map((c) => [c, Object.fromEntries(OPCIONES_POR_CONTEXTO[c].map((o) => [o.id, 0]))])) as Cuentas
const todos = vacio()
const pluribus = vacio()
let manos = 0

for (const m of banco.manos) {
  manos++
  const e = crearMano({ jugadores: m.n, stacks: m.st, ciegas: m.bl })
  m.h.forEach((c: string, i: number) => repartirPrivadas(e, i, separarCartas(c)))
  for (const [asiento, codigo, hasta, , calle] of m.a as number[][]) {
    while (e.calle < calle!) repartirCalle(e, separarCartas(m.t[e.calle]!))
    const tipo = TIPOS[codigo!]!
    if (tipo === 'cbr') {
      const ctx = contextoDe(e)
      const max = accionesLegales(e, asiento).subir?.max ?? 0
      const id = hasta! >= max ? 'allin' : opcionMasCercana(ctx, medidaDe(e, asiento!, ctx, hasta!)).id
      todos[ctx][id]!++
      if (m.n[asiento!] === 'Pluribus') pluribus[ctx][id]!++
    }
    aplicarAccion(e, tipo === 'cbr' ? { asiento: asiento!, tipo, hasta } : { asiento: asiento!, tipo })
  }
}

const frecuencias = (c: Cuentas) =>
  Object.fromEntries(CONTEXTOS.map((ctx) => {
    const n = Object.values(c[ctx]).reduce((a, b) => a + b, 0)
    return [ctx, {
      n,
      frecuencias: Object.fromEntries(Object.entries(c[ctx]).map(([k, v]) => [k, n ? Math.round((v / n) * 10000) / 10000 : 0])),
    }]
  }))

const salida = {
  fuente: 'modelo_transformado/banco_manos_reales.json',
  manos,
  nota: 'Frecuencia de cada tamaño de subida por contexto. `todos` = todos los jugadores del banco (la tabla que usa el juego); `pluribus` = solo Pluribus.',
  todos: frecuencias(todos),
  pluribus: frecuencias(pluribus),
}
writeFileSync(join(raiz, 'src', 'juego', 'tamanos_pluribus.json'), JSON.stringify(salida, null, 2) + '\n')
console.log(JSON.stringify(salida))
