/**
 * Visor: revive una mano real decisión por decisión. Muestra la mesa de revisión, las lecturas (matemática y élite)
 * y lo que hizo de verdad el jugador; con ‹ › se avanza y se retrocede de decisión (también con las flechas del teclado).
 */
import { useEffect, useMemo, useState } from 'react'
import { construirEscenario, decisionPorDefecto, type BancoManos } from '../../ui/datos/escenario.ts'
import { useAnalisis } from '../../ui/datos/useAnalisis.ts'
import { PanelLecturas } from '../../ui/mesa/PanelLecturas.tsx'
import { guardarUltimaMano } from './estado.ts'
import { describirAccion, POSICIONES, type CodigoAccion } from './logica.ts'
import { MarcoDecision } from './MarcoDecision.tsx'

export interface VisorProps {
  banco: BancoManos
  k: number
  /** Índice de acción (`d`) donde abrir; si falta, la decisión por defecto de la mesa de revisión. */
  d?: number
  onVolver: () => void
  /** Texto del botón de salida cuando hay otra mano que buscar. */
  onOtraMano?: () => void
}

export function Visor({ banco, k, d, onVolver, onOtraMano }: VisorProps) {
  const mano = useMemo(() => banco.manos.find((m) => m.k === k) ?? null, [banco, k])
  const indices = useMemo(() => mano?.d.map((x) => x[0]) ?? [], [mano])
  const [idx, setIdx] = useState<number | null>(null)

  // Al cambiar de mano se abre en la decisión pedida (o en la de siempre).
  useEffect(() => {
    if (!mano) { setIdx(null); return }
    const pedida = d !== undefined && indices.includes(d) ? d : decisionPorDefecto(mano, banco.meta.orden_variables)
    setIdx(pedida)
  }, [mano, d, indices, banco])

  const posicion = idx === null ? -1 : indices.indexOf(idx)

  const { escenario, fallo } = useMemo(() => {
    if (idx === null) return { escenario: null, fallo: null }
    try { return { escenario: construirEscenario(banco, k, idx), fallo: null } } catch (e) { return { escenario: null, fallo: e instanceof Error ? e.message : String(e) } }
  }, [banco, k, idx])

  const lectura = useAnalisis(escenario, true)

  useEffect(() => { if (idx !== null && escenario) guardarUltimaMano(k, idx) }, [k, idx, escenario])

  const ir = (delta: number) => {
    const destino = indices[posicion + delta]
    if (destino !== undefined) setIdx(destino)
  }

  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const destino = e.key === 'ArrowLeft' ? indices[posicion - 1] : e.key === 'ArrowRight' ? indices[posicion + 1] : undefined
      if (destino !== undefined) { e.preventDefault(); setIdx(destino) }
    }
    window.addEventListener('keydown', alTecla)
    return () => window.removeEventListener('keydown', alTecla)
  }, [indices, posicion])

  // --- Lo que hizo de verdad el jugador ---
  const real = useMemo(() => {
    if (!mano || idx === null || !escenario) return null
    const dec = mano.d.find((x) => x[0] === idx)!
    const a = mano.a[idx]!
    return {
      texto: describirAccion(dec[1] as CodigoAccion, a[2]!, a[3]!, escenario.estado.bb, escenario.aPagarBB > 0),
      jugador: escenario.heroe.nombre,
      posicion: POSICIONES[a[0]!] ?? '',
    }
  }, [mano, idx, escenario])

  const acciones = (
    <div className="an-nav" role="group" aria-label="Recorrer la mano" data-e="visor-nav">
      <button type="button" className="icono an-nav__paso" aria-label="Decisión anterior" disabled={posicion <= 0} onClick={() => ir(-1)}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5 8 12l7 7" /></svg>
      </button>
      <div className="an-nav__real" aria-live="polite" data-e="accion-real">
        {real ? (
          <>
            <span className="an-nav__quien">{real.jugador} · {real.posicion} · decisión {posicion + 1} de {indices.length}</span>
            <span className="an-nav__hizo">Hizo <b>{real.texto}</b></span>
          </>
        ) : <span className="an-nav__quien">Cargando la mano…</span>}
      </div>
      <button type="button" className="icono an-nav__paso" aria-label="Decisión siguiente" disabled={posicion < 0 || posicion >= indices.length - 1} onClick={() => ir(1)}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
      </button>
    </div>
  )

  const error = !mano ? `La mano ${k} no está en el banco.` : fallo
  return (
    <MarcoDecision
      escenario={escenario}
      panel={(columna) => <PanelLecturas lectura={lectura} columna={columna} />}
      acciones={acciones}
      onVolver={onVolver}
      superpuesto={
        error ? (
          <div className="error" role="alert">
            <p>{error}</p>
            <button type="button" className="accion accion--call" onClick={onOtraMano ?? onVolver}>Buscar otra mano</button>
          </div>
        ) : null
      }
    />
  )
}
