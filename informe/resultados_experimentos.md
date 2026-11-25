# PHT-T · Resultados de los experimentos (borrador para el informe)

> Borrador técnico con todas las cifras verificadas en los notebooks. Sirve de base para redactar el informe académico final.
> Todas las métricas provienen de `informe/metricas/*.json` y las figuras de `informe/figuras/`.
>
> Notebooks por modelo: Modelo 1 → 02–04 · Modelo 2 → 05–07 · Modelo 3 → 08–09 · Modelo 4 → 10–11 · Motor matemático + Modelo 4 → 12.

---

## 1. Resumen de la evolución

| Versión | Datos | Variables | Exactitud en test | F1-Macro | Estado |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Modelo 1** (`v1-con-fuga`) | HandHQ, 60,000 manos (Absolute Poker 1000NL) | 5 públicas | 92.90% | 0.910 | ❌ Inflado por fuga de información |
| **Modelo 2** (`v2-corregido`) | Igual que el Modelo 1 | 5 públicas | 64.86% | 0.531 | ✅ Válido; empata con un árbol simple |
| **Modelo 3** (`v3-45-variables`) | HandHQ, 440,249 manos (3.77 M decisiones) | 44 públicas | 73.83% | 0.630 | ✅ Válido; techo sin cartas privadas |
| **Modelo 4** (`v4-pluribus`) | Pluribus, 10,000 manos con todas las cartas visibles | 47 (públicas + cartas + equity) | **87.39%** (CV 87.50 ± 0.25) | **0.839** | ✅ Modelo final |

Cada versión está guardada en `models/` y marcada con un *tag* de git, para que el frontend pueda comparar las cuatro en la misma situación.

El modelo describe **lo que harían jugadores de élite** en una situación, no la jugada matemáticamente óptima.

---

## 2. Modelo 1: el 92.9% que no era real

**Qué pasó.** En la reconstrucción de decisiones (Notebook 02), la "foto" de la mesa (bote, stack, apuesta pendiente) se guardaba **después** de mover las fichas en las jugadas *Check/Call* y *Bet/Raise*, pero **antes** en los *Fold*. La red no aprendió póker: aprendió a distinguir cuál de las dos fotos estaba mirando.

**Evidencia.**
- En el test, entre las decisiones con apuesta pendiente (`to_call > 0`), la igualdad `pot_odds == to_call / (bote + to_call)` se cumplía en **26,271 folds y en 0 no-folds**.
- Una regla trivial basada en esa inconsistencia separa los *Fold* con 98.5% de exactitud.
- En la prueba de cordura (flop, bote 100, apuesta 50) el Modelo 1 respondía **100% Fold**.

**Segundo error encontrado en la misma celda.** En el formato PHH, `cbr X` significa "subir **hasta** X". El código sumaba X completo al bote en lugar de solo la diferencia con lo ya apostado en la ronda.

| Modelo (datos con fuga) | Exactitud | F1-Macro |
| :--- | :---: | :---: |
| Baseline 2: árbol de profundidad 3 | 72.21% | 0.662 |
| Red neuronal MLP | 92.90% | 0.910 |

La fuga también inflaba al árbol (72.21% contra 64.77% con los datos corregidos). Los Notebooks 02–04 conservan la versión original con sus salidas. Al volver a ejecutarlos con rutas separadas se obtiene 92.91%, así que el resultado es reproducible.

**Corrección (Notebooks 05–07).** Guardar siempre la foto antes de mover fichas y calcular el pago de `cbr` como `min(max(0, X − ya_puesto), stack)`. Artefactos originales en `models/v1_con_fuga/` (commit `ffa760e`).

---

## 3. Modelo 2: fuga corregida

| Modelo | Exactitud | F1-Macro |
| :--- | :---: | :---: |
| Baseline 1: clase mayoritaria (*Fold*) | 48.10% | 0.217 |
| Baseline 2: árbol de profundidad 3 | 64.77% | 0.528 |
| Red neuronal MLP | **64.86%** | **0.531** |

