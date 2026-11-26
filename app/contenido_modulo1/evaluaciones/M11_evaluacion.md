# Evaluación del Módulo 11

<!-- SUPUESTO: las preguntas conservan los $ del original, porque son preguntas de lectura y no casos de mesa. Las preguntas 5 y 6 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M10_L04 y M01_L05). -->
<!-- SUPUESTO: la pregunta 1 original pide "nombra tres señales de tilt" (respuesta abierta). Como la app solo admite opciones o una cifra, se convierte en "elige la lista que contiene tres señales de tilt". -->

```pregunta
id: m11-p01
leccion: M11_L01
formato: opciones
enunciado: ¿Cuál de estas listas contiene tres señales de *tilt*?
opciones: [Jugar manos fuera de tus rangos; querer recuperar hoy; subir de límite para recuperar, Revisar tus manos después; descansar entre sesiones; jugar una sola mesa, Marcar manos dudosas; calcular el EV; anotar una lección]
correcta: Jugar manos fuera de tus rangos; querer recuperar hoy; subir de límite para recuperar
explicacion: Las señales de *tilt* son, por ejemplo, jugar manos fuera de tus rangos, pagar apuestas grandes "para ver", querer recuperar hoy, obsesionarte con un rival y subir de límite para recuperar. Las otras dos listas son hábitos de estudio y descanso.
```

```pregunta
id: m11-p02
leccion: M11_L02
formato: numero
enunciado: En el flop pagas $40 de un *all-in* en un bote de $60 con 12 *outs* (45 % de equity). ¿Cuál es el EV de pagar, en dólares?
correcta: 23
tolerancia: 0
unidad: $
explicacion: Si ganas: $60 + $40 = $100. EV = 0,45 × $100 − 0,55 × $40 = $45 − $22 = **+$23**.
```

```pregunta
id: m11-p03
leccion: M11_L02
formato: opciones
enunciado: ¿Qué proporción entre juego y estudio recomiendan los libros para principiantes?
opciones: [50 % jugar y 50 % estudiar, 80 % jugar y 20 % estudiar, 100 % jugar]
correcta: 50 % jugar y 50 % estudiar
explicacion: **50 % jugar y 50 % estudiar.**
por_opcion:
  80 % jugar y 20 % estudiar: Jugar da experiencia, pero estudiar la convierte en mejores decisiones.
  100 % jugar: Sin estudio, las horas de juego no te hacen mejorar.
```

```pregunta
id: m11-p04
leccion: M11_L03
formato: opciones
enunciado: ¿Por qué un límite más bajo puede darte más dinero que uno más alto?
opciones: [Porque tu winrate depende de tus rivales y con rivales más débiles ganas muchas más bb/100, Porque en los límites bajos no hay rake, Porque en los límites bajos la varianza desaparece]
correcta: Porque tu winrate depende de tus rivales y con rivales más débiles ganas muchas más bb/100
explicacion: Porque tu winrate depende de tus rivales: con rivales más débiles puedes ganar muchas más bb/100, y eso compensa que cada bb valga menos.
```

```pregunta
id: m11-p05
leccion: M10_L04
formato: opciones
enunciado: Abres y te resuben. ¿Con qué manos haces *4-bet* por valor?
opciones: [QQ+ y AK, JJ y AQ, Cualquier pareja]
correcta: QQ+ y AK
explicacion: **QQ+ y AK.**
```

```pregunta
id: m11-p06
leccion: M01_L05
formato: opciones
enunciado: Tu banca cae por debajo de 20 *buy-ins* del límite que juegas. ¿Qué haces?
opciones: [Bajo al límite anterior, Sigo en el mismo límite, Subo de límite para recuperar]
correcta: Bajo al límite anterior
explicacion: **Bajas al límite anterior.**
por_opcion:
  Subo de límite para recuperar: Subir para recuperar es una señal de tilt y rompe las reglas de banca.
```
