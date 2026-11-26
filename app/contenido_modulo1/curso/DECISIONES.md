# Decisiones de diseño del curso

Las cinco decisiones que estaban pendientes, tomadas con autonomía delegada por el usuario. Cada una dice qué dicen los libros (vía NotebookLM), qué calculé yo y qué se decidió.

## 1. Banca

**Qué dicen los libros.** Ninguno da una regla para principiantes de cash (NotebookLM, auditoría D-14). Acevedo (Cap. 6, Tablas 28 y 29) da una "banca mínima" de 1.345bb (13,5 *buy-ins*) a 5bb/100 y 2.690bb (27 *buy-ins*) a 2,5bb/100, con desviación estándar de 67bb/100. Clarke (1.4) dice que la banca es parte del "juego práctico" y (Cap. 2) que el principiante debe aceptar perder un poco en el límite más bajo mientras aprende, "como una matrícula".

**Qué calculé.** Con la fórmula de riesgo de ruina (`exp(−2 · winrate · banca / DE²)`), los mínimos de Acevedo equivalen exactamente a un **5 % de riesgo de ruina**. Con DE 67bb/100:

| Winrate | 20 *buy-ins* | 30 *buy-ins* | 40 *buy-ins* |
|---|---|---|---|
| 1bb/100 | 41 % | 26 % | 17 % |
| 2,5bb/100 | 11 % | 3,5 % | 1,2 % |
| 5bb/100 | 1,2 % | 0,1 % | ≈0 % |

Ninguna banca protege a quien todavía pierde; lo que protege de verdad es **bajar de límite a tiempo**.

**Decisión.**
- La banca es dinero aparte, que puedes perder sin que afecte tu vida.
- Para jugar un límite necesitas **30 *buy-ins*** de ese límite (1 *buy-in* = 100bb).
- Si tu banca cae por debajo de **20 *buy-ins***, vuelves al límite anterior.
- Mientras no tengas un historial ganador, empieza en el límite más bajo disponible.

**Por qué 30 y 20.** 30 está justo por encima del mínimo de Acevedo para un ganador modesto (27) y da un riesgo de ≈3,5 %. Dos umbrales distintos evitan subir y bajar de límite cada sesión. Es una regla propia, declarada como tal en la lección 1.5.

## 2. SPR

**Qué dicen los libros.** Hardin (Cap. 2): bajo 0–2, medio 3–6, alto 7+. Acevedo (Cap. 1): bajo 0–5, medio 6–11, alto 11+. Los dos coinciden en la consecuencia: con SPR bajo uno se compromete con *top pair* o un *overpair*; con SPR alto hacen falta manos muy fuertes.

**Decisión.** Umbrales de **Hardin**. Razones: (a) Hardin escribe para principiantes y sus cortes son más prudentes: con ellos el alumno arriesga su stack con una pareja solo cuando el bote ya es casi tan grande como lo que queda; (b) los de Acevedo salen de *solvers* y suponen un jugador que sabe jugar bien manos medias en botes grandes. La lección 10.5 menciona que otros autores usan cortes más amplios.

## 3. Rangos de apertura por posición

**Qué dicen los libros.** Clarke (Cap. 2) da rangos "por defecto" para cada posición, que él mismo califica de **conservadores y aptos para principiantes** en límites bajos. NotebookLM los leyó de las Figuras 5, 7, 10, 15 y 16. Acevedo (Cap. 5) da rangos de equilibrio para cash 6-max con frecuencias mezcladas (UTG 17,1 %, HJ 21,4 %, CO 27,8 %, BU 43,4 %, SB sube 24,4 % y hace limp 37,7 %).

**Qué comprobé.** Conté los combos de los rangos de Clarke con `herramientas/rangos_clarke.py`: UTG 140 combos (10,6 %, el texto dice 11 %), HJ 206 (15,5 %, igual al texto), CO 338 (25,5 %, igual que el texto del Cap. 10, incluyendo KJo y KTo), BU 562 (42,4 %), SB 470 (35,4 %). La coincidencia con los porcentajes del texto confirma que la lectura de las figuras es correcta.

**Decisión.** La tabla del curso es la de **Clarke, sin cambios**:

| Posición | Rango | % |
|---|---|---|
| UTG | 77+, ATs+, KTs+, QTs+, JTs, T9s, AJo+, KQo | 10,6 % |
| HJ | 66+, A2s+, KTs+, QTs+, JTs, T9s, 98s, ATo+, KJo+ | 15,5 % |
| CO | 22+, A2s+, K8s+, Q9s+, J9s+, T8s+, 97s+, 87s, 76s, 65s, A9o+, KTo+, QTo+, JTo, T9o | 25,5 % |
| BU | 22+, A2s+, K2s+, Q2s+, J6s+, T6s+, 96s+, 86s+, 75s+, 64s+, 53s+, 43s, 32s, A8o+, K8o+, Q8o+, J8o+, T8o+, 98o, 87o | 42,4 % |
| SB (todos se retiraron) | 22+, A2s+, K2s+, Q7s+, J7s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s, 43s, A9o+, K9o+, Q9o+, J9o+, T8o+, 98o, 87o | 35,4 % |

Razones: es un solo autor (coherencia), es explotativo y conservador como el resto del curso, no tiene frecuencias mezcladas (un principiante no puede ejecutar "sube el 39 % de las veces") y no hay que inventar nada. Desde SB se sigue la regla de Clarke: subir o retirarse.

**Tamaño de apertura:** 2,5bb ($5) desde cualquier posición. Acevedo (Cap. 5) usa 2,5bb de UTG a BU y afirma (Cap. 4) que el tamaño de apertura apenas cambia el resultado mientras sea razonable; Clarke usa 2,5x en CO y SB. Un solo número evita errores al principio. Las variantes de Clarke (3x en UTG/HJ, 2x en BU contra *regs*, más grande contra *fish*) se mencionan como ajuste futuro.

## 4. Ritmo y número de lecciones

**Decisión.** 66 lecciones en 13 módulos (ver `ESTRUCTURA_CURRICULAR.md` §9 para los cambios). Ritmo recomendado: **una lección al día, cinco días por semana**, y el día de la mini-evaluación al cerrar cada módulo: unas **15 semanas**. Quien quiera jugar antes tiene una **ruta mínima** (módulos 0 a 5 y la lección 11.4, unas 7 semanas). El Módulo 12 es opcional.

Razón: una idea por día es lo que pidió el usuario ("unos minutos al día"); el día de evaluación da repaso espaciado sin añadir lecciones.

## 5. Formato de entrega

**Decisión.**
- **Fuente:** una lección por archivo Markdown en `lecciones/` (`M04_L02.md`), más una mini-evaluación por módulo (`M04_evaluacion.md`). Se puede leer en cualquier editor, revisar en git y convertir a otros formatos.
- **Versión para estudiar:** `curso.html`, un solo archivo que se abre sin internet en el navegador o el móvil, generado con `python -I herramientas/construir_html.py`. Tiene índice, cartas con baraja de cuatro colores (♠ negro, ♥ rojo, ♦ azul, ♣ verde, la convención habitual en salas online, para no confundir palos) y respuestas ocultas que se despliegan con un toque.
- **Cartas:** como texto con símbolos (A♠ K♥). No uso imágenes: no hay que producirlas ni mantenerlas, y se leen igual en cualquier pantalla.
- **Sin integración con ninguna aplicación:** el usuario no lo pidió y el curso es independiente.

Razón: el Markdown es la fuente que se corrige y verifica; el HTML es la forma cómoda de estudiar. Separarlos permite corregir una cifra en un solo lugar y regenerar todo.
