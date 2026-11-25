# 🔄 Conversión del modelo y verificación

> Cómo se transformaron los modelos entrenados para que funcionen en el navegador, por qué se hizo y qué pruebas confirman que dan los mismos resultados que los originales.

**Estado:** ✅ **Pruebas 1 a 8 aprobadas.** Las pruebas 1 a 4 (conversión) salen del Notebook 13 y las 5 a 8 (app) de Vitest (`npm test` en `app/`). Ninguna cifra se escribe a mano.

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
Cifras impresas por Vitest sobre el motor TypeScript de `app/src/motor/` (generado con `npm run informe` en `app/`; ninguna cifra se escribe a mano). Resultado de Vitest: **27 pruebas aprobadas en 6 archivos**. Versiones: vitest 5.1.0, onnxruntime-web 1.31.1, onnxruntime-node 1.31.1.

| # | Prueba | Criterio | Resultado |
|---|---|---|---|
| 5 | Variables: golden (1,000 situaciones) | 46 variables idénticas; c_equity preflop idéntica; c_equity postflop dentro de ±4 errores estándar | situaciones=1000<br>manos=676<br>variables deterministas comparadas=46000 (46 por situación)<br>diferencias=0<br>c_equity preflop idéntica 250/250<br>c_equity postflop (MC): n=750, \|z\| máx=3.81, z medio=0.012, z² medio=0.95 (esperado ≈ 1; TS 4000 sims vs Python 150)<br>8.4 s |
| 5 | Variables: banco de manos reales | 46 variables en todas las decisiones (tolerancia: redondeo del banco a 5 decimales) | manos=1849<br>decisiones=16599 (esperadas 16599)<br>diferencia máxima en las 46 variables=5.00e-6 (mano 2486 dec 6 call_vs_bote; límite 5e-6 por el redondeo del banco)<br>problemas=0<br>0.3 s |
| 6 | Evaluador vs treys (3,000 manos) | Puntaje y clase 100 % iguales | manos=3000 (por nº de cartas {"5":1000,"6":1000,"7":1000})<br>puntajes distintos=0<br>clases distintas=0 |
| 7 | Equity vs Python (200 situaciones) | \|equity_ts − equity_py\| ≤ 4 × √(ee_py² + ee_ts²) en todas | situaciones=200<br>simulaciones TS=20000 (Python 20000)<br>\|z\| máximo=3.546<br>\|z\| promedio=0.711 (esperado ≈ 0.8)<br>z medio con signo=-0.116<br>calle 0: 2.38<br>calle 1: 1.90<br>calle 2: 3.55<br>calle 3: 1.76<br>fuera de ±4: 0<br>20.8 s |
| 8 | Predicción final vs Keras (onnxruntime-node) | Diferencia ≤ 1e-5 y misma acción en el 100 % | onnxruntime-node<br>situaciones=1000<br>diferencia máxima de probabilidad vs Keras=1.88e-6 (criterio ≤ 1e-5)<br>diferencia media=1.31e-7<br>misma acción 1000/1000 (100.00 %)<br>informativo: vector preparado TS vs Python máx=7.15e-6<br>inferencia del lote: 43 ms |
| 8 | Predicción final vs Keras (onnxruntime-web, wasm) | Diferencia ≤ 1e-5 y misma acción en el 100 % | onnxruntime-web (wasm)<br>situaciones=1000<br>diferencia máxima de probabilidad vs Keras=1.79e-6 (criterio ≤ 1e-5)<br>diferencia media=1.36e-7<br>misma acción 1000/1000 (100.00 %)<br>informativo: vector preparado TS vs Python máx=7.15e-6<br>inferencia del lote: 26 ms |
| extra | Turnos y calles contra manos reales | El turno y el reparto de calle del motor coinciden con el PHH | manos=2525<br>decisiones=24172<br>turno distinto al del PHH=0<br>reparto de calle fuera de lugar=0<br>manos que no terminan donde deben=0<br>subidas reales=4997, fuera del rango legal calculado=0 |
| extra | Manos generadas con acciones legales | Fichas conservadas; mismas 47 variables en vivo que al reconstruir el PHH | manos aleatorias=400<br>decisiones=5176<br>con algún jugador all-in al final=392<br>llegaron a showdown=394<br>problemas=0 |
| extra | Servicio del Worker (analizar) | Variables + equity + red + lectura conjunta | analizar → equity=49.5 %<br>pot_odds=0<br>red={"fold":1.4276947979396937e-7,"call":0.5637437701225281,"raise":0.4362560212612152}<br>lectura=sin_apuesta |

- La prueba 5 parte de los datos CRUDOS de cada mano (acciones PHH, stacks, ciegas y cartas), recalcula las variables con el motor TypeScript y las compara con las que calculó Python (golden = parquet de test, verificado en el Notebook 13).
- `c_equity` postflop es Monte Carlo (150 simulaciones en Python, más en TypeScript): se compara dentro del margen estadístico; no se reproduce bit a bit.
- La prueba 8 se corre con el mismo `modelo4.onnx` en dos entornos: onnxruntime-node (CPU) y onnxruntime-web (wasm, el que usa el navegador).

### 5.3 Conclusión
*Pendiente.*