- La red apenas supera al árbol: con 5 variables públicas, **la información disponible es el límite, no la arquitectura**.
- El *recall* de *Bet/Raise* es muy bajo: sin cartas ni contexto, las agresiones no se pueden anticipar.
- En la prueba de cordura, el Modelo 2 reparte la probabilidad entre las tres acciones (53% / 36% / 12%).

Figuras: `modelo2_curvas_aprendizaje.png`, `modelo2_matriz_confusion.png`.

---

## 4. Modelo 3: ¿hasta dónde se llega sin cartas privadas?

**Datos.** Shard completo de HandHQ (`takara-ai/poker_hands`): 440,249 manos de No-Limit Hold'em (Absolute Poker 1000NL: 66,830; Full Tilt 50NL: 373,419), 26,909 jugadores, 3,773,857 decisiones. Las cartas privadas aparecen ocultas (`????`) salvo en el *showdown*.

**Diseño de validación.**
- Partición **cronológica** 70/15/15: train 2,584,256 · val 596,389 · test 593,212. El test son los últimos días del archivo (train termina el día 17 a las 21:40; test empieza el día 18 a las 14:06).
- El perfil de cada jugador (estadísticas tipo HUD con suavizado bayesiano) se actualiza **solo con manos anteriores** a la decisión.
- 5 chequeos anti-fuga, todos en 0: consistencia de pot odds en las tres clases, ninguna mano compartida entre conjuntos, orden temporal, conteo exacto de manos previas en el perfil (0 de 3,773,857) y número de cartas del tablero según la calle.

**Error adicional encontrado: ciegas en heads-up.** En las mesas de 2 jugadores, el formato PHH lista las ciegas como `[5, 10]`, pero el botón/ciega pequeña es `p2`. Se verificó contando quién actúa primero: `p2` abre el preflop en 2,999 de 3,000 manos y `p1` abre el flop en 1,807 de 1,807. Se corrigió en los Modelos 3 y 4 (el Modelo 2 se dejó como estaba, ya etiquetado).

**Resultados (test cronológico).**

| Modelo | Exactitud | F1-Macro | Log-loss |
| :--- | :---: | :---: | :---: |
| Baseline 1: clase mayoritaria | 53.76% | 0.233 | 7.453 |
| Baseline 2: árbol prof. 3 (5 variables) | 69.50% | 0.474 | 0.737 |
| Referencia: Gradient Boosting (44 variables) | 73.71% | 0.628 | 0.616 |
| **Red neuronal MLP (44 variables)** | **73.83%** | **0.630** | **0.612** |

F1 por clase: *Fold* 0.845 · *Check/Call* 0.662 · *Bet/Raise* 0.382 (recall 27.4%).

**Ablación (misma red, añadiendo grupos de variables).**

| Grupo | Variables | Exactitud |
| :--- | :---: | :---: |
| G0 · 5 variables originales | 5 | 70.19% |
| G1 · + ciegas grandes y nivel | 6 | 70.20% |
| G2 · + posición e historial de apuestas | 30 | 72.73% |
| G3 · + textura de la mesa | 37 | 72.77% |
| G4 · + perfil del jugador | 44 | 73.83% |

Con las mismas 5 variables, la nueva reconstrucción da 70.19% frente al 64.86% del Modelo 2. La diferencia combina la corrección de ciegas, unas 10 veces más decisiones y la partición cronológica; no se aisló el aporte de cada factor.

**Curva de aprendizaje: más datos no ayudan.**

| Decisiones de entrenamiento | 50,000 | 200,000 | 800,000 | 2,584,256 |
| :--- | :---: | :---: | :---: | :---: |
| Exactitud en test | 73.14% | 73.53% | 73.75% | 73.83% |

