/** Marcador de posición del módulo Instructor ("Próximamente"). El frente del módulo lo reemplaza por la pantalla real. */
import MarcadorModulo from '../../pantallas/MarcadorModulo.tsx'

export default function PantallaInstructor(props: { onSalir: () => void }) {
  return <MarcadorModulo modulo="instructor" onSalir={props.onSalir} />
}
