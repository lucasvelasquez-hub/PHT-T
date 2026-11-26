/** Entrada del Analista: las dos formas de jugar con las manos reales y "dónde quedó" (última mano y récord). */
import { useState } from 'react'
import { BarraPantalla, IconoFlecha, IconoModulo, Pantalla } from '../../pantallas/elementos.tsx'
import type { BancoIndexado } from './banco.ts'
import { leerEstado } from './estado.ts'
import { nombreDeMano, NOMBRES_CALLE, POSICIONES, DECISIONES_POR_SESION, PUNTOS_MAXIMOS_DECISION } from './logica.ts'

export interface InicioAnalistaProps {
  /** Se llena cuando el banco ya cargó (para describir la última mano). */
  datos: BancoIndexado | null
  onAdivinar: () => void
  onBuscar: () => void
  onContinuar: (k: number, d: number) => void
  onSalir: () => void
}

export function InicioAnalista({ datos, onAdivinar, onBuscar, onContinuar, onSalir }: InicioAnalistaProps) {
  const [estado] = useState(leerEstado)
  const ultima = estado.ultimaMano
  const dec = ultima && datos ? datos.decisiones.find((d) => d.k === ultima.k && d.idx === ultima.d) : undefined

  return (
    <Pantalla>
      <div className="nc-envoltura nc-analista an-envoltura">
        <BarraPantalla titulo="Analista" onVolver={onSalir} />
        <div className="an-inicio">
          <header className="an-cabeza">
            <span className="nc-proximamente__medalla an-cabeza__medalla"><IconoModulo id="analista" tam={34} /></span>
            <div>
              <h2 className="nc-titulo">Manos reales de Pluribus</h2>
              <p className="nc-subtitulo">Revive cada decisión y descubre qué haría la élite.</p>
            </div>
          </header>

          <div className="an-opciones">
            <button type="button" className="an-opcion an-opcion--juego" onClick={onAdivinar}>
              <span className="an-opcion__sobre">Juego</span>
              <span className="an-opcion__nombre">¿Adivinas qué hizo la élite?</span>
              <span className="an-opcion__texto">{DECISIONES_POR_SESION} decisiones. Elige antes de ver la respuesta y gana hasta {PUNTOS_MAXIMOS_DECISION} puntos en cada una.</span>
              <span className="nc-modulo__ir">Jugar <IconoFlecha /></span>
            </button>
            <button type="button" className="an-opcion" onClick={onBuscar}>
              <span className="an-opcion__sobre">Banco</span>
              <span className="an-opcion__nombre">Buscar manos</span>
              <span className="an-opcion__texto">Filtra por calle, posición y cartas, y recorre la mano decisión por decisión.</span>
              <span className="nc-modulo__ir">Buscar <IconoFlecha /></span>
            </button>
          </div>

          <section className="an-donde" aria-label="Dónde quedaste">
            <h3 className="an-donde__titulo">Dónde quedaste</h3>
            <div className="an-donde__fila">
              <div className="an-donde__dato">
                <span className="an-donde__rotulo">Última mano</span>
                {ultima ? (
                  <b data-e="ultima-mano">
                    #{ultima.k}{dec ? ` · ${nombreDeMano(dec.cartas)} · ${POSICIONES[dec.asiento]} · ${NOMBRES_CALLE[dec.calle]}` : ''}
                  </b>
                ) : <b className="an-donde__nada">Aún no abres ninguna</b>}
              </div>
              {ultima ? <button type="button" className="nc-boton-suave" onClick={() => onContinuar(ultima.k, ultima.d)}>Continuar</button> : null}
            </div>
            <div className="an-donde__fila">
              <div className="an-donde__dato">
                <span className="an-donde__rotulo">Récord de ¿Adivinas?</span>
                {estado.sesiones > 0
                  ? <b data-e="record">{estado.record} <small>de {DECISIONES_POR_SESION * PUNTOS_MAXIMOS_DECISION} · {estado.sesiones} {estado.sesiones === 1 ? 'sesión' : 'sesiones'}</small></b>
                  : <b className="an-donde__nada">Aún sin sesiones</b>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Pantalla>
  )
}
