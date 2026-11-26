/**
 * PanelLecturas: las dos lecturas lado a lado y la línea del comentarista.
 *  - MATEMÁTICA: equity grande, barra blanca con la marca de las pot odds.
 *  - ÉLITE: tres barras cobalto (Fold, Check-Call, Bet-Raise) con su porcentaje.
 * Las cifras y las barras corren juntas hasta su valor (~0.36 s, salida exponencial); con movimiento reducido
 * aparecen ya en su valor.
 */
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { fmtPct } from '../datos/formato.ts'
import { CURVA_GSAP, DURACION_CIFRAS, movimientoReducido } from '../movimiento.ts'

export interface Lectura {
  /** Equity en 0..1. */
  equity: number
  /** Pot odds en 0..1 (0 si no hay nada que pagar). */
  potOdds: number
  fold: number
  call: number
  raise: number
  comentario: string
  fuente: 'vivo' | 'banco'
}

const FILAS = [
  { clave: 'fold', nombre: 'Fold' },
  { clave: 'call', nombre: 'Check-Call' },
  { clave: 'raise', nombre: 'Bet-Raise' },
] as const

/** `ayuda`: texto de la mano guiada; ocupa el lugar del comentario de la élite. */
export function PanelLecturas({ lectura, columna = false, ayuda = null }: { lectura: Lectura | null; columna?: boolean; ayuda?: string | null }) {
  const raiz = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = raiz.current
      if (!el || !lectura) return
      const campos = {
        eq: { v: lectura.equity, texto: el.querySelector<HTMLElement>('[data-v="eq"]'), barra: el.querySelector<HTMLElement>('[data-b="eq"]') },
        fold: { v: lectura.fold, texto: el.querySelector<HTMLElement>('[data-v="fold"]'), barra: el.querySelector<HTMLElement>('[data-b="fold"]') },
        call: { v: lectura.call, texto: el.querySelector<HTMLElement>('[data-v="call"]'), barra: el.querySelector<HTMLElement>('[data-b="call"]') },
        raise: { v: lectura.raise, texto: el.querySelector<HTMLElement>('[data-v="raise"]'), barra: el.querySelector<HTMLElement>('[data-b="raise"]') },
      }
      const pinta = (t: number) => {
        for (const c of Object.values(campos)) {
          const v = c.v * t
          if (c.texto) c.texto.textContent = fmtPct(v)
          if (c.barra) c.barra.style.transform = `scaleX(${Math.min(Math.max(v, 0), 1)})`
        }
      }
      if (movimientoReducido()) {
        pinta(1)
        gsap.fromTo(el.querySelector('[data-e="lecturas"]'), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' })
        return
      }
      const paso = { t: 0 }
      pinta(0)
      gsap.to(paso, { t: 1, duration: DURACION_CIFRAS, ease: CURVA_GSAP, onUpdate: () => pinta(paso.t) })
    },
    { scope: raiz, dependencies: [lectura] },
  )

  const cargando = lectura === null
  const marca = lectura ? Math.min(Math.max(lectura.potOdds, 0), 1) : 0
  const alineacion = marca < 0.2 ? 'inicio' : marca > 0.8 ? 'fin' : 'centro'

  return (
    <section
      ref={raiz}
      className={`panel__lecturas ${columna ? 'panel__lecturas--columna' : ''}`}
      aria-label="Lecturas de la situación"
      aria-busy={cargando}
      data-e="panel"
      data-fuente={lectura?.fuente}
    >
      <div className="panel__cols" data-e="lecturas">
        <div className="panel__mate">
          <h2 className="panel__titulo">MATEMÁTICA</h2>
          <p className="panel__cifra" aria-label={lectura ? `Equity ${fmtPct(lectura.equity)}` : 'Calculando'}>
            <span data-v="eq">{cargando ? '—' : fmtPct(lectura.equity)}</span>
          </p>
          <div
            className="barra barra--mate"
            role="img"
            aria-label={lectura ? `Equity ${fmtPct(lectura.equity)} frente a pot odds ${fmtPct(lectura.potOdds)}` : 'Equity frente a pot odds'}
          >
            <div className="barra__relleno barra__relleno--blanco" data-b="eq" />
            {lectura && lectura.potOdds > 0 ? <div className="barra__marca" style={{ left: `${marca * 100}%` }} /> : null}
          </div>
          {lectura && lectura.potOdds > 0 ? (
            <div className="barra__leyenda" aria-hidden="true">
              <span className={`barra__etiqueta barra__etiqueta--${alineacion}`} style={{ left: `${marca * 100}%` }}>
                POT ODDS {fmtPct(lectura.potOdds)}
              </span>
            </div>
          ) : (
            <div className="barra__leyenda" aria-hidden="true">{cargando ? <span className="barra__etiqueta barra__etiqueta--inicio" style={{ left: 0 }}>Calculando…</span> : null}</div>
          )}
        </div>

        <div className="panel__elite">
          <h2 className="panel__titulo">ÉLITE</h2>
          <ul className="panel__filas">
            {FILAS.map((f) => (
              <li key={f.clave} className="fila">
                <span className="fila__nombre">{f.nombre}</span>
                <span className="fila__valor" data-v={f.clave}>{cargando ? '—' : fmtPct(lectura[f.clave])}</span>
                <div className="barra barra--elite" role="img" aria-label={lectura ? `${f.nombre} ${fmtPct(lectura[f.clave])}` : f.nombre}>
                  <div className="barra__relleno barra__relleno--cobalto" data-b={f.clave} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {ayuda ? (
        <p className="panel__comentario panel__comentario--ayuda" data-e="ayuda" role="status">{ayuda}</p>
      ) : (
        <p className="panel__comentario" data-e="comentario">
          {cargando ? <span className="panel__esqueleto" aria-hidden="true" /> : <em>{lectura.comentario}</em>}
        </p>
      )}
    </section>
  )
}
