# # 🃏 PHT-T: Poker Hold'em Texas Tutor
### Entrenador Inteligente de Texas Hold'em mediante Redes Neuronales
**Curso:** Machine Learning • **Horizonte:** 3 semanas • **Stack:** Python 3.12, TensorFlow/Keras 3, Scikit-Learn, Pandas, PyArrow

---

## 📌 1. Planteamiento del Problema y Enfoque Metodológico
El objetivo del proyecto es construir un entrenador interactivo de **No-Limit Texas Hold'em (NLHE)** capaz de modelar patrones humanos de toma de decisiones a partir de historiales de manos reales.

El proyecto mantiene una estricta **separación conceptual** (según las mejores prácticas de la industria):
1. **Modelo Neuronal (Supervisado):** Aprende la distribución de probabilidad de las acciones humanas (`Fold`, `Check/Call`, `Bet/Raise`) a partir del estado contextual público de la mesa (calle, tamaño del bote, apuesta a enfrentar, stack efectivo y pot odds).
2. **Motor Matemático (Independiente):** Calcula de forma exacta y mediante simulación Monte Carlo la fuerza de la mano, proyectos (*outs*) y probabilidad de victoria (*equity*) a partir de las cartas privadas del usuario.

---

## 📊 2. Resultados Académicos y Comparativa con Baselines
El modelo neuronal fue evaluado en un conjunto de prueba cerrado (*Test Set*) de **56.362 decisiones** procedentes de **9.000 partidas completas** que el modelo jamás vio durante el entrenamiento (partición agrupada por `hand_id` para garantizar **cero fuga de información**):

| Enfoque / Modelo | Accuracy (Test) | $F_1$-Score Macro | Justificación / Rol en el Proyecto |
| :--- | :---: | :---: | :--- |
| **Baseline 1: Clase Mayoritaria (*Fold*)** | 48.10% | 0.217 | Piso mínimo absoluto (predecir a ciegas la acción más común). |
| **Baseline 2: Árbol de Reglas Simples (Prof. 3)** | 72.21% | 0.662 | Sentido común básico: pasar si es gratis, retirarse si cobran. |
| **🎯 Red Neuronal MLP (TensorFlow / Keras 3)** | **92.90%** | **0.910** | **Captura no lineal del 28% de decisiones complejas (agresiones y pot-commitment).** |

### Métricas Detalladas por Jugada en el Examen Final (Test):
* **Retirarse (*Fold*):** Precision 98.5% | Recall 99.9% | $F_1$-Score: **0.992**
* **Pasar / Igualar (*Check/Call*):** Precision 88.8% | Recall 85.7% | $F_1$-Score: **0.872**
* **Apostar / Subir (*Bet/Raise*):** Precision 86.1% | Recall 87.3% | $F_1$-Score: **0.867**

---

## 📂 3. Estructura del Repositorio y Cuadernos
* **`notebooks/01_auditoria_dataset.ipynb`**: Descarga del shard Parquet desde Hugging Face (`takara-ai/poker_hands`), filtrado de 440.249 partidas de No-Limit Hold'em y auditoría de disponibilidad de cartas privadas.
* **`notebooks/02_reconstruccion_decisiones.ipynb`**: Máquina de estados que reconstruye momentos individuales de decisión ($X, y$), prevención de *Data Leakage* y partición 70/15/15 por `hand_id`.
* **`notebooks/03_modelo_baseline.ipynb`**: Implementación formal de los baselines de comparación y justificación metodológica del valor del Deep Learning.
* **`notebooks/04_entrenamiento_red_neuronal.ipynb`**: Arquitectura piramidal MLP (128 ➔ 64 ➔ 32 ➔ 3), curvas de aprendizaje, matrices de confusión y guardado del modelo en formato `.keras`.
* **`models/final/`**: Pesos de la red neuronal entrenada y escalador matemático (*StandardScaler*) para inferencia en producción.
* **`plan_de_trabajo.html`**: Hoja de ruta interactiva con las 7 fases del proyecto.

---

## 🚀 4. Próximos Pasos (Fases 6 y 7)
* [x] Auditoría y preparación del dataset supervisado.
* [x] Entrenamiento y validación del modelo neuronal con >92% de exactitud.
* [ ] Implementación del motor matemático de probabilidades (*Equity* y combinatoria).
* [ ] Desarrollo de la interfaz interactiva local con **Streamlit** (Módulos: *Aprender*, *Practicar*, *Analizar*).
