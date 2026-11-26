/** Marcador de posición del módulo Retador ("Próximamente"). El frente del módulo lo reemplaza por la pantalla real. */
import MarcadorModulo from '../../pantallas/MarcadorModulo.tsx'

export default function PantallaRetador(props: { onSalir: () => void }) {
  return <MarcadorModulo modulo="retador" onSalir={props.onSalir} />
}
