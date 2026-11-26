/**
 * banco.ts: carga el banco de manos reales UNA vez por visita y arma el índice de decisiones.
 * Lo usan el buscador, el visor y "¿Adivinas?" sin volver a pedir los 3.5 MB.
 */
import { useCallback, useEffect, useState } from 'react'
import { cargarBanco, type BancoManos } from '../../ui/datos/escenario.ts'
import { indexarBanco, type Decision } from './logica.ts'

export interface BancoIndexado { banco: BancoManos; decisiones: Decision[] }

let promesa: Promise<BancoIndexado> | null = null

export function cargarBancoIndexado(): Promise<BancoIndexado> {
  promesa ??= cargarBanco().then(
    (banco) => ({ banco, decisiones: indexarBanco(banco) }),
    (e) => { promesa = null; throw e }, // si falla, el próximo intento vuelve a pedirlo
  )
  return promesa
}

export interface EstadoBanco {
  datos: BancoIndexado | null
  error: string | null
  reintentar: () => void
}

export function useBanco(): EstadoBanco {
  const [datos, setDatos] = useState<BancoIndexado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    let vivo = true
    setError(null)
    cargarBancoIndexado().then(
      (d) => vivo && setDatos(d),
      (e: unknown) => vivo && setError(e instanceof Error ? e.message : String(e)),
    )
    return () => { vivo = false }
  }, [intento])
  const reintentar = useCallback(() => setIntento((n) => n + 1), [])
  return { datos, error, reintentar }
}
