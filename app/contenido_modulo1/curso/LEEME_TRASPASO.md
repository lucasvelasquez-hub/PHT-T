# Traspaso: Curso de póker (cash 6-max, principiantes)

Si eres el agente que continúa este trabajo, empieza aquí. Última actualización: 2026-11-25.

## 1. Qué es

Un **curso de Texas Hold'em No-Limit cash 6-max (100bb) para principiantes absolutos**: 66 lecciones de 5 a 10 minutos, una idea por lección, con ejemplos de cartas, botes y apuestas, y una mini-evaluación por módulo. Contenido propio basado en 4 libros que viven solo en NotebookLM. Es independiente de cualquier otro proyecto del repositorio.

## 2. Estado: completo

| Entregable | Archivo |
|---|---|
| **Puerta de entrada: índice con enlaces a cada lección y evaluación, en orden** | `indice.html` |
| Una página por lección, con botones de anterior/siguiente y vuelta al índice | `html/M00_L01.html` … |
| El curso completo en una sola página (sin internet, móvil o PC) | `curso.html` |
| 66 lecciones + 13 mini-evaluaciones (fuente) | `lecciones/M00_L01.md` … `lecciones/M12_evaluacion.md` |
| Auditoría independiente de la estructura v1 | `AUDITORIA_INDEPENDIENTE.md` |
| Estructura curricular v2 y registro de cambios | `ESTRUCTURA_CURRICULAR.md` |
| Las cinco decisiones de diseño justificadas | `DECISIONES.md` |
| Qué se verificó en cada módulo y contra qué capítulo | `REGISTRO_VERIFICACION.md` |
| Mecanismo de trabajo con NotebookLM | `MECANISMO_NOTEBOOKLM.md` |
| Herramientas de cálculo y verificación | `herramientas/` |
| Respuestas en bruto de NotebookLM (local, fuera de git) | `notebooklm/` |

## 3. Cómo se mantiene

1. **Editar** el Markdown de la lección en `lecciones/`.
2. **Si cambias una cifra o un ejemplo de cartas**, añade o ajusta su comprobación en `herramientas/verificar_lecciones.py` y ejecútalo: `python -I herramientas/verificar_lecciones.py` (debe terminar en 0 errores; hoy son 183 comprobaciones).
3. **Si cambias un rango**, edítalo en `herramientas/rangos_clarke.py` y regenera las cuadrículas: `python -I herramientas/insertar_cuadriculas.py`.
4. **Regenera el HTML** (curso.html, indice.html y html/): `python -I herramientas/construir_html.py`. Nunca edites los HTML a mano.
5. Toda cifra nueva sacada de un libro se pregunta antes a NotebookLM (CONFIRMADA / CORREGIDA / NO RESPALDADA + libro y capítulo) y se anota en `REGISTRO_VERIFICACION.md`.

## 4. Reglas que siguen vigentes

- **Nunca leer los PDF/EPUB de los libros.** NotebookLM estudia; el agente pregunta, estructura y redacta.
- **Toda regla de mesa o tamaño** se rastrea a un libro, a las reglas públicas o a una regla propia del curso declarada como tal (lista en `REGISTRO_VERIFICACION.md`).
- **No usar contexto de otros proyectos** del repositorio.
- **Respuestas al usuario cortas y directas.**
- Commits locales; push solo si el usuario lo pide. `notebooklm/` y los libros no se suben.

## 5. Trampas técnicas conocidas

- `python -I` ignora `PYTHONIOENCODING`: los scripts fuerzan UTF-8 con `sys.stdout.reconfigure`. Si escribes uno nuevo que imprima palos (♠♥♦♣), haz lo mismo.
- Las respuestas grandes de NotebookLM se guardan en un archivo; extráelas con `herramientas/extraer_respuesta.py` (ver `MECANISMO_NOTEBOOKLM.md`).
- NotebookLM se contradijo una vez (porcentajes de Clarke sacados de un HUD de ejemplo). Ante cifras que no cuadran, recalcula con código.

## 6. Posibles mejoras futuras (no pedidas)

- Ejercicios interactivos o repaso con tarjetas a partir de las mini-evaluaciones.
- Imágenes de cartas en lugar de texto.
- Un módulo de juego en vivo (casino) si el usuario lo quiere.