Multiplicar los datos por 50 suma 0.7 puntos. Cargar los 21 millones de manos del archivo original no cambiaría la conclusión.

**Análisis complementarios.**
- Por situación: preflop enfrentando subida 80.17%; preflop sin subidas 74.49%; postflop sin apuestas 71.20%; postflop enfrentando apuesta 62.57%.
- Por historial del jugador (sin perfil → con perfil): 0 manos 60.22 → 63.39; >500 manos 80.77 → 81.22. Los jugadores habituales son predecibles incluso sin perfil; el perfil añade alrededor de 1 punto en total.
- Calibración: la confianza media coincide con la exactitud real en todos los tramos (p. ej., 0.852 vs 0.851).

**Conclusión.** Sin las cartas privadas hay un techo cercano al 74%. Para superarlo hace falta un conjunto de datos donde las cartas sean visibles.

Figuras: `modelo3_distribuciones.png`, `modelo3_curvas_aprendizaje.png`, `modelo3_matriz_confusion.png`, `modelo3_ablacion.png`, `modelo3_curva_datos.png`, `modelo3_calibracion.png`.

---

## 5. Búsqueda de conjuntos de datos con cartas visibles

Criterios: No-Limit Texas Hold'em, cartas privadas conocidas, jugadores de élite (humanos o bots de nivel élite). No se filtró por licencia en la búsqueda.

**Única fuente utilizable encontrada: Pluribus.** 10,000 manos de las sesiones de 5 profesionales + Pluribus (Brown & Sandholm, *Science*, 2019), con todas las cartas visibles, publicadas en formato PHH en el repositorio `uoftcprg/phh-dataset` (licencia MIT).

**Otras fuentes encontradas, no utilizadas:**

| Fuente | Por qué no se usó |
| :--- | :--- |
| ACPC, registros de la competencia anual de bots 2009–2017 (~279 M manos, Zenodo DOI 10.5281/zenodo.17136841, CC BY 4.0) | Principalmente heads-up entre bots académicos de nivel variable, no humanos de élite; 20 GB |
| Hand2Note Live DB (+600,000 manos de transmisiones en vivo) | Comercial |
| SpinGPT (arXiv 2509.22387) | Datos disponibles solo bajo petición |
| Libratus, Claudico y las sesiones de Pluribus con 1 humano y 5 IA | No publicados |

**Fuentes descartadas:** HandHQ (cartas solo en el *showdown*); DeepStack (registros no públicos); Slumbot, ReBeL y AlphaHoldem (sin registros de manos publicados); conjuntos generados por modelos de lenguaje; PokerBench (decisiones de *solver*, no de jugadores); 83 manos de la WSOP (límite fijo y juegos mixtos).

---

## 6. Modelo 4: Pluribus con cartas visibles

**Datos.** 10,000 manos en 92 sesiones, mesas de 6 jugadores, ciegas 50/100 y stacks de 100 ciegas grandes. Participan 14 jugadores (Pluribus y 13 profesionales que se turnaron) → 91,356 decisiones (profesionales 76,187; Pluribus 15,169). Auditoría: 0 cartas ocultas de 60,000 repartidas.

**Variables (47).** 36 públicas (contexto, posición, historial, textura, indicador `es_pluribus`) + 9 de cartas propias (alta, baja, pareja, mismo palo, separación, clase, fuerza, proyectos de color y escalera) + 2 de equity del motor matemático (preflop y en la calle actual, Monte Carlo con `treys`, contra manos aleatorias).

**Diseño de validación.**
- Partición **por sesiones** (64 / 14 / 14 sesiones): train 61,641 · val 13,116 · test 16,599 decisiones. Ninguna sesión aparece en dos conjuntos.
- Validación cruzada de 5 rondas agrupada por sesión.
- 5 chequeos anti-fuga en 0, incluido que cada decisión solo usa las cartas que el jugador conocía.

**Resultados (test).**

