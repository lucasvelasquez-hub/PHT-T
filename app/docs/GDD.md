# Next Chip · Documento de diseño del juego

**Versión:** 0.2 · **Actualizado:** 2026-11-26 · [Funciones](#índice-de-funciones) · [Decisiones](#decisiones) · [Cambios](#registro-de-cambios)

> Qué es la app: `../01_OBJETIVO_Y_FUNCIONAMIENTO.md`. Cómo está construida: `../02_ARQUITECTURA_Y_DECISIONES_TECNICAS.md`.
> Este documento dice **cómo se juega y por qué es divertido**. Los números de cada función viven en su nota (`features/<función>/design.md`).
> Lo marcado **[SUPUESTO]** es una primera propuesta: se confirma jugando.

## Resumen

El jugador se sienta en una mesa de 6 jugadores y toma decisiones de póker. En cada una, el juego le dice dos cosas: cuántas fichas ganó o perdió (la suerte) y cuánto se pareció su decisión a la de los jugadores de élite (su habilidad). Lo divertido es mejorar esa segunda cifra: subir de rango, batir su récord y entender por qué la élite a veces se retira con buenas cartas. Una sesión dura unos 5 minutos.

| | |
|---|---|
| Género | Entrenador de póker con mesa animada (Texas Hold'em No-Limit, 6 jugadores) |
| Público | Principiantes e intermedios. Primer uso: una **presentación en clase** |
| Plataformas | Navegador en celular (vertical, pulgar) y PC (horizontal, ratón) |
| Sesión | Retador: 10 manos (~5 min). Instructor: una lección (~8 min) |
| Tecnología | React + Vite + TypeScript, ya construida (ver `02_*`) |
| Alcance | Demostración para clase: sin cuentas, progreso guardado en el navegador |
| Referencias | **Duolingo** (camino de lecciones, estrellas, racha suave) · **Balatro** (cada ficha y puntaje responde con peso y sonido) · **PokerStars / Zynga Poker** (ritmo de mesa, turnos claros) · **GTO Wizard** (ejercicio corto con nota inmediata) |

## Pilares

1. **Decidir bien vale más que ganar la mano.** Siempre hay dos marcadores, *Fichas* y *Precisión élite*. Se premia la decisión, no el resultado. Por eso el rango sube con la precisión, nunca con las fichas.
2. **Cada acción responde.** Toda acción del jugador tiene una respuesta visible y sonora en menos de 0.3 s. Los rivales nunca hacen esperar: actúan rápido y siempre se puede saltar. Nada de animaciones largas que frenen el aprendizaje.
3. **Calidad de estudio.** Materiales con volumen, luz y profundidad. El comp aprobado (`.impeccable/mocks/decision/comp-b.png`) es la ley. Primero la imagen, después el código.
4. **Honesto siempre.** Se dice "lo que harían jugadores de élite", nunca "jugada óptima". Las cifras salen del motor y de la red, nunca se inventan. Cada mano dice si es real o generada.
5. **Corto y sin castigo.** Sin vidas, sin multas por faltar un día, sin culpa. Se puede salir en cualquier momento y retomar donde quedó.

## Ciclo principal

```
decidir (Fold / Check-Call / Raise con tamaño)
  → respuesta inmediata (+puntos de precisión, sonido)
  → fin de la mano (se revelan cartas y lectura de la élite)
  → resumen de sesión (mejor y peor decisión, tu estilo frente a la élite)
  → experiencia acumulada → sube el rango → nueva sesión o reto del día
```
- **Segundos:** una decisión en la [mano completa](features/mano-completa/design.md), con su respuesta.
- **Minutos:** una sesión del [Retador](features/retador/design.md) o una lección del Instructor.
- **Entre sesiones:** el [progreso](features/progreso/design.md): experiencia, rango, récords, racha y dónde quedó cada módulo.

## Pantallas y flujo

```
Portada → (primera vez) Nombre o Invitado → 3 tarjetas de módulos → Mano guiada
        → Inicio (rango, experiencia, 3 módulos) ⇄ Retador | Instructor | Analista ⇄ Ajustes / Créditos
```
Las tarjetas de bienvenida hablan en tono de juego y no mencionan nada técnico (motor, red, ONNX).

## Índice de funciones

| Función | Estado | Alcance | Resumen | Nota |
|---|---|---|---|---|
| Mesa y lecturas | implementado | MVP | Mesa del comp B con lecturas del motor y de la élite | `src/ui/` |
| Mano completa | implementado | MVP | Reparto, turnos, rivales con el Modelo 4, Raise con tamaño, showdown | [diseño](features/mano-completa/design.md) |
| Retador | implementado | MVP | Sesión de 10 manos, puntaje de precisión, resumen y reto del día | [diseño](features/retador/design.md) |
| Progreso | implementado | MVP | Nombre o invitado, experiencia, 6 rangos con las fichas, guardado local | [diseño](features/progreso/design.md) |
| Portada y bienvenida | implementado | MVP | Portada, nombre, 3 tarjetas de módulos y mano guiada de ~30 s | — |
| Sonido | implementado | MVP | Efectos de los paquetes de Kenney (uso libre), música apagada por defecto | — |
| Instructor | implementado | MVP | Camino de 13 módulos; lecciones partidas en pantallas; estrellas; repaso | — |
| Casos "Prueba en vivo" | implementado | MVP | 3–6 casos por módulo en la mesa, en bb, verificados por el motor | — |
| Evaluaciones interactivas | implementado | MVP | Las mini-evaluaciones del curso como preguntas de opción o número | — |
| Analista | implementado | MVP | Repetir manos reales decisión por decisión, filtros | — |
| ¿Adivinas qué hizo la élite? | implementado | MVP | En el Analista, decides antes de ver la respuesta | — |
| ¿Y si...? | idea | después | Cambiar una pieza y ver la curva de sensibilidad a la equity | — |
| Comparar los 4 modelos | idea | después | La misma situación con los 4 modelos del proyecto | — |

## Hitos

1. **H1 · Portada y bienvenida (diseño):** imágenes de referencia para elegir y luego el código · listo cuando: el usuario aprueba una portada.
2. **H2 · Mano completa:** listo cuando: se juegan 10 manos seguidas sin errores, el bote cuadra en todas y los rivales actúan con el Modelo 4.
3. **H3 · Retador + Progreso + Sonido:** listo cuando: una sesión completa da su resumen, suma experiencia y el rango se conserva al recargar.
4. **H4 · Instructor:** listo cuando: se completa una lección con su evaluación y sus casos, y queda marcada con estrellas.
5. **H5 · Analista:** listo cuando: se repite una mano real completa y el modo "¿Adivinas?" da puntaje.
6. **H6 · Agente de prueba y Vercel:** listo cuando: el enlace público abre en celular y en PC.

## Decisiones

| ID | Fecha | Decisión | Alternativas | Por qué | Afecta |
|---|---|---|---|---|---|
| D-001 | 2026-11-26 | Sin cuentas: nombre o invitado, progreso en el navegador | Cuentas con servidor | Demostración en clase; no hay servidor (ver `02_*`) | progreso |
| D-002 | 2026-11-26 | Dos marcadores: Fichas y Precisión élite | Solo precisión; solo fichas | Enseña que decidir bien y ganar no son lo mismo | retador, mano-completa |
| D-003 | 2026-11-26 | 6 rangos con las 6 fichas (1 a 100) | Niveles numéricos | Aprovecha recursos hechos y queda coherente con la mesa | progreso |
| D-004 | 2026-11-26 | Sin vidas en el Instructor; racha que no castiga | Vidas al estilo Duolingo | Las vidas frustran; pilar 5 | instructor |
| D-005 | 2026-11-26 | Sin respaldo descargable ni aviso de dinero real | Incluirlos | Es una demostración para clase | progreso, portada |
| D-006 | 2026-11-26 | Orden: base común → Retador → Instructor → Analista | Analista primero (orden anterior) | El Retador usa la base sin piezas nuevas; el usuario dejó el orden libre | hitos |
| D-007 | 2026-11-26 | Las lecciones aprobadas quedan en $; los casos van en bb | Reescribir las lecciones en bb | El curso ya está aprobado; la conversión se explica una vez | instructor, casos |
| D-008 | 2026-11-26 | La bienvenida termina en una mano guiada, no en páginas de texto | Pantallas de explicación | Se aprende jugando; pilar 2 | portada |

## Preguntas abiertas

- **Supuestos por confirmar:** todos los [SUPUESTO] de las notas de funciones (tamaños de Raise, puntos por rango, número de manos por sesión).
- **Riesgos:**
  - ¿Rivales que eligen al azar según la élite juegan creíble? Se ve jugando 50 manos en H2.
  - ¿Una sesión de 10 manos tiene suficientes decisiones del jugador, si se retira mucho preflop? Se mide en H3.
  - Cuota de Canva y ChatGPT para la portada: planear pocos pedidos grandes.

## Registro de cambios

**0.1 (2026-11-26):** primer borrador; diseñados mano completa, Retador y progreso; D-001 a D-008.
**0.2 (2026-11-26):** implementados los hitos H1 a H5 (falta la portada de PC); los tamaños de los rivales se midieron en el banco (`src/juego/tamanos_pluribus.json`).
