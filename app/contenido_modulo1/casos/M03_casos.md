# Casos del Módulo 3: cuenta tus outs

<!-- SUPUESTO: este módulo enseña a contar outs y a estimar con la regla del 2 y del 4, y todavía no enseña pot odds (llegan en el Módulo 4). Por eso los 6 casos usan `formato: opciones` y piden contar o estimar, sin decidir si se paga. En todos, el BTN abre a 2.5 bb, la BB paga y el BTN apuesta 3 bb en el flop (bote de 5.5 + 3 = 8.5 bb); la BB actúa primero en el flop y por eso pasa antes. La app calcula su equity contra manos al azar, que no es lo mismo que contar outs; cada explicación dice qué cálculo usa la lección. Los decimales llevan punto y las opciones no llevan comas. -->

```caso
id: m03-c01
titulo: Cuenta los outs de un proyecto de color
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Ac 5c
mesa: Kc 9c 3d
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: Tienes cuatro tréboles entre tus cartas y la mesa. ¿Cuántos outs tienes para completar el color?
formato: opciones
opciones: [9 outs, 11 outs, 13 outs]
correcta: 9 outs
explicacion: Lección 3.1 (M03_L01). Hay 13 tréboles en total y ves cuatro (A♣ 5♣ K♣ 9♣): 13 − 4 = 9 outs. La app mostrará su equity contra manos al azar, que es un número distinto; la lección cuenta outs.
por_opcion:
  11 outs: Solo restaste dos tréboles; también hay que restar los que están en la mesa.
  13 outs: Son todos los tréboles de la baraja; hay que restar los cuatro que ya ves.
```

```caso
id: m03-c02
titulo: Una escalera abierta
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Jd Td
mesa: Qc 9h 2s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: Tienes Q-J-T-9 con cuatro cartas seguidas. ¿Cuántos outs tienes para completar la escalera?
formato: opciones
opciones: [4 outs, 6 outs, 8 outs]
correcta: 8 outs
explicacion: Lección 3.2 (M03_L02). Te vale un K (K-Q-J-T-9) o un 8 (Q-J-T-9-8): 4 + 4 = 8 outs, el número de una escalera abierta. La app mostrará su equity contra manos al azar; la lección cuenta outs.
por_opcion:
  4 outs: Eso sería una escalera interna, con un solo hueco; aquí te valen cartas por los dos extremos.
  6 outs: Son los outs de dos sobrecartas, no de esta escalera.
```

```caso
id: m03-c03
titulo: Color y escalera abierta a la vez
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Jh Th
mesa: 9h 8c 2h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: Tienes cuatro corazones y además J-T-9-8. ¿Cuántos outs tienes en total?
formato: opciones
opciones: [9 outs, 15 outs, 17 outs]
correcta: 15 outs
explicacion: Lección 3.2 (M03_L02). Color: 9 corazones. Escalera abierta (Q o 7): 8 cartas. La Q♥ y el 7♥ valen para los dos proyectos y no se cuentan dos veces: 9 + 8 − 2 = 15 outs. Con la regla del 2, una carta da 30 %, y la lección da 31.9 % como valor exacto; la app mostrará su propia equity contra manos al azar.
por_opcion:
  9 outs: Es solo el color; olvidas la escalera abierta.
  17 outs: Sumaste 9 + 8 sin descontar las dos cartas que completan los dos proyectos.
```

```caso
id: m03-c04
titulo: Outs sucios en un flop con dos corazones
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Js Td
mesa: 9h 8h 2c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: Tienes escalera abierta, pero la mesa tiene dos corazones y el BTN podría tener dos corazones en la mano. ¿Cuántos outs limpios cuentas?
formato: opciones
opciones: [4 outs, 6 outs, 8 outs]
correcta: 6 outs
explicacion: Lección 3.4 (M03_L04). La escalera abierta tiene 8 outs (Q o 7), pero la Q♥ y el 7♥ ponen tres corazones en la mesa: si el rival tiene dos corazones, completa el color y te gana. Son outs sucios y se descuentan: 8 − 2 = 6 outs limpios. Con la regla del 2, una carta da 12 % en lugar de 16 %.
por_opcion:
  8 outs: Es la cuenta sin descontar; la Q♥ y el 7♥ completan tu escalera pero también pueden darle el color al rival.
  4 outs: Descontaste de más; solo dos de las ocho cartas son sucias.
```

```caso
id: m03-c05
titulo: La regla del 2 cuando el rival puede volver a apostar
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: 9h 8h
mesa: Kh 4h 2c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: Tienes 9 outs de color y pagas. El BTN puede volver a apostar en el turn. ¿Qué probabilidad aproximada tienes de ligar el color en el turn?
formato: opciones
opciones: [9 %, 18 %, 36 %]
correcta: 18 %
explicacion: Lección 3.3 (M03_L03). Si el rival puede volver a apostar, solo tienes asegurada una carta, así que se multiplica por 2: 9 × 2 = 18 %. El valor exacto que da la lección es 19.1 %. La app mostrará su equity contra manos al azar, que es otro número.
por_opcion:
  9 %: Es la cantidad de outs, no la probabilidad; cada out vale cerca de un 2 %.
  36 %: Es 9 × 4, que solo vale si verás las dos cartas sin pagar más, es decir, con todo el dinero dentro en el flop.
```

```caso
id: m03-c06
titulo: Una escalera interna
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Qc Tc
mesa: Kd 9s 8s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: Con tus dos cartas y la mesa tienes K, Q, T, 9 y 8: te falta una J en el medio. ¿Cuántos outs tienes para la escalera?
formato: opciones
opciones: [4 outs, 8 outs, 9 outs]
correcta: 4 outs
explicacion: Lección 3.2 (M03_L02). Solo te vale una J, que completa K-Q-J-T-9 o Q-J-T-9-8, y quedan cuatro: son 4 outs, el número de una escalera interna. La app mostrará su equity contra manos al azar; la lección cuenta outs.
por_opcion:
  8 outs: Eso sería una escalera abierta, con cartas válidas por los dos extremos.
  9 outs: Son los outs de un color, no de esta escalera.
```
