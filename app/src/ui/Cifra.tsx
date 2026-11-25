/** Cifra: un número que corre hasta su nuevo valor (~0.36 s, salida exponencial). Con movimiento reducido cambia de golpe. */
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { CURVA_GSAP, DURACION_CIFRAS, movimientoReducido } from './movimiento.ts'

export function Cifra({ valor, formato }: { valor: number; formato: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const mostrado = useRef(valor)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const desde = mostrado.current
      if (desde === valor || movimientoReducido()) {
        mostrado.current = valor
        el.textContent = formato(valor)
        return
      }
      const paso = { v: desde }
      gsap.to(paso, {
        v: valor,
        duration: DURACION_CIFRAS,
        ease: CURVA_GSAP,
        onUpdate: () => {
          mostrado.current = paso.v
          el.textContent = formato(paso.v)
        },
        onComplete: () => {
          mostrado.current = valor
          el.textContent = formato(valor)
        },
      })
    },
    { dependencies: [valor] },
  )

  return <span ref={ref}>{formato(valor)}</span>
}
