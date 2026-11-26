/** Piezas pequeñas del Instructor: texto con markdown en línea, estrellas, iconos y la barra de avance. */
import { marked } from 'marked'
import { useMemo } from 'react'

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** Los palos rojos (♥ ♦) se pintan en rojo suave para que se lean sobre fondo oscuro. */
export function conPalos(html: string): string {
  return html.replace(/[♥♦]/g, (p) => `<span class="ins-palo-rojo">${p}</span>`)
}

/** Texto en línea con markdown (negritas, cursivas) y palos de colores. El contenido es del propio curso. */
export function Rico({ texto, className }: { texto: string; className?: string }) {
  const html = useMemo(() => conPalos(marked.parseInline(texto, { async: false }) as string), [texto])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** HTML de bloque ya convertido por el curso (una pantalla de lección). */
export function HtmlLeccion({ html, className }: { html: string; className?: string }) {
  const conPalosRojos = useMemo(() => conPalos(html), [html])
  return <div className={className} dangerouslySetInnerHTML={{ __html: conPalosRojos }} />
}

export function IconoEstrella({ llena, tam = 18 }: { llena: boolean; tam?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" className={`ins-estrella ${llena ? 'ins-estrella--llena' : ''}`}>
      <path d="m12 2.9 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1L3.2 9.4l6.1-.9Z" />
    </svg>
  )
}

export function Estrellas({ n, tam = 18 }: { n: number; tam?: number }) {
  return (
    <span className="ins-estrellas" role="img" aria-label={`${n} de 3 estrellas`}>
      {[0, 1, 2].map((i) => <IconoEstrella key={i} llena={i < n} tam={tam} />)}
    </span>
  )
}

export function IconoCheck({ tam = 28 }: { tam?: number }) {
  return <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" {...trazo} strokeWidth={2.6}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
}
export function IconoEvaluacion({ tam = 28 }: { tam?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" {...trazo}>
      <rect x="5" y="4" width="14" height="17" rx="2.4" /><path d="M9 4.2V3h6v1.2" /><path d="m8.6 11 1.4 1.4 2.4-2.6M8.6 16.6h6.8" />
    </svg>
  )
}
export function IconoCartas({ tam = 28 }: { tam?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" {...trazo}>
      <rect x="4" y="5.5" width="10" height="14" rx="2" transform="rotate(-9 9 12.5)" /><rect x="10" y="4.5" width="10" height="14" rx="2" transform="rotate(8 15 11.5)" />
    </svg>
  )
}
export function IconoRepaso({ tam = 24 }: { tam?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" {...trazo}>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.9-5.2L19.5 9" /><path d="M19.5 4.5V9H15" /><path d="M19.5 12a7.5 7.5 0 0 1-12.9 5.2L4.5 15" /><path d="M4.5 19.5V15H9" />
    </svg>
  )
}
export function IconoJugar({ tam = 22 }: { tam?: number }) {
  return <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" fill="currentColor"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.8l10.6-6.8a1 1 0 0 0 0-1.6L9.5 4.4A1 1 0 0 0 8 5.2Z" /></svg>
}
export function IconoLibro({ tam = 26 }: { tam?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" {...trazo}>
      <path d="M4 5.5C6.6 4.4 9.4 4.4 12 6c2.6-1.6 5.4-1.6 8-.5V18c-2.6-1.1-5.4-1.1-8 .5-2.6-1.6-5.4-1.6-8-.5Z" /><path d="M12 6v12.5" />
    </svg>
  )
}
export function IconoVer({ tam = 20 }: { tam?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" {...trazo}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" />
    </svg>
  )
}

/** Barra de avance segmentada: `total` tramos, los primeros `hechos` encendidos. `estados` pinta cada tramo (acierto/fallo). */
export function BarraAvance({ total, actual, estados, etiqueta }: { total: number; actual: number; estados?: ('ok' | 'no' | undefined)[]; etiqueta: string }) {
  return (
    <div className="ins-avance" role="progressbar" aria-label={etiqueta} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(actual + 1, total)}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`ins-avance__tramo ${i < actual ? 'ins-avance__tramo--hecho' : ''} ${i === actual ? 'ins-avance__tramo--actual' : ''} ${estados?.[i] === 'ok' ? 'is-ok' : ''} ${estados?.[i] === 'no' ? 'is-no' : ''}`} />
      ))}
    </div>
  )
}
