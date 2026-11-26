/** Créditos: reutiliza el texto de atribución de la mesa y suma la línea de los sonidos de Kenney (CC0). */
import { Creditos } from '../ui/mesa/Creditos.tsx'
import { BarraPantalla, Pantalla } from './elementos.tsx'

export default function PantallaCreditos({ onSalir }: { onSalir: () => void }) {
  return (
    <Pantalla>
      <div className="nc-envoltura">
        <BarraPantalla titulo="Créditos" onVolver={onSalir} />
        <div className="nc-texto-creditos">
          <Creditos />
          <section className="creditos" aria-label="Sonidos">
            <p className="creditos__texto">
              Sonidos: Kenney (kenney.nl), licencia CC0 (dominio público) —{' '}
              <a href="https://kenney.nl" target="_blank" rel="noreferrer noopener">https://kenney.nl</a>
            </p>
          </section>
        </div>
      </div>
    </Pantalla>
  )
}
