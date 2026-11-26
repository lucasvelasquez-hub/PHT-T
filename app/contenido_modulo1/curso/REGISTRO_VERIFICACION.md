# Registro de verificación por módulo

Cada cifra que sale de un libro se verificó con NotebookLM (CONFIRMADA / CORREGIDA / NO RESPALDADA). Cada cálculo y cada ejemplo de cartas se recalculó en `herramientas/verificar_lecciones.py` (ejecutar: `python -I herramientas/verificar_lecciones.py`). Las respuestas en bruto de NotebookLM están en `notebooklm/` (local, fuera de git).

| Módulo | Consulta a NotebookLM | Cifras de libro usadas | Comprobaciones por código |
|---|---|---|---|
| 0 | Auditoría A (`105b528b…`) | Rake 2,5–10 % con tope; 5 % tope $5; sin flop no hay rake (Acevedo Cap. 1). KQ contra KJ 73,16 % (Hardin Cap. 5). Combos 6/4/12 (Hardin Cap. 18). BB/bb (Hardin Cap. 2). Minraise "2× la última apuesta" (Acevedo Cap. 1), sustituida por la regla pública. | 25 |
| 4 (piloto 4.2) | `18bf5c97…` | Fórmula de pot odds y forma de proporción (Hardin Cap. 6). Tres pasos de "Can We Call?" (Hardin Cap. 11). RE = ATC/(ATC+TP), sumar la apuesta del rival (Clarke Cap. 7). 9 outs = 19,1 % con una carta (Hardin Cap. 9). | 9 |

**Contenido sin base en los libros (reglas públicas):** lecciones 0.1 a 0.5 (flujo de la mano, jerarquía, cinco mejores cartas, *kicker*, acciones, subida mínima, ciegas y orden de acción).
