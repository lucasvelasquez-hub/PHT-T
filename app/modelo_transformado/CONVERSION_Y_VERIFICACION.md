# 🔄 Conversión del modelo y verificación

> Cómo se transformaron los modelos entrenados para que funcionen en el navegador, por qué se hizo y qué pruebas confirman que dan los mismos resultados que los originales.

**Estado:** ⏳ **Pendiente.** Este documento describe el plan. Las secciones de resultados se llenarán con cifras del notebook ejecutado; ninguna cifra se escribe a mano.

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
*Pendiente: se llenará con la salida del Notebook 13.*

| Modelo | Diferencia máxima | Coincidencia de acción | Exactitud Keras | Exactitud ONNX |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |

### 5.2 App (pruebas 5–8)
*Pendiente: se llenará con la salida de Vitest.*

### 5.3 Conclusión
*Pendiente.*
