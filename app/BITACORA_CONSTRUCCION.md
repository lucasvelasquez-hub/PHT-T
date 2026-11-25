# 📒 Next Chip · Bitácora de construcción

> Memoria de trabajo de la construcción. Cada agente lee **solo** la sección que le toca.
> Decisiones: `02_ARQUITECTURA_Y_DECISIONES_TECNICAS.md` (sección 7). Qué hace la app: `01_OBJETIVO_Y_FUNCIONAMIENTO.md`.

## Estado

| Etapa | Estado | Responsable | Salida |
|---|---|---|---|
| 1 · Base: Notebook 13 (ONNX, JSON, golden, banco real) | ✅ hecho y auditado | Sonnet (alto) | `app/modelo_transformado/` |
| 1b · Especificación de las 47 variables y el motor para TypeScript | ✅ hecho (sin verificar: la valida la prueba golden en la etapa 3) | Gemini | `app/docs/ESPEC_MOTOR_Y_VARIABLES.md` |
| ⛔ Revisión 1 con el usuario: cifras del Notebook 13 | pendiente | — | — |
| 2 · Dirección de diseño (impeccable) | pendiente | — | — |
| ⛔ Revisión 2 con el usuario: diseño | pendiente | — | — |
| 3 · Núcleo TS (evaluador, equity, variables, ONNX) + Vitest golden | pendiente | — | — |
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
