# Evaluación del Módulo 12 (opcional)

<!-- SUPUESTO: las preguntas conservan los símbolos de palo (♠ ♥ ♦ ♣) del original. Las preguntas 6 y 7 son de repaso de módulos anteriores y llevan en `leccion` la lección repasada (M11_L01 y M09_L01). -->
<!-- SUPUESTO: la pregunta 1 original tiene tres cifras (AA, KK y AK) y la 5 pide nombrar los cuatro pasos (respuesta abierta). Se convierten en opciones que combinan todo, con una opción igual a la respuesta original y distractores cercanos. -->

```pregunta
id: m12-p01
leccion: M12_L01
formato: opciones
enunciado: Tienes **A♠ K♥**. El flop es **A♦ 7♣ 2♥**. ¿Cuántos combos de AA, de KK y de AK puede tener tu rival?
opciones: [AA 1; KK 3; AK 6, AA 3; KK 3; AK 6, AA 1; KK 3; AK 12, AA 6; KK 6; AK 16]
correcta: AA 1; KK 3; AK 6
explicacion: AA: ves dos ases → **1**. KK: ves un rey → **3**. AK: quedan 2 ases × 3 reyes = **6**.
por_opcion:
  AA 3; KK 3; AK 6: Ves dos ases, uno en tu mano y otro en la mesa, así que de AA queda solo 1 combo.
  AA 1; KK 3; AK 12: De AK quedan 2 ases × 3 reyes, no 12, porque tus cartas eliminan combos.
  AA 6; KK 6; AK 16: Esos son los combos sin ver ninguna carta; tus cartas y la mesa eliminan combos del rival.
```

```pregunta
id: m12-p02
leccion: M12_L02
formato: opciones
enunciado: ¿Qué diferencia hay entre un rango polarizado y uno condensado?
opciones: [El polarizado tiene manos muy fuertes y muy débiles y el condensado tiene manos medias, El polarizado tiene manos medias y el condensado tiene manos muy fuertes y muy débiles, No hay diferencia porque los dos tienen las mismas manos]
correcta: El polarizado tiene manos muy fuertes y muy débiles y el condensado tiene manos medias
explicacion: El polarizado tiene manos **muy fuertes y muy débiles**; el condensado, **manos medias** (*bluff-catchers*).
```

```pregunta
id: m12-p03
leccion: M12_L03
formato: numero
enunciado: En el river apuestas 2/3 del bote con un rango equilibrado. ¿Qué parte de tus apuestas son faroles?
correcta: 29
tolerancia: 1
unidad: %
explicacion: El precio del rival: (2/3) ÷ (1 + 4/3) = 2/7 ≈ **29 %**. Dos faroles por cada cinco manos de valor.
```

```pregunta
id: m12-p04
leccion: M12_L03
formato: numero
enunciado: Tu rival apuesta medio bote en el river. ¿Qué frecuencia mínima de defensa necesitas para que sus faroles no ganen solos?
correcta: 67
tolerancia: 1
unidad: %
explicacion: MDF = 1 ÷ 1,5 ≈ **67 %**.
```

```pregunta
id: m12-p05
leccion: M12_L04
formato: opciones
enunciado: ¿Cuáles son los cuatro pasos del proceso para explotar a un rival?
opciones: [Imaginar el equilibrio; hacer una lectura; buscar cómo aprovecharla; decidir cuánto desviarte, Hacer una lectura; apostar siempre; farolear más; decidir cuánto desviarte, Imaginar el equilibrio; copiar al rival; apostar el bote; retirarte]
correcta: Imaginar el equilibrio; hacer una lectura; buscar cómo aprovecharla; decidir cuánto desviarte
explicacion: Imaginar el equilibrio, hacer una lectura, buscar cómo aprovecharla y decidir cuánto desviarte.
```

```pregunta
id: m12-p06
leccion: M11_L01
formato: opciones
enunciado: ¿Qué haces cuando reconoces dos señales de *tilt*?
opciones: [Cierro la mesa, Sigo jugando para recuperar, Subo de límite]
correcta: Cierro la mesa
explicacion: **Cierras la mesa.**
por_opcion:
  Sigo jugando para recuperar: Querer recuperar hoy es una señal más de tilt.
  Subo de límite: Subir de límite para recuperar es otra señal de tilt.
```

```pregunta
id: m12-p07
leccion: M09_L01
formato: numero
enunciado: Faroleas el bote entero en el river. ¿Qué porcentaje de retiradas necesitas?
correcta: 50
tolerancia: 1
unidad: %
explicacion: **50 %.**
```
