/** Ayudas de movimiento compartidas: curva, duraciones y la preferencia de movimiento reducido. */
import gsap from 'gsap'
import { useEffect, useState } from 'react'

// Las duraciones son tiempo real: si el navegador retrasa cuadros (pestaña en segundo plano), la animación igual termina a tiempo.
gsap.ticker.lagSmoothing(0)

/** Salida exponencial: arranca rápido y se asienta sin rebote. */
export const CURVA_GSAP = 'expo.out'
export const CURVA_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)'
/** Duración de las cifras y barras (s). */
export const DURACION_CIFRAS = 0.36

const CONSULTA = '(prefers-reduced-motion: reduce)'

export function movimientoReducido(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(CONSULTA).matches
}

export function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState(movimientoReducido)
  useEffect(() => {
    const m = window.matchMedia(CONSULTA)
    const alCambiar = () => setReducido(m.matches)
    m.addEventListener('change', alCambiar)
    return () => m.removeEventListener('change', alCambiar)
  }, [])
  return reducido
}
