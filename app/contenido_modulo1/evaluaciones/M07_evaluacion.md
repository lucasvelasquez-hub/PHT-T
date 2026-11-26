# Evaluación del Módulo 7

<!-- SUPUESTO: las preguntas conservan los $ y los símbolos de palo (♠ ♥ ♦ ♣) del original, porque son preguntas de lectura y no casos de mesa. Las preguntas 6 y 7 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M06_L04 y M04_L04). -->

```pregunta
id: m07-p01
leccion: M07_L01
formato: opciones
enunciado: Tienes **K♣ K♦**. ¿En cuál de estas mesas es más fuerte tu mano?
opciones: [Q♠ 7♦ 2♣, J♥ T♥ 9♥, Es igual de fuerte en las dos]
correcta: Q♠ 7♦ 2♣
explicacion: En **Q♠ 7♦ 2♣** la mesa es seca y casi nada te gana. En J♥ T♥ 9♥ hay escaleras y colores posibles, así que tu pareja de reyes vale menos contra lo que puede tener el rival.
```

```pregunta
id: m07-p02
leccion: M07_L02
formato: opciones
enunciado: Abres a $5 en el BU con **A♣ A♦**; un *station* paga en la BB. Bote: $11. Flop **Q♥ 8♠ 3♣**. La BB pasa. ¿Pasas o apuestas? ¿De cuánto?
opciones: [Paso para no asustarlo, Apuesto por valor unos $7 a $9, Apuesto un tamaño pequeño de unos $3, Apuesto unos $30]
correcta: Apuesto por valor unos $7 a $9
explicacion: **Apuestas por valor**: muchas manos peores pagan (damas, ochos, parejas). Contra un *station*, que es inelástico, apuestas más grande que tu tamaño habitual: **unos $7 a $9**.
por_opcion:
  Paso para no asustarlo: Contra un station no hay nada que esconder, porque paga con muchas manos peores.
  Apuesto un tamaño pequeño de unos $3: Contra un rival inelástico conviene apostar más grande, no más pequeño.
  Apuesto unos $30: Es casi el triple del bote y es mucho más de lo que la lección propone.
```

```pregunta
id: m07-p03
leccion: M07_L03
formato: opciones
enunciado: Bote de $10 en el flop. Comparas dos planes: apostar 2/3 en flop, turn y river, o pasar el flop y apostar 2/3 en turn y river. Te pagan siempre. ¿Qué bote final consigue cada plan? (Apuestas redondeadas a dólares enteros.)
opciones: [Tres apuestas $130 y dos apuestas $56, Tres apuestas $56 y dos apuestas $24, Tres apuestas $130 y dos apuestas $130, Tres apuestas $37 y dos apuestas $16]
correcta: Tres apuestas $130 y dos apuestas $56
explicacion: Tres apuestas: $7 → $24; $16 → $56; $37 → **$130**. Dos apuestas: $7 → $24; $16 → **$56**. Saltarte el flop deja el bote en menos de la mitad.
```

```pregunta
id: m07-p04
leccion: M07_L04
formato: opciones
enunciado: ¿Contra quién apuestas más grande por valor: un *reg* que se retira ante apuestas grandes o un *whale* que paga todo?
opciones: [Contra el whale, Contra el reg, Contra los dos por igual]
correcta: Contra el whale
explicacion: Contra el ***whale***, porque es inelástico: paga casi igual sea grande o pequeña la apuesta. El *reg* se retira ante las apuestas grandes.
```

```pregunta
id: m07-p05
leccion: M07_L05
formato: opciones
enunciado: River. Tienes segunda pareja con buen *kicker* en el BU; tu rival, un *station*, pasó en el turn y en el river. ¿Qué haces?
opciones: [Apuesto pequeño más o menos un tercio del bote, Paso, Apuesto el bote entero, Hago all-in]
correcta: Apuesto pequeño más o menos un tercio del bote
explicacion: **Valor fino**: una apuesta pequeña, un tercio del bote más o menos. Un *station* paga con muchas manos peores.
```

```pregunta
id: m07-p06
leccion: M06_L04
formato: numero
enunciado: Bote de $16 en un flop **A♠ 7♦ 2♣**. ¿De cuánto es tu *c-bet*?
correcta: 8
tolerancia: 0
unidad: $
explicacion: Flop seco: mitad del bote, **$8**.
```

```pregunta
id: m07-p07
leccion: M04_L04
formato: opciones
enunciado: Bote de $30, tu rival apuesta $15 y tienes 12 *outs* en el flop (sin *all-in*). ¿Pagas?
opciones: [Pago, Me retiro, Subo all-in]
correcta: Pago
explicacion: Precio: 25 %. Equity: 12 × 2 = 24 % (exacto, 25,5 %). Está en el límite; con cualquier *implied odds*, **pagas**.
```
