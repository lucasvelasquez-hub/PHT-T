# Casos del Módulo 12 (opcional): combos, rangos y explotar

<!-- SUPUESTO: este módulo es teórico. "Equilibrio" es el concepto del libro (Brokos, Acevedo) que explica la lección; la app no calcula equilibrios y la lectura de la red sigue siendo "lo que harían jugadores de élite". -->
<!-- SUPUESTO: m12-c01, m12-c02 y m12-c03 usan formato opciones, porque lo que se evalúa es una idea (combos, tipo de mano, frecuencia de defensa) y no una acción de la mesa. -->
<!-- SUPUESTO: las lecciones usan $ y aquí todo va en bb sobre 100 bb. Los botes y apuestas se rehacen con la misma proporción que usa la lección (por ejemplo, apuesta del bote en el river). -->

```caso
id: m12-c01
titulo: Contar combos de AA con un as en tu mano
tipo: matematica
calle: flop
heroe: BB
cartas_heroe: As Qh
mesa: Ah Kc 7d
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN, SB fold; BB paga
  flop: BB check; CO apuesta 3.5
bote_esperado: 9
pregunta: El CO apuesta 3.5 bb. ¿Cuántos combos de AA puede tener?
formato: opciones
opciones: [1 combo, 3 combos, 6 combos]
correcta: 1 combo
explicacion: Lección 12.1 (M12_L01). Una pareja tiene 6 combos y cada carta de ese valor que ves quita 3, luego 2, luego 1. Ves dos ases, el tuyo y el de la mesa, así que de AA queda 1 combo. De KK quedan 3 y de AK, 2 ases × 3 reyes = 6. Tu A♠ bloquea muchas de sus mejores manos.
por_opcion:
  3 combos: Eso sería con un solo as a la vista; aquí ves dos, el tuyo y el de la mesa.
  6 combos: Eso sería sin ver ningún as; tus cartas y la mesa eliminan combos del rival.
```

```caso
id: m12-c02
titulo: Damas como bluff-catcher frente a un rival polarizado
tipo: concepto
calle: river
heroe: BB
cartas_heroe: Qs Qd
mesa: Ks 9s 4c 2h 7d
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN apuesta 7; BB paga
  river: BB check; BTN apuesta 18
bote_esperado: 43.5
pregunta: El BTN apostó todas las calles y el proyecto de color de picas no llegó. Su rango es polarizado. ¿Qué tipo de mano son tus damas aquí?
formato: opciones
opciones: [Un bluff-catcher porque gana a los faroles y pierde contra el valor, Una mano de valor porque gana a casi todo lo que apuesta, Un farol porque no puede ganar si le pagan]
correcta: Un bluff-catcher porque gana a los faroles y pierde contra el valor
explicacion: Lección 12.2 (M12_L02). Frente a un rango polarizado, con manos muy fuertes o proyectos fallidos, tus damas ganan a todos sus faroles y pierden contra todo su valor: son un bluff-catcher. La pregunta no es si tienes buena mano, sino la del Módulo 8, si farolea lo suficiente para que te compense pagar.
por_opcion:
  Una mano de valor porque gana a casi todo lo que apuesta: Contra un rango polarizado solo ganas a sus faroles; su valor te gana.
  Un farol porque no puede ganar si le pagan: Tus damas sí ganan cuando él farolea.
```

```caso
id: m12-c03
titulo: Cuánto defender ante una apuesta del bote
tipo: matematica
calle: river
heroe: BB
cartas_heroe: Js Jd
mesa: Kc 8h 3s 6d 2h
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN apuesta 7; BB paga
  river: BB check; BTN apuesta 25.5
bote_esperado: 51
pregunta: El BTN apuesta el bote entero en el river, 25.5 bb sobre 25.5 bb. Para que sus faroles no ganen dinero solos, ¿qué parte de tu rango deberías defender?
formato: opciones
opciones: [Un 50 % de mi rango, Un 33 % de mi rango, Un 67 % de mi rango]
correcta: Un 50 % de mi rango
explicacion: Lección 12.3 (M12_L03). La frecuencia mínima de defensa es MDF = bote ÷ (bote + apuesta) = 25.5 ÷ 51 = 50 %. El 33 % es el precio que pagas, no la parte del rango que defiendes, y el 67 % sería contra medio bote. La lección avisa de que estas fórmulas son exactas solo en el river. La app mostrará su equity contra manos al azar, que no es esta cuenta.
por_opcion:
  Un 33 % de mi rango: Ese es el precio que pagas, 25.5 ÷ 76.5, no la parte de tu rango que defiendes.
  Un 67 % de mi rango: Eso sería contra una apuesta de medio bote, no del bote entero.
```

```caso
id: m12-c04
titulo: Contra un nit que nunca farolea, retírate
tipo: concepto
calle: river
heroe: BB
cartas_heroe: Kh Jd
mesa: Kd 8c 4s 9h 2c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN check
  river: BB check; BTN apuesta 11.5
bote_esperado: 23
pregunta: El BTN es un nit al que has visto durante horas sin farolear nunca en el river. Apuesta el bote entero, 11.5 bb. Tienes un bluff-catcher. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: Fold
explicacion: Lección 12.4 (M12_L04), con sus cuatro pasos. Imaginas el equilibrio, en el que con una apuesta del bote hay 1 farol por cada 2 de valor y pagarías cerca de la mitad de tus manos. Tu lectura es firme, porque el nit nunca farolea, así que sus apuestas son casi todo valor. El error es grande y la lectura es firme: te retiras incluso con manos con las que en equilibrio pagarías.
por_opcion:
  Call: Contra un rival que casi nunca farolea, pagar con un bluff-catcher pierde dinero.
  Raise: Subir convierte tu mano en un farol contra un rango que casi todo es valor.
```

```caso
id: m12-c05
titulo: Contra quien se retira en el river, farolea más
tipo: concepto
calle: river
heroe: BTN
cartas_heroe: Js Ts
mesa: 8s 4s 2d Kh 3c
accion:
  preflop: UTG, HJ, CO fold; BTN sube 2.5; SB fold; BB paga
  flop: BB check; BTN apuesta 3; BB paga
  turn: BB check; BTN check
  river: BB check
bote_esperado: 11.5
pregunta: Has visto que la BB se retira en el river cada vez que alguien apuesta. Tu proyecto de color no llegó. ¿Qué haces?
formato: decision
opciones: [Check, Bet]
correcta: Bet
explicacion: Lección 12.4 (M12_L04). Si tu rival se retira cada vez que apuestas, el ajuste es farolear más. Es el paso 3 del método, buscar cómo aprovechar su error, con una lectura firme. Un farol de medio bote, unos 6 bb, necesita que se retire 1 de cada 3 veces, y este rival se retira mucho más.
por_opcion:
  Check: Renuncias a aprovechar un error claro del rival: se retira demasiado, y sus retiradas son tu ganancia.
```
