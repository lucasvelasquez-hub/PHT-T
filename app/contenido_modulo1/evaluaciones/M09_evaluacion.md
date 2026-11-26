# Evaluación del Módulo 9

<!-- SUPUESTO: las preguntas conservan los $ y los símbolos de palo (♠ ♥ ♦ ♣) del original, porque son preguntas de lectura y no casos de mesa. Las preguntas 6 y 7 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M08_L01 y M06_L05). -->
<!-- SUPUESTO: la pregunta 1 original tiene dos partes (el porcentaje y si se haría contra un station). Como el formato numero admite una sola cifra, el enunciado pide el porcentaje y la segunda parte queda en la explicación. La pregunta 2 también tiene dos cifras (50 % y 33 %) y por eso va como opciones con los dos valores. -->

```pregunta
id: m09-p01
leccion: M09_L01
formato: numero
enunciado: River. Bote de $60, faroleas $40. ¿Qué porcentaje de retiradas necesitas? (Después piensa si lo harías contra un *station*.)
correcta: 40
tolerancia: 1
unidad: %
explicacion: 40 ÷ 100 = **40 %**. Contra un *station*, **no**: no se retira 4 de cada 10 veces.
```

```pregunta
id: m09-p02
leccion: M09_L01
formato: opciones
enunciado: ¿Qué farol necesita funcionar más a menudo: uno de medio bote o uno del bote entero? ¿Cuánto cada uno?
opciones: [El del bote necesita 50 % y el de medio bote 33 %, El de medio bote necesita 50 % y el del bote 33 %, Los dos necesitan 33 %, El del bote necesita 67 % y el de medio bote 50 %]
correcta: El del bote necesita 50 % y el de medio bote 33 %
explicacion: El del bote: **50 %**. El de medio bote: **33 %**.
```

```pregunta
id: m09-p03
leccion: M09_L02
formato: opciones
enunciado: Tienes **8♠ 7♠** en un flop **6♠ 5♦ K♠**. Tu rival pasa. ¿Qué proyecto tienes y por qué conviene apostar?
opciones: [Color más escalera abierta con 15 outs y apostar da dos formas de ganar, Solo color con 9 outs y conviene pagar sin apostar, Solo escalera abierta con 8 outs y conviene pasar]
correcta: Color más escalera abierta con 15 outs y apostar da dos formas de ganar
explicacion: Color (9) + escalera abierta (9 o 4; el 9♠ y el 4♠ ya cuentan en el color): **15 *outs***. Apostar te da dos formas de ganar: que se retire ahora o que ligues después.
```

```pregunta
id: m09-p04
leccion: M09_L03
formato: opciones
enunciado: Hiciste *c-bet* con **A♥ Q♥** en **J♣ 7♦ 3♠** y te pagaron. Turn **K♦**. ¿Segundo tiro?
opciones: [Sí hago el segundo tiro, No paso, Hago all-in]
correcta: Sí hago el segundo tiro
explicacion: **Sí**, es un buen candidato: el K te da una escalera interna (la T), asusta a las jotas y sietes que pagaron el flop, y tu mano no gana sin apostar.
por_opcion:
  No paso: El turn te mejora y asusta a las manos medias que pagaron; rendirte aquí desperdicia una buena carta.
  Hago all-in: La lección propone un segundo tiro, no jugarse todo el stack con un proyecto interno.
```

```pregunta
id: m09-p05
leccion: M09_L05
formato: opciones
enunciado: ¿Cuándo tiene sentido una *c-bet* retrasada?
opciones: [Cuando no apostaste el flop porque no te convenía y tu rival vuelve a pasar en el turn, Siempre que tu rival pase en el flop, Cuando tu rival paga tu apuesta del flop]
correcta: Cuando no apostaste el flop porque no te convenía y tu rival vuelve a pasar en el turn
explicacion: Cuando no apostaste el flop porque no te convenía y tu rival **vuelve a pasar en el turn**: su rango queda limitado a manos débiles.
```

```pregunta
id: m09-p06
leccion: M08_L01
formato: numero
enunciado: River. Bote de $90, tu rival apuesta $30. ¿Qué equity necesitas para pagar?
correcta: 20
tolerancia: 1
unidad: %
explicacion: 1/3 del bote: **20 %**.
```

```pregunta
id: m09-p07
leccion: M06_L05
formato: opciones
enunciado: ¿Por qué tus *c-bets* de farol funcionan peor contra tres rivales que contra uno?
opciones: [Porque tienen que retirarse todos y las probabilidades se multiplican, Porque tu apuesta cuesta más contra tres rivales, Porque tres rivales siempre tienen mejor mano que uno]
correcta: Porque tienen que retirarse todos y las probabilidades se multiplican
explicacion: Porque **tienen que retirarse todos**, y las probabilidades se multiplican.
```
