import type { ReactNode } from 'react'

/** BarraSuperior: volver, NEXT CHIP en versalitas espaciadas y ajustes; debajo, la píldora de calle y origen. */
export interface BarraSuperiorProps {
  calle: string
  origen: string
  onVolver: () => void
  onAjustes: () => void
  /** Mensaje breve que ocupa el lugar de la píldora (por ejemplo, la acción elegida). */
  aviso?: ReactNode
}

export function BarraSuperior({ calle, origen, onVolver, onAjustes, aviso }: BarraSuperiorProps) {
  return (
    <header className="barra-superior" data-e="barra">
      <div className="barra-superior__fila">
        <button type="button" className="icono" aria-label="Volver" onClick={onVolver}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 4.5 7.5 12 15 19.5" />
          </svg>
        </button>
        <h1 className="barra-superior__titulo">NEXT CHIP</h1>
        <button type="button" className="icono" aria-label="Ajustes y créditos" onClick={onAjustes}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" transform="translate(1.2 1.2) scale(.9)" />
          </svg>
        </button>
      </div>
      {aviso ?? (
        <p className="barra-superior__situacion" aria-label={`${calle}, ${origen}`}>
          {calle} · {origen}
        </p>
      )}
    </header>
  )
}
