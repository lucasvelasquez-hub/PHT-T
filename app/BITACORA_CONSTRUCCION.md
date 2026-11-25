# 📒 Next Chip · Bitácora de construcción

> Memoria de trabajo de la construcción. Cada agente lee **solo** la sección que le toca.
> Decisiones: `02_ARQUITECTURA_Y_DECISIONES_TECNICAS.md` (sección 7). Qué hace la app: `01_OBJETIVO_Y_FUNCIONAMIENTO.md`.

## Estado

| Etapa | Estado | Responsable | Salida |
|---|---|---|---|
| 1 · Base: Notebook 13 (ONNX, JSON, golden, banco real) | ✅ hecho y auditado | Sonnet (alto) | `app/modelo_transformado/` |
| 1b · Especificación de las 47 variables y el motor para TypeScript | ✅ hecho (sin verificar: la valida la prueba golden en la etapa 3) | Gemini | `app/docs/ESPEC_MOTOR_Y_VARIABLES.md` |
| ⛔ Revisión 1 con el usuario: cifras del Notebook 13 | pendiente | — | — |
| 2 · Dirección de diseño (impeccable) | 🔄 prototipo en curso | Sonnet (alto) | `app/prototipo/mesa.html`, brief en `.impeccable/surfaces/app.md` |
| ⛔ Revisión 2 con el usuario: diseño | pendiente | — | — |
| 3 · Núcleo TS (evaluador, equity, variables, ONNX) + Vitest golden | ✅ hecho y auditado (27/27) | Sonnet (alto) | `app/src/motor/` |
| 4 · Módulo 3 con manos reales | pendiente | — | — |
| ⛔ Revisión 3 con el usuario: Módulo 3 funcionando | pendiente | — | — |
| 5 · Agente de prueba + publicación en Vercel | pendiente | — | — |
| 6 · Módulo 2 · 7 · "¿Y si...?" · 8 · Módulo 1 | pendiente | — | — |

## Reglas para todos los agentes

- Lenguaje: "lo que harían jugadores de élite". Nunca "jugada óptima", "correcta" ni GTO.
- No tocar `models/` ni `data/`. No subir `data/` ni archivos personales de la raíz.
- Ninguna pieza de TypeScript vale hasta que pasa la prueba contra `referencia_golden.json`.
- No hacer commit: lo hace el orquestador después de auditar.

## Registro

- 2026-11-25 · Arranque. Nombre: Next Chip. Protocolo en la sección 7 de `02_*`.
- 2026-11-25 · Especificación escrita por Gemini (781 líneas). Su sección 7 lista ambigüedades a revisar en la etapa 3.
- 2026-11-25 · Notebook 13 ejecutado sin errores. Pruebas 1–4 aprobadas en los 4 modelos (diferencia máx. ≤ 9.5e-7, 100 % de coincidencia; Modelo 4 = 87.39 %, confirmado por el orquestador por separado).
  - Datos para TS: `hand_key` = posición en `sorted(glob('data/raw/pluribus/*/*.phh'))`; las manos traen `archivo`. Tabla preflop: `tabla["J9s"]["2"]` (rivales = min(n_activos−1, 4), mínimo 1).
  - Ojo: los `variables_modelo3/4.json` originales listan `bote`, `to_call` y `stack` en `variables_log`, pero no son entradas; los `_preparacion.json` nuevos tienen solo las 7 reales. Usar siempre los `_preparacion.json`.
  - Escalar en float64 y luego pasar a float32. `get_rank_class` de treys 0.1.8 devuelve 0 para escalera real. `c_equity` postflop se compara con margen.
- 2026-11-25 · Dirección elegida por el usuario: **Mesa televisada** (estudio grafito, rótulos de transmisión, élite = cobalto). Contrato de dirección en `.impeccable/surfaces/app.md`. Ficha del producto: `PRODUCT.md`.
- 2026-11-25 · Motor TS listo (`app/src/motor/`, API en `index.ts`). Pruebas 5–8 aprobadas: 46,000 variables idénticas; evaluador 3,000/3,000; equity |z| máx 3.55; red diferencia máx 1.9e-6 y 1000/1000 acciones. Worker con onnxruntime-web probado en el build.
  - Correcciones a la spec de Gemini: no hay inversión de ciegas en heads-up en los notebooks (irrelevante: la mesa siempre empieza con 6); `c_clase` va de 0 a 9 (0 = escalera real) y preflop usa 10; no hay decisiones con stack 0.
  - Datos: un plugin de `vite.config.ts` sirve `/modelo_transformado/*` en dev y copia solo lo necesario a `dist/`. El wasm de onnxruntime (14.8 MB) no se precarga en la PWA.
  - Pendiente: `npm audit` marca 4 vulnerabilidades moderadas (revisar antes de publicar).
