# Evaluación del Módulo 0

<!-- SUPUESTO: las preguntas conservan los $ y los símbolos de palo del original, porque son preguntas de lectura y no casos de mesa. Las preguntas 1, 5, 6 y 7 del original tenían dos partes y se separaron en bloques distintos, así que el módulo pasa de 7 a 10 preguntas. Los decimales llevan punto (2.5) y las opciones no llevan comas, para no romper la lista `opciones`. -->

```pregunta
id: m00-p01
leccion: M00_L01
formato: opciones
enunciado: ¿Cuáles son las cuatro rondas de apuestas en orden y cuántas cartas comunitarias hay en la mesa en cada una?
opciones: [Preflop 0 - flop 3 - turn 4 - river 5, Preflop 2 - flop 3 - turn 4 - river 5, Preflop 0 - flop 3 - river 4 - turn 5]
correcta: Preflop 0 - flop 3 - turn 4 - river 5
explicacion: Preflop (0 cartas comunitarias), flop (3), turn (4) y river (5).
```

```pregunta
id: m00-p02
leccion: M00_L02
formato: opciones
enunciado: Mesa: **8♠ 7♠ 6♦ 2♠ K♣**. Tú: **A♠ 4♣**. Rival: **9♥ 5♦**. ¿Quién gana?
opciones: [Gana el rival con escalera 9-8-7-6-5, Gana tú con color de picas, Empatan y se divide el bote]
correcta: Gana el rival con escalera 9-8-7-6-5
explicacion: **Gana el rival**, con escalera 9-8-7-6-5. Es una trampa: tú solo tienes **cuatro** picas (A♠ 8♠ 7♠ 2♠) y el color necesita cinco, así que te quedas con carta alta. Si caíste, repasa la lección 0.2 y acostúmbrate a contar las cinco cartas una por una.
```

```pregunta
id: m00-p03
leccion: M00_L03
formato: opciones
enunciado: Mesa: **A♦ 9♣ 9♠ 6♥ 3♦**. Tú: **A♣ 4♠**. Rival: **A♠ K♥**. ¿Quién gana?
opciones: [Gana el rival por el kicker, Gana tú por el kicker, Empatan y se divide el bote]
correcta: Gana el rival por el kicker
explicacion: Los dos tienen doble pareja, ases y nueves. Quinta carta: tu 6 de la mesa (tu 4 no entra) contra su K. **Gana el rival** por el *kicker*.
```

```pregunta
id: m00-p04
leccion: M00_L04
formato: numero
enunciado: Ciegas $1/$2. Un jugador sube a $7. ¿Cuál es la subida mínima para el siguiente jugador?
correcta: 12
tolerancia: 0
unidad: $
explicacion: El aumento fue de $5 (de $2 a $7). Mínimo: $7 + $5 = **$12**.
```

```pregunta
id: m00-p05
leccion: M00_L06
formato: numero
enunciado: En $1/$2, el botón sube a $5, la SB se retira y la BB paga. En el flop la BB pasa y el botón apuesta $8. Si la BB paga, ¿cuánto hay en el bote?
correcta: 27
tolerancia: 0
unidad: $
explicacion: Bote del flop: $5 + $5 + $1 = $11. Tras la apuesta y el pago: $11 + $8 + $8 = **$27**.
```

```pregunta
id: m00-p06
leccion: M00_L05
formato: numero
enunciado: En esa misma mesa de $1/$2 el bote es de $27. ¿Cuántas ciegas grandes (bb) son?
correcta: 13.5
tolerancia: 0.1
unidad: bb
explicacion: En $1/$2 una ciega grande vale $2, así que $27 son **13.5 bb**.
```

```pregunta
id: m00-p07
leccion: M00_L07
formato: numero
enunciado: La sala cobra un *rake* de 5 % con tope de $4. ¿Cuánto se cobra de un bote de $50?
correcta: 2.5
tolerancia: 0.01
unidad: $
explicacion: $50 × 5 % = **$2.50**.
```

```pregunta
id: m00-p08
leccion: M00_L07
formato: numero
enunciado: Con el mismo *rake* (5 % con tope de $4), el bote llegó a $300 pero todos se retiraron antes del flop. ¿Cuánto se cobra?
correcta: 0
tolerancia: 0
unidad: $
explicacion: Sin flop no hay *rake*: se cobra **$0**.
```

```pregunta
id: m00-p09
leccion: M00_L08
formato: numero
enunciado: ¿Cuántos combos hay de **AQ**, sin indicar palos?
correcta: 16
tolerancia: 0
unidad: combos
explicacion: AQ: **16** combos (4 × 4).
```

```pregunta
id: m00-p10
leccion: M00_L08
formato: numero
enunciado: ¿Cuántos combos hay de **AQs** (as y dama del mismo palo)?
correcta: 4
tolerancia: 0
unidad: combos
explicacion: AQs: **4** combos, uno por cada palo.
```
