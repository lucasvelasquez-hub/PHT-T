# Evaluación del Módulo 10

<!-- SUPUESTO: las preguntas conservan los $ y los símbolos de palo (♠ ♥ ♦ ♣) del original, porque son preguntas de lectura y no casos de mesa. Las preguntas 6 y 7 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M09_L02 y M02_L04). La indicación "Mesa $1/$2, stacks de $200" del original se repite en los enunciados 1 a 5. -->
<!-- SUPUESTO: las preguntas 1 y 5 tienen dos datos (acción y tamaño; SPR y nivel), por eso van como opciones que combinan los dos y no como numero. -->

```pregunta
id: m10-p01
leccion: M10_L03
formato: opciones
enunciado: Mesa $1/$2, stacks de $200. El HJ abre a $5. Estás en el BU con **A♦ K♦**. ¿Qué haces y de cuánto?
opciones: [3-bet por valor a $15, 3-bet por valor a $20, Pago $5, Me retiro]
correcta: 3-bet por valor a $15
explicacion: ***3-bet* por valor** a 3 × $5 = **$15** (en posición).
por_opcion:
  3-bet por valor a $20: Es el tamaño de fuera de posición (4 × $5); en el BU estás en posición.
  Pago $5: Con A-K quieres meter dinero ahora, por valor.
  Me retiro: A-K es una de las manos con las que se resube por valor.
```

```pregunta
id: m10-p02
leccion: M10_L02
formato: opciones
enunciado: Mesa $1/$2, stacks de $200. Un *fish* agresivo abre en el CO y nunca se retira ante un *3-bet*. ¿Resubes con **A♠ Q♠** o con **A♥ 4♥**?
opciones: [Con A♠ Q♠ por valor, Con A♥ 4♥ de farol, Con las dos]
correcta: Con A♠ Q♠ por valor
explicacion: Con **A♠ Q♠**, por valor (rango lineal). No con A♥ 4♥: no tiene *fold equity*.
por_opcion:
  Con A♥ 4♥ de farol: Un farol solo gana si el rival se retira, y este rival nunca se retira.
  Con las dos: El farol con A♥ 4♥ no funciona contra quien no se retira.
```

```pregunta
id: m10-p03
leccion: M10_L03
formato: numero
enunciado: Mesa $1/$2, stacks de $200. El CO abre a $5. Estás en la BB. ¿De cuánto es tu *3-bet*?
correcta: 20
tolerancia: 0
unidad: $
explicacion: Fuera de posición: 4 × $5 = **$20**.
```

```pregunta
id: m10-p04
leccion: M10_L04
formato: opciones
enunciado: Mesa $1/$2, stacks de $200. Abres en el CO y un *nit* te resube desde la BB. Tienes **A♣ J♣**. ¿Qué haces?
opciones: [Me retiro, Pago, Hago 4-bet]
correcta: Me retiro
explicacion: **Te retiras.** Contra el rango de *3-bet* de un *nit* (QQ+, AK), A-J está muy por detrás.
por_opcion:
  Pago: A-J no está en la lista de pago contra un rival que solo resube con monstruos.
  Hago 4-bet: El 4-bet por valor es para QQ+ y AK, no para A-J.
```

```pregunta
id: m10-p05
leccion: M10_L05
formato: opciones
enunciado: Mesa $1/$2, stacks de $200. Bote de $41 en el flop con $180 detrás. ¿SPR y nivel?
opciones: [4.4 y es medio, 4.4 y es bajo, 4.4 y es alto, 0.2 y es bajo]
correcta: 4.4 y es medio
explicacion: 180 ÷ 41 ≈ **4,4**: medio.
```

```pregunta
id: m10-p06
leccion: M09_L02
formato: opciones
enunciado: ¿Por qué un semifarol necesita que tu rival se retire menos veces que un farol puro?
opciones: [Porque aunque te pague puedes ligar tu proyecto y ganar después, Porque el semifarol siempre cuesta menos, Porque el rival nunca paga un semifarol]
correcta: Porque aunque te pague puedes ligar tu proyecto y ganar después
explicacion: Porque, aunque te pague, **puedes ligar** tu proyecto y ganar después.
```

```pregunta
id: m10-p07
leccion: M02_L04
formato: opciones
enunciado: **A♠ T♠** en UTG. ¿Subes?
opciones: [Sí subo, Me retiro, Pago la ciega grande]
correcta: Sí subo
explicacion: **Sí.** ATs está en ATs+.
```
