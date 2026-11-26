# Casos del Módulo 4: equity y pot odds

<!-- SUPUESTO: las lecciones usan $ y aquí se convierte a 100 bb (1 bb = $2) con bases nuevas, para que las apuestas den fracciones exactas. En todos los casos el CO abre a 2.5 bb, el BTN y la BB pagan y la SB se retira: bote de 8 bb. En el flop la BB (el héroe) pasa, el CO apuesta y el BTN se retira, así que el héroe actúa dos veces en el flop; la acción está completa hasta que decide. Las manos del héroe están en el rango de defensa de la BB contra el CO de la lección 5.2. Con las decisiones Raise la app elige el tamaño. La app calcula su equity contra manos al azar; cada explicación dice qué cálculo usa la lección (outs × 2 o outs × 4). Los decimales llevan punto y las opciones no llevan comas. -->

```caso
id: m04-c01
titulo: Proyecto de color frente a media apuesta del bote
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: 9h 8h
mesa: Kh 7h 2c
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB paga
  flop: BB check; CO apuesta 4; BTN fold
bote_esperado: 12
pregunta: El CO apuesta 4 bb en un bote de 8 y el BTN se retira. Te falta un corazón para el color. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 4.2 (M04_L02). Pagas 4 para un bote final de 8 + 4 + 4 = 16: 4 ÷ 16 = 25 %, el precio de medio bote. Tu equity con 9 outs es 9 × 2 = 18 % (exacto, 19.1 %). Como 18 % es menor que 25 %, pagar pierde dinero a largo plazo, salvo que esperes ganar mucho más después (lección 4.5). La app mostrará su equity contra manos al azar, que es un número distinto.
por_opcion:
  Call: Necesitas ganar el 25 % de las veces y con el color solo ganas cerca del 18 %.
  Raise: Subir pone más dinero en un bote donde el precio de seguir ya es más alto que tu equity.
```

```caso
id: m04-c02
titulo: El mismo proyecto con un precio barato
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Ts 9s
mesa: As 6s 2d
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB paga
  flop: BB check; CO apuesta 2; BTN fold
bote_esperado: 10
pregunta: El CO apuesta 2 bb en un bote de 8 y el BTN se retira. Tienes cuatro picas entre tus cartas y la mesa. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Lección 4.4 (M04_L04). Pagas 2 para un bote final de 8 + 2 + 2 = 12: 2 ÷ 12 = 16.7 %, el precio de un cuarto del bote. Tu equity con 9 outs es 9 × 2 = 18 %. Como 18 % es mayor que 16.7 %, pagar gana dinero a largo plazo. Con las mismas cartas del caso anterior pero otro precio, la decisión cambia. La app mostrará su equity contra manos al azar.
por_opcion:
  Fold: Con 18 % de equity contra un precio de 16.7 %, retirarte regala dinero.
  Raise: Este módulo compara pagar con retirarse; con este precio pagar ya gana dinero a largo plazo.
```

```caso
id: m04-c03
titulo: Una escalera interna frente a una apuesta del bote
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Jh Th
mesa: Qc 8d 3s
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB paga
  flop: BB check; CO apuesta 8; BTN fold
bote_esperado: 16
pregunta: El CO apuesta 8 bb, el bote completo, y el BTN se retira. Solo te sirve un 9 para la escalera. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 4.4 (M04_L04). Una apuesta del bote cuesta 33 % (8 ÷ 24). Con una escalera interna tienes 4 outs, y 4 × 2 = 8 %. Estás muy lejos del precio, así que te retiras. La app mostrará su equity contra manos al azar, que es mayor; la lección usa outs × 2.
por_opcion:
  Call: Pagarías para ganar el 8 % de las veces cuando necesitas el 33 %.
  Raise: Subir con solo 4 outs y sin pareja pone mucho dinero en un bote donde vas muy por detrás.
```

```caso
id: m04-c04
titulo: Implied odds con una escalera escondida
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: 8c 7c
mesa: Kh 6d 5s
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB paga
  flop: BB check; CO apuesta 6; BTN fold
bote_esperado: 14
pregunta: El CO apuesta 6 bb y tienes una escalera abierta escondida con 16 % de equity (8 outs × 2). ¿Cuánto dinero extra necesitas ganar de media cuando ligas para que pagar valga la pena?
formato: opciones
opciones: [6 bb, 17.5 bb, 20 bb, 37.5 bb]
correcta: 17.5 bb
explicacion: Lección 4.5 (M04_L05). Pagas 6 para un bote final de 8 + 6 + 6 = 20 bb, y el dinero extra es lo que pagas ÷ tu equity − bote final: 6 ÷ 0.16 − 20 = 37.5 − 20 = 17.5 bb. Contra un rival que paga mucho, con unas 90 bb todavía detrás y una escalera que no se ve, ganar 17.5 bb más es realista; contra un nit o con stacks cortos no lo sería. Según las pot odds solas, te retirarías.
por_opcion:
  6 bb: Es solo lo que pagas, no el dinero extra que necesitas ganar.
  20 bb: Es el bote final; hay que restarlo de lo que necesitas recuperar.
  37.5 bb: Es 6 ÷ 0.16, lo que tendrías que ganar en total; falta restar el bote final de 20 bb que ya está en la mesa.
```

```caso
id: m04-c05
titulo: El precio de una apuesta de tres cuartos
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Jd Td
mesa: Qc 9h 2s
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB paga
  flop: BB check; CO apuesta 6; BTN fold
bote_esperado: 14
pregunta: El CO apuesta 6 bb en un bote de 8, es decir, 3/4 del bote. ¿Qué equity necesitas para pagar?
formato: opciones
opciones: [30 %, 43 %, 75 %]
correcta: 30 %
explicacion: Lección 4.3 (M04_L03). Tres cuartos del bote cuestan 30 %. Con la fórmula de la lección 4.2: pagas 6 para un bote final de 8 + 6 + 6 = 20, y 6 ÷ 20 = 30 %. Con tu escalera abierta (8 outs × 2 = 16 %) no te dan las pot odds. La app mostrará su equity contra manos al azar, que es otro número.
por_opcion:
  43 %: Es 6 ÷ (8 + 6): olvidaste sumar tu propio pago al bote final.
  75 %: Es el tamaño de la apuesta como fracción del bote, no el precio de pagarla.
```

```caso
id: m04-c06
titulo: Color y escalera abierta contra media apuesta
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: Kh Qh
mesa: Jh Th 2c
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB paga
  flop: BB check; CO apuesta 4; BTN fold
bote_esperado: 12
pregunta: El CO apuesta 4 bb en un bote de 8 y el BTN se retira. Tienes color y escalera abierta a la vez, 15 outs. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Call
explicacion: Lección 4.4 (M04_L04). Pagas 4 para un bote final de 8 + 4 + 4 = 16: 4 ÷ 16 = 25 %. Tu equity con 15 outs es 15 × 2 = 30 % (exacto, 31.9 %), mayor que el precio, así que pagas. La app mostrará su equity contra manos al azar, que es otro número.
por_opcion:
  Fold: Con 30 % de equity contra un precio de 25 %, retirarte regala dinero.
  Raise: Subir no se estudia en este módulo; con este precio pagar ya gana dinero a largo plazo.
```
