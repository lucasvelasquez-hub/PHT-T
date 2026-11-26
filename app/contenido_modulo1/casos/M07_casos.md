# Casos del Módulo 7: valor y construcción del bote

<!-- SUPUESTO: las lecciones usan mesa de $1/$2 y aquí se convierte a 100 bb (1 bb = $2): abrir a $5 = 2.5 bb; apuesta de $7 = 3.5 bb. Con las decisiones Bet/Raise la app elige el tamaño; el tamaño que propone la lección va en la explicación. -->

```caso
id: m07-c01
titulo: Rey con dama en un flop seco: ¿te pagan manos peores?
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: Ks Qh
mesa: Kd 9s 4c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check
bote_esperado: 5.5
pregunta: La BB pasa. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Es la pregunta de oro de la lección 7.2 (M07_L02). Contra lo que defiende la BB pagan manos peores que la tuya, como reyes con peor kicker, nueves y parejas pequeñas, así que apuestas por valor. La lección propone un tamaño cercano a medio bote, unos 3 bb.
por_opcion:
  Check: Pasar renuncia a cobrar de manos peores que sí habrían pagado.
```

```caso
id: m07-c02
titulo: Pareja de reyes frente a una apuesta fuerte en el river
tipo: concepto
calle: river
heroe: BTN
cartas_heroe: Ks Qc
mesa: Kd 9s 4c 8h 7h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN apuesta 7; BB paga
  river: BB apuesta 18
bote_esperado: 43.5
pregunta: La BB pagó flop y turn, y ahora apuesta 18 bb. Estás pensando en subir. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: [Fold, Call]
explicacion: La lección 7.2 (M07_L02) plantea este mismo final de mano. Si subes, ¿te pagaría una mano peor? Casi ninguna. Con esta mesa pagarían escaleras como J-T o 6-5 y dobles parejas, que te ganan, y las peores se retirarían. La lección solo responde que no se sube; entre pagar y retirarse depende de cuánto creas que puede farolear.
por_opcion:
  Raise: Solo te pagarían manos que te ganan, y las peores se retirarían; la subida solo pierde.
```

```caso
id: m07-c03
titulo: Trío de sietes: apuesta el flop
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: 7s 7h
mesa: Kc 7d 3s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check
bote_esperado: 5.5
pregunta: La BB es un station y pasa. Tienes trío. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 7.3 (M07_L03). El bote crece multiplicándose: la lección compara apostar 2/3 en las tres calles contra pasar el flop, y saltarte una sola apuesta deja el bote final en menos de la mitad. Contra un station no hay nada que esconder, porque pagaba igual. Un tamaño de 2/3 son unos 3.5 bb.
por_opcion:
  Check: Pasar el flop pierde un crecimiento del bote que no se recupera después, y el station no necesitaba que lo engañaran.
```

```caso
id: m07-c04
titulo: Full house de ases contra un rival muy agresivo
tipo: concepto
calle: flop
heroe: BB
cartas_heroe: As Ad
mesa: Ac 8d 8h
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN, SB fold; BB sube 10; CO paga
bote_esperado: 20.5
pregunta: Fuera de posición, contra un CO muy agresivo que apuesta casi siempre que le pasan. Tienes full. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Check
explicacion: Es uno de los casos raros de slowplay de la lección 7.3 (M07_L03). Tu mano es casi imposible de superar, el CO casi nunca tendrá algo con lo que pagar una apuesta, y siendo agresivo apostará por ti si pasas. Fuera de esos casos, la regla del curso es apostar.
por_opcion:
  Bet: Contra este rival la apuesta casi no encuentra pagos; pasar le deja apostar a él.
```

```caso
id: m07-c05
titulo: Contra un station, apuesta más grande
tipo: concepto
calle: turn
heroe: BTN
cartas_heroe: Ah Jd
mesa: Jh 8d 2s 5c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3.5; BB paga
  turn: BB check
bote_esperado: 12.5
pregunta: La BB es un station: paga casi igual sea cual sea el tamaño. Tienes pareja de jotas con as. ¿De cuánto apuestas?
formato: opciones
opciones: [Unos 4 bb un tercio del bote, Unos 8.5 bb dos tercios del bote, Unos 11 bb casi el bote]
correcta: Unos 11 bb casi el bote
explicacion: Lección 7.4 (M07_L04). Un rival inelástico paga casi igual con cualquier tamaño, así que apuestas más grande por valor. Con el bote en 12.5 bb, la lección propone casi el bote, unos 11 bb, en lugar de 2/3, unos 8.5 bb. Además, el bote del river será mayor.
por_opcion:
  Unos 4 bb un tercio del bote: Regalas dinero: el station te paga lo mismo con una apuesta más grande.
  Unos 8.5 bb dos tercios del bote: Es tu tamaño habitual, pero contra un rival inelástico puedes ganar más.
```

```caso
id: m07-c06
titulo: Valor fino con rey y diez en el river
tipo: concepto
calle: river
heroe: BTN
cartas_heroe: Ks Ts
mesa: Kd 8c 6h 3s 2d
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN check
  river: BB check
bote_esperado: 11.5
pregunta: La BB es un station que pasó en el turn y en el river. Tienes pareja de reyes con kicker medio. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Es valor fino, lección 7.5 (M07_L05). Estás en posición, el rival mostró debilidad y un station paga con reyes peores, ochos, seises y parejas bajas. La lección sugiere una apuesta pequeña, cerca de un tercio del bote, unos 4 bb. Contra un reg agresivo que sube mucho en el river, en cambio, pasar sería razonable.
por_opcion:
  Check: Dejas de cobrar de manos peores que sí pagarían contra este rival.
```
