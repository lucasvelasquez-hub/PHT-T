# Casos del Módulo 1: tu lugar en la mesa

<!-- SUPUESTO: todos los casos usan 100 bb para todos. Las lecciones 1.2 (stack efectivo), 1.4 (varianza) y 1.5 (banca) no se prestan a la mesa de 100 bb y no tienen caso. Las posiciones se escriben BTN (la lección dice BU), como en la app. El perfil del rival se cuenta en el texto de `pregunta`, porque el formato del caso no tiene un campo para eso. Los decimales llevan punto y las opciones no llevan comas. -->

```caso
id: m01-c01
titulo: Quién habla último después del flop
tipo: concepto
calle: flop
heroe: CO
cartas_heroe: Ah Qs
mesa: 9c 5d 2h
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB fold
bote_esperado: 6.5
pregunta: Subiste desde el CO y solo pagó el BTN. En el flop, el turn y el river, ¿quién habla último?
formato: opciones
opciones: [El BTN porque está en posición, Tú en el CO porque subiste antes del flop, Quien tenga la mejor mano]
correcta: El BTN porque está en posición
explicacion: Lección 1.1 (M01_L01). Después del flop habla primero el CO y el BTN actúa último, así que el BTN está en posición. Hablar después es una ventaja enorme: ve lo que hace el CO antes de decidir, y el CO nunca tiene esa información.
por_opcion:
  Tú en el CO porque subiste antes del flop: Haber subido no cambia el orden; después del flop se habla en orden desde la izquierda del botón.
  Quien tenga la mejor mano: El orden de hablar depende de la silla, no de las cartas.
```

```caso
id: m01-c02
titulo: Ases contra un all-in
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Ah As
accion:
  preflop: UTG, HJ fold; CO all-in
bote_esperado: 101.5
pregunta: El CO mete todo, 100 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call]
correcta: Call
explicacion: Lección 1.3 (M01_L03). Una decisión se juzga por su EV y no por el resultado. En el ejemplo de la lección, los ases ganan alrededor del 82 % de las veces contra K♣ K♦, así que pagar gana dinero de media aunque esta vez puedas perder. La app mostrará su propia equity contra manos al azar, que es un número distinto.
por_opcion:
  Fold: Retirarte con la mejor mano de salida por miedo a perder una vez deja ir una decisión de EV muy positivo.
```

```caso
id: m01-c03
titulo: Un fish fit-or-fold entra con limp
tipo: concepto
calle: preflop
heroe: HJ
cartas_heroe: 8h 8d
accion:
  preflop: UTG paga
bote_esperado: 2.5
pregunta: UTG es un fish fit-or-fold: entra en muchísimas manos pagando la ciega y se retira casi siempre cuando no liga el flop. Entró pagando. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Raise
explicacion: Lección 1.6 (M01_L06). Contra un fish fit-or-fold el plan es "infla el bote y llévatelo": subir contra sus limps y apostar el flop, porque se retira casi siempre cuando no liga. En el Módulo 2 verás de cuánto subir.
por_opcion:
  Fold: Una pareja contra un rival débil es una buena mano para jugar; retirarte regala la oportunidad.
  Call: Entrar tú también solo pagando no presiona a un rival que se retira cuando no liga, ni infla el bote.
```

```caso
id: m01-c04
titulo: No le faroles al station
tipo: concepto
calle: flop
heroe: BTN
cartas_heroe: 8d 7d
mesa: Ks 2h 3c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check
bote_esperado: 5.5
pregunta: La BB es un fish station: odia retirarse y paga con casi cualquier cosa hasta el final. Tú no tienes nada. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Check
explicacion: Lección 1.6 (M01_L06). El error más caro del principiante es farolear al station: si alguien paga siempre, el farol solo le regala dinero. Con una buena mano sí apostarías, y grande, porque te pagará.
por_opcion:
  Bet: Un farol solo gana si el rival se retira, y este rival casi nunca se retira.
```

```caso
id: m01-c05
titulo: Un nit sube desde UTG
tipo: concepto
calle: preflop
heroe: BTN
cartas_heroe: Ac Jd
accion:
  preflop: UTG sube 2.5; HJ, CO fold
bote_esperado: 4
pregunta: UTG es un nit: juega muy pocas manos y cuando sube casi siempre tiene algo bueno. ¿Qué haces con A♣ J♦?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 1.6 (M01_L06). El rango de un nit que sube desde UTG es muy fuerte (parejas altas, AK, AQ) y tu AJ estará a menudo por detrás. Con un nit, retirarte con manos medias es lo normal. En el Módulo 5 lo verás en detalle.
por_opcion:
  Call: Pagar con una mano que a menudo va por detrás de su rango te cuesta dinero.
  Raise: Resubir pone más dinero en un bote donde vas por detrás de un rango fuerte.
```
