# 🃏 PHT-T: Poker Hold'em Texas Tutor
### Entrenador Inteligente de Texas Hold'em mediante Redes Neuronales
**Curso:** Machine Learning • **Stack:** Python 3.12, TensorFlow/Keras 3, Scikit-Learn, Pandas, PyArrow, treys

---

## 📌 1. Planteamiento del Problema
El objetivo es construir un entrenador interactivo de **No-Limit Texas Hold'em** que muestre, para cualquier situación de juego, **qué harían jugadores de élite** (`Fold`, `Check/Call`, `Bet/Raise`) y lo compare con lo que dice la matemática.

El sistema une dos piezas:
1. **Red neuronal (supervisada):** aprende la distribución de probabilidad de las acciones de jugadores de élite a partir del contexto de la mesa y de las cartas del jugador.
2. **Motor matemático:** calcula la *equity* (probabilidad de ganar) mediante simulación Monte Carlo. Su resultado es también una variable de entrada de la red.

---

## 📊 2. Evolución del Modelo (4 versiones)
El proyecto se presenta como una investigación en cuatro etapas. Cada versión está guardada en `models/` y marcada con un *tag* de git.

| Versión | Datos | Variables | Exactitud (Test) | F1-Macro | Estado |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Modelo 1** · `v1-con-fuga` | HandHQ, 60,000 manos | 5 públicas | 92.90% | 0.910 | ❌ Inflado por fuga de información |
| **Modelo 2** · `v2-corregido` | HandHQ, 60,000 manos | 5 públicas | 64.86% | 0.531 | ✅ Fuga corregida |
| **Modelo 3** · `v3-45-variables` | HandHQ, 440,249 manos | 44 públicas | 73.83% | 0.630 | ✅ Techo sin cartas privadas |
| **Modelo 4** · `v4-pluribus` | Pluribus, 10,000 manos con cartas | 47 (contexto + cartas + equity) | **87.39%** | **0.839** | ✅ Modelo final |

### Hallazgos principales
* **Modelo 1 → 2:** el 92.9% venía de una **fuga de información**: el bote se registraba *después* de la acción en *Check/Call* y *Bet/Raise*, y *antes* en *Fold*. Al corregirlo, la exactitud real fue 64.9%, empatada con un árbol simple.
* **Modelo 3:** con 44 variables públicas, partición cronológica y 3.77 millones de decisiones, la red llega a 73.8%. La curva de aprendizaje es plana (50,000 decisiones → 73.1%; 2.58 millones → 73.8%): **sin las cartas privadas hay un techo cercano al 74%**.
* **Modelo 4:** con las manos de Pluribus (Brown & Sandholm, *Science* 2019), donde todas las cartas son visibles, la red alcanza **87.39%** en test y **87.50% ± 0.25** en validación cruzada por sesiones. Sin las variables de cartas cae a 70.8%. El resultado está en el rango publicado por Havoc (AAMAS 2026) sobre los mismos datos: 80.3–86.8% por jugador.

### Modelo 4 por calle (validación cruzada, 5 rondas)
| Preflop | Flop | Turn | River |
| :---: | :---: | :---: | :---: |
| 91.69% ± 0.26 | 79.87% ± 0.46 | 78.07% ± 1.11 | 77.37% ± 1.55 |

El detalle completo (evidencias de la fuga, ablaciones, calibración, sensibilidad a la equity y búsqueda de otros conjuntos de datos) está en [`informe/resultados_experimentos.md`](informe/resultados_experimentos.md).

---

## 📂 3. Estructura del Repositorio
| Notebook | Modelo | Contenido |
| :--- | :---: | :--- |
| `01_auditoria_dataset` | — | Descarga del shard de HandHQ (`takara-ai/poker_hands`) y auditoría de las 440,249 manos |
| `02_m1_reconstruccion_con_fuga` | 1 | Reconstrucción original, con la fuga de información (se conserva para documentar el error) |
| `03_m1_baselines` | 1 | Baselines originales |
| `04_m1_entrenamiento` | 1 | Entrenamiento original: 92.90% inflado |
| `05_m2_reconstruccion_corregida` | 2 | Reconstrucción corregida (foto de la mesa *antes* de actuar) |
| `06_m2_baselines` | 2 | Baselines con los datos corregidos |
| `07_m2_entrenamiento` | 2 | Entrenamiento del Modelo 2: 64.86% |
| `08_m3_reconstruccion` | 3 | 44 variables públicas, perfil del jugador, partición cronológica |
| `09_m3_entrenamiento` | 3 | Entrenamiento, ablación y curva de datos: 73.83% |
| `10_m4_reconstruccion_pluribus` | 4 | Descarga de las manos de Pluribus, variables de cartas y equity |
| `11_m4_entrenamiento` | 4 | Entrenamiento, validación cruzada por sesiones y sensibilidad: 87.39% |
| `12_motor_matematico_equity` | 4 | Motor de equity Monte Carlo (`treys`) integrado con el Modelo 4 y lectura conjunta |

* **`models/v1_con_fuga/` … `models/v4_pluribus/`**: red entrenada, escalador y lista de variables de cada versión.
* **`informe/`**: borrador de resultados, figuras (`figuras/`) y métricas en JSON (`metricas/`).
* **`data/`** (no se sube al repositorio): los notebooks 01 y 10 descargan los datos automáticamente.

---

## 🚀 4. Próximos Pasos
* [x] Auditoría y preparación de los datos.
* [x] Detección y corrección de la fuga de información.
* [x] Motor matemático de equity.
* [x] Modelo final con cartas visibles (Pluribus) y validación cruzada.
* [ ] Interfaz interactiva con **Streamlit** (*Analizar*, *Practicar*, *Aprender*), con comparación de los 4 modelos y lectura conjunta red + motor.
* [ ] Informe académico final.
