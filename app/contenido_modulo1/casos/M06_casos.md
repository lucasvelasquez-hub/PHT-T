# Casos del Módulo 6: la apuesta de continuación

<!-- SUPUESTO: las lecciones usan $ y aquí se convierte a 100 bb (1 bb = $2): abrir a $5 = 2.5 bb. Para que medio bote y 2/3 del bote den cantidades exactas, en los casos 1 a 5 el BTN abre a 2.5 bb, solo paga la SB (la BB se retira) y el bote del flop es de 6 bb; la SB actúa primero y pasa. El perfil del rival se cuenta en el texto de `pregunta`, porque el formato del caso no tiene un campo para eso. Con las decisiones Bet la app elige el tamaño; el tamaño que pide la lección va en la explicación, y m06-c05 lo pregunta con `opciones`. Los decimales llevan punto y las opciones no llevan comas. -->

```caso
id: m06-c01
titulo: C-bet en un flop seco con un as
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: Ah 5h
mesa: Ks 7d 2c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB paga; BB fold
  flop: SB check
bote_esperado: 6
pregunta: Subiste desde el botón y la SB, un reg, pagó. El flop es muy seco y la SB pasa. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 6.3 (M06_L03). Respondes las tres preguntas: el flop es muy seco y hay un solo rival, así que se retirará a menudo; si te paga, tienes un as y un proyecto backdoor de escalera (3 y 4); y con as alto casi nunca ganas sin apostar. La lección propone medio bote en un flop seco: 3 bb.
por_opcion:
  Check: Pasar regala la oportunidad de ganar el bote ahora; con as alto casi nunca ganas sin apostar.
```

```caso
id: m06-c02
titulo: Sin mano y contra un station
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: 7d 6d
mesa: Qs Jh Ts
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB paga; BB fold
  flop: SB check
bote_esperado: 6
pregunta: Subiste desde el botón y la SB, un station, pagó. El flop está lleno de cartas altas y de escaleras posibles, y no tienes pareja ni proyecto. La SB pasa. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Check
explicacion: Lección 6.1 (M06_L01). Una c-bet sin mano es un pequeño farol y solo gana si el rival se retira lo bastante a menudo. Aquí el flop conecta mucho con el rango de quien paga y un station casi nunca se retira. Pasas y, si apuesta, te retiras: ya perdiste lo que pusiste antes del flop, pero no tiras más.
por_opcion:
  Bet: Apostar sin mano ni proyecto contra un rival que no se retira y en un flop que conecta con su rango tira dinero.
```

```caso
id: m06-c03
titulo: Una pareja pequeña en un flop de ases y reyes
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: 6s 6c
mesa: Ad Kh 9c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB paga; BB fold
  flop: SB check
bote_esperado: 6
pregunta: Subiste desde el botón y la SB, un reg, pagó. El flop es A♦ K♥ 9♣ y la SB pasa. ¿Qué haces con 6♠ 6♣?
formato: decision
opciones: [Check, Bet]
correcta: Check
explicacion: Lección 6.3 (M06_L03). El flop es alto, pero un reg defiende muchos ases y reyes, así que ligó a menudo. Si te paga, solo te salvan los dos seises que quedan. Y tu pareja a veces gana sin apostar, si la SB tiene algo como QJ o T8. Apostar convertiría tus seises en un farol.
por_opcion:
  Bet: Apostar convertiría tus seises en un farol: solo se retirarían las manos que ya ganas.
```

```caso
id: m06-c04
titulo: Dos sobrecartas contra un rival que se retira
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: Kc Qc
mesa: 7h 4d 2s
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB paga; BB fold
  flop: SB check
bote_esperado: 6
pregunta: Subiste desde el botón y la SB, un fish fit-or-fold que se retira mucho cuando no liga, pagó. El flop es muy seco y la SB pasa. ¿Qué haces con K♣ Q♣?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 6.3 (M06_L03). Un flop muy seco y un rival que se retira mucho hacen probable que se retire. Si te paga, tienes dos sobrecartas para seguir. Es la c-bet clara: la lección propone medio bote en un flop seco, 3 bb.
por_opcion:
  Check: Contra un rival que se retira mucho en un flop seco, pasar regala el bote.
```

```caso
id: m06-c05
titulo: El tamaño de la c-bet en un flop mojado
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: As Js
mesa: Jh Th 5c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB paga; BB fold
  flop: SB check
bote_esperado: 6
pregunta: Subiste desde el botón y la SB pagó. Tienes pareja de jotas con as en un flop con proyectos de color y de escalera. La SB pasa y decides apostar. ¿De cuánto?
formato: opciones
opciones: [1.5 bb (1/4 del bote), 3 bb (1/2 del bote), 4 bb (2/3 del bote), 6 bb (el bote completo)]
correcta: 4 bb (2/3 del bote)
explicacion: Lección 6.4 (M06_L04). La regla del curso es medio bote en flops secos y 2/3 del bote en flops mojados. Este flop tiene proyectos de color y de escalera, y no quieres darles un precio barato para ligar. En un bote de 6 bb, 2/3 son 4 bb.
por_opcion:
  1.5 bb (1/4 del bote): Es demasiado pequeña: les da un buen precio para seguir y ligar.
  3 bb (1/2 del bote): Medio bote es el tamaño de los flops secos; este está mojado y les daría un precio barato.
  6 bb (el bote completo): Arriesga más de lo que propone la regla del curso para un flop mojado, que es 2/3 del bote.
```

```caso
id: m06-c06
titulo: Con tres jugadores en el bote
tipo: concepto
calle: flop
heroe: CO
cartas_heroe: Qc Tc
mesa: Kd 9s 8s
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB paga
  flop: BB check
bote_esperado: 8
pregunta: Abriste desde el CO y pagaron el BTN y la BB. El flop está mojado, tienes una escalera interna (solo la J) y la BB pasa. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Check
explicacion: Lección 6.5 (M06_L05). Para que una c-bet gane el bote tienen que retirarse todos, y las probabilidades se multiplican: aunque cada rival se retirara un 60 % de las veces, que se retiren los dos a la vez ocurre solo un 36 % (0.6 × 0.6). Con dos rivales y poco más que una escalera interna, pasas.
por_opcion:
  Bet: Con dos rivales en un flop mojado, alguno habrá ligado algo, y con solo una escalera interna la apuesta falla casi siempre.
```
