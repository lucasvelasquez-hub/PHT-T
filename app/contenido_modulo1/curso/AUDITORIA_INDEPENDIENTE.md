# Auditoría independiente de la estructura v1

Fecha: 2026-11-25. Hecha por el agente que continúa el trabajo, sin dar por bueno nada del agente anterior.

## Método

1. **NotebookLM** (cuaderno "Curso Poker Cash – Principiantes"): 5 consultas nuevas e independientes (`new_conversation`), con 67 afirmaciones numeradas y respuesta obligatoria CONFIRMADA / CORREGIDA / NO RESPALDADA con libro y capítulo. Conversaciones: `105b528b…` (A: reglas, outs, pot odds), `b030c71a…` (B: preflop y c-bet), parte C (postflop y 3-bet, guardada en `notebooklm/04_auditoria_C.md`), `4cf12722…` (D: banca, mentalidad, GTO), `90fd1578…` (E: rangos de apertura de Clarke y Acevedo).
2. **Recálculo propio con código:** `herramientas/poker_calc.py` (evaluador de manos, conteo de *outs*, *pot odds*, varianza, riesgo de ruina, combos de rangos) y `herramientas/auditar_estructura_v1.py` (38 comprobaciones de los ejemplos de la v1). `herramientas/rangos_clarke.py` cuenta los combos de los rangos de apertura.
3. **Contraste entre ambas fuentes.** Cuando NotebookLM se contradijo a sí mismo, se resolvió con el cálculo o con la cita textual.

## Resultado en una línea

La v1 era sólida en lo esencial (ninguna regla de otro proyecto detectada; todo lo de mesa se rastrea a libros o a reglas públicas), pero tenía **3 errores de cálculo nuevos, 5 cifras o citas mal atribuidas, 2 afirmaciones falsas en su propio registro de verificación y 4 ejemplos confusos**. Todo quedó corregido en la v2.

## 1. Decisiones del agente anterior (sección 10 de la v1)

| Decisión | Veredicto | Razón |
|---|---|---|
| Cash 6-max, 100bb | **CONFIRMADA** | Clarke (Intro, Cap. 2: el libro se centra en cash 6-max online) y Acevedo (Cap. 5: "6-max Cash Game Equilibrium Strategies (100bb)"). |
| Ciegas $1/$2 y stack $200 en los ejemplos | **CONFIRMADA (decisión pedagógica)** | No sale de los libros (Acevedo usa $2/$5; Clarke usa bb). Se mantiene porque las cuentas salen en números enteros y $1/$2 es la escala estándar pública de mesas en vivo. Se declara en el curso que es solo una escala de ejemplo. |
| Temas y nivel de cada módulo | **CONFIRMADA con cambios** | Todos los temas tienen base en los libros (ver §2). Se cambió el orden (ver `ESTRUCTURA_CURRICULAR.md` §9). |
| Módulo 0 y módulo de mentalidad | **CONFIRMADA** | Los libros asumen que el lector conoce las reglas; el usuario pidió principiantes absolutos. El contenido del módulo de mentalidad sí está en Clarke Cap. 1.4 y Acevedo Cap. 6. |
| Lección de la cuadrícula 13×13 | **CONFIRMADA** | Acevedo Cap. 1 la explica (13 parejas, 78 *suited*, 78 *offsuit*). |
| 64 lecciones, 13 semanas, formato de 5 pasos, repaso cada 3 módulos | **CAMBIADA** | Formato de 5 pasos se mantiene. Pasan a 66 lecciones; el "repaso cada 3 módulos" nunca se concretó y se sustituye por preguntas de repaso espaciado dentro de cada mini-evaluación. |
| Reglas para resolver discrepancias | **CAMBIADA** | La de *open limp* estaba mal descrita: Acevedo acepta el limp en SB **también en cash 6-max** (Cap. 5), no solo en torneos. La del SPR quedaba pendiente; ahora decidida. |
| Jerarquía, reglas básicas, subida mínima estándar | **CONFIRMADA** | Reglas públicas. Acevedo Cap. 1 define *minraise* como "dos veces la última apuesta"; es una simplificación del libro: la regla pública es subir al menos lo mismo que la subida anterior. Se enseña la regla pública y se avisa de la simplificación. |
| 27 % para defender BB contra 2,5bb | **CONFIRMADA** | Recalculado: $3 / $11 = 27,3 %. Clarke no da esa cifra (usa tablas por tamaño, Cap. 6, Fig. 32). |
| Propuesta de 30 *buy-ins* | **CONFIRMADA, con nueva justificación** | Ningún libro da regla para principiantes (D-14). Recalculé que los "mínimos" de Acevedo (1.345bb y 2.690bb) equivalen a un riesgo de ruina del 5 %; 30 *buy-ins* dan ≈3,5 % con 2,5bb/100. Ver decisión 1 en `DECISIONES.md`. |
| Corrección de cifras y ejemplos | **CAMBIADA** | Varias "correcciones" del agente anterior eran a su vez incorrectas (ver §3). |
| `.gitignore` de libros y respuestas en bruto | **CONFIRMADA** | No lo pidió el usuario, pero evita subir material con derechos de autor y no tiene coste. |

