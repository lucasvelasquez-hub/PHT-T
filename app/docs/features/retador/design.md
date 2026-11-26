# Retador

**Estado:** diseñado · **Actualizado:** 2026-11-26 · [GDD](../../GDD.md)

El jugador juega sesiones cortas de manos completas contra 5 rivales que juegan como la élite. Cada decisión recibe al instante un puntaje de precisión, y al final de la sesión ve un resumen de cómo juega frente a la élite. Es el módulo más "juego" y sirve sobre todo al pilar 1 (decidir bien vale más que ganar la mano).

## Reglas

1. Una **sesión** son 10 manos completas ([mano completa](../mano-completa/design.md)). El botón rota, así que el jugador pasa por todas las posiciones.
2. **Puntaje de una decisión** = 100 × la probabilidad que la élite da a la acción elegida, redondeado. Ejemplo: si la élite sube el 70 % de las veces y el jugador sube, gana 70 puntos.
3. El tamaño del Raise no cambia el puntaje, porque la red no distingue tamaños. La pantalla lo dice una vez: "La élite no distingue tamaños de subida".
4. **Respuesta inmediata** después de cada decisión: los puntos saltan junto al jugador, con una etiqueta y un sonido según el puntaje (tabla abajo).
5. **Fin de la mano:** se revelan las cartas de los rivales, se ven las fichas ganadas o perdidas (en bb) y se puede abrir la lectura completa de cada decisión.
6. **Dos marcadores** en la barra superior durante toda la sesión: **Fichas** (suma de bb ganadas o perdidas) y **Precisión élite** (promedio de los puntajes de sus decisiones).
7. **Resumen de la sesión:**
   - Precisión élite y Fichas.
   - Mejor decisión: la de más puntos donde la élite estaba más dividida.
   - Decisión a revisar: la de menos puntos.
   - **Tu estilo frente a la élite:** se compara cuántas veces subió el jugador con cuántas veces habría subido la élite en esas mismas decisiones (y lo mismo con los Fold).
   - Récord personal, si lo batió.
8. **Reto del día:** 5 manos iguales para todos ese día. Las cartas y los sorteos de los rivales salen de la fecha, así que con las mismas decisiones salen las mismas manos. Se guarda el mejor puntaje del día.
9. Si se sale a mitad de sesión, al volver sigue en la mano siguiente con los puntos que llevaba.

## Números

| Nombre | Valor | Unidad | Qué mirar al jugar |
|---|---|---|---|
| Manos por sesión | 10 [SUPUESTO] | manos | Que haya al menos ~12 decisiones; si hay menos, subir a 12 |
| Manos del reto del día | 5 [SUPUESTO] | manos | — |
| Etiqueta "Como la élite" | ≥ 60 [SUPUESTO] | puntos | Color cobalto, sonido brillante |
| Etiqueta "Discutible" | 30–59 [SUPUESTO] | puntos | Color neutro |
| Etiqueta "La élite casi nunca lo hace" | < 30 [SUPUESTO] | puntos | Sin sonido de error agresivo: pilar 5 |
| Diferencia para decir "más agresivo" o "más pasivo" | 10 [SUPUESTO] | puntos porcentuales | Que la frase no salga por una sola mano |

## Sensación (respuestas por nivel)

| Nivel | Evento | Respuesta |
|---|---|---|
| Pequeño | Acción de un rival, carta repartida | Movimiento de 0.3 s y un sonido corto |
| Medio | Decisión del jugador | Puntos que saltan con rebote, color de la etiqueta y sonido |
| Grande | Ganar el bote, fin de la sesión, nuevo récord, subir de rango | Fichas al ganador, contador que sube y destello breve de la ficha del rango |

## Casos límite

- El jugador se retira preflop en casi todas las manos: igual cuenta cada Fold como decisión con su puntaje.
- Si la élite da 0 % a la acción elegida, el puntaje es 0 y la etiqueta lo explica sin culpa.
- La red tarda: la barra de acciones se activa solo cuando la lectura está lista, porque el puntaje la necesita.

## Preguntas abiertas

- [SUPUESTO] El reto del día usa manos generadas, no reales.
- [SUPUESTO] Más adelante habrá una sesión con manos del banco (reales) para comparar puntajes.

## Historia

- 2026-11-26: diseñado.
