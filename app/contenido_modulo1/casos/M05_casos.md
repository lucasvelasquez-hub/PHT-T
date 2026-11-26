# Casos del Módulo 5: pagar una subida

<!-- SUPUESTO: las lecciones usan $ y aquí se convierte a 100 bb (1 bb = $2): abrir a $5 = 2.5 bb; la regla del 15 con 100 bb de stack efectivo permite pagar hasta unos 6.7 bb. En m05-c06 el héroe abre desde el BTN, la BB resube y le vuelve a tocar al héroe, así que la acción incluye una acción suya antes de decidir. Con las decisiones Raise la app elige el tamaño. La app calcula su equity contra manos al azar; en los casos de tipo `matematica` la explicación dice qué cálculo usa la lección. Los decimales llevan punto y las opciones no llevan comas. -->

```caso
id: m05-c01
titulo: Pagar con KQ suited contra el HJ
tipo: concepto
calle: preflop
heroe: CO
cartas_heroe: Kd Qd
accion:
  preflop: UTG fold; HJ sube 2.5
bote_esperado: 4
pregunta: El HJ abre a 2.5 bb. ¿Qué haces en el CO?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Lección 5.1 (M05_L01). Para pagar una apertura necesitas más que para abrir, y KQs es una de las manos del rango de pago del CO contra el HJ: está en buena forma contra lo que abre. Las manos más fuertes, QQ+ y AK, se resuben; KQs se paga.
por_opcion:
  Fold: KQs sí está en el rango de pago del CO contra el HJ; retirarte regala una mano que se defiende bien.
  Raise: Resubir se reserva para las manos más fuertes (QQ+ y AK); KQs paga.
```

```caso
id: m05-c02
titulo: AJ offsuit contra una apertura desde UTG
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Ac Jd
accion:
  preflop: UTG sube 2.5; HJ, CO fold
bote_esperado: 4
pregunta: UTG abre a 2.5 bb. Tienes A♣ J♦ en el botón y juegas con posición. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 5.1 (M05_L01). Contra UTG el botón paga AQo pero no AJo. Aunque abrirías AJo desde el botón, el que abre desde UTG tiene un rango fuerte y, cuando ligas un as, muchas veces él tiene un as con mejor kicker. Esa distancia entre abrir y pagar es el gap concept.
por_opcion:
  Call: AJo no está en el rango de pago del botón contra UTG: cuando ligas un as, a menudo vas por detrás.
  Raise: Resubir se reserva para las manos más fuertes (QQ+ y AK); AJo no está entre ellas.
```

```caso
id: m05-c03
titulo: Defender la ciega grande contra el botón
tipo: matematica
calle: preflop
heroe: BB
cartas_heroe: 7h 6h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold
bote_esperado: 4
pregunta: El BTN abre a 2.5 bb y la SB se retira. ¿Qué haces en la BB?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Lección 5.2 (M05_L02). Ya pusiste 1 bb y cierras la acción, así que pagas 1.5 bb más para un bote final de 5.5: 1.5 ÷ 5.5 = 27 % de equity necesaria. 76s está en el rango de defensa de la BB contra una apertura de 2.5 bb desde el botón. La lección usa ese 27 %; la app mostrará su equity contra manos al azar, que es otro número.
por_opcion:
  Fold: Con un precio de 27 % y una mano que liga escaleras y colores, 76s sí se defiende.
  Raise: Resubir se reserva para QQ+ y AK; 76s paga.
```

```caso
id: m05-c04
titulo: La misma defensa contra UTG cambia
tipo: concepto
calle: preflop
heroe: BB
cartas_heroe: Qc Td
accion:
  preflop: UTG sube 2.5; HJ, CO, BTN, SB fold
bote_esperado: 4
pregunta: UTG abre a 2.5 bb y todos se retiran hasta ti en la BB. ¿Qué haces con Q♣ T♦?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 5.2 (M05_L02). QTo se defiende contra una apertura del botón, pero el rango de UTG es mucho más fuerte. La regla prudente del curso es defender desde la BB con el mismo rango de pago que tendría el botón contra esa posición, y contra UTG ese rango no incluye QTo.
por_opcion:
  Call: Contra el botón QTo sí paga, pero contra UTG el rango de quien abre es mucho más fuerte y la mano va por detrás a menudo.
  Raise: Resubir se reserva para las manos más fuertes (QQ+ y AK); QTo no está entre ellas.
```

```caso
id: m05-c05
titulo: Una pareja pequeña para buscar trío
tipo: matematica
calle: preflop
heroe: BTN
cartas_heroe: 4s 4h
accion:
  preflop: UTG sube 2.5; HJ, CO fold
bote_esperado: 4
pregunta: UTG abre a 2.5 bb y los dos tienen 100 bb. ¿Qué haces en el botón con 4♠ 4♥?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Lección 5.3 (M05_L03). Regla del 15: el stack efectivo debe ser al menos 15 veces lo que pagas; 15 × 2.5 = 37.5 bb y el stack efectivo es 100 bb, así que cumples. Además 44 está en el rango de pago del botón contra UTG. Ligas trío o mejor 1 de cada 8.5 veces (11.8 %), y para compensar las demás hace falta mucho dinero detrás. La lección no usa la equity de la app, que es contra manos al azar.
por_opcion:
  Fold: Cumples la regla del 15 y 44 está en el rango de pago: pagar para buscar trío gana dinero a largo plazo.
  Raise: Resubir se reserva para QQ+ y AK; con una pareja pequeña se paga para buscar trío.
```

```caso
id: m05-c06
titulo: Cuando te resuben, el trío ya no sale a cuenta
tipo: matematica
calle: preflop
heroe: BTN
cartas_heroe: 4c 4h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB sube 10
bote_esperado: 13
pregunta: Abres a 2.5 bb en el botón con 4♣ 4♥ y la BB resube a 10 bb. Los dos tienen 100 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 5.4 (M05_L04). Para seguir tendrías que pagar 7.5 bb más. Regla del 15: 15 × 7.5 = 112.5 bb, más que los 100 bb de stack efectivo, así que no cumples. Con una resubida, buscar trío es demasiado caro para lo que hay detrás. La lección usa esta regla y no la equity de la app, que es contra manos al azar.
por_opcion:
  Call: No cumples la regla del 15: no hay dinero suficiente detrás para que ligar un trío compense lo que pagas.
  Raise: Resubir se reserva para las manos más fuertes; con 44 la pregunta es si pagas o te retiras.
```
