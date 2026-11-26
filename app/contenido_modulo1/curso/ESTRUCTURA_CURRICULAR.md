# Curso de Texas Hold'em Cash 6-max para principiantes — Estructura curricular v2

Estado: v2, tras la auditoría independiente (`AUDITORIA_INDEPENDIENTE.md`). La v1 está en el historial de git (commit `3c00256`). Las decisiones de diseño y su justificación están en `DECISIONES.md`.

## 1. Cómo se construyó

- **Fuentes (solo en NotebookLM, cuaderno "Curso Poker Cash – Principiantes"):** Hardin (*Essential Poker Math*), Clarke (*The Grinder's Manual*), Brokos (*Play Optimal Poker*), Acevedo (*Modern Poker Theory*).
- **Método:** NotebookLM consulta los libros y responde con citas; el agente estructura y redacta. Toda cifra se verifica dos veces: con NotebookLM (CONFIRMADA / CORREGIDA / NO RESPALDADA + libro y capítulo) y con código propio (`herramientas/`).
- **Contenido propio:** los libros dan conceptos y cifras; la redacción y los ejemplos son originales.

## 2. Perfil, objetivos y formato

**Alumno de entrada:** nunca ha jugado póker con dinero real.
**Modalidad:** No-Limit Hold'em, cash, mesas de 6 jugadores, 100 ciegas grandes (100bb). Ejemplos en ciegas $1/$2 (1bb = $2, stack = $200), como escala de ejemplo.

**Al terminar el curso, el alumno sabrá:**
1. Seguir una mano, leer la mesa y hablar el idioma del póker.
2. Juzgar sus decisiones por su valor esperado (EV) y no por el resultado, y proteger su banca.
3. Abrir, aislar, defender y resubir antes del flop según su posición.
4. Calcular al instante *outs*, *equity* y *pot odds*.
5. Jugar después del flop con criterio: *c-bets* selectivas, apuestas por valor, defensa y faroles con matemáticas.
6. Cuidar su cabeza y organizar su estudio.

**Formato de cada lección (5 a 10 minutos, una sola idea):**
1. **Gancho:** una situación o pregunta.
2. **La idea:** explicada con lenguaje simple.
3. **Ejemplo guiado:** con cartas, bote y apuestas.
4. **Tu turno:** uno o dos ejercicios, con la respuesta oculta.
5. **En una frase:** el resumen.
6. **Fuentes:** libro y capítulo (al pie, para quien quiera profundizar).

**Reglas de diseño:** cada lección usa solo lo ya enseñado; cada término técnico se explica la primera vez; cada módulo cierra con una mini-evaluación que incluye 2 preguntas de repaso de módulos anteriores (repaso espaciado).

## 3. Mapa general

| Módulo | Tema | Lecciones |
|---|---|---|
| 0 | Primeros pasos antes de tu primera mano | 8 |
| 1 | La mesa, el EV y la suerte | 6 |
| 2 | Abrir el bote antes del flop | 7 |
| 3 | Matemáticas de bolsillo: *outs* y regla del 2 y del 4 | 4 |
| 4 | ¿Pago o me retiro? *Equity*, *pot odds* e *implied odds* | 5 |
| 5 | Defender antes del flop y *set-mining* | 4 |
| 6 | La apuesta de continuación (*c-bet*) | 5 |
| 7 | Apostar por valor | 5 |
| 8 | Defensa después del flop | 4 |
| 9 | Faroles y semifaroles | 5 |
| 10 | *3-bet* y botes grandes | 5 |
| 11 | Mente y hábitos | 4 |
| 12 | Opcional: puente a GTO | 4 |
| | **Total** | **66** |

**Ruta mínima para sentarse a jugar en el límite más bajo:** módulos 0, 1, 2, 3, 4 y 5 (34 lecciones) más la lección 11.4.

## 4. Módulos y lecciones

Cada lección indica su idea y su base. Los ejemplos concretos están en los archivos de `lecciones/` y se verifican en `herramientas/verificar_lecciones.py`.

### Módulo 0 — Primeros pasos antes de tu primera mano
*Los libros asumen que el lector ya conoce las reglas; las lecciones 0.1 a 0.4 se basan en las reglas públicas del juego.*
- **0.1 El viaje de una mano.** Dos cartas propias, cinco comunitarias, cuatro rondas de apuestas, *showdown*. Base: reglas públicas.
- **0.2 ¿Qué mano gana? La jerarquía.** Las diez categorías, de carta alta a escalera real. Base: reglas públicas.
- **0.3 Tus cinco mejores cartas, el *kicker* y el empate.** Se juega con las 5 mejores de 7; el *kicker* desempata; bote dividido. Base: reglas públicas; *kicker*: Hardin (Glosario y Cap. 5, KQ contra KJ = 73,16 %).
- **0.4 Tus opciones en cada turno.** *Fold, check, call, bet, raise, all-in*; la subida mínima. Base: reglas públicas; Acevedo Cap. 1 (definiciones; su "dos veces la última apuesta" es una simplificación).
- **0.5 Ciegas, botón y por qué contamos en bb.** Las ciegas crean el bote; medir en ciegas grandes; en cash las fichas son dinero y puedes recargar. Base: Hardin Cap. 2; Acevedo Caps. 1 y 6.
- **0.6 Cuenta el bote en segundos.** El bote incluye todo lo apostado; apuestas como fracción del bote. Base: Hardin Cap. 6; Acevedo Cap. 4 (normalizar el bote a 1).
- **0.7 El *rake*.** La sala cobra un porcentaje con tope; sin flop no hay rake; por eso se juegan menos manos marginales. Base: Acevedo Caps. 1 y 4.
- **0.8 El idioma del póker.** AKs, AKo, JJ+, Hero/Villain, combos (6, 4, 12). Base: Hardin Caps. 2 y 18; Acevedo Cap. 1.

### Módulo 1 — La mesa, el EV y la suerte
- **1.1 Las seis sillas.** UTG, HJ, CO, BU, SB, BB; hablar último es ventaja. Base: Clarke 2.1.
- **1.2 Tu stack y el stack efectivo.** Lo máximo en juego es el stack menor. Base: Hardin Cap. 2; Clarke (Glosario).
- **1.3 El EV: la moneda del póker.** Una decisión se juzga por lo que gana a largo plazo. Base: Clarke 1.2; Hardin Cap. 10.
- **1.4 La varianza.** Los resultados de corto plazo oscilan alrededor del EV; bb/100. Base: Clarke 1.2; Acevedo Cap. 6 (Tabla 29).
- **1.5 Tu banca.** Dinero aparte, 30 *buy-ins*, cuándo bajar de límite. Base: Acevedo Cap. 6 (mínimos teóricos); Clarke 1.4 y Cap. 2 (aprender en el límite más bajo); regla del curso en `DECISIONES.md`.
- **1.6 ¿Quién está sentado contigo?** *Nit, reg*, y los cuatro *fish* de Clarke (*fit-or-fold*, *station*, *aggro*, *whale*). Base: Clarke 3.3; Hardin Cap. 3.

### Módulo 2 — Abrir el bote antes del flop
- **2.1 Piensa en rangos.** El rango es el conjunto de manos con que haces una acción. Base: Clarke Cap. 2 y Glosario; Hardin Cap. 2.
- **2.2 La cuadrícula 13×13.** Parejas en la diagonal, *suited* arriba, *offsuit* abajo. Base: Acevedo Cap. 1.
- **2.3 O subes o te retiras.** Por qué no hacemos *open limp*. Base: Clarke Cap. 3; Acevedo Caps. 4 y 5.
- **2.4 Rangos de las primeras posiciones: UTG y HJ.** Base: Clarke 2.2–2.4 (Figs. 5 y 7).
- **2.5 Rangos de las posiciones finales: CO, BU y SB.** Base: Clarke 2.5–2.7 (Figs. 10, 15 y 16); Acevedo Cap. 5 (BU 43,4 %).
- **2.6 Tamaño de apertura y robo de ciegas.** 2,5bb desde cualquier posición. Base: Acevedo Caps. 4 y 5; Clarke Cap. 2.
- **2.7 Cuando alguien hace *limp*: aislar.** 3bb + 1bb por *limper* + 1bb fuera de posición. Base: Clarke 3.6.

### Módulo 3 — Matemáticas de bolsillo: *outs* y regla del 2 y del 4
- **3.1 ¿Qué son los *outs*?** Base: Hardin Cap. 8.
- **3.2 Los proyectos que debes memorizar.** 9, 8, 6, 4, 12, 15. Base: Hardin Caps. 8 y 15.
- **3.3 La regla del 2 y del 4.** Y su error con muchos *outs*. Base: Hardin Cap. 9.
- **3.4 *Outs* sucios.** Base: Hardin Cap. 8.

### Módulo 4 — ¿Pago o me retiro? *Equity*, *pot odds* e *implied odds*
- **4.1 La *equity*: tu parte del bote.** Base: Hardin Cap. 5.
- **4.2 *Pot odds*: el precio de ver una carta.** *(Lección piloto.)* Base: Hardin Cap. 6; Acevedo Cap. 1; Clarke Cap. 7.
- **4.3 Los precios estándar.** Tabla de 1/4 a bote completo. Base: Hardin (tablas de referencia); Clarke Cap. 7 (Fig. 37); Acevedo Cap. 4 (Tabla 14).
- **4.4 ¿Puedo pagar con mi proyecto?** Base: Hardin Cap. 11.
- **4.5 *Implied odds*.** El dinero que ganarás después. Base: Hardin Cap. 7; Clarke Caps. 6 y 8.

### Módulo 5 — Defender antes del flop y *set-mining*
- **5.1 El *gap concept*.** Para pagar una subida necesitas más que para abrir. Base: Clarke Cap. 6.
- **5.2 Defender la ciega grande y pagar en posición.** Base: Clarke Cap. 6 (Fig. 32).
- **5.3 Matemáticas del *set-mining*.** 11,76 % y la regla del 15. Base: Hardin Caps. 4 y 13; Clarke Cap. 6.
- **5.4 Cuándo no buscar trío.** Base: Hardin Cap. 13; Clarke Cap. 6.

### Módulo 6 — La apuesta de continuación (*c-bet*)
- **6.1 Qué es una *c-bet* y por qué no es automática.** Base: Clarke Cap. 4; Acevedo Cap. 12.
- **6.2 Flops secos y flops mojados.** Base: Clarke 4.1.
- **6.3 Las preguntas antes de una *c-bet* de farol.** Los siete factores de Clarke en tres preguntas. Base: Clarke 4.1.
- **6.4 ¿De qué tamaño?** Mitad del bote en seco, 2/3 en mojado. Base: Clarke 4.2.
- **6.5 Botes con tres o más jugadores.** Base: Clarke 4.1.

### Módulo 7 — Apostar por valor
- **7.1 Fuerza relativa.** Base: Clarke 5.2.
- **7.2 La pregunta de oro: ¿me pagan manos peores?** Base: Clarke Cap. 5.
- **7.3 Construir el bote en tres calles.** Base: Clarke 5.3.
- **7.4 Elasticidad: ajusta el tamaño al rival.** Base: Clarke 5.6.
- **7.5 Valor fino en el river.** Base: Clarke 5.4; Brokos Cap. 6.

### Módulo 8 — Defensa después del flop
- **8.1 El river: la decisión cerrada.** Base: Clarke Cap. 7; Hardin Cap. 16.
- **8.2 Flop y turn: la decisión abierta.** Base: Clarke Cap. 8; Acevedo Cap. 12.
- **8.3 Defender el flop con manos hechas y proyectos.** Base: Clarke Cap. 8.
- **8.4 La *donk bet*.** Base: Clarke Cap. 8; Acevedo Cap. 11.

### Módulo 9 — Faroles y semifaroles
- **9.1 La matemática del farol.** Base: Hardin Cap. 16; Acevedo Cap. 2.
- **9.2 El semifarol.** Base: Hardin Cap. 15.
- **9.3 El segundo tiro (*double barrel*).** Base: Clarke 12.1.
- **9.4 No le farolees al *station*.** Base: Clarke 12.1.
- **9.5 La *delayed c-bet*.** Base: Clarke 12.3.

### Módulo 10 — *3-bet* y botes grandes
- **10.1 ¿Qué es el *3-bet*?** Base: Clarke Cap. 10; Hardin Cap. 13.
- **10.2 Rango lineal y rango polarizado.** Base: Clarke Cap. 10; Hardin Cap. 13.
- **10.3 Tamaños de *3-bet*.** 3 veces la apertura en posición, 4 veces fuera. Base: Clarke 10.5; Acevedo Cap. 5.
- **10.4 Cuando te hacen *3-bet*.** *4-bet* con QQ+ y AK, pagar en posición con manos jugables, retirarse con el resto. Base: Clarke 11.2.
- **10.5 Botes de *3-bet* y SPR.** Base: Hardin Cap. 2; Acevedo Cap. 1.

### Módulo 11 — Mente y hábitos
- **11.1 El *tilt*.** Base: Clarke 1.4 y Glosario; Acevedo Cap. 6.
- **11.2 Cómo estudiar y revisar tus manos.** Base: Acevedo Cap. 6 (50/50); Hardin Cap. 17; Clarke 1.4.
- **11.3 Qué mesa elegir y cuántas jugar.** Base: Clarke 1.4; Acevedo Caps. 4 y 6.
- **11.4 Tu primera sesión: el plan completo.** Lección integradora con lista de comprobación. Base: todo el curso.

### Módulo 12 (opcional) — Puente a GTO
- **12.1 Contar combos y *blockers*.** Base: Hardin Cap. 18; Clarke Cap. 9; Brokos Cap. 8.
- **12.2 Rango polarizado y rango condensado.** Base: Brokos Cap. 2.
- **12.3 El equilibrio y la indiferencia.** Base: Brokos Caps. 1 y 2; Acevedo Cap. 2.
- **12.4 El equilibrio como brújula para explotar.** Base: Brokos Cap. 5.

## 5. Cómo resolvemos las discrepancias entre autores

| Tema | Autores | Regla del curso |
|---|---|---|
| GTO frente a explotar | Acevedo: base GTO; Clarke y Brokos: explotar; Hardin: no trata GTO | Módulos 0–11 enseñan reglas simples y explotación; el equilibrio queda para el Módulo 12 |
| *C-bet* automática | Clarke y Acevedo la desaconsejan | Nunca automática; ver Módulo 6 |
| *Open limp* | Clarke: subir o retirarse en todas las posiciones (incluida SB). Acevedo: limp mixto solo en SB, también en cash | Regla simple de Clarke: o subes o te retiras |
| Tamaño de apertura | Clarke: 3x UTG/HJ, 2,5x CO y SB, 2x BU contra regs. Acevedo: 2,5bb de UTG a BU, 3bb SB, y dice que el tamaño apenas cambia el resultado si es razonable | 2,5bb desde cualquier posición |
| Tamaño de *c-bet* | Clarke 4.2: 1/2–3/5 seco, 2/3–bote mojado. Acevedo: varios tamaños según textura | Mitad del bote en seco; 2/3 en mojado |
| Tamaño de *3-bet* | Clarke: 7bb IP, 8bb OOP. Acevedo (cash): 8,5bb IP, 10bb OOP (contra 2,5bb) | 3 veces la apertura en posición (7,5bb), 4 veces fuera (10bb) |
| *Set-mining* | Clarke: recuperar ≈10× lo invertido (bote + stack). Hardin: stack efectivo 15× lo pagado | Regla del 15 de Hardin, por simple y prudente |
| *Alpha* y MDF en el flop | Hardin y Clarke las aplican; Acevedo advierte que engañan en el flop | Fórmulas estrictas solo en el river o *all-in* |
| Umbrales de SPR | Hardin: bajo 0–2, medio 3–6, alto 7+. Acevedo: 0–5, 6–11, 11+ | Umbrales de Hardin (ver `DECISIONES.md`) |

## 6. Fuera de alcance

- Torneos (Acevedo Caps. 6–9, salvo la tabla de varianza de cash del Cap. 6).
- *Solvers* y software (Acevedo Cap. 3; Hardin Cap. 17 más allá del EV básico).
- Teoría post-flop de *solvers* (Acevedo Caps. 10, 11, 13, 14), salvo la advertencia sobre MDF.
- Juegos teóricos de Brokos (Caps. 3, 6, 7, 8) más allá del Módulo 12.
- Stacks muy profundos o cortos, *4-bet* de farol, *5-bet*, *probe bets*, *bluff-raises* (Clarke Caps. 11–14).

## 7. Verificación

- Auditoría de la v1: `AUDITORIA_INDEPENDIENTE.md`.
- Verificación de cada módulo redactado: `REGISTRO_VERIFICACION.md`.
- Recálculo automático de los ejemplos: `python -I herramientas/verificar_lecciones.py`.

## 8. Decisiones

Las cinco decisiones que estaban pendientes están tomadas y justificadas en `DECISIONES.md`.

## 9. Cambios de la v1 a la v2

| Cambio | Razón |
|---|---|
| El módulo "Abrir el bote" pasa de 4.º a 3.º lugar (ahora Módulo 2), antes de la matemática | La primera decisión real del alumno es qué manos jugar; con esto puede sentarse a una mesa tras el Módulo 2. Clarke ordena igual (Caps. 2–3 antes del Cap. 7). La matemática se necesita al enfrentar apuestas, que llega justo después. Ninguna lección de apertura usa *pot odds*. |
| Varianza y banca pasan del módulo final al Módulo 1 (1.4 y 1.5) | El alumno debe saberlo **antes** de jugar con dinero real, no al final del curso. |
| 0.6 "Cash o torneo" se elimina como lección y queda como recuadro en 0.5 | El curso es solo de cash; no merece una lección entera. |
| La jerarquía de manos (antes 0.7) pasa a 0.2 y se divide en dos lecciones (0.2 y 0.3) | Sin jerarquía no se entiende el *showdown* de la 0.1; la regla de las "cinco mejores cartas" y el *kicker* son la confusión más común del principiante y no caben con la jerarquía en 10 minutos. |
| "Rangos de apertura por posición" se divide en 2.4 (UTG, HJ) y 2.5 (CO, BU, SB) | Cinco rangos en una lección superan los 10 minutos. |
| Nueva 11.4 "Tu primera sesión" | Cierre integrador: convierte el curso en un plan de acción. |
| 11.1 (varianza) y 11.2 (banca) salen del Módulo 11 | Movidas al Módulo 1. |
| "Repaso cada 3 módulos" → 2 preguntas de repaso espaciado en cada mini-evaluación | Repaso más frecuente y sin lecciones extra. |
| Tamaños de *c-bet*, *3-bet*, *4-bet*, factores de *c-bet* | Corregidos según la auditoría. |
| Ejemplos de 4.1, 7.3, 8.4, 9.2, 9.5 y 10.5 de la v1 | Corregidos o reescritos (errores de cálculo o confusos). |

Equivalencia de numeración: v1 M2→v2 M3, v1 M3→v2 M4 (la piloto "3.2" es ahora **4.2**), v1 M4→v2 M2; los módulos 5 a 10 y 12 conservan su número.

## 10. Origen de cada decisión (actualizado)

| Decisión | Origen |
|---|---|
| Principiantes, cash, lecciones cortas y paulatinas, ejemplos con cartas y apuestas, contenido propio, NotebookLM lee los libros | Usuario |
| Cash 6-max, 100bb | Libros (Clarke, Acevedo); confirmado en la auditoría |
| Escala $1/$2 y $200 | Agente (decisión pedagógica declarada; sin base en libros) |
| Temas por módulo | Libros |
| Orden de módulos de la v2, división de lecciones, lección 11.4 | Agente (v2), justificado en §9 |
| Formato de lección, repaso espaciado, formato de entrega, ritmo | Agente (v2), justificado en `DECISIONES.md` |
| Rangos de apertura | Libro (Clarke, figuras por defecto), elegido por el agente |
| Tamaños de apertura, *c-bet*, *3-bet*, *set-mining*, SPR | Libros; el agente eligió entre autores (tabla §5) |
| Banca de 30 *buy-ins* | Agente, con cálculo de riesgo de ruina sobre datos de Acevedo |
| Reglas básicas, jerarquía, subida mínima | Reglas públicas del juego |
