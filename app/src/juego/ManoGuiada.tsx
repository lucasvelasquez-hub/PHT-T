/**
 * ManoGuiada: la mano de práctica de la bienvenida. Cartas y acciones fijas (`guionPractica.ts`), con textos de ayuda;
 * el jugador toca los botones que se le indican. Al terminar, el botón dice CONTINUAR y llama a `onTerminar`.
 */
import { MesaEnVivo } from './MesaEnVivo.tsx'
import { GUION_PRACTICA } from './guionPractica.ts'

export function ManoGuiada({ onTerminar }: { onTerminar: () => void }) {
  return (
    <MesaEnVivo
      semilla={2026}
      boton={GUION_PRACTICA.boton}
      guion={GUION_PRACTICA}
      mostrarLecturas="siempre"
      textoSiguiente="CONTINUAR"
      onSiguienteMano={onTerminar}
      onVolver={onTerminar}
      origen="Mano de práctica"
    />
  )
}
