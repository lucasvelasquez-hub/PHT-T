/** Piezas compartidas por las pantallas de la app: barra superior, interruptor, iconos y datos de los tres módulos. */
import type { ReactNode } from 'react'

export type ModuloId = 'instructor' | 'retador' | 'analista'

export const MODULOS: ReadonlyArray<{ id: ModuloId; nombre: string; sobre: string; texto: string }> = [
  { id: 'instructor', nombre: 'Instructor', sobre: 'Aprende', texto: 'Aprende paso a paso.' },
  { id: 'retador', nombre: 'Retador', sobre: 'Juega', texto: 'Juega manos y mide cuánto te pareces a la élite.' },
  { id: 'analista', nombre: 'Analista', sobre: 'Descubre', texto: 'Revive manos reales y descubre qué hizo la élite.' },
]

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function IconoModulo({ id, tam = 26 }: { id: ModuloId; tam?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tam} height={tam} aria-hidden="true" {...trazo}>
      {id === 'instructor' && (<><path d="M4 5.5C6.6 4.4 9.4 4.4 12 6c2.6-1.6 5.4-1.6 8-.5V18c-2.6-1.1-5.4-1.1-8 .5-2.6-1.6-5.4-1.6-8-.5Z" /><path d="M12 6v12.5" /></>)}
      {id === 'retador' && (<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.2" /><path d="M12 4v2.6M12 17.4V20M4 12h2.6M17.4 12H20" /></>)}
      {id === 'analista' && (<><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /><path d="M8 12.2l1.8-1.8 1.6 1.2 2-2.4" /></>)}
    </svg>
  )
}

export function IconoVolver() {
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...trazo}><path d="m15 5-7 7 7 7" /></svg>
}
export function IconoAjustes() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...trazo}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.6M12 18.6v2.6M4.3 7.4l2.2 1.3M17.5 15.3l2.2 1.3M4.3 16.6l2.2-1.3M17.5 8.7l2.2-1.3" />
    </svg>
  )
}
export function IconoFlecha() {
  return <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...trazo}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}
export function IconoLlama() {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M12.4 2.5c.4 3-1.2 4.4-2.6 6C8.2 10.3 7 12 7 14.4a5 5 0 0 0 10 0c0-2-.9-3.4-1.8-4.6-.2 1-.7 1.8-1.5 2.2.4-3.3-.1-6.6-1.3-9.5Z" /></svg>
}

/** Barra superior: flecha de volver a la izquierda, NEXT CHIP al centro y, opcionalmente, el engranaje a la derecha. */
export function BarraPantalla(props: { titulo?: string; onVolver?: () => void; onAjustes?: () => void }) {
  return (
    <header className="nc-barra">
      {props.onVolver ? (
        <button type="button" className="icono" aria-label="Volver" onClick={props.onVolver}><IconoVolver /></button>
      ) : <span className="nc-barra__relleno" />}
      <h1 className="nc-barra__titulo">{props.titulo ?? 'Next Chip'}</h1>
      {props.onAjustes ? (
        <button type="button" className="icono" aria-label="Ajustes" onClick={props.onAjustes}><IconoAjustes /></button>
      ) : <span className="nc-barra__relleno" />}
    </header>
  )
}

export function Interruptor(props: { activo: boolean; onCambio: (v: boolean) => void; etiquetaId: string }) {
  return (
    <button type="button" role="switch" aria-checked={props.activo} aria-labelledby={props.etiquetaId} className="nc-interruptor" onClick={() => props.onCambio(!props.activo)}>
      <span className="nc-interruptor__bola" />
    </button>
  )
}

/** Imagen opcional: si el archivo todavía no existe, se oculta y se ve el degradado que hay debajo. */
export function ImagenOpcional(props: { src: string; className: string }) {
  return <img src={props.src} alt="" className={props.className} draggable={false} onError={(e) => { e.currentTarget.style.display = 'none' }} />
}

export function Pantalla(props: { children: ReactNode; className?: string }) {
  return <main className={`nc-pantalla ${props.className ?? ''}`}>{props.children}</main>
}
