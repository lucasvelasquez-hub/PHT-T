# Casos del Módulo 0: cómo se juega una mano

<!-- SUPUESTO: las lecciones usan mesa de $1/$2 y aquí se convierte a 100 bb (1 bb = $2): abrir a $5 = 2.5 bb; apuesta de $6 = 3 bb. El tema del módulo (reglas) casi no se presta a decisiones de estrategia, por eso hay solo 4 casos: dos de cálculo con formato `opciones` (bote y subida mínima) y dos de concepto con `decision` (la ciega grande y el rake). Los decimales llevan punto y las opciones no llevan comas. -->

```caso
id: m00-c01
titulo: Cuenta el bote antes de decidir
tipo: matematica
calle: flop
heroe: BTN
cartas_heroe: Jh Th
mesa: Kd 8s 3c
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB fold
  flop: CO apuesta 3
bote_esperado: 9.5
pregunta: El CO apuesta 3 bb en el flop. ¿Cuánto hay ahora en el bote, contando su apuesta?
formato: opciones
opciones: [6.5 bb, 8 bb, 9.5 bb, 12.5 bb]
correcta: 9.5 bb
explicacion: Lección 0.6 (M00_L06). Se suma lo que puso cada jugador, ciegas incluidas aunque se hayan retirado. Antes del flop hay 2.5 (CO) + 2.5 (BTN) + 0.5 (SB) + 1 (BB) = 6.5 bb, y con la apuesta de 3 bb son 9.5 bb. Si pagas, el bote queda en 12.5 bb.
por_opcion:
  6.5 bb: Es el bote del flop sin contar la apuesta del CO.
  8 bb: Se olvidaron las ciegas; la SB y la BB dejan su dinero en el bote aunque se retiren.
  12.5 bb: Ese sería el bote si ya hubieras pagado, y todavía no lo has hecho.
```

```caso
id: m00-c02
titulo: La subida mínima
tipo: matematica
calle: preflop
heroe: HJ
cartas_heroe: Ah Kc
accion:
  preflop: UTG sube 2.5
bote_esperado: 4
pregunta: UTG sube a 2.5 bb. Si quieres resubir lo mínimo, ¿a cuánto subes?
formato: opciones
opciones: [3.5 bb, 4 bb, 5 bb]
correcta: 4 bb
explicacion: Lección 0.4 (M00_L04). La subida mínima es lo que hay que pagar más el último aumento. UTG subió de 1 a 2.5, un aumento de 1.5 bb, así que el mínimo es 2.5 + 1.5 = 4 bb. La regla simplificada de "el doble de la apuesta" daría 5 bb y falla justo en este caso.
por_opcion:
  3.5 bb: Es menos que el mínimo; el aumento tiene que ser al menos tan grande como el anterior, que fue de 1.5 bb.
  5 bb: Es la regla simplificada del doble, que no vale cuando la apuesta anterior ya fue una subida.
```

```caso
id: m00-c03
titulo: La ciega grande puede pasar
tipo: concepto
calle: preflop
heroe: BB
cartas_heroe: 7h 2c
accion:
  preflop: UTG, HJ, CO, BTN fold; SB paga
bote_esperado: 2
pregunta: Todos se retiran y la SB solo completa la ciega. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Check
explicacion: Lección 0.5 (M00_L05). Cuando nadie sube, la BB ya tiene su ciega en el bote y puede pasar para ver el flop sin poner nada más. Con 7♥ 2♣ no hay motivo para poner más dinero.
por_opcion:
  Bet: Es legal, pero pondrías dinero extra con una de las manos más flojas que hay.
```

```caso
id: m00-c04
titulo: Subir antes del flop evita el rake
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Ad Js
accion:
  preflop: UTG, HJ, CO fold
bote_esperado: 1.5
pregunta: Todos se retiran hasta ti en el botón. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 0.7 (M00_L07). Si subes y todos se retiran, ganas las ciegas sin pagar rake, porque sin flop no hay comisión. Pagar solo la ciega lleva a flops baratos con más jugadores, donde sí se cobra. La idea del curso es preferir subir a solo pagar.
por_opcion:
  Fold: Retirarte regala la oportunidad de ganar las ciegas con una mano que tiene buenas opciones.
  Call: Pagar solo la ciega renuncia a ganar sin pelear y te lleva a un flop barato, donde sí se cobra rake.
```