| Modelo | Exactitud | Profesionales | Pluribus | F1-Macro | Log-loss |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Baseline 1: clase mayoritaria | 53.80% | 53.99% | 52.92% | 0.233 | 7.446 |
| Baseline 2: árbol prof. 3 (5 variables) | 69.25% | 69.67% | 67.21% | 0.485 | 0.679 |
| Referencia: Gradient Boosting (47 variables) | 87.20% | 87.50% | 85.70% | 0.836 | 0.285 |
| **Red neuronal MLP (47 variables)** | **87.39%** | **87.66%** | **86.06%** | **0.839** | **0.279** |

F1 por clase: *Fold* 0.951 · *Check/Call* 0.794 · *Bet/Raise* 0.773.

**Validación cruzada por sesiones (5 rondas).**

| Métrica | Media ± desviación |
| :--- | :---: |
| Exactitud global | 87.50% ± 0.25 |
| F1-Macro | 0.841 ± 0.004 |
| Preflop | 91.69% ± 0.26 |
| Flop | 79.87% ± 0.46 |
| Turn | 78.07% ± 1.11 |
| River | 77.37% ± 1.55 |

La preocupación inicial era que el river, con unas 1,000 decisiones por conjunto, diera métricas inestables. La validación cruzada muestra una dispersión de ±1.6 puntos: mayor que en el preflop, pero acotada.

**Ablación.**

| Variante | Exactitud |
| :--- | :---: |
| Sin cartas (solo contexto público) | 70.78% |
| Cartas sin equity del motor | 87.19% |
| Completo (cartas + equity) | 87.39% |

- Sin cartas, el modelo vuelve a un techo cercano al de HandHQ, con otros jugadores y otro sitio. Esto confirma la hipótesis del Modelo 3.
- La equity aporta poca exactitud porque la red ya deduce la fuerza de la mano a partir de las cartas. Su valor está en la interpretación y en unir la red con el motor matemático.

**Curva de sensibilidad a la equity.** Se tomaron 1,477 decisiones postflop frente a una apuesta (pot odds medianas de 25%) y se varió solo la equity:

| Equity | Fold | Call | Raise |
| :---: | :---: | :---: | :---: |
| 0% | 97.3% | 1.3% | 1.5% |
| 50% | 60.9% | 34.6% | 4.5% |
| 100% | 3.7% | 62.8% | 33.4% |

Con 50% de equity, el doble de las pot odds, la élite todavía se retira la mayoría de las veces. El motor mide la equity contra manos aleatorias, pero quien apuesta no tiene una mano aleatoria; los profesionales descuentan eso y la red lo aprendió. Esta diferencia entre "lo que dice la matemática" y "lo que hace la élite" es uno de los aportes didácticos de la aplicación.

**Calibración.** La confianza media de la red coincide con la exactitud real en todos los tramos.

**Comparación con la literatura.** Havoc (Shapira et al., AAMAS 2026), una LSTM entrenada sobre las mismas manos de Pluribus y que también usa probabilidad de ganar (1,000 simulaciones) en lugar de cartas crudas, reporta **80.27% – 86.77%** de exactitud por jugador (Tabla 1) y 98.1 / 81.3 / 64.7 para *Fold* / *Call* / *Raise* (Tabla 2). El Modelo 4 queda en el mismo rango con un MLP más simple. La configuración experimental no es idéntica, así que la comparación es orientativa.

**Limitaciones.**
- 10,000 manos de 14 jugadores en un único formato (mesas de 6, 100 ciegas grandes). El modelo aprende el estilo de esos jugadores.
- La equity se calcula contra manos aleatorias, no contra el rango probable del rival.
- El modelo predice qué haría la élite, no la jugada óptima.

Figuras: `modelo4_distribuciones.png`, `modelo4_curvas_aprendizaje.png`, `modelo4_matriz_confusion.png`, `modelo4_calibracion.png`, `modelo4_sensibilidad_equity.png`.

---

