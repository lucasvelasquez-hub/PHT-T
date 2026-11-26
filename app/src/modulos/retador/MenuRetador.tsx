/** Menú del Retador: Sesión y Reto del día, el récord personal, el mejor puntaje de hoy y qué mide cada marcador. */
import { BarraPantalla, IconoFlecha, IconoModulo, Pantalla } from '../../pantallas/elementos.tsx'
import { MANOS_RETO, MANOS_SESION, type SesionGuardada } from './logica.ts'

export interface PropsMenu {
  record: number | null
  mejorHoy: number | null
  /** Sesión a medias que se puede retomar. */
  enCurso: SesionGuardada | null
  onSesion: () => void
  onReto: () => void
  onContinuar: () => void
  onSalir: () => void
}

const pct = (v: number | null) => (v === null ? '—' : `${v} %`)

export default function MenuRetador({ record, mejorHoy, enCurso, onSesion, onReto, onContinuar, onSalir }: PropsMenu) {
  const faltan = enCurso ? enCurso.total - enCurso.siguiente : 0
  return (
    <Pantalla>
      <div className="nc-envoltura nc-retador rt-envoltura">
        <BarraPantalla titulo="Retador" onVolver={onSalir} />
        <div className="rt-menu">
          <div className="rt-menu__cabeza">
            <span className="rt-menu__medalla"><IconoModulo id="retador" tam={30} /></span>
            <div>
              <h2 className="nc-titulo">Juega y mide tu juego</h2>
              <p className="nc-subtitulo">Cada decisión se compara con lo que harían jugadores de élite.</p>
            </div>
          </div>

          <dl className="rt-records" aria-label="Tus marcas">
            <div className="rt-record" data-e="record">
              <dt>Récord personal</dt>
              <dd>{pct(record)}</dd>
              <span className="rt-record__nota">Mejor precisión en una sesión de {MANOS_SESION} manos</span>
            </div>
            <div className="rt-record" data-e="mejor-dia">
              <dt>Mejor de hoy</dt>
              <dd>{pct(mejorHoy)}</dd>
              <span className="rt-record__nota">{mejorHoy === null ? 'Hoy todavía no juegas el reto' : 'En el reto del día'}</span>
            </div>
          </dl>

          {enCurso ? (
            <button type="button" className="rt-continuar" onClick={onContinuar} data-e="continuar">
              <span>
                <b>Seguir tu {enCurso.tipo === 'reto' ? 'reto del día' : 'sesión'}</b>
                <small>{faltan > 0 ? `Sigues en la mano ${enCurso.siguiente + 1} de ${enCurso.total}` : 'Ya terminaste las manos: ver el resumen'}</small>
              </span>
              <IconoFlecha />
            </button>
          ) : null}

          <div className="rt-modos">
            <button type="button" className="rt-modo rt-modo--sesion" onClick={onSesion} data-e="iniciar-sesion">
              <span className="rt-modo__sobre">Práctica</span>
              <span className="rt-modo__nombre">Sesión</span>
              <span className="rt-modo__texto">{MANOS_SESION} manos completas. El botón rota, así que pasas por todas las posiciones.</span>
              <span className="rt-modo__ir">Empezar <IconoFlecha /></span>
            </button>
            <button type="button" className="rt-modo rt-modo--reto" onClick={onReto} data-e="iniciar-reto">
              <span className="rt-modo__sobre">Una vez al día</span>
              <span className="rt-modo__nombre">Reto del día</span>
              <span className="rt-modo__texto">{MANOS_RETO} manos iguales para todos hoy. Con las mismas decisiones salen las mismas manos.</span>
              <span className="rt-modo__ir">Jugar el reto <IconoFlecha /></span>
            </button>
          </div>

          <p className="rt-explica" data-e="explicacion">
            <b>Fichas</b> cuenta lo que ganas o pierdes en cada mano. <b>Precisión élite</b> mide cuánto se parecen tus decisiones a las de jugadores de élite. Son dos cosas distintas: puedes ganar fichas con suerte o perderlas decidiendo como la élite.
          </p>
        </div>
      </div>
    </Pantalla>
  )
}
