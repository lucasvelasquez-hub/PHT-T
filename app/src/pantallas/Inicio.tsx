/** Inicio: saludo, ficha del rango con su barra de XP, racha, tres tarjetas grandes de módulos y accesos a Ajustes y Créditos. */
import { hashDesdeRuta, type Ruta } from '../app/navegacion.ts'
import type { CSSProperties } from 'react'
import { rangoDe, useProgreso } from '../progreso/progreso.ts'
import { BarraPantalla, IconoFlecha, IconoLlama, IconoModulo, ImagenOpcional, MODULOS, Pantalla } from './elementos.tsx'

const miles = (n: number) => n.toLocaleString('es-MX')
const plural = (n: number, uno: string, varios: string) => (n === 1 ? uno : varios)

export default function Inicio({ ir }: { ir: (r: Ruta) => void }) {
  const { perfil, xp, rango, racha } = useProgreso()
  const nombre = perfil?.invitado ? 'invitado' : (perfil?.nombre ?? 'invitado')
  const faltan = rango.xpSiguiente === null ? 0 : rango.xpSiguiente - xp
  const avance = rango.xpSiguiente === null ? 1 : (xp - rango.xpMin) / (rango.xpSiguiente - rango.xpMin)
  const siguiente = rango.xpSiguiente === null ? null : rangoDe(rango.xpSiguiente).nombre

  return (
    <Pantalla>
      <div className="nc-envoltura">
        <BarraPantalla onAjustes={() => ir({ pantalla: 'ajustes' })} />
        <div className="nc-inicio">
          <div className="nc-cabeza">
            <div className="nc-cabeza__izq">
              <h2 className="nc-saludo"><small>Next Chip</small>Hola, {nombre}</h2>
              <p className="nc-racha" aria-label={racha.actual > 0 ? `Racha de ${racha.actual} ${plural(racha.actual, 'día', 'días')}` : 'Aún sin racha'}>
                <IconoLlama />
                {racha.actual > 0
                  ? <><b>{racha.actual}</b> {plural(racha.actual, 'día', 'días')} seguidos {racha.mejor > racha.actual ? <span>· mejor {racha.mejor}</span> : null}</>
                  : <>Hoy empieza tu racha</>}
              </p>
            </div>
            <section className="nc-rango" aria-label="Tu rango">
              <div className="nc-rango__ficha">
                <img src={`/assets/fichas/ficha_${rango.ficha}.webp`} alt="" draggable={false} />
              </div>
              <h3 className="nc-rango__nombre"><small>Tu rango</small>{rango.nombre}</h3>
              <div className="nc-xp">
                <div className="nc-xp__pista" role="progressbar" aria-label="Experiencia hasta el siguiente rango" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(avance * 100)}>
                  <div className="nc-xp__relleno" style={{ transform: `scaleX(${Math.max(0.02, Math.min(1, avance))})` }} />
                </div>
                <p className="nc-xp__texto" style={{ margin: 0 }}>
                  <span><b>{miles(xp)}</b> XP</span>
                  <span>{siguiente ? `Faltan ${miles(faltan)} para ${siguiente}` : 'Rango máximo'}</span>
                </p>
              </div>
            </section>
          </div>

          <nav className="nc-modulos" aria-label="Módulos">
            {MODULOS.map((m, i) => (
              <a
                key={m.id} href={hashDesdeRuta({ pantalla: m.id })} className={`nc-modulo nc-${m.id}`} style={{ '--i': i } as CSSProperties}
                onClick={(e) => { e.preventDefault(); ir({ pantalla: m.id }) }}
              >
                <ImagenOpcional src={`/assets/bienvenida/${m.id}.webp`} className="nc-modulo__img" />
                <span className="nc-modulo__icono"><IconoModulo id={m.id} /></span>
                <h3 className="nc-modulo__nombre">{m.nombre}</h3>
                <p className="nc-modulo__texto">{m.texto}</p>
                <span className="nc-modulo__ir">Entrar <IconoFlecha /></span>
              </a>
            ))}
          </nav>

          <div className="nc-accesos">
            <button type="button" className="nc-enlace" onClick={() => ir({ pantalla: 'ajustes' })}>Ajustes</button>
            <button type="button" className="nc-enlace" onClick={() => ir({ pantalla: 'creditos' })}>Créditos</button>
          </div>
        </div>
      </div>
    </Pantalla>
  )
}
