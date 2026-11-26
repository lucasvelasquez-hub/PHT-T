# Casos del Módulo 8: defender, pagar y el river

<!-- SUPUESTO: las lecciones usan mesa de $1/$2 y aquí se convierte a 100 bb (1 bb = $2): abrir a $5 = 2.5 bb; apuesta de $6 = 3 bb. Los botes y apuestas del m08-c01 (river) se rehacen en bb con la misma proporción de medio bote que usa la lección, porque los $100 del ejemplo no caben en una mesa de 100 bb. -->

```caso
id: m08-c01
titulo: Damas en el river contra un fish agresivo
tipo: concepto
calle: river
heroe: BB
cartas_heroe: Qc Qd
mesa: Kh 8h 3c 5d 2s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN apuesta 7; BB paga
  river: BB check; BTN apuesta 13
bote_esperado: 38.5
pregunta: El BTN es un fish agresivo que apostó flop, turn y river. El proyecto de color de corazones no llegó. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Es el ejemplo de la lección 8.1 (M08_L01). Medio bote pide ganar un 25 % de las veces. Un fish agresivo llega con muchos proyectos de corazones que no ligaron y los farolea a menudo, así que basta con que farolee 1 de cada 4 veces. Contra un nit, en cambio, la misma mano se retiraría.
por_opcion:
  Fold: Contra este rival, retirarte regala un pago que tiene precio.
  Raise: Una subida solo la pagan manos mejores que las damas, y los faroles se retiran.
```

```caso
id: m08-c02
titulo: Pareja de sietes en la BB: pagar una vez, con un plan
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: 7h 7d
mesa: Ks 9s 5c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: El BTN hace c-bet con casi todo. Apuesta 3 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Lección 8.2 (M08_L02). El precio es 3 ÷ (5.5 + 3 + 3) = 26 %, y la lección avisa de que esa equity no se cobra entera en el flop porque quedan turn y river. Contra un BTN que apuesta casi con todo, pagar una vez es razonable, pero con un plan: si cae una pica, un A, una Q, una J o una T y vuelve a apostar, te retiras. La app mostrará su equity contra manos al azar, que es otro número.
por_opcion:
  Fold: Contra un rival que apuesta con casi todo, retirarte ya regala demasiado.
  Raise: La lección propone pagar una vez con un plan, no subir con una pareja media.
```

```caso
id: m08-c03
titulo: Segunda pareja y un turn que completa el color
tipo: concepto
calle: turn
heroe: BB
cartas_heroe: 9h 8h
mesa: Ks 9s 4d 2s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN apuesta 8
bote_esperado: 19.5
pregunta: Pagaste el flop con segunda pareja. En el turn cae una pica que completa un proyecto obvio y el BTN apuesta 8 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 8.2 (M08_L02). Esta era una de tus cartas malas. Con segunda pareja y un rival que apuesta fuerte después de completarse un proyecto, lo normal es retirarte, porque parte de tu equity en papel era equity fantasma que no se cobra.
por_opcion:
  Call: Pagar con segunda pareja ante una carta mala y una apuesta fuerte suele pagar de más por una equity que no vas a cobrar.
  Raise: Subir con segunda pareja convertiría tu mano en un farol contra un rival que ya completó su proyecto.
```

```caso
id: m08-c04
titulo: Escalera abierta escondida en la BB
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Js Ts
mesa: 9c 8d 3h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3
bote_esperado: 8.5
pregunta: El BTN apuesta 3 bb. Tienes escalera abierta y stacks de 100 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Lección 8.3 (M08_L03). El precio es 3 ÷ (5.5 + 3 + 3) = 26 % y tu escalera abierta da 8 outs, 8 × 2 = 16 % para el turn. Por pot odds no llega, pero tu proyecto está escondido, tienes dos sobrecartas y los stacks son de 100 bb, así que las implied odds compensan: pagas y persigues. La app mostrará su equity contra manos al azar, que no es la cuenta de outs de la lección.
por_opcion:
  Fold: Ignoras las implied odds: un J-T en la BB no lo espera nadie.
  Raise: La lección propone pagar y perseguir con este proyecto; subir con proyectos es otro tema.
```

```caso
id: m08-c05
titulo: Donk bet mínima: haz lo mismo que si te hubiera pasado
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: As Kd
mesa: Qh 7c 4s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB apuesta 1
bote_esperado: 6.5
pregunta: La BB, un fish, hace una donk bet de solo 1 bb. No tienes pareja. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Regla de la donk mínima, lección 8.4 (M08_L04). En este flop seco habrías hecho c-bet con A-K, así que ante una donk de 1 bb haces lo mismo que habrías hecho si te hubiera pasado: subes con lo que habrías apostado y pagas con lo que habrías pasado.
por_opcion:
  Fold: Una apuesta de 1 bb casi no cuesta nada, y habrías apostado esta mano si te hubieran pasado.
  Call: Pagas con las manos con las que habrías pasado; esta es una mano con la que habrías apostado.
```

```caso
id: m08-c06
titulo: Donk bet de un fish: sube por valor con top pair
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: Ks Qs
mesa: Qh 7c 4s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB apuesta 4
bote_esperado: 9.5
pregunta: La BB, un fish, apuesta 4 bb antes de que puedas hacer c-bet. Tienes top pair con buen kicker. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 8.4 (M08_L04). Una donk bet de un fish suele venir de manos medias, como damas peores, sietes, cuatros y proyectos de escalera, y te pagarán una subida con muchas manos peores. La lección propone subir por valor, a unos 12 bb.
por_opcion:
  Fold: Tienes top pair con buen kicker contra un rango de manos medias.
  Call: Pagar deja de cobrar de manos medias que sí pagarían una subida.
```
