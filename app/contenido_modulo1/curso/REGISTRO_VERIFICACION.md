# Registro de verificación por módulo

Cada cifra que sale de un libro se verificó con NotebookLM (CONFIRMADA / CORREGIDA / NO RESPALDADA). Cada cálculo y cada ejemplo de cartas se recalculó en `herramientas/verificar_lecciones.py` (ejecutar: `python -I herramientas/verificar_lecciones.py`). Las respuestas en bruto de NotebookLM están en `notebooklm/` (local, fuera de git).

| Módulo | Consulta a NotebookLM | Cifras de libro usadas | Comprobaciones por código |
|---|---|---|---|
| 0 | Auditoría A (`105b528b…`) | Rake 2,5–10 % con tope; 5 % tope $5; sin flop no hay rake (Acevedo Cap. 1). KQ contra KJ 73,16 % (Hardin Cap. 5). Combos 6/4/12 (Hardin Cap. 18). BB/bb (Hardin Cap. 2). Minraise "2× la última apuesta" (Acevedo Cap. 1), sustituida por la regla pública. | 25 |
| 1 | `05_m1_m2_m3.md`; auditoría D | Posiciones y HJ = MP (Clarke 2.1). Stack efectivo (Hardin Cap. 2). EV: +$15 de EV y perder $100 (Clarke 1.2); fórmula (Hardin Cap. 17). AA contra KK ≈ 82 % (Hardin; Monte Carlo propio 82,1 %). Winrates de cash 6-max (Acevedo Cap. 2). 22,77 % tras 10.000 manos, DE 67 (Acevedo Cap. 6); resto de la tabla, cálculo propio. Bancas mínimas (Acevedo Cap. 6). Tipos de fish y estadísticas VPIP/PFR (Clarke 3.3 y Cap. 2). | 12 |
| 2 | `05_m1_m2_m3.md`; auditoría B y E | Rangos de apertura (Clarke Figs. 5, 7, 10, 15, 16; combos propios coinciden con el 11 %, 15,5 % y 338 combos del texto). Tres atributos para abrir (Clarke 2.2). Cuadrícula 13×13 (Acevedo Cap. 1). Tamaño de apertura (Acevedo Caps. 4 y 5; Clarke Cap. 2). RFE (Clarke Cap. 2, ejemplo 4BB = 72,7 %); robo a 2,5bb = 62,5 % (Hardin Cap. 13). Triángulo ISO y regla de tamaño (Clarke Cap. 3). | 18 |
| 4 (piloto 4.2) | `18bf5c97…` | Fórmula de pot odds y forma de proporción (Hardin Cap. 6). Tres pasos de "Can We Call?" (Hardin Cap. 11). RE = ATC/(ATC+TP), sumar la apuesta del rival (Clarke Cap. 7). 9 outs = 19,1 % con una carta (Hardin Cap. 9). | 9 |

**Contenido sin base en los libros (reglas públicas):** lecciones 0.1 a 0.5 (flujo de la mano, jerarquía, cinco mejores cartas, *kicker*, acciones, subida mínima, ciegas y orden de acción).
