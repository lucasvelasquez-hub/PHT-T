# Evaluación del Módulo 3

<!-- SUPUESTO: las preguntas conservan los $ y los símbolos de palo del original. Las preguntas 7 y 8 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M02_L05 y M01_L03). Las preguntas 1 y 3 del original tenían dos partes y se separaron en bloques distintos, así que el módulo pasa de 6 a 8 preguntas. Los decimales llevan punto y las opciones no llevan comas. -->

```pregunta
id: m03-p01
leccion: M03_L02
formato: numero
enunciado: **A♦ Q♣** en un flop **J♠ T♥ 3♦**. ¿Cuántos *outs* tienes para la escalera?
correcta: 4
tolerancia: 0
unidad: outs
explicacion: Para la escalera solo te vale un **K** (A-K-Q-J-T): **4 *outs*** (escalera interna).
```

```pregunta
id: m03-p02
leccion: M03_L01
formato: numero
enunciado: En ese mismo flop (**A♦ Q♣** contra **J♠ T♥ 3♦**), ¿cuántos *outs* tienes en total si cuentas también emparejar tus sobrecartas, el as y la dama?
correcta: 10
tolerancia: 0
unidad: outs
explicacion: Si un as o una dama también te dieran la mejor mano, sumarías 3 ases y 3 damas a los 4 reyes: **10 *outs*** en total. Si tu rival ya tiene una pareja de jotas o mejor, las sobrecartas pueden no bastar.
```

```pregunta
id: m03-p03
leccion: M03_L02
formato: numero
enunciado: **9♣ 8♣** en un flop **7♣ 6♦ 2♣**. Tienes color y escalera abierta a la vez. ¿Cuántos *outs* tienes en total?
correcta: 15
tolerancia: 0
unidad: outs
explicacion: **Color + escalera abierta** (T o 5): 9 + 8 − 2 (T♣ y 5♣ ya contados) = **15 *outs***.
```

```pregunta
id: m03-p04
leccion: M03_L03
formato: numero
enunciado: Con 8 *outs*, tu rival apuesta en el flop y tú pagas. ¿Qué probabilidad aproximada tienes de ligar en el turn?
correcta: 16
tolerancia: 1
unidad: %
explicacion: Una carta: 8 × 2 = **16 %**.
```

```pregunta
id: m03-p05
leccion: M03_L03
formato: numero
enunciado: Con 8 *outs* estás *all-in* en el flop, así que verás turn y river sin pagar más. ¿Qué probabilidad aproximada tienes de ligar?
correcta: 32
tolerancia: 1
unidad: %
explicacion: *All-in* en el flop, dos cartas: 8 × 4 = **32 %**.
```

```pregunta
id: m03-p06
leccion: M03_L04
formato: numero
enunciado: **Q♠ J♠** en un flop **T♦ 9♦ 4♣**. ¿Cuántos *outs* limpios tienes contra un rival que podría tener dos diamantes?
correcta: 6
tolerancia: 0
unidad: outs
explicacion: Escalera abierta: K u 8, 8 *outs*. El **K♦** y el **8♦** ponen tres diamantes: sucios. **6 *outs* limpios** (≈ 12 % con una carta).
```

```pregunta
id: m03-p07
leccion: M02_L05
formato: opciones
enunciado: Mesa $1/$2 y todos se retiran hasta ti. Tienes **K♠ 6♠**. ¿Qué haces en el CO y qué haces en el BU?
opciones: [CO retirarte y BU subir a $5, CO subir a $5 y BU subir a $5, CO subir a $5 y BU retirarte, CO retirarte y BU retirarte]
correcta: CO retirarte y BU subir a $5
explicacion: CO: **te retiras** (reyes *suited* desde K8s). BU: **subes a $5** (K2s+).
```

```pregunta
id: m03-p08
leccion: M01_L03
formato: opciones
enunciado: ¿Por qué perder un bote en el que tenías el 82 % no significa que decidiste mal?
opciones: [Porque la decisión se juzga por su EV y no por el resultado, Porque con el 82 % nunca se pierde, Porque la suerte siempre se compensa dentro de la misma sesión]
correcta: Porque la decisión se juzga por su EV y no por el resultado
explicacion: Porque la decisión se juzga por su **EV**: meter el dinero con el 82 % gana a largo plazo, aunque esta vez saliera mal.
```
