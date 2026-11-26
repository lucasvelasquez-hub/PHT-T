/** Ayudas del entorno compartidas por las pantallas de la mesa: tamaño de la ventana y ajustes guardados. */
import { useEffect, useState } from 'react'

export function leerAjuste(clave: string): boolean {
  try { return window.localStorage.getItem(clave) === '1' } catch { return false }
}

export function guardarAjuste(clave: string, v: boolean) {
  try { window.localStorage.setItem(clave, v ? '1' : '0') } catch { /* sin almacenamiento: el ajuste dura la sesión */ }
}

export const CLAVE_MAZO4 = 'nextchip:mazo4'

export function useViewport() {
  const [t, setT] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const medir = () => setT((a) => (a.w === window.innerWidth && a.h === window.innerHeight ? a : { w: window.innerWidth, h: window.innerHeight }))
    medir()
    window.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('resize', medir)
    }
  }, [])
  return t
}
