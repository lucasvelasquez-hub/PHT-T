# Casos del Módulo 11: tu primera sesión

<!-- SUPUESTO: este módulo trata de mente, estudio y hábitos, y casi no se presta a la mesa, así que hay solo 2 casos. Los dos siguen la mano completa de la lección 11.4 (M11_L04), ya en bb: aislar al limper y apostar el flop por valor. -->
<!-- SUPUESTO: en el m11-c01 el HJ "paga" la ciega grande (limp). Se asume que el motor de casos acepta "paga" para completar la ciega. -->

```caso
id: m11-c01
titulo: Aísla al limper con A-J en el BTN
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Ah Js
accion:
  preflop: UTG fold; HJ paga; CO fold
bote_esperado: 2.5
pregunta: Un fish fit-or-fold hace limp en el HJ y los demás se retiran. Estás en el BTN. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lista de la lección 11.4 (M11_L04), antes del flop. AJo está en tu rango de BTN y el curso dice que nunca se hace limp: si hay limpers, se aíslan. La regla es 3 bb más 1 bb por cada limper, unos 4 bb estando en posición. Así te quedas a solas con el fish, con posición.
por_opcion:
  Fold: AJo está en tu rango de BTN y el limper es un jugador débil al que conviene aislar.
  Call: El curso evita el limp; con una mano de tu rango y un jugador débil delante, se aísla subiendo.
```

```caso
id: m11-c02
titulo: Apuesta por valor en el flop contra el fish
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: Ah Js
mesa: Jd 7c 2s
accion:
  preflop: UTG fold; HJ paga; CO fold; BTN sube 4; SB, BB fold; HJ paga
  flop: HJ check
bote_esperado: 9.5
pregunta: Aislaste al fish fit-or-fold, que pagó, y ahora pasa en el flop. Tienes top pair con as. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lista de la lección 11.4 (M11_L04), después del flop. La pregunta de oro del Módulo 7 es si te pagan manos peores, y sí: jotas peores, sietes, parejas y algún proyecto. La mesa es seca, así que la lección propone apostar medio bote, unos 5 bb.
por_opcion:
  Check: Dejas de cobrar de manos peores que sí pagarían, y contra un fish no hay nada que esconder.
```
