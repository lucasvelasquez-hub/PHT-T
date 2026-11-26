/**
 * Buscador: las manos reales del banco, con filtros por calle de la decisión, posición del jugador y cartas.
 * Una fila por mano (apunta a la primera decisión suya que cumple todos los filtros). Lista paginada de 20 en 20.
 */
import { useEffect, useMemo, useRef } from 'react'
import { rutaCarta } from '../../ui/mesa/Carta.tsx'
import { useProgreso } from '../../progreso/progreso.ts'
import { BarraPantalla, Pantalla } from '../../pantallas/elementos.tsx'
import type { BancoIndexado } from './banco.ts'
import {
  buscarManos, describirAccion, FILTROS_CARTAS, hayFiltros, nombreDeMano, NOMBRES_CALLE, paginar, POSICIONES, SIN_FILTROS,
  type Calle, type Decision, type FilaMano, type FiltroCarta, type Filtros,
} from './logica.ts'

export const POR_PAGINA = 20

export interface Busqueda { filtros: Filtros; pagina: number }
export const BUSQUEDA_INICIAL: Busqueda = { filtros: SIN_FILTROS, pagina: 0 }

export interface BuscadorProps {
  datos: BancoIndexado
  busqueda: Busqueda
  onBusqueda: (b: Busqueda) => void
  onAbrir: (k: number, d: number) => void
  onSalir: () => void
}

const CALLES: Calle[] = [0, 1, 2, 3]

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`an-chip ${activo ? 'an-chip--activo' : ''}`} aria-pressed={activo} onClick={onClick}>{children}</button>
  )
}

export function Buscador({ datos, busqueda, onBusqueda, onAbrir, onSalir }: BuscadorProps) {
  const { filtros } = busqueda
  const { ajustes } = useProgreso()
  const filas = useMemo(() => buscarManos(datos.decisiones, filtros), [datos, filtros])
  const { items, pagina, paginas } = paginar(filas, busqueda.pagina, POR_PAGINA)
  const lista = useRef<HTMLElement>(null)

  // Al cambiar de página, la lista vuelve arriba.
  useEffect(() => { lista.current?.scrollIntoView({ block: 'nearest' }); const r = lista.current?.closest('.nc-pantalla'); if (r) r.scrollTop = 0 }, [pagina])

  const cambiar = (f: Partial<Filtros>) => onBusqueda({ filtros: { ...filtros, ...f }, pagina: 0 })
  const alternarCarta = (c: FiltroCarta) =>
    cambiar({ cartas: filtros.cartas.includes(c) ? filtros.cartas.filter((x) => x !== c) : [...filtros.cartas, c] })

  return (
    <Pantalla>
      <div className="nc-envoltura nc-analista an-envoltura">
        <BarraPantalla titulo="Buscar manos" onVolver={onSalir} />

        <section className="an-filtros" aria-label="Filtros">
          <div className="an-grupo" role="group" aria-label="Calle de la decisión">
            <h2 className="an-grupo__titulo">Calle</h2>
            <div className="an-chips">
              <Chip activo={filtros.calle === null} onClick={() => cambiar({ calle: null })}>Todas</Chip>
              {CALLES.map((c) => <Chip key={c} activo={filtros.calle === c} onClick={() => cambiar({ calle: filtros.calle === c ? null : c })}>{NOMBRES_CALLE[c]![0] + NOMBRES_CALLE[c]!.slice(1).toLowerCase()}</Chip>)}
            </div>
          </div>
          <div className="an-grupo" role="group" aria-label="Posición del jugador">
            <h2 className="an-grupo__titulo">Posición</h2>
            <div className="an-chips">
              <Chip activo={filtros.posicion === null} onClick={() => cambiar({ posicion: null })}>Todas</Chip>
              {POSICIONES.map((p, i) => <Chip key={p} activo={filtros.posicion === i} onClick={() => cambiar({ posicion: filtros.posicion === i ? null : i })}>{p}</Chip>)}
            </div>
          </div>
          <div className="an-grupo" role="group" aria-label="Cartas del jugador">
            <h2 className="an-grupo__titulo">Cartas</h2>
            <div className="an-chips">
              {FILTROS_CARTAS.map((c) => <Chip key={c.id} activo={filtros.cartas.includes(c.id)} onClick={() => alternarCarta(c.id)}>{c.nombre}</Chip>)}
            </div>
          </div>
        </section>

        <div className="an-conteo">
          <p role="status" aria-live="polite" data-e="conteo">
            <b>{filas.length.toLocaleString('es-MX')}</b> {filas.length === 1 ? 'mano' : 'manos'}
            {hayFiltros(filtros) ? ' con estos filtros' : ' en el banco'}
          </p>
          {hayFiltros(filtros) ? <button type="button" className="nc-enlace" onClick={() => onBusqueda(BUSQUEDA_INICIAL)}>Limpiar filtros</button> : null}
        </div>

        <section ref={lista} aria-label="Manos encontradas">
          {items.length === 0 ? (
            <p className="an-vacio">Ninguna mano cumple todos esos filtros a la vez. Quita alguno para ver más.</p>
          ) : (
            <ul className="an-lista">
              {items.map((f) => <Fila key={f.decision.k} fila={f} cuatroColores={ajustes.mazo4colores} onAbrir={onAbrir} />)}
            </ul>
          )}
        </section>

        {paginas > 1 ? (
          <nav className="an-paginas" aria-label="Páginas">
            <button type="button" className="nc-boton-suave" disabled={pagina === 0} onClick={() => onBusqueda({ filtros, pagina: pagina - 1 })}>Anterior</button>
            <span className="an-paginas__estado">Página <b>{pagina + 1}</b> de {paginas}</span>
            <button type="button" className="nc-boton-suave" disabled={pagina >= paginas - 1} onClick={() => onBusqueda({ filtros, pagina: pagina + 1 })}>Siguiente</button>
          </nav>
        ) : null}
      </div>
    </Pantalla>
  )
}

function Fila({ fila, cuatroColores, onAbrir }: { fila: FilaMano; cuatroColores: boolean; onAbrir: (k: number, d: number) => void }) {
  const d: Decision = fila.decision
  const cartas = [d.cartas.slice(0, 2), d.cartas.slice(2, 4)]
  const verbo = describirAccion(d.real, d.hastaFichas, d.pagoFichas, d.bb, d.aPagarBB > 0)
  return (
    <li>
      <button type="button" className="an-fila" onClick={() => onAbrir(d.k, d.idx)} aria-label={`Mano ${d.k}, ${NOMBRES_CALLE[d.calle]}, ${nombreDeMano(d.cartas)}, ${POSICIONES[d.asiento]}`}>
        <span className="an-fila__cartas" aria-hidden="true">
          {cartas.map((c) => <img key={c} src={rutaCarta(c, cuatroColores)} alt="" width={34} height={48} loading="lazy" draggable={false} />)}
        </span>
        <span className="an-fila__datos">
          <span className="an-fila__titulo">
            <b>{nombreDeMano(d.cartas)}</b> · {POSICIONES[d.asiento]} · {NOMBRES_CALLE[d.calle]}
          </span>
          <span className="an-fila__sub">
            Mano #{d.k} · {d.jugador} · hizo {verbo}
            {fila.coinciden > 1 ? ` · ${fila.coinciden} decisiones` : ''}
          </span>
        </span>
        <span className="an-etiqueta">REAL · PLURIBUS</span>
      </button>
    </li>
  )
}
