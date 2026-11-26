/** Estado del Instructor: vive en `guardarSeccion('instructor', …)` de Progreso y se mantiene también en React. */
import { useCallback, useRef, useState } from 'react'
import { progresoGlobal } from '../../progreso/progreso.ts'
import { ESTADO_INICIAL, normalizarEstado, type EstadoInstructor } from './logica.ts'

export function useAlmacenInstructor() {
  const [estado, setEstado] = useState<EstadoInstructor>(() => {
    try { return normalizarEstado(progresoGlobal().leerSeccion('instructor')) } catch { return ESTADO_INICIAL }
  })
  const ref = useRef(estado)
  /** Cambia el estado, lo guarda enseguida y devuelve el nuevo. */
  const actualizar = useCallback((f: (e: EstadoInstructor) => EstadoInstructor): EstadoInstructor => {
    const nuevo = f(ref.current)
    ref.current = nuevo
    setEstado(nuevo)
    try { progresoGlobal().guardarSeccion('instructor', nuevo) } catch { /* sin almacenamiento: dura solo esta visita */ }
    return nuevo
  }, [])
  return { estado, ref, actualizar }
}
