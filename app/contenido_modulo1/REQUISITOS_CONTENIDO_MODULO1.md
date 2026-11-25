# 📚 Requisitos del contenido · Módulo 1 (Instructor)

> Cómo escribir las unidades del Instructor para que entren directo a la app, sin adaptarlas.
> Este documento debe bastar por sí solo: quien prepare el contenido, persona o agente, no necesita leer nada más del proyecto.

**Última actualización:** 25 de noviembre de 2026

---

## 1. Qué es el Módulo 1

- Un curso de Texas Hold'em No-Limit, ordenado de lo básico a lo avanzado.
- Cada unidad tiene:
  - **La lección:** texto, ejemplos y cartas dibujadas.
  - **Un resumen.**
  - **"Prueba en vivo lo que aprendiste":** casos en una mesa animada, donde el usuario decide y recibe retroalimentación.
- Junto a cada caso, la app muestra dos lecturas propias:
  - **Motor matemático:** equity y pot odds.
  - **Red neuronal:** lo que harían jugadores de élite, entrenada con manos de Pluribus.

## 2. Reglas generales del contenido

1. **Texto propio.** El contenido se basa en varios libros, pero se escribe con palabras propias. No se copian párrafos. Se permiten citas breves, de una o dos líneas, entre comillas y con autor y libro.
2. **Fuentes al final de cada unidad:** libro, autor y capítulo.
3. **Lenguaje:**
   - Nunca escribir "jugada óptima", "jugada perfecta" ni "GTO" para describir lo que hace la app.
   - Si un libro recomienda algo, escribir "el libro recomienda" o "la idea de esta unidad es".
   - La red se describe siempre como **"lo que harían jugadores de élite"**.
   - Escribir "tiene sentido", nunca "hace sentido".
4. **Nombres de las acciones:** Fold, Check, Call, Bet y Raise, como en la app. La primera vez que aparece cada uno en el curso se explica en español (Fold = retirarse, Check = pasar, Call = pagar, Bet = apostar, Raise = subir).
5. **Nombres de las posiciones** (mesa de 6): UTG, HJ, CO, BTN, SB y BB. Se explican en la unidad de posiciones.
6. **Cantidades siempre en ciegas grandes (bb)**, nunca en dinero. Ejemplo: "sube a 2.5 bb".
7. **Formato de mesa por defecto:** 6 jugadores, todos con 100 bb al empezar, ciegas de 0.5 bb y 1 bb. Es el formato en que se entrenó la red. Si un caso usa otro formato, la app no podrá mostrar la lectura de la élite.

## 3. Cómo se escriben las cartas

Cada carta se escribe con **dos caracteres: valor y palo**.

| Valor | Se escribe | | Palo | Se escribe |
|---|---|---|---|---|
| As | `A` | | Picas ♠ | `s` |
| Rey, Reina, Jota | `K`, `Q`, `J` | | Corazones ♥ | `h` |
| Diez | `T` | | Diamantes ♦ | `d` |
| 9 al 2 | `9` … `2` | | Tréboles ♣ | `c` |

- Ejemplos: `As` = As de picas · `Th` = Diez de corazones · `7c` = Siete de tréboles.
- **Dentro del texto de la lección**, las cartas entre corchetes se dibujan como cartas reales: `[As Kh]` muestra el As de picas y el Rey de corazones.
- **Manos genéricas** (sin palo), para hablar de rangos: `AKs` (suited, mismo palo), `AKo` (offsuit, distinto palo), `TT` (pareja de dieces). Estas se muestran como texto, no como cartas.

## 4. Un archivo por unidad

- **Nombre:** `uNN_tema-corto.md`, con dos dígitos. Ejemplos: `u01_reglas-basicas.md`, `u07_pot-odds.md`.
- **Ubicación:** esta misma carpeta (`app/contenido_modulo1/`).
- **Imágenes:** si hacen falta, se describen con una línea `IMAGEN: descripción de lo que debe mostrar`, y se diseñan en la app con el estilo visual del resto. No se pegan imágenes de los libros.

### 4.1 Estructura de cada archivo

````markdown
---
unidad: 7
titulo: Pot odds: cuánto cuesta seguir en la mano
nivel: basico            # basico | intermedio | avanzado
duracion_min: 12         # tiempo estimado de lectura
prerrequisitos: [5, 6]   # números de unidades que conviene haber visto
objetivos:
  - Calcular las pot odds de un pago.
  - Comparar pot odds con la probabilidad de ganar.
conceptos: [pot odds, equity, pago rentable]
---

## (Primer apartado de la lección)

