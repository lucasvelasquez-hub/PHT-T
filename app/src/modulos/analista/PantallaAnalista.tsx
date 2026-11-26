/** Marcador de posición del módulo Analista ("Próximamente"). El frente del módulo lo reemplaza por la pantalla real. */
import MarcadorModulo from '../../pantallas/MarcadorModulo.tsx'

export default function PantallaAnalista(props: { onSalir: () => void }) {
  return <MarcadorModulo modulo="analista" onSalir={props.onSalir} />
}
