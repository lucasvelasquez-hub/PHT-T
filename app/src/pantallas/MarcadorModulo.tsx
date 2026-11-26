/** Marcador de posición de un módulo que todavía no se construye. Cada módulo lo reemplaza por su pantalla real. */
import { BarraPantalla, IconoModulo, MODULOS, Pantalla, type ModuloId } from './elementos.tsx'

export default function MarcadorModulo({ modulo, onSalir }: { modulo: ModuloId; onSalir: () => void }) {
  const datos = MODULOS.find((m) => m.id === modulo)!
  return (
    <Pantalla>
      <div className={`nc-envoltura nc-${modulo}`}>
        <BarraPantalla titulo={datos.nombre} onVolver={onSalir} />
        <div className="nc-proximamente">
          <span className="nc-proximamente__medalla"><IconoModulo id={modulo} tam={42} /></span>
          <h2 className="nc-titulo">{datos.nombre}</h2>
          <p className="nc-subtitulo">{datos.texto}</p>
          <p className="nc-proximamente__etiqueta">Próximamente</p>
          <button type="button" className="nc-boton-suave" onClick={onSalir}>Volver al inicio</button>
        </div>
      </div>
    </Pantalla>
  )
}
