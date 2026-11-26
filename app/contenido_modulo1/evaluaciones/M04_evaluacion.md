# Evaluación del Módulo 4

<!-- SUPUESTO: las preguntas conservan los $ y los símbolos de palo del original. Las preguntas 9 y 10 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M03_L03 y M02_L07). Las preguntas 3, 5 y 6 del original tenían dos partes (o pedían nombrar tres cosas) y se separaron o se pasaron a opciones con la respuesta original como opción esperada. Los decimales llevan punto y las opciones no llevan comas. -->

```pregunta
id: m04-p01
leccion: M04_L01
formato: numero
enunciado: Todo el dinero está dentro en el flop y tienes un 30 % de equity en un bote de $150. ¿Cuál es tu parte del bote?
correcta: 45
tolerancia: 0
unidad: $
explicacion: 0.30 × $150 = **$45**.
```

```pregunta
id: m04-p02
leccion: M04_L02
formato: numero
enunciado: Bote de $60, tu rival apuesta $30. ¿Qué equity necesitas para pagar?
correcta: 25
tolerancia: 1
unidad: %
explicacion: 30 ÷ (60 + 30 + 30) = 30 ÷ 120 = **25 %**.
```

```pregunta
id: m04-p03
leccion: M04_L03
formato: numero
enunciado: Sin calcular: ¿qué equity necesitas para pagar una apuesta de 3/4 del bote?
correcta: 30
tolerancia: 1
unidad: %
explicacion: Una apuesta de 3/4 del bote → **30 %**.
```

```pregunta
id: m04-p04
leccion: M04_L03
formato: numero
enunciado: Sin calcular: ¿qué equity necesitas para pagar una apuesta de 1/3 del bote?
correcta: 20
tolerancia: 1
unidad: %
explicacion: Una apuesta de 1/3 del bote → **20 %**.
```

```pregunta
id: m04-p05
leccion: M04_L04
formato: opciones
enunciado: Tienes **8♠ 7♠** en un flop **K♥ 6♣ 5♦**. Bote de $60 y tu rival apuesta $30. ¿Pagas por *pot odds*?
opciones: [No - tu equity es menor que el precio, Sí - tu equity es mayor que el precio, Sí - las escaleras abiertas siempre se pagan]
correcta: No - tu equity es menor que el precio
explicacion: Precio: medio bote → **25 %**. Equity: 8-7-6-5, escalera abierta (9 o 4), 8 × 2 = **16 %**. 16 % < 25 %: **no** te dan las *pot odds*.
```

```pregunta
id: m04-p06
leccion: M04_L05
formato: numero
enunciado: En ese mismo caso (**8♠ 7♠** en **K♥ 6♣ 5♦**, bote de $60, apuesta de $30 y equity del 16 %), ¿cuánto dinero extra necesitarías ganar de media cuando ligas?
correcta: 67.5
tolerancia: 0.5
unidad: $
explicacion: $30 ÷ 0.16 − $120 = $187.50 − $120 = **$67.50**.
```

```pregunta
id: m04-p07
leccion: M04_L05
formato: opciones
enunciado: En ese mismo caso, ¿contra qué rival y con qué stacks podría valer la pena pagar por *implied odds*?
opciones: [Contra un station con stacks grandes y en posición, Contra un nit con stacks cortos, Contra un fish fit-or-fold fuera de posición]
correcta: Contra un station con stacks grandes y en posición
explicacion: Solo con stacks grandes detrás, en posición y contra un rival que paga mucho (un *station*). Contra un *nit* o con stacks cortos, te retiras.
```

```pregunta
id: m04-p08
leccion: M04_L05
formato: opciones
enunciado: ¿En cuál de estas situaciones son malas las *implied odds*?
opciones: [Proyecto de color obvio contra un nit con poco dinero detrás, Escalera escondida en posición contra un station con stacks grandes, Pareja pequeña en posición contra un rival que paga mucho]
correcta: Proyecto de color obvio contra un nit con poco dinero detrás
explicacion: Son malas con un proyecto obvio, contra un *nit*, con poco dinero detrás, fuera de posición, en el river o en un *all-in*.
```

```pregunta
id: m04-p09
leccion: M03_L03
formato: opciones
enunciado: ¿Cuándo usas "× 4" en lugar de "× 2" para estimar tu probabilidad de ligar?
opciones: [Solo cuando verás dos cartas sin pagar más (con todo el dinero dentro en el flop), Siempre que estés en el flop, Siempre que tengas más de 8 outs]
correcta: Solo cuando verás dos cartas sin pagar más (con todo el dinero dentro en el flop)
explicacion: Solo cuando verás **dos cartas sin pagar más**: con todo el dinero dentro en el flop.
```

```pregunta
id: m04-p10
leccion: M02_L07
formato: opciones
enunciado: Mesa $1/$2. Un *limper* en el HJ. Tú, en el BU con **A♠ J♣**. ¿Qué haces y de cuánto?
opciones: [Aislar subiendo a $8, Aislar subiendo a $5, Hacer limp tú también, Retirarte]
correcta: Aislar subiendo a $8
explicacion: **Aíslas a 4 bb = $8** (3 bb + 1 bb por el *limper*; estás en posición).
```