## 2. Cifras y reglas, una por una

**CONFIRMADAS por NotebookLM y por mi recálculo:** posiciones UTG/HJ/CO/BU/SB/BB (Clarke 2.1; HJ también se llama MP); stack efectivo (Hardin Cap. 2; Clarke glosario); AA contra KK ≈ 82 % (Hardin, tabla de referencia); KQ contra KJ 73,16 % (Hardin Cap. 5); combos 4/12/6 (Hardin Cap. 18); *outs* 9/8/6/4/12/15 (Hardin Caps. 8 y 15); regla del 2 y del 4 y su error de ±1–3 % desde 10 *outs* (Hardin Cap. 9); *outs* sucios (Hardin Cap. 8); equity (Hardin Cap. 5); fórmula de *pot odds* (Hardin Cap. 6); trío en el flop 11,76 % (Hardin Cap. 4); aislamiento 3bb + 1bb por *limper* + 1bb fuera de posición (Clarke 3.6); *gap concept* (Clarke Cap. 6); rake 5 % con tope y "sin flop no hay rake" (Acevedo Cap. 1); 13×13 (Acevedo Cap. 1); fuerza relativa, construir el bote, elasticidad (palabra literal), *thin value* (Clarke Cap. 5); *alpha* = apuesta ÷ (bote + apuesta) (Acevedo Cap. 2; Hardin Cap. 16); advertencia de Acevedo sobre *alpha*/MDF en el flop (Cap. 12); *donk bet* (Clarke Cap. 8; Acevedo Cap. 11); semifarol (Hardin Cap. 15); *double barrel*, no farolear al *station*, *delayed c-bet* (Clarke Cap. 12); 3-bet lineal/polarizado con A5s (Clarke Cap. 10); umbrales SPR de Hardin (Cap. 2) y Acevedo (Cap. 1); 22,77 % en pérdidas a 5bb/100 tras 10.000 manos con DE 67 (Acevedo Cap. 6, contexto cash; recalculado 22,78 %); 50 % jugar / 50 % estudiar (Acevedo Cap. 6); selección de mesa (Clarke 1.4; Acevedo Cap. 4); combos y *blockers*; juego de la clarividencia (Brokos Cap. 2); indiferencia y 2 valor : 1 farol con apuesta de bote (Brokos; Acevedo Cap. 2); equilibrio como brújula (Brokos Cap. 5, proceso de 4 pasos).

**CORREGIDAS (la v1 decía algo inexacto):**