Texto con títulos de nivel 2 (##) y 3 (###), listas, tablas, negritas
y cartas entre corchetes como [Ah 5h].

> 💡 **Clave:** una idea importante, destacada en un recuadro.

> ⚠️ **Error común:** un error típico de principiantes.

## Resumen

- De 3 a 5 ideas, una por línea.

## Prueba en vivo

(De 3 a 6 casos con el formato de la sección 5.)

## Fuentes

- Autor, *Título del libro*, capítulo N.
````

## 5. Casos de "Prueba en vivo"

Cada caso va en un bloque que empieza con ` ```caso ` y termina con ` ``` `. Los campos se escriben como `nombre: valor`.

### 5.1 Campos de la situación

| Campo | Obligatorio | Qué poner |
|---|---|---|
| `id` | Sí | `uNN-cMM`, por ejemplo `u07-c02` |
| `titulo` | Sí | Frase corta que se muestra arriba del caso |
| `tipo` | Sí | `matematica` o `concepto` (ver 5.3) |
| `calle` | Sí | `preflop`, `flop`, `turn` o `river`: la calle en la que decide el usuario |
| `heroe` | Sí | Posición del usuario: `UTG`, `HJ`, `CO`, `BTN`, `SB` o `BB` |
| `cartas_heroe` | Sí | Dos cartas, por ejemplo `Ah 5h` |
| `mesa` | Si la calle no es preflop | 3, 4 o 5 cartas según la calle, por ejemplo `Kh 9h 2c` |
| `stacks` | No | Por defecto `100` para todos. Si cambia: `BTN 60, BB 100, resto 100` |
| `accion` | Sí | **Todas** las acciones en orden, por calle, hasta que le toca al usuario (ver 5.2) |
| `bote_esperado` | Recomendado | Bote en bb justo antes de que decida el usuario. La app lo calcula y avisa si no coincide |

### 5.2 Cómo se escribe la acción

- Una línea por calle, con las acciones en orden separadas por punto y coma.
- Las ciegas (SB 0.5 y BB 1) se ponen solas; no se escriben.
- Las subidas se escriben **"hasta"**: `CO sube 2.5` significa que su apuesta total en esa calle queda en 2.5 bb.
- Cada jugador que se retira se escribe. Se puede agrupar: `UTG, HJ fold`.
- Verbos permitidos: `fold`, `check`, `paga`, `apuesta X`, `sube X`, `all-in`.

Ejemplo:

```
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB fold
  flop: CO apuesta 3
```

Con esa acción, el bote antes de que decida el BTN es 2.5 + 2.5 + 0.5 + 1 + 3 = **9.5 bb**, y le cuesta **3 bb** seguir.

### 5.3 Tipos de caso y cómo se califican

| Tipo | Qué evalúa | Quién define la respuesta |
|---|---|---|
| `matematica` | Cálculos: pot odds, outs, probabilidad de ganar, si un pago es rentable | La respuesta debe salir de los números del propio caso. La app verifica las pot odds con su motor. |
| `concepto` | Una idea de estrategia de la unidad: posición, selección de manos, tamaño de apuesta, faroles | El autor, según lo que enseña la unidad |

En los dos tipos, si el caso está en el formato del modelo (sección 2, regla 7), la app muestra al final **qué harían jugadores de élite**. Puede coincidir o no con la lección, y esa comparación también enseña.

> ⚠️ **Sobre la equity:** el motor de la app calcula la probabilidad de ganar **contra manos al azar**. Los libros suelen calcularla contra una mano o un rango concreto, o con outs. En los casos de tipo `matematica`, escribe en `explicacion` qué cálculo usa la lección (por ejemplo "9 outs ≈ 35 % al river"). La app mostrará su propio número aparte, aclarando que es contra manos al azar.

### 5.4 Campos de la pregunta

| Campo | Obligatorio | Qué poner |
|---|---|---|
| `pregunta` | Sí | Texto de la pregunta, por ejemplo "¿Qué haces?" |
| `formato` | Sí | `decision` (botones de acción en la mesa) u `opciones` (respuestas de selección múltiple) |
| `opciones` | Sí | Con `decision`: las acciones **legales** en ese momento (si hay apuesta, no puede haber Check). Con `opciones`: de 2 a 4 respuestas escritas |
| `correcta` | Sí | La opción esperada. Si hay más de una aceptable: `correcta: [Call, Raise]` |
| `explicacion` | Sí | Por qué es la esperada: de 2 a 4 líneas |
| `por_opcion` | Recomendado | Una línea de retroalimentación para cada opción incorrecta |

### 5.5 Ejemplo completo

```caso
id: u07-c02
titulo: Proyecto de color frente a una apuesta pequeña
tipo: matematica
calle: flop
heroe: BTN
cartas_heroe: Ah 5h
mesa: Kh 9h 2c
accion:
  preflop: UTG, HJ fold; CO sube 2.5; BTN paga; SB fold; BB fold
  flop: CO apuesta 3
bote_esperado: 9.5
pregunta: El CO apuesta 3 bb. ¿Qué haces?
formato: decision
opciones: [Fold, Call, Raise]
correcta: [Call, Raise]
explicacion: Pagar cuesta 3 para ganar 9.5, así que necesitas ganar al menos el 24 % de las veces (3 / 12.5). Con 9 outs de color tienes cerca del 35 % de completarlo hasta el river, más que suficiente.
por_opcion:
  Fold: Retirarte regala la mano cuando el precio es bajo y tu proyecto es fuerte.
```

## 6. Organización del curso (sugerencia, no obligatoria)

- Entre **8 y 15 unidades**, cada una de 8 a 15 minutos de lectura.
- Un orden posible:
  1. Reglas y orden de juego.
  2. Ranking de manos.
  3. Posiciones en la mesa de 6.
  4. Selección de manos preflop.
  5. Tamaños de subida preflop.
  6. Pot odds.
  7. Outs y probabilidad de ganar.
  8. Textura de la mesa.
  9. Apuesta de continuación.
  10. Juego en el turn y el river.
  11. Faroles y semifaroles.
  12. Rangos.
  13. Gestión del stack y SPR.
- Cada unidad debe usar solo conceptos de unidades anteriores, o explicarlos en el momento.

## 7. Lista de verificación antes de entregar

- [ ] Un archivo por unidad, con el nombre `uNN_tema-corto.md`.
- [ ] Encabezado completo: `unidad`, `titulo`, `nivel`, `duracion_min`, `prerrequisitos`, `objetivos` y `conceptos`.
- [ ] Texto propio, con citas breves atribuidas y fuentes al final.
- [ ] Cartas escritas en el formato de la sección 3.
- [ ] De 3 a 6 casos por unidad, con todos los campos obligatorios.
- [ ] La acción de cada caso está completa y `bote_esperado` coincide con ella.
- [ ] Las opciones de tipo `decision` son legales en ese momento.
- [ ] No aparecen las frases prohibidas ("jugada óptima", "GTO", "hace sentido").
