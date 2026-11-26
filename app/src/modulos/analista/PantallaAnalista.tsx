/**
 * Módulo Analista: revive manos reales de Pluribus decisión por decisión.
 *   inicio  -> buscador de manos -> visor (mesa de revisión, avance y retroceso)
 *           -> ¿Adivinas qué hizo la élite? (sesión de 10 decisiones) -> resumen
 * La ruta `#/analista/<mano>` abre esa mano directamente en el visor.
 */
import { useCallback, useEffect, useState } from 'react'
import { useRuta } from '../../app/navegacion.ts'
import { Pantalla } from '../../pantallas/elementos.tsx'
import { Adivinas } from './Adivinas.tsx'
import { useBanco } from './banco.ts'
import { Buscador, BUSQUEDA_INICIAL, type Busqueda } from './Buscador.tsx'
import { InicioAnalista } from './InicioAnalista.tsx'
import { Visor } from './Visor.tsx'
import './analista.css'

type Vista =
  | { tipo: 'inicio' }
  | { tipo: 'buscador' }
  | { tipo: 'adivinas' }
  | { tipo: 'visor'; k: number; d?: number; desde: 'inicio' | 'buscador' | 'adivinas' }

export default function PantallaAnalista(props: { onSalir: () => void }) {
  const [ruta] = useRuta()
  const rutaMano = ruta.pantalla === 'analista' ? ruta.mano : undefined
  const [vista, setVista] = useState<Vista>(() => (rutaMano !== undefined ? { tipo: 'visor', k: rutaMano, desde: 'inicio' } : { tipo: 'inicio' }))
  const [busqueda, setBusqueda] = useState<Busqueda>(BUSQUEDA_INICIAL)
  const { datos, error, reintentar } = useBanco()

  // Si la ruta cambia a otra mano estando aquí, se abre esa mano.
  useEffect(() => {
    if (rutaMano !== undefined) setVista((v) => (v.tipo === 'visor' && v.k === rutaMano ? v : { tipo: 'visor', k: rutaMano, desde: 'inicio' }))
  }, [rutaMano])

  const aInicio = useCallback(() => setVista({ tipo: 'inicio' }), [])

  if (vista.tipo === 'inicio') {
    return (
      <InicioAnalista
        datos={datos}
        onAdivinar={() => setVista({ tipo: 'adivinas' })}
        onBuscar={() => setVista({ tipo: 'buscador' })}
        onContinuar={(k, d) => setVista({ tipo: 'visor', k, d, desde: 'inicio' })}
        onSalir={props.onSalir}
      />
    )
  }

  // Todo lo demás necesita el banco de manos.
  if (!datos) {
    return (
      <Pantalla>
        <div className="nc-envoltura nc-analista an-envoltura">
          <div className="an-carga" role={error ? 'alert' : 'status'}>
            {error ? (
              <>
                <p>No se pudo cargar el banco de manos. {error}</p>
                <button type="button" className="nc-boton" onClick={reintentar}>Reintentar</button>
                <button type="button" className="nc-enlace" onClick={aInicio}>Volver</button>
              </>
            ) : (
              <>
                <span className="an-carga__giro" aria-hidden="true" />
                <p>Cargando las manos reales…</p>
              </>
            )}
          </div>
        </div>
      </Pantalla>
    )
  }

  switch (vista.tipo) {
    case 'buscador':
      return (
        <Buscador
          datos={datos}
          busqueda={busqueda}
          onBusqueda={setBusqueda}
          onAbrir={(k, d) => setVista({ tipo: 'visor', k, d, desde: 'buscador' })}
          onSalir={aInicio}
        />
      )
    case 'adivinas':
      return (
        <Adivinas
          datos={datos}
          onSalir={aInicio}
          onRevisar={(k, d) => setVista({ tipo: 'visor', k, d, desde: 'adivinas' })}
        />
      )
    case 'visor':
      return (
        <Visor
          banco={datos.banco}
          k={vista.k}
          d={vista.d}
          onVolver={() => setVista(vista.desde === 'buscador' ? { tipo: 'buscador' } : vista.desde === 'adivinas' ? { tipo: 'adivinas' } : { tipo: 'inicio' })}
          onOtraMano={() => setVista({ tipo: 'buscador' })}
        />
      )
  }
}