| v1 | Lo correcto |
|---|---|
| *Pot odds* en Acevedo Cap. 2 | Acevedo Cap. 1. |
| Tabla de precios: 1/3 = 20 %, 2/3 = 28,6 % | Exacto: 20,0 % y 28,6 %. Hardin imprime 19,9 % y 28,5 % (redondeo del libro). Clarke (Cap. 7, Fig. 37) y Acevedo (Cap. 4, Tabla 14) la dan redondeada. |
| Hardin da fórmula de *implied odds* | No la da (Cap. 7 es cualitativo). La fórmula con "bono de *implied odds*" es de Clarke, Cap. 8. |
| EV en Hardin Caps. 1 y 10 | Cap. 10 (y 17). |
| Brokos (Introducción) critica la c-bet automática | **No respaldada**: la introducción de Brokos no habla de c-bets. Se elimina la cita. |
| Clarke da "tres factores" para la c-bet de farol | Clarke da **siete** factores (Cap. 4.1). La lección se rehace con los siete agrupados en tres preguntas. |
| Tamaños de c-bet: 1/3 a 1/2 en seco; "Acevedo propone 1/3" | Clarke 4.2: 1/2–3/5 en seco, 3/5–2/3 intermedio, 2/3–bote en mojado. Acevedo **no** fija 1/3: mezcla varios tamaños según textura. Regla del curso: mitad del bote en seco, 2/3 en mojado. |
| Hardin Cap. 14 respalda "apostar solo si pagan peores" | Solo Clarke Cap. 5 lo formula. |
| 4-bet por valor con KK+ y AK (Clarke Cap. 11) | Clarke 11.2: **QQ+ y AK**. |
| 3-bet de Acevedo 8,5bb/10bb "Cap. 7" | Esas cifras están en Acevedo **Cap. 5 (cash)**; el Cap. 7 repite cifras de torneo. |
| *Open limp*: Acevedo lo acepta "en SB y torneos" | En SB también en cash 6-max (Cap. 5: SB sube 3x un 24,4 % y hace limp un 37,7 %). |
| Set-mining: "10× Clarke / 15× Hardin" sobre lo mismo | Clarke: recuperar ≈10 veces lo invertido sumando bote + stack rival. Hardin: el stack efectivo debe ser 15 veces lo pagado. |

**Errores del registro de verificación de la v1 (afirmaciones falsas del agente anterior):**
1. "Los porcentajes de Acevedo son de torneos 9-max": falso. El 43,4 % de apertura en BU es de **cash 6-max** (Acevedo Cap. 5, Hand Range 35).
2. "Acevedo propone 1/3 [en c-bets]": falso, ver arriba.

**Nota sobre una contradicción de NotebookLM:** en la parte B dijo que Clarke da CO 25 %, BU 48 % y SB 42 %; esas cifras salen de un HUD de un rival en una mano de ejemplo, no de una recomendación. En la parte E dijo que Clarke solo da porcentaje en el texto para UTG (11 %) y HJ (15,5 %). Mi conteo de combos de los rangos leídos de las figuras da UTG 10,6 %, HJ 15,5 %, CO 338 combos (25,5 %, igual que el texto del Cap. 10), BU 42,4 % y SB 35,4 %. Se usan mis cifras calculadas.

## 3. Ejemplos recalculados

36 de 38 comprobaciones de la v1 dan OK (salida completa: `python -I herramientas/auditar_estructura_v1.py`). Errores encontrados:

| Lección v1 | Error | Corrección |
|---|---|---|
| 9.2 | J♥T♥ en 9♥6♣2♥ **no** tiene 15 *outs*: solo 9 (color); no hay proyecto de escalera. | Mesa 9♥8♣2♥: color + escalera abierta = 15 *outs* (comprobado). |
| 9.5 | "Apuestas $3 en bote $5,50": tras abrir a $5 y que BB pague, el bote es **$11** ($5,50 era 5,5bb confundido con dólares). | Bote $11; apuesta de $6 aprox. |
| 10.5 | Bote $39 con $182 detrás no cuadra (sería $181). | Recalculado con los tamaños nuevos: BB resube a $20, BU paga, bote $41, $180 detrás, SPR 4,4. |
| 8.4 | El ejemplo mezclaba dos manos de Hero (A♠K♦ y K♠Q♠). | Se reescribe con una sola mano. |
| 4.1 | "Desde UTG abro parejas…": el rango de Clarke en UTG es 77+, no todas las parejas. | Se usa el rango de Clarke. |
| 7.3 | Bote de $15 sin origen claro. | Se recalcula desde una apertura real. |

## 4. ¿Hay contexto ajeno en el contenido?

Revisé cada regla de mesa, tamaño y cifra de la v1. Todas se rastrean a un libro, a las reglas públicas o a un cálculo propio declarado. La única elección sin base en los libros es la escala $1/$2, que se mantiene como decisión pedagógica declarada. No encontré ninguna regla que solo pudiera venir de otro proyecto.
