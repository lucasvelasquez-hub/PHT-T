/**
 * useAnalisis: calcula las lecturas de la decisión EN VIVO con el motor (Web Worker):
 * equity (Monte Carlo) + predicción de la red ONNX (Modelo 4) + lectura conjunta.
 *
 * Flujo: Escenario (estado de la mesa) -> worker `iniciar` (carga tablas, modelo y wasm) -> worker `analizar`
 * -> Lectura para el panel. Si el worker falla, el panel usa lo que guardó el banco y lo marca como "banco".
 * La comparación con el banco queda en la consola y en `window.__nextchip` (para revisarla a mano).
 */
import { useEffect, useState } from 'react'
import { lecturaConjunta, type RespuestaAnalizar } from '../../motor/index.ts'
import { crearClienteMotor } from '../../motor/cliente.ts'
import type { Lectura } from '../mesa/PanelLecturas.tsx'
import { comentarioDe } from './comentario.ts'
import type { Escenario } from './escenario.ts'

const SIMULACIONES = 12000
const SEMILLA = 1687

export interface ComparacionBanco {
  claveMano: number
  fuente: 'vivo' | 'banco'
  equityVivo: number
  equityBanco: number
  eliteVivo: [number, number, number]
  eliteBanco: [number, number, number]
  ms: number
}

declare global {
  interface Window { __nextchip?: { comparacion?: ComparacionBanco; analisis?: RespuestaAnalizar } }
}

function deBanco(e: Escenario): Lectura {
  const p = e.banco.prediccion
  const l = lecturaConjunta({ equity: e.banco.equity, potOdds: e.banco.potOdds, aPagar: e.legales.aPagar, prediccion: p })
  return { equity: e.banco.equity, potOdds: e.banco.potOdds, fold: p.fold, call: p.call, raise: p.raise, comentario: comentarioDe(l, p), fuente: 'banco' }
}

export function useAnalisis(escenario: Escenario | null, usarBanco = false): Lectura | null {
  const [lectura, setLectura] = useState<Lectura | null>(null)

  useEffect(() => {
    setLectura(null)
    if (!escenario) return
    if (usarBanco) {
      setLectura(deBanco(escenario))
      return
    }
    let vivo = true
    const cliente = crearClienteMotor()
    const t0 = performance.now()
    ;(async () => {
      try {
        await cliente.pedir({ tipo: 'iniciar' })
        const r = await cliente.pedir({
          tipo: 'analizar', estado: escenario.estado, asiento: escenario.heroe.indice, simulaciones: SIMULACIONES, semilla: SEMILLA,
        })
        if (!vivo) return
        const ms = Math.round(performance.now() - t0)
        const comparacion: ComparacionBanco = {
          claveMano: escenario.claveMano,
          fuente: 'vivo',
          equityVivo: r.variables.c_equity,
          equityBanco: escenario.banco.equity,
          eliteVivo: [r.prediccion.fold, r.prediccion.call, r.prediccion.raise],
          eliteBanco: [escenario.banco.prediccion.fold, escenario.banco.prediccion.call, escenario.banco.prediccion.raise],
          ms,
        }
        window.__nextchip = { comparacion, analisis: r }
        console.info('[Next Chip] lecturas en vivo vs banco', comparacion)
        setLectura({
          equity: r.variables.c_equity,
          potOdds: r.foto.potOdds,
          fold: r.prediccion.fold,
          call: r.prediccion.call,
          raise: r.prediccion.raise,
          comentario: comentarioDe(r.lectura, r.prediccion),
          fuente: 'vivo',
        })
      } catch (error) {
        if (!vivo) return
        console.warn('[Next Chip] el motor no respondió; se usan las lecturas guardadas en el banco', error)
        setLectura(deBanco(escenario))
      }
    })()
    return () => {
      vivo = false
      cliente.cerrar()
    }
  }, [escenario, usarBanco])

  return lectura
}
