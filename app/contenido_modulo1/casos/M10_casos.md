# Casos del Módulo 10: 3-bet y SPR

<!-- SUPUESTO: las lecciones usan mesa de $1/$2 con stacks de $200 y aquí se convierte a 100 bb (1 bb = $2): apertura de $5 = 2.5 bb; 3-bet de $15 = 7.5 bb; $20 = 10 bb; 4-bet de $38 = 19 bb. Con las decisiones Bet/Raise la app elige el tamaño; el tamaño que propone la lección va en la explicación. -->
<!-- SUPUESTO: el caso m10-c02 (A5s como farol) depende de que el rival se retire mucho al 3-bet; esa condición va escrita en la pregunta porque la app no la muestra. -->

```caso
id: m10-c01
titulo: Damas contra una apertura: resube por valor
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Qs Qh
accion:
  preflop: UTG fold; HJ sube 2.5; CO fold
bote_esperado: 4
pregunta: El HJ abre a 2.5 bb. Estás en el BTN con una pareja de damas. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 10.1 (M10_L01). Es un 3-bet por valor: el HJ abre con muchas manos peores (66+, A2s+, ATo+, KJo+) y una buena parte te pagará o te resubirá con manos inferiores a tus damas. Con la regla del curso, en posición se resube a 3 veces la apertura, unos 7.5 bb. Si se retira, ganas 4 bb: su apertura más las ciegas.
por_opcion:
  Fold: Con damas quieres meter dinero ahora; retirarte regala una mano de valor.
  Call: Pagar deja de cobrar valor ahora; las damas se resuben, no se pagan.
```

```caso
id: m10-c02
titulo: A5s como farol contra un rival que se retira mucho
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: As 5s
accion:
  preflop: UTG, HJ fold; CO sube 2.5
bote_esperado: 4
pregunta: El CO es un reg que se retira mucho ante un 3-bet. Abre a 2.5 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 10.2 (M10_L02). Contra un rival que se retira mucho, el rango de 3-bet es polarizado: manos muy fuertes más algunos faroles. A5s es un buen farol porque bloquea ases, con lo que hay menos AA y AK posibles para el CO, y si te paga puede ligar color o escalera. La regla del curso es 3 veces la apertura en posición, unos 7.5 bb.
por_opcion:
  Fold: Contra quien se retira mucho, los faroles ganan el bote a menudo, y A5s es de los mejores.
  Call: A5s funciona mejor como farol de 3-bet que pagando, porque bloquea ases y puede ligar color o escalera.
```

```caso
id: m10-c03
titulo: Reyes fuera de posición: el tamaño del 3-bet
tipo: concepto
calle: preflop
heroe: SB
cartas_heroe: Kh Kd
accion:
  preflop: UTG fold; HJ sube 2.5; CO, BTN fold
bote_esperado: 4
pregunta: El HJ abre a 2.5 bb y estás en la SB con reyes. Resubes por valor. ¿A cuánto?
formato: opciones
opciones: [Resubo a 5 bb, Resubo a 7.5 bb, Resubo a 10 bb]
correcta: Resubo a 10 bb
explicacion: Lección 10.3 (M10_L03). La regla del curso es 3 veces la apertura en posición y 4 veces fuera de posición. Estás en la SB, fuera de posición, así que 4 × 2.5 = 10 bb. Un tamaño mayor hace que te paguen menos y que el bote sea más grande cuando te pagan.
por_opcion:
  Resubo a 5 bb: Le das un precio muy barato para ver el flop con posición.
  Resubo a 7.5 bb: Es el tamaño de en posición, 3 veces la apertura; estás fuera de posición.
```

```caso
id: m10-c04
titulo: Rey y jota contra el 3-bet de un nit
tipo: concepto
calle: preflop
heroe: CO
cartas_heroe: Kd Jd
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN, SB fold; BB sube 10
bote_esperado: 13
pregunta: Abriste a 2.5 bb en el CO y la BB, un nit, te resube a 10 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 10.4 (M10_L04). Un nit que resube tiene casi siempre QQ+ o AK, y contra eso K-J está muy por detrás. Retirarte te cuesta 2.5 bb, no 10 o más. La mayoría de tus aperturas no aguantan un 3-bet y no pasa nada.
por_opcion:
  Call: K-J no está en la lista de pago, y menos fuera de posición contra un nit.
  Raise: El 4-bet por valor es para QQ+ y AK; con K-J solo regalarías dinero a un rango muy fuerte.
```

```caso
id: m10-c05
titulo: Damas contra el 3-bet del BTN: 4-bet por valor
tipo: concepto
calle: preflop
heroe: CO
cartas_heroe: Qc Qd
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN sube 7.5; SB, BB fold
bote_esperado: 11.5
pregunta: Abriste a 2.5 bb en el CO y el BTN resube a 7.5 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 10.4 (M10_L04). Con QQ+ y AK la regla del curso es el 4-bet por valor, a unas 2.5 veces el 3-bet, unos 19 bb. Si tu rival va all-in después, pagas, porque con estas manos estás dispuesto a jugarte el stack.
por_opcion:
  Fold: Con QQ+ se resube por valor; retirarte regala una de tus mejores manos.
  Call: Pagar desperdicia valor: con QQ+ y AK la lección propone el 4-bet.
```

```caso
id: m10-c06
titulo: Bote de 3-bet con SPR medio: c-bet pequeña
tipo: concepto
calle: flop
heroe: BB
cartas_heroe: As Qs
mesa: Qh 7d 2c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB sube 10; BTN paga
bote_esperado: 20.5
pregunta: Resubiste desde la BB y el BTN pagó. Quedan 90 bb por jugador y tienes top pair con el mejor kicker. Eres el primero en hablar. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 10.5 (M10_L05). El SPR es 90 ÷ 20.5 ≈ 4.4, un nivel medio. En botes de 3-bet las c-bets pueden ser más pequeñas, alrededor de 1/3 del bote, unos 7 bb. Apuestas por valor, pero con SPR medio un top pair no es para jugarte el stack sin pensar si te suben con fuerza.
por_opcion:
  Check: Dejas de cobrar valor con tu mejor mano posible en un bote que ya es grande.
```
