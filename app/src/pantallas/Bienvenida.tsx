/**
 * Bienvenida (solo la primera vez): 1) elegir nombre o jugar como invitado, 2) tres tarjetas que se deslizan,
 * una por módulo, 3) la mano guiada.
 *
 * PUNTO DE CONEXIÓN con el frente Juego: la mano guiada es `ManoGuiada` de `src/juego/index.ts`
 * (`ManoGuiada(props: { onTerminar: () => void })`). Mientras ese archivo no exista se muestra un marcador con "Saltar";
 * en cuanto exista, `import.meta.glob` lo encuentra solo, sin tocar este archivo.
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react'
import { useProgreso, NOMBRE_MAX } from '../progreso/progreso.ts'
import { BarraPantalla, IconoModulo, ImagenOpcional, MODULOS, Pantalla, type ModuloId } from './elementos.tsx'

type PropsManoGuiada = { onTerminar: () => void }
const cargadoresJuego = import.meta.glob('../juego/index.ts') as Record<string, () => Promise<{ ManoGuiada?: ComponentType<PropsManoGuiada> }>>
const cargarJuego = Object.values(cargadoresJuego)[0]
const ManoGuiadaPerezosa = cargarJuego
  ? lazy(async () => {
      const m = await cargarJuego()
      return { default: m.ManoGuiada ?? ((p: PropsManoGuiada) => <MarcadorMano onSaltar={p.onTerminar} />) }
    })
  : null

const TONOS: Record<ModuloId, string> = { instructor: 'nc-instructor', retador: 'nc-retador', analista: 'nc-analista' }

function MarcadorMano({ onSaltar }: { onSaltar: () => void }) {
  return (
    <div className="nc-marcador-mano">
      <h2 className="nc-titulo">Tu primera mano</h2>
      <p className="nc-subtitulo">Una mano de práctica, con ayuda en cada paso, llegará muy pronto.</p>
      <button type="button" className="nc-boton nc-boton--ancho" onClick={onSaltar}>Saltar</button>
    </div>
  )
}

function PasoNombre({ onListo }: { onListo: (nombre: string | null) => void }) {
  const [texto, setTexto] = useState('')
  const valido = texto.trim().length >= 1
  const enviar = (e: FormEvent) => { e.preventDefault(); if (valido) onListo(texto) }
  return (
    <section className="nc-paso" aria-labelledby="bv-titulo">
      <div className="nc-nombre">
        <div className="nc-nombre__cabeza">
          <h2 id="bv-titulo" className="nc-titulo">Bienvenido a la mesa</h2>
          <p className="nc-subtitulo">Elige cómo quieres que te llamemos. Tu progreso se guarda solo en este dispositivo.</p>
        </div>
        <form onSubmit={enviar} style={{ display: 'grid', gap: 14 }}>
          <label className="nc-campo">
            <span className="nc-campo__rotulo">Tu nombre</span>
            <input
              className="nc-campo__entrada" type="text" value={texto} maxLength={NOMBRE_MAX} autoComplete="nickname" autoCapitalize="words" spellCheck={false}
              enterKeyHint="go" placeholder="Por ejemplo, Lucía" onChange={(e) => setTexto(e.target.value)}
            />
            <span className="nc-campo__cuenta">{Math.min(texto.length, NOMBRE_MAX)}/{NOMBRE_MAX}</span>
          </label>
          <button type="submit" className="nc-boton nc-boton--ancho" disabled={!valido}>Continuar</button>
        </form>
        <button type="button" className="nc-enlace" onClick={() => onListo(null)}>Jugar como invitado</button>
      </div>
    </section>
  )
}

function PasoTarjetas({ onSiguiente }: { onSiguiente: () => void }) {
  const pista = useRef<HTMLDivElement>(null)
  const [activa, setActiva] = useState(0)
  const [todasVisibles, setTodasVisibles] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(min-width: 900px)')
    const f = () => setTodasVisibles(m.matches)
    f()
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])

  const alDeslizar = useCallback(() => {
    const el = pista.current
    if (!el) return
    const t = el.children[0] as HTMLElement | undefined
    if (!t) return
    const paso = t.offsetWidth + 14
    setActiva(Math.max(0, Math.min(MODULOS.length - 1, Math.round(el.scrollLeft / paso))))
  }, [])

  const ir = (i: number) => {
    const el = pista.current
    const t = el?.children[i] as HTMLElement | undefined
    if (!el || !t) return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: t.offsetLeft - (el.clientWidth - t.offsetWidth) / 2, behavior: reducido ? 'auto' : 'smooth' })
  }
  const ultima = todasVisibles || activa === MODULOS.length - 1

  return (
    <section className="nc-paso nc-paso--tarjetas" aria-labelledby="bv-tarjetas">
      <h2 id="bv-tarjetas" className="nc-titulo" style={{ paddingTop: 14 }}>Tres formas de mejorar</h2>
      <div className="nc-pista" ref={pista} onScroll={alDeslizar} role="list" aria-label="Los tres módulos">
        {MODULOS.map((m) => (
          <article key={m.id} className={`nc-tarjeta ${TONOS[m.id]}`} role="listitem">
            <ImagenOpcional src={`/assets/bienvenida/${m.id}.webp`} className="nc-tarjeta__img" />
            <span className="nc-tarjeta__icono"><IconoModulo id={m.id} /></span>
            <p className="nc-tarjeta__sobre">{m.sobre}</p>
            <h3 className="nc-tarjeta__nombre">{m.nombre}</h3>
            <p className="nc-tarjeta__texto">{m.texto}</p>
          </article>
        ))}
      </div>
      <div className="nc-pie">
        <div className="nc-puntos" aria-hidden="true">
          {MODULOS.map((m, i) => <span key={m.id} className={`nc-punto ${i === activa ? 'nc-punto--activo' : ''}`} />)}
        </div>
        <button type="button" className="nc-boton" onClick={() => (ultima ? onSiguiente() : ir(activa + 1))}>
          {ultima ? 'Probar una mano' : 'Siguiente'}
        </button>
      </div>
    </section>
  )
}

export default function Bienvenida({ onTerminar }: { onTerminar: () => void }) {
  const { perfil, definirPerfil } = useProgreso()
  // Si el nombre ya está elegido (por ejemplo, se recargó a mitad de la bienvenida), se sigue con las tarjetas.
  const [paso, setPaso] = useState<'nombre' | 'tarjetas' | 'mano'>(() => (perfil ? 'tarjetas' : 'nombre'))

  if (paso === 'mano') {
    return (
      <Pantalla className="nc-bienvenida">
        {ManoGuiadaPerezosa ? (
          <div className="nc-guiada">
            <Suspense fallback={null}><ManoGuiadaPerezosa onTerminar={onTerminar} /></Suspense>
          </div>
        ) : (
          <div className="nc-envoltura" style={{ justifyContent: 'center' }}><MarcadorMano onSaltar={onTerminar} /></div>
        )}
      </Pantalla>
    )
  }

  return (
    <Pantalla className="nc-bienvenida">
      <img className="nc-bienvenida__foto" src="/assets/portada/portada_movil.webp" alt="" draggable={false} />
      <div className="nc-bienvenida__velo" aria-hidden="true" />
      <div className="nc-envoltura">
        <BarraPantalla />
        {paso === 'nombre' ? (
          <PasoNombre
            onListo={(n) => {
              definirPerfil(n === null ? { nombre: 'Invitado', invitado: true } : { nombre: n, invitado: false })
              setPaso('tarjetas')
            }}
          />
        ) : (
          <PasoTarjetas onSiguiente={() => setPaso('mano')} />
        )}
      </div>
    </Pantalla>
  )
}
