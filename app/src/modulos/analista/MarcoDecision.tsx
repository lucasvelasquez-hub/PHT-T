/**
 * MarcoDecision: la mesa de revisión de Next Chip (MarcoMesa + Mesa, del frente Juego) para UNA decisión del banco.
 * La usan el visor y "¿Adivinas?". Aquí solo se compone: ni la mesa ni el panel se reescriben.
 *
 * `eleccion` hace que la mesa reaccione a lo que el jugador eligió (fichas al bote o cartas que se retiran),
 * igual que en la mesa de revisión de `src/ui/PantallaMesa.tsx`. `puntos` hace saltar el puntaje sobre el paño.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useViewport } from '../../ui/datos/entorno.ts'
import type { Escenario } from '../../ui/datos/escenario.ts'
import { calcularEscena, aPantalla } from '../../ui/mesa/geometria.ts'
import { MarcoMesa } from '../../ui/mesa/MarcoMesa.tsx'
import { Mesa, type VueloFichas } from '../../ui/mesa/Mesa.tsx'
import { useProgreso } from '../../progreso/progreso.ts'
import type { AccionJuego, NivelPuntaje } from './logica.ts'

export interface Eleccion { id: number; accion: AccionJuego }
export interface PuntosSaltan { id: number; puntos: number; nivel: NivelPuntaje }

export interface MarcoDecisionProps {
  escenario: Escenario | null
  /** Clave extra para volver a montar la mesa (por ejemplo, el número de decisión de la sesión). */
  clave?: string
  /** Recibe `columna`: true cuando el panel va en la columna derecha (PC). */
  panel: (columna: boolean) => ReactNode
  acciones: ReactNode
  /** Reemplaza la píldora de calle y origen de la barra superior. */
  aviso?: ReactNode
  eleccion?: Eleccion | null
  puntos?: PuntosSaltan | null
  /** Avisos o errores que flotan sobre la mesa. */
  superpuesto?: ReactNode
  onVolver: () => void
}

export function MarcoDecision({ escenario, clave = '', panel, acciones, aviso, eleccion = null, puntos = null, superpuesto, onVolver }: MarcoDecisionProps) {
  const { w, h } = useViewport()
  const escena = useMemo(() => calcularEscena(w, h), [w, h])
  const { ajustes, cambiarAjuste } = useProgreso()
  const [abiertos, setAbiertos] = useState(false)

  // --- Reacción de la mesa a la elección: fichas hacia el bote, o cartas fuera con fold ---
  const [boteExtra, setBoteExtra] = useState(0)
  const [stackGastado, setStackGastado] = useState(0)
  const [vuelo, setVuelo] = useState<VueloFichas | null>(null)
  useEffect(() => {
    setBoteExtra(0); setStackGastado(0); setVuelo(null)
    if (!escenario || !eleccion || eleccion.accion === 'fold') return
    const pagoFichas = eleccion.accion === 'call'
      ? escenario.legales.pagoCall
      : (escenario.legales.subir?.min ?? 0) - escenario.estado.puesto[escenario.heroe.indice]!
    const monto = pagoFichas / escenario.estado.bb
    if (monto <= 0) return
    setStackGastado(monto)
    setVuelo({ id: eleccion.id, monto })
  }, [escenario, eleccion])
  const alLlegar = useCallback(() => { if (vuelo) setBoteExtra((b) => b + vuelo.monto) }, [vuelo])
  const alTerminarVuelo = useCallback(() => setVuelo(null), [])

  const centro = aPantalla(escena, escena.plano.bote)

  return (
    <MarcoMesa
      escena={escena}
      mesa={
        escenario ? (
          <Mesa
            key={`${escenario.claveMano}-${escenario.indiceDecision}-${clave}`}
            escena={escena}
            escenario={escenario}
            cuatroColores={ajustes.mazo4colores}
            boteBB={escenario.boteBB + boteExtra}
            stackHeroeBB={escenario.heroe.stackBB - (vuelo || boteExtra > 0 ? stackGastado : 0)}
            heroeRetirado={eleccion?.accion === 'fold'}
            vuelo={vuelo}
            onLlegadaFichas={alLlegar}
            onFinVuelo={alTerminarVuelo}
          />
        ) : (
          <div className="pantalla__fondo" aria-hidden="true" />
        )
      }
      calle={escenario?.calle ?? 'MESA'}
      origen={escenario?.etiquetaOrigen ?? 'CARGANDO'}
      aviso={aviso}
      onVolver={onVolver}
      panel={panel(escena.plano.modo === 'escritorio')}
      acciones={acciones}
      superpuesto={
        <>
          {puntos ? (
            <div
              key={puntos.id}
              className={`an-puntos an-puntos--${puntos.nivel}`}
              style={{ left: centro.x, top: centro.y }}
              aria-hidden="true"
            >
              <span className="an-puntos__cifra">+{puntos.puntos}</span>
              <span className="an-puntos__nota">puntos</span>
            </div>
          ) : null}
          {superpuesto}
        </>
      }
      ajustes={{
        abierto: abiertos,
        onAbrir: () => setAbiertos(true),
        onCerrar: () => setAbiertos(false),
        cuatroColores: ajustes.mazo4colores,
        onCuatroColores: (v) => cambiarAjuste('mazo4colores', v),
      }}
    />
  )
}
