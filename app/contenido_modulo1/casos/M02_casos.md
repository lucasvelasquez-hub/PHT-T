# Casos del Módulo 2: qué manos abrir y de cuánto

<!-- SUPUESTO: las lecciones usan mesa de $1/$2 y aquí se convierte a 100 bb (1 bb = $2): abrir a $5 = 2.5 bb; aislar a $8 = 4 bb. No hay casos con el héroe en UTG porque, sin acciones antes que él, el campo `accion` quedaría vacío; el rango de UTG se practica en las preguntas de la evaluación. Con las decisiones Raise la app elige el tamaño; el tamaño que pide la lección va en la explicación y en los casos de tamaño (m02-c05 y m02-c06) se pregunta con `opciones`. Los decimales llevan punto y las opciones no llevan comas. -->

```caso
id: m02-c01
titulo: Un as pequeño del mismo palo en el HJ
tipo: concepto
calle: preflop
heroe: HJ
cartas_heroe: As 3s
accion:
  preflop: UTG fold
bote_esperado: 1.5
pregunta: UTG se retira y te toca en el HJ. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 2.4 (M02_L04). El rango del HJ incluye todos los ases suited (A2s+), porque pueden ligar el color más alto. A3s está dentro: subes a 2.5 bb.
por_opcion:
  Fold: A3s sí está en el rango del HJ; en UTG los ases suited empiezan en ATs, pero una silla más tarde se abre más.
  Call: Pagar solo la ciega es un open limp. La regla de la lección 2.3 es subir o retirarse.
```

```caso
id: m02-c02
titulo: T7 suited en el CO se queda fuera por poco
tipo: concepto
calle: preflop
heroe: CO
cartas_heroe: Tc 7c
accion:
  preflop: UTG, HJ fold
bote_esperado: 1.5
pregunta: Todos se retiran hasta ti en el CO. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 2.5 (M02_L05). El CO abre las tes suited desde T8s, así que T7s queda fuera por poco. La misma mano sí se abre desde el botón, como verás en el caso siguiente: la decisión cambia según la silla.
por_opcion:
  Raise: T7s no está en el rango del CO, que abre las tes suited desde T8s.
  Call: Pagar solo la ciega es un open limp. La regla es subir o retirarse.
```

```caso
id: m02-c03
titulo: La misma mano en el botón sí se abre
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Tc 7c
accion:
  preflop: UTG, HJ, CO fold
bote_esperado: 1.5
pregunta: Todos se retiran hasta ti en el botón con la misma mano del caso anterior. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 2.5 (M02_L05). Desde el botón quedan pocos rivales detrás y juegas con posición, así que el rango es el más amplio de todos: las tes suited se abren desde T6s. T7s está dentro, y subes a 2.5 bb.
por_opcion:
  Fold: Desde el botón T7s sí está en el rango (T6s+). El error típico de principiante en esta silla es jugar demasiado pocas manos.
  Call: Pagar solo la ciega es un open limp. La regla es subir o retirarse.
```

```caso
id: m02-c04
titulo: Una dama débil suited en la ciega pequeña
tipo: concepto
calle: preflop
heroe: SB
cartas_heroe: Qc 4c
accion:
  preflop: UTG, HJ, CO, BTN fold
bote_esperado: 1.5
pregunta: Todos se retiran hasta ti en la SB. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 2.5 (M02_L05). Desde la SB solo tienes un rival, la BB, pero ella tendrá posición sobre ti, así que abres menos que en el botón. Las damas suited empiezan en Q7s: Q4s se abre desde el botón, pero no desde aquí.
por_opcion:
  Raise: Q4s no está en el rango de la SB, que empieza en Q7s para las damas suited.
  Call: Completar la ciega desde la SB tampoco es una opción en este curso: subes o te retiras.
```

```caso
id: m02-c05
titulo: De cuánto abres desde el CO
tipo: concepto
calle: preflop
heroe: CO
cartas_heroe: Qh Th
accion:
  preflop: UTG, HJ fold
bote_esperado: 1.5
pregunta: QTs está en el rango del CO y todos se retiran hasta ti. ¿A cuánto subes?
formato: opciones
opciones: [2 bb, 2.5 bb, 4 bb, 6 bb]
correcta: 2.5 bb
explicacion: Lección 2.6 (M02_L06). La regla del curso es abrir siempre a 2.5 bb desde cualquier silla: un tamaño razonable casi no cambia lo que ganas y usar siempre el mismo no da pistas. Arriesgas 2.5 bb para ganar las ciegas, 1.5 bb: para que el robo gane por sí solo, todos deben retirarse al menos 2.5 ÷ (2.5 + 1.5) = 62.5 % de las veces.
por_opcion:
  2 bb: Un tamaño de 2 a 3 bb es razonable, pero el curso usa siempre 2.5 bb para no complicarte ni dar pistas.
  4 bb: Arriesgas más para ganar lo mismo y necesitas que se retiren más veces; desde el botón, 4 bb pide un 72.7 %.
  6 bb: Es todavía más grande; la regla del curso es 2.5 bb desde cualquier silla.
```

```caso
id: m02-c06
titulo: Aislar a un limper desde el botón
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Ac Td
accion:
  preflop: UTG fold; HJ paga; CO fold
bote_esperado: 2.5
pregunta: El HJ es un fish fit-or-fold que entró pagando la ciega. ATo está en tu rango de botón. ¿De cuánto aíslas?
formato: opciones
opciones: [2.5 bb, 4 bb, 5 bb, 6 bb]
correcta: 4 bb
explicacion: Lección 2.7 (M02_L07). El tamaño del aislamiento es 3 bb + 1 bb por cada limper + 1 bb más si vas a estar fuera de posición. Con un limper y en posición son 3 + 1 = 4 bb.
por_opcion:
  2.5 bb: Es una apertura normal; con un limper ya en el bote conviene subir más para que se retiren los demás.
  5 bb: Suma 1 bb por estar fuera de posición, pero en el botón estás en posición.
  6 bb: Sería el tamaño con dos limpers y fuera de posición; aquí hay un solo limper.
```
