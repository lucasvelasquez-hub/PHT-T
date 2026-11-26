/** Ajustes: sonido, mazo de 4 colores y cambiar el nombre. Todo se guarda en Progreso (ya no en la hoja de la mesa). */
import { useState, type FormEvent } from 'react'
import { NOMBRE_MAX, nombreValido, useProgreso } from '../progreso/progreso.ts'
import { BarraPantalla, Interruptor, Pantalla } from './elementos.tsx'

export default function PantallaAjustes({ onSalir }: { onSalir: () => void }) {
  const { perfil, ajustes, cambiarAjuste, definirPerfil, guardaEnNavegador } = useProgreso()
  const [texto, setTexto] = useState(perfil && !perfil.invitado ? perfil.nombre : '')
  const [guardado, setGuardado] = useState(false)
  const limpio = nombreValido(texto)
  const cambio = limpio !== null && !(perfil && !perfil.invitado && perfil.nombre === limpio)

  const guardarNombre = (e: FormEvent) => {
    e.preventDefault()
    if (!limpio) return
    definirPerfil({ nombre: limpio, invitado: false })
    setTexto(limpio)
    setGuardado(true)
  }

  return (
    <Pantalla>
      <div className="nc-envoltura">
        <BarraPantalla titulo="Ajustes" onVolver={onSalir} />
        <div className="nc-lista">
          {!guardaEnNavegador ? (
            <p className="nc-aviso" role="status">Tu navegador no deja guardar datos (ventana privada). Puedes jugar, pero el progreso se perderá al cerrar.</p>
          ) : null}

          <section className="nc-grupo" aria-label="Jugador">
            <form className="nc-editar" onSubmit={guardarNombre}>
              <label className="nc-campo">
                <span className="nc-campo__rotulo">{perfil?.invitado ? 'Ponte un nombre' : 'Tu nombre'}</span>
                <div className="nc-editar__fila">
                  <input
                    className="nc-campo__entrada" type="text" value={texto} maxLength={NOMBRE_MAX} autoComplete="nickname" spellCheck={false}
                    placeholder={perfil?.invitado ? 'Ahora juegas como invitado' : 'Tu nombre'}
                    onChange={(e) => { setTexto(e.target.value); setGuardado(false) }}
                  />
                  <button type="submit" className="nc-boton-suave" disabled={!cambio}>Guardar</button>
                </div>
              </label>
              {guardado ? <p className="nc-confirma" role="status">Nombre guardado.</p> : null}
            </form>
          </section>

          <section className="nc-grupo" aria-label="Preferencias">
            <div className="nc-fila">
              <div>
                <p className="nc-fila__nombre" id="aj-sonido">Sonido</p>
                <p className="nc-fila__ayuda">Fichas, cartas y avisos mientras juegas.</p>
              </div>
              <Interruptor etiquetaId="aj-sonido" activo={ajustes.sonido} onCambio={(v) => cambiarAjuste('sonido', v)} />
            </div>
            <div className="nc-fila">
              <div>
                <p className="nc-fila__nombre" id="aj-mazo">Mazo de 4 colores</p>
                <p className="nc-fila__ayuda">Diamantes en azul y tréboles en verde, para distinguir los palos de un vistazo.</p>
              </div>
              <Interruptor etiquetaId="aj-mazo" activo={ajustes.mazo4colores} onCambio={(v) => cambiarAjuste('mazo4colores', v)} />
            </div>
          </section>
        </div>
      </div>
    </Pantalla>
  )
}
