# Mano completa

**Estado:** diseñado · **Actualizado:** 2026-11-26 · [GDD](../../GDD.md)

Es la base de los tres módulos: una mano de póker jugada de principio a fin en la mesa del comp B. Se reparte, cada jugador actúa en su turno, se reparten las calles, se muestran las cartas y el bote va al ganador. Los 5 rivales deciden con el Modelo 4, así que juegan como la élite. Sirve a los pilares 2 (cada acción responde) y 4 (honesto: solo situaciones posibles).

## Reglas

1. Formato fijo del modelo: 6 jugadores, todos con **100 bb** al empezar cada mano y ciegas de 0.5 y 1 bb. Los stacks se reinician en cada mano.
2. El botón avanza un asiento por mano, así que la posición del jugador cambia en cada mano.
3. Orden de una mano: ciegas → 2 cartas a cada uno → preflop → flop → turn → river → showdown. Termina antes si solo queda un jugador.
4. **Rivales:** en su turno se calcula la lectura (equity + red) y se **sortea** la acción con las probabilidades de la élite (Fold, Check/Call, Bet/Raise).
   - Si sale Fold y puede pasar gratis, pasa (Check).
   - Si sale Bet/Raise y no puede subir, paga (Call).
   - El tamaño de la subida sale de la tabla de tamaños (abajo).
5. **Jugador:** tiene FOLD, CHECK/CALL y RAISE. Al tocar RAISE aparecen los botones de tamaño de la calle; cualquier tamaño se ajusta al mínimo y al máximo legales del motor (`accionesLegales`).
6. Si el jugador se retira, el resto de la mano sigue sola y aparece **"Saltar"**, que la resuelve al instante.
7. Showdown: se muestran las cartas de los que siguen, se marca la mejor mano y las fichas del bote vuelan al ganador. Un empate divide el bote. Las fichas sobrantes van al primer asiento después del botón.
8. Con stacks iguales al empezar **nunca hay botes laterales**: el que va all-in con 100 bb no puede ser superado.
9. La mano muestra siempre su origen: **"Mano generada"** (o "Mano real · Pluribus" en el Analista).

## Números

| Nombre | Valor | Unidad | Qué mirar al jugar |
|---|---|---|---|
| Pausa de "pensar" de un rival | 0.6 [SUPUESTO] | s | Que no aburra ni parezca instantáneo |
| Animación de una acción (fichas, volteo) | 0.3 | s | Viene de `01_*` §4 |
| Reparto: separación entre cartas | 0.08 [SUPUESTO] | s | Que se lea como un reparto real |
| Fichas al ganador | 0.5 [SUPUESTO] | s | Es el momento grande de la mano |
| Raise del jugador, preflop sin subidas antes | 2.5 · 3 · all-in [SUPUESTO] | bb | — |
| Raise del jugador, preflop frente a una subida | 3× · 4× · all-in [SUPUESTO] | veces la subida | — |
| Raise del jugador, postflop | 1/3 · 1/2 · 3/4 · bote · all-in [SUPUESTO] | fracción del bote | — |
| Rivales: tamaños | los mismos botones, con frecuencias medidas en las manos de Pluribus [SUPUESTO: medir antes de fijar] | — | Que suban como en las manos reales |

## Casos límite

- Todos se retiran hasta la ciega grande: gana sin flop.
- El jugador va all-in temprano: las calles que faltan se reparten seguidas, con una pausa corta entre cada una.
- El jugador recarga la página a mitad de mano: la mano empieza de nuevo (no se guarda a mitad de mano) [SUPUESTO].
- Toques rápidos repetidos: solo vale el primero; los botones se bloquean hasta el siguiente turno.
- Si el motor tarda en calcular, el turno del rival espera la lectura; la pausa de 0.6 s la cubre casi siempre.

## Preguntas abiertas

- [SUPUESTO] `es_pluribus` = 0 para los rivales, como para el jugador (la élite humana del dataset).
- [SUPUESTO] Los tamaños de los rivales se miden en las manos de Pluribus antes de fijarlos.

## Historia

- 2026-11-26: diseñada.
