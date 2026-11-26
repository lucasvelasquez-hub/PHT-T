/**
 * App: decide qué pantalla se ve según la ruta (`location.hash`, ver app/navegacion.ts) y el progreso guardado.
 *   portada -> bienvenida (solo la primera vez) -> inicio -> módulo -> volver
 * Los parámetros de revisión de la mesa (?mano=…&d=…&fuente=banco&ajustes=1) abren directo la mesa de revisión.
 */
import { lazy, Suspense, useEffect, useMemo } from 'react'
import { hashDesdeRuta, useRuta, type Ruta } from './app/navegacion.ts'
import Bienvenida from './pantallas/Bienvenida.tsx'
import Inicio from './pantallas/Inicio.tsx'
import PantallaAjustes from './pantallas/PantallaAjustes.tsx'
import PantallaCreditos from './pantallas/PantallaCreditos.tsx'
import Portada from './pantallas/Portada.tsx'
import { useProgreso } from './progreso/progreso.ts'
import { precalentar } from './app/precalentar.ts'
import { iniciarSonido, reproducir } from './sonido/sonido.ts'

const PantallaAnalista = lazy(() => import('./modulos/analista/PantallaAnalista.tsx'))
const PantallaInstructor = lazy(() => import('./modulos/instructor/PantallaInstructor.tsx'))
const PantallaRetador = lazy(() => import('./modulos/retador/PantallaRetador.tsx'))
const PantallaMesa = lazy(() => import('./ui/PantallaMesa.tsx'))
const PARAMETROS_REVISION = ['mano', 'd', 'fuente', 'ajustes']

/** Pantallas que piden haber elegido nombre (o invitado) antes. */
const NECESITAN_PERFIL: ReadonlyArray<Ruta['pantalla']> = ['inicio', 'retador', 'instructor', 'analista', 'ajustes']

export default function App() {
  const [ruta, ir] = useRuta()
  const { perfil, bienvenidaVista, marcarBienvenidaVista, sincronizarMazo } = useProgreso()
  const revision = useMemo(() => {
    const p = new URLSearchParams(window.location.search)
    return PARAMETROS_REVISION.some((k) => p.has(k))
  }, [])

  // Ruta efectiva: sin perfil no se entra a pantallas de juego; la bienvenida ya vista no se repite.
  const efectiva: Ruta =
    !perfil && NECESITAN_PERFIL.includes(ruta.pantalla) ? { pantalla: 'bienvenida' }
    : bienvenidaVista && ruta.pantalla === 'bienvenida' ? { pantalla: 'inicio' }
    : ruta
  const destino = hashDesdeRuta(efectiva)
  useEffect(() => {
    if (!revision && destino !== hashDesdeRuta(ruta)) window.location.replace(destino)
  }, [revision, destino, ruta])

  useEffect(() => { iniciarSonido() }, [])
  useEffect(() => { if (!revision && efectiva.pantalla === 'portada') precalentar() }, [revision, efectiva.pantalla])
  // La hoja de ajustes de la mesa de revisión escribe el mazo en su clave antigua: se recoge al cambiar de pantalla.
  useEffect(() => { sincronizarMazo() }, [ruta.pantalla, sincronizarMazo])

  // Sonido de botón en las pantallas de la app (la mesa pone los suyos).
  useEffect(() => {
    const alTocar = (e: MouseEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest('.nc-pantalla button:not(:disabled), .nc-pantalla a[href]')) reproducir('boton')
    }
    document.addEventListener('click', alTocar)
    return () => document.removeEventListener('click', alTocar)
  }, [])

  if (revision) {
    return <Suspense fallback={null}><PantallaMesa /></Suspense>
  }

  const salir = () => ir({ pantalla: 'inicio' })
  const pantalla = (() => {
    switch (efectiva.pantalla) {
      case 'portada':
        return <Portada onJugar={() => ir({ pantalla: bienvenidaVista && perfil ? 'inicio' : 'bienvenida' })} />
      case 'bienvenida':
        return <Bienvenida onTerminar={() => { marcarBienvenidaVista(); ir({ pantalla: 'inicio' }) }} />
      case 'inicio':
        return <Inicio ir={ir} />
      case 'retador':
        return <PantallaRetador onSalir={salir} />
      case 'instructor':
        return <PantallaInstructor onSalir={salir} />
      case 'analista':
        return <PantallaAnalista onSalir={salir} />
      case 'ajustes':
        return <PantallaAjustes onSalir={salir} />
      case 'creditos':
        return <PantallaCreditos onSalir={() => ir(perfil ? { pantalla: 'inicio' } : { pantalla: 'portada' })} />
    }
  })()
  return <Suspense fallback={null}>{pantalla}</Suspense>
}
