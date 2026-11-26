/**
 * Portada: foto de fondo (celular o escritorio) y, encima y en código, el logo, el lema y el botón JUGAR.
 * Si la foto de escritorio no existe todavía, se usa la del celular centrada sobre fondo oscuro.
 */
import { useEffect, useState } from 'react'

const MOVIL = '/assets/portada/portada_movil.webp'
const ESCRITORIO = '/assets/portada/portada_escritorio.webp'

function useExiste(url: string) {
  const [existe, setExiste] = useState(false)
  useEffect(() => {
    let vivo = true
    const im = new Image()
    im.onload = () => vivo && setExiste(true)
    im.onerror = () => vivo && setExiste(false)
    im.src = url
    return () => { vivo = false }
  }, [url])
  return existe
}

function useAncho(minimo: number) {
  const consulta = `(min-width: ${minimo}px) and (min-aspect-ratio: 1/1)`
  const [ok, setOk] = useState(() => window.matchMedia(consulta).matches)
  useEffect(() => {
    const m = window.matchMedia(consulta)
    const f = () => setOk(m.matches)
    m.addEventListener('change', f)
    f()
    return () => m.removeEventListener('change', f)
  }, [consulta])
  return ok
}

export default function Portada({ onJugar }: { onJugar: () => void }) {
  const hayEscritorio = useExiste(ESCRITORIO)
  const ancho = useAncho(900)
  const usaEscritorio = ancho && hayEscritorio
  return (
    <main className={`nc-portada ${usaEscritorio ? 'nc-portada--escritorio' : ancho ? 'nc-portada--solo-movil' : 'nc-portada--movil'}`}>
      <img className="nc-portada__img" src={usaEscritorio ? ESCRITORIO : MOVIL} alt="" draggable={false} fetchPriority="high" />
      <div className="nc-portada__velo" aria-hidden="true" />
      <div className="nc-portada__contenido">
        <h1 className="nc-logo">Next Chip</h1>
        <p className="nc-lema">Juega como la élite</p>
        <div className="nc-portada__pie">
          <button type="button" className="nc-boton nc-boton--grande" onClick={onJugar}>Jugar</button>
        </div>
      </div>
    </main>
  )
}
