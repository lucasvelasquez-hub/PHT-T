# Casos del Módulo 9: faroles y semifaroles

<!-- SUPUESTO: las lecciones usan mesa de $1/$2 y aquí se convierte a 100 bb (1 bb = $2): abrir a $5 = 2.5 bb; c-bet de $6 = 3 bb. En el m09-c01 el farol de medio bote son unos 6 bb sobre 11.5 bb de bote (34 %), cerca del 33 % que da la tabla de la lección. Con las decisiones Bet/Raise la app elige el tamaño; el tamaño que propone la lección va en la explicación. -->

```caso
id: m09-c01
titulo: Farol de medio bote contra un nit que mostró debilidad
tipo: matematica
calle: river
heroe: BTN
cartas_heroe: Ah 5h
mesa: 9h 6h 2c Kd 3s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN check
  river: BB check
bote_esperado: 11.5
pregunta: La BB es un nit que pagó el flop y pasó en el turn y en el river. Tu proyecto de color no llegó. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 9.1 (M09_L01). Un farol necesita retiradas = apuesta ÷ (bote + apuesta). Con medio bote, unos 6 bb, son 6 ÷ (11.5 + 6) = 34 %, cerca del 33 % de la tabla. Un nit que mostró debilidad se retira probablemente más de 1 de cada 3 veces. La app mostrará su equity contra manos al azar, pero aquí la mano gana solo si el rival se retira, así que lo que decide es la frecuencia de retiradas.
por_opcion:
  Check: Medio bote solo pide que se retire 1 de cada 3 veces, y este rival ya mostró debilidad.
```

```caso
id: m09-c02
titulo: Semifarol con color y escalera abierta
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: Jh Th
mesa: 9h 8c 2h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check
bote_esperado: 5.5
pregunta: Tienes color y escalera abierta: 15 outs. La BB pasa. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 9.2 (M09_L02). Un semifarol gana de dos formas: el rival se retira y te llevas el bote ahora, o te paga y ligas después. Pasar renuncia a la primera, y si ligas con el bote pequeño cobrarás menos. La lección propone apostar 2/3, unos 3.5 bb.
por_opcion:
  Check: Ves el turn gratis, pero nunca ganas el bote ahora, y si ligas el color cobras menos.
```

```caso
id: m09-c03
titulo: Segundo tiro cuando el turn te da color
tipo: concepto
calle: turn
heroe: BTN
cartas_heroe: Kh Jh
mesa: Qh 9c 4s 2h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check
bote_esperado: 11.5
pregunta: Hiciste c-bet y la BB pagó. En el turn cae el 2 de corazones y la BB pasa. Tienes color más escalera interna: 12 outs. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 9.3 (M09_L03). La carta del turn te da equity: 12 outs, 12 × 2 = 24 % de ligar en el river. Si la BB pagó con una pareja media, una segunda apuesta puede hacerla retirarse. La lección propone un segundo tiro de unos 7.5 bb, dos tercios del bote, con dos formas de ganar.
por_opcion:
  Check: Pierdes la posibilidad de que se retire con su pareja media, y tu mano mejoró mucho en este turn.
```

```caso
id: m09-c04
titulo: Contra un station no hay faroles
tipo: concepto
calle: turn
heroe: BTN
cartas_heroe: Ac 5c
mesa: Js 8d 4c Kh
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check
bote_esperado: 11.5
pregunta: La BB es un station que pagó tu c-bet. No tienes pareja ni proyecto. El K asusta a muchos rivales. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Check
explicacion: Lección 9.4 (M09_L04). Un station paga con cualquier pareja y con casi cualquier cosa, y un farol de medio bote necesita que se retire un 33 %. La carta que asusta a muchos rivales no lo asusta a él. Contra un station la lección propone jugar solo por valor: sin mano, pasas y te rindes.
por_opcion:
  Bet: Es un farol contra el rival que menos se retira; cada farol fallido es dinero regalado.
```

```caso
id: m09-c05
titulo: C-bet retrasada tras dos checks del rival
tipo: concepto
calle: turn
heroe: BTN
cartas_heroe: Qc Jc
mesa: 9h 8h 6s 2d
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN check
  turn: BB check
bote_esperado: 5.5
pregunta: En el flop, una mesa muy mojada, los dos pasaron. Ahora la BB, un reg, vuelve a pasar. Tienes escalera interna y dos sobrecartas. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 9.5 (M09_L05). Si tu rival pasa dos veces, su rango queda limitado a manos débiles y medias. La c-bet no te convenía en el flop, pero su segundo check te dice que no conectó tanto. La lección propone una c-bet retrasada de unos 3.5 bb, 2/3 del bote. Si te paga, aún tienes tu escalera interna.
por_opcion:
  Check: Dejas pasar un spot en el que su rango está limitado y puedes ganar el bote sin mejorar.
```

```caso
id: m09-c06
titulo: Flop seco que te favorece: c-bet directa
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: As 3s
mesa: Kh 7c 2d
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check
bote_esperado: 5.5
pregunta: La BB pasa. El flop es muy seco y te favorece. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 9.5 (M09_L05). La c-bet retrasada es para cuando el flop no te convenía. Aquí el flop es muy seco y te favorece, así que lo normal es hacer la c-bet ya en el flop, pequeña, en lugar de esperar al turn.
por_opcion:
  Check: Esperar al turn solo tiene sentido cuando el flop no te convenía; este te favorece.
```