## 7. Motor matemático + red neuronal (Notebook 12)

El motor de equity Monte Carlo (`treys`) calcula las variables de cartas que recibe el Modelo 4, y la red cargada reproduce su exactitud en test (87.39%). Esto permite hacer preguntas del tipo "¿qué pasaría si tuviera otras cartas en la misma situación?".

**Ejemplo (situación real de test).** Flop Qh 3c Kh, apuesta de 2.5 BB a un bote de 7.5 BB (pot odds 25%), 1 rival:

| Cartas | Equity (motor) | Veredicto matemático | Fold | Check/Call | Bet/Raise |
| :--- | :---: | :--- | :---: | :---: | :---: |
| A♣ 6♥ (reales; el jugador se retiró) | 44.0% | Rentable pagar | 98.9% | 0.4% | 0.7% |
| A♠ A♥ | 87.7% | Rentable pagar | 0.1% | 66.6% | 33.3% |
| 7♦ 2♣ | 17.8% | No rentable | 99.9% | 0.0% | 0.1% |

**Lectura conjunta sobre todo el test** (1,477 decisiones postflop enfrentando una apuesta). Margen = equity del motor − pot odds:

| Margen (pp) | Decisiones | Fold real | Call real | Raise real | Fold según la red |
| :--- | :---: | :---: | :---: | :---: | :---: |
| < −20 | 11 | 100.0% | 0.0% | 0.0% | 99.3% |
| −20 a 0 | 117 | 96.6% | 1.7% | 1.7% | 95.1% |
| 0 a 20 | 362 | 81.8% | 13.0% | 5.2% | 80.5% |
| 20 a 40 | 435 | 49.7% | 43.4% | 6.9% | 51.4% |
| > 40 | 552 | 17.2% | 65.4% | 17.4% | 15.5% |

- Según el motor, pagar era rentable en el 91.3% de los casos, pero la élite se retiró en el 45.0% de ellos. Cuando no era rentable, se retiró en el 96.9%.
- La razón es que la equity se calcula contra manos aleatorias, y quien apuesta suele tener una mano más fuerte que el promedio.
- La red reproduce esas frecuencias por tramo: aprendió el "descuento" que aplican los profesionales.
- Para la aplicación, mostrar ambas lecturas enseña cuándo la élite coincide con la matemática y cuándo se aparta.

Figura: `motor_vs_elite.png`. Métricas: `motor_vs_elite.json`.

---

## 8. Lecciones para el informe

1. **Una exactitud muy alta es una señal de alerta.** El 92.9% del Modelo 1 venía de una fuga de información en la preparación de datos, no del modelo.
2. **La información limita más que la arquitectura.** En los Modelos 2, 3 y 4, la red y un modelo de árboles quedan empatados; lo que mueve la exactitud son las variables disponibles.
3. **Más datos no sustituyen a la información correcta.** 50 veces más decisiones sin cartas suman 0.7 puntos; con las mismas 10,000 manos de Pluribus, añadir las cartas suma 16.4.
4. **Validar como se va a usar.** Partición cronológica (Modelo 3) y por sesiones (Modelo 4), validación cruzada agrupada y chequeos anti-fuga explícitos.

---

## 9. Referencias

- Brown, N. & Sandholm, T. (2019). Superhuman AI for multiplayer poker. *Science*, 365(6456), 885–890.
- Shapira et al. (2026). Havoc [título completo por confirmar]. *Proceedings of AAMAS 2026*. https://ifaamas.org/Proceedings/aamas2026/pdfs/LRNX6318.pdf
- University of Toronto Computer Poker Research Group. *Poker Hand History (PHH) format* y repositorio `uoftcprg/phh-dataset`.
- Conjunto HandHQ: `takara-ai/poker_hands` (Hugging Face).
- Annual Computer Poker Competition (ACPC), registros 2009–2017. Zenodo, DOI 10.5281/zenodo.17136841.
