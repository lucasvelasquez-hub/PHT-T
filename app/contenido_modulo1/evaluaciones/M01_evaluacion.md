# Evaluación del Módulo 1

<!-- SUPUESTO: las preguntas conservan los $ y los símbolos de palo del original. Las preguntas 7 y 8 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M00_L04 y M00_L03). Las que en el original eran de respuesta abierta (1, 4, 5 y 6) se pasaron a opciones con la respuesta original como opción esperada. Los decimales llevan punto y las opciones no llevan comas. -->

```pregunta
id: m01-p01
leccion: M01_L01
formato: opciones
enunciado: El CO sube y el BU paga. Después del flop, ¿quién habla primero y quién está en posición?
opciones: [Habla primero el CO y el BU está en posición, Habla primero el BU y el CO está en posición, Habla primero quien tiene más fichas]
correcta: Habla primero el CO y el BU está en posición
explicacion: Habla primero el **CO**; el **BU** está en posición, porque después del flop habla después que su rival.
```

```pregunta
id: m01-p02
leccion: M01_L02
formato: numero
enunciado: Tú tienes $200 en la BB y el BU tiene $75. ¿Cuál es el stack efectivo en bb (ciegas $1/$2)?
correcta: 37.5
tolerancia: 0.1
unidad: bb
explicacion: El stack efectivo es el menor de los dos stacks: **$75 = 37.5 bb.**
```

```pregunta
id: m01-p03
leccion: M01_L03
formato: numero
enunciado: Te ofrecen esta apuesta: sacas una carta de una baraja; si es un corazón ganas $5 y si no pagas $2. ¿Cuál es tu EV?
correcta: -0.25
tolerancia: 0.01
unidad: $
explicacion: Hay 13 corazones de 52 cartas, o sea 1/4. EV = 0.25 × $5 − 0.75 × $2 = $1.25 − $1.50 = **−$0.25**. No aceptas.
```

```pregunta
id: m01-p04
leccion: M01_L03
formato: opciones
enunciado: Pierdes un bote enorme con **K♠ K♥** contra **Q♦ Q♣**, con todo el dinero dentro antes del flop, porque cae una dama. ¿Fue un error meter el dinero?
opciones: [No - la decisión fue +EV y el resultado fue varianza, Sí - perdiste así que la decisión fue mala, Sí - debías retirarte porque podía caer una dama]
correcta: No - la decisión fue +EV y el resultado fue varianza
explicacion: **No.** Los reyes ganan a las damas la gran mayoría de las veces; la decisión fue +EV. El resultado fue varianza.
```

```pregunta
id: m01-p05
leccion: M01_L05
formato: opciones
enunciado: Tienes $120 para póker. ¿Puedes jugar NL5 ($5 por *buy-in*)? ¿Cuál es tu límite?
opciones: [No - tu límite es NL2, Sí - y también podrías subir a NL10, Sí - con 24 buy-ins ya basta]
correcta: No - tu límite es NL2
explicacion: **No:** $120 son 24 *buy-ins* de NL5 y necesitas 30 ($150) para empezar en ese límite. Tu límite es **NL2**, donde tienes 60 *buy-ins*.
```

```pregunta
id: m01-p06
leccion: M01_L06
formato: opciones
enunciado: Un rival se retira casi siempre cuando alguien apuesta el flop, pero entra en muchísimas manos pagando la ciega. ¿Qué perfil es y cuál es el plan contra él?
opciones: [Fish fit-or-fold - subir contra sus limps y apostar el flop, Fish station - nunca farolearle y apostar fuerte por valor, Nit - robar sus ciegas y respetar sus subidas, Whale - jugar más manos contra él]
correcta: Fish fit-or-fold - subir contra sus limps y apostar el flop
explicacion: **Fish fit-or-fold.** Plan: subir contra sus *limps* y apostar el flop ("infla el bote y llévatelo").
```

```pregunta
id: m01-p07
leccion: M00_L04
formato: numero
enunciado: Preflop en $1/$2, un jugador sube a $6 y otro resube a $18. ¿Cuál es la subida mínima del siguiente jugador?
correcta: 30
tolerancia: 0
unidad: $
explicacion: Último aumento: $12. Mínimo: $18 + $12 = **$30**.
```

```pregunta
id: m01-p08
leccion: M00_L03
formato: opciones
enunciado: Mesa: **K♦ K♣ 8♥ 5♠ 2♦**. Tú: **A♥ 3♣**. Rival: **Q♠ J♠**. ¿Quién gana?
opciones: [Gana tú por el as como kicker, Gana el rival porque tiene dos cartas altas, Empatan y se divide el bote]
correcta: Gana tú por el as como kicker
explicacion: Los dos tienen pareja de reyes. Tú: K-K-A-8-5. Rival: K-K-Q-J-8. **Ganas tú** por el as.
```
