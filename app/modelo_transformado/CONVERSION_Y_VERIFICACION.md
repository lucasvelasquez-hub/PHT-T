# 🔄 Conversión del modelo y verificación

> Cómo se transformaron los modelos entrenados para que funcionen en el navegador, por qué se hizo y qué pruebas confirman que dan los mismos resultados que los originales.

**Estado:** ✅ **Pruebas 1 a 4 hechas** con el Notebook 13 (conversión de los 4 modelos aprobada). Las pruebas 5 a 8 (la app) siguen pendientes. Las cifras vienen del notebook ejecutado; ninguna se escribe a mano.

---

## 1. Por qué se transformó

- Los modelos se entrenaron en Python con Keras y están guardados en formato `.keras`, que solo Python puede abrir.
- La app corre **en el navegador del usuario**, sin servidor, para tener diseño libre, publicación gratuita y respuesta instantánea.
- El navegador no ejecuta Keras. El modelo se pasa a **ONNX**, un formato estándar que el navegador ejecuta con `onnxruntime-web`.
- Los modelos originales de `models/` **no se modifican**. Esta carpeta guarda solo las copias convertidas.

## 2. Qué se convierte

| Modelo | Origen | Destino (esta carpeta) |
|---|---|---|
| 1 · con fuga | `models/v1_con_fuga/` | `modelo1.onnx`, `modelo1_preparacion.json` |
| 2 · corregido | `models/v2_corregido/` | `modelo2.onnx`, `modelo2_preparacion.json` |
| 3 · 44 variables | `models/v3_45_variables/` | `modelo3.onnx`, `modelo3_preparacion.json` |
| 4 · Pluribus | `models/v4_pluribus/` | `modelo4.onnx`, `modelo4_preparacion.json` |
| Tabla de equity preflop | Notebook 12 | `equity_preflop_169.json` |
| Archivo de referencia | Test del Modelo 4 | `referencia_golden.json` |

Cada archivo `_preparacion.json` contiene:
- La lista y el orden de las variables.
- Las variables con `log1p`.
- El promedio y la escala del escalador.
- El orden de las salidas (Fold, Check/Call, Bet/Raise).

## 3. Cómo se convierte (plan)

Todo se hace en el notebook `notebooks/13_exportar_app.ipynb`, con el estilo de los anteriores:

1. Cargar cada modelo `.keras` y su escalador.
2. Exportar a ONNX: primero con `model.export(..., format="onnx")` de Keras 3; si falla, pasar por SavedModel y `tf2onnx`.
3. En la conversión, Dropout queda desactivado y BatchNormalization usa sus valores aprendidos, como en cualquier predicción normal.
4. Exportar los escaladores y las listas de variables a JSON.
5. Ejecutar las pruebas de la sección 4 y guardar el reporte.

## 4. Pruebas de verificación (plan)

| # | Prueba | Con qué datos | Criterio de aprobación |
|---|---|---|---|
| 1 | Probabilidades ONNX vs Keras | Test completo de cada modelo (Modelo 4: 16,599 decisiones) | Diferencia máxima ≤ 1e-5 |
| 2 | Acción elegida ONNX vs Keras | Mismo test | 100 % de coincidencia |
| 3 | Exactitud recalculada con ONNX | Mismo test | Igual a la del notebook de entrenamiento (Modelo 4: 87.39 %) |
| 4 | Escalador en JSON vs `.pkl` | Test completo | Diferencia máxima ≤ 1e-6 |
| 5 | Variables calculadas por la app vs Python | `referencia_golden.json` | Iguales en todas las situaciones |
| 6 | Evaluador de manos de la app vs treys | Manos de prueba | 100 % de coincidencia |
| 7 | Equity de la app vs Python | Situaciones de referencia | Dentro del margen esperado del Monte Carlo |
| 8 | Predicción final de la app vs Python | `referencia_golden.json` | Diferencia máxima ≤ 1e-5 |

- Las pruebas 1 a 4 verifican la conversión y se hacen en Python.
- Las pruebas 5 a 8 verifican la app y se hacen con Vitest cuando exista el código.

## 5. Reporte de resultados

### 5.1 Conversión (pruebas 1–4)
Cifras impresas por `notebooks/13_exportar_app.ipynb` sobre el test completo de cada modelo (ONNX opset 17, ejecutado con onnxruntime; criterios: diferencia ≤ 1e-5, coincidencia 100 %, escalador ≤ 1e-6).

| Modelo | Decisiones de test | Diferencia máxima | Coincidencia de acción | Exactitud Keras | Exactitud ONNX | Escalador JSON vs .pkl |
|---|---|---|---|---|---|---|
| 1 | 56,362 | 9.54e-07 | 100.00 % | 92.90 % | 92.90 % | 0.00e+00 |
| 2 | 56,362 | 4.47e-07 | 100.00 % | 64.86 % | 64.86 % | 0.00e+00 |
| 3 | 593,212 | 2.68e-07 | 100.00 % | 73.83 % | 73.83 % | 0.00e+00 |
| 4 | 16,599 | 8.05e-07 | 100.00 % | 87.39 % | 87.39 % | 0.00e+00 |

- Método: `model.export(..., format="onnx", opset_version=17)` de Keras 3.15 (usa `tf2onnx` 1.17.0, instalado sin dependencias para no tocar numpy ni protobuf). Entrada `Entrada_Variables`, salida `Identity:0`.
- Informativo: escalando en float32 como sklearn, la diferencia con el cálculo en float64 llega a 1.91e-06 (Modelo 3) y 3.81e-06 (Modelo 4); con el escalado del JSON las probabilidades quedan a ≤ 1.25e-06 de Keras.
- Verificación del archivo de referencia: las 47,000 variables de `referencia_golden.json` (1,000 situaciones) son idénticas al parquet de test, y las 46 variables sin Monte Carlo de las 16,599 decisiones se reproducen exactamente reconstruyendo las manos desde los archivos PHH.

### 5.2 App (pruebas 5–8)
*Pendiente: se llenará con la salida de Vitest.*

### 5.3 Conclusión
*Pendiente.*
