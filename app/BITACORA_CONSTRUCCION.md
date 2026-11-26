# 📒 Next Chip · Bitácora de construcción

> Memoria de trabajo de la construcción. Cada agente lee **solo** la sección que le toca.
> Decisiones: `02_ARQUITECTURA_Y_DECISIONES_TECNICAS.md` (sección 7). Qué hace la app: `01_OBJETIVO_Y_FUNCIONAMIENTO.md`.

## Estado

| Etapa | Estado | Responsable | Salida |
|---|---|---|---|
| 1 · Base: Notebook 13 (ONNX, JSON, golden, banco real) | ✅ hecho y auditado | Sonnet (alto) | `app/modelo_transformado/` |
| 1b · Especificación de las 47 variables y el motor para TypeScript | ✅ hecho (sin verificar: la valida la prueba golden en la etapa 3) | Gemini | `app/docs/ESPEC_MOTOR_Y_VARIABLES.md` |
| ⛔ Revisión 1 con el usuario: cifras del Notebook 13 | pendiente | — | — |
| 2 · Dirección de diseño (impeccable) + pantalla de mesa en React | ✅ hecho (build y 29/29 pruebas) | Sonnet (alto) + orquestador (recursos) | `app/src/ui/`, `app/public/{assets,cartas,fonts}/`, comp `.impeccable/mocks/decision/comp-b.png` + `preview_cartas_fichas.png` |
| ⛔ Revisión 2 con el usuario: diseño | ✅ aprobada el 2026-11-25 ("se ve muy muy bien") | — | — |
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
- 2026-11-25 · El usuario rechazó el prototipo plano "Mesa televisada" (`app/prototipo/`, se conserva como antecedente): "no se ve como un juego de estudio". Se generaron 3 imágenes de referencia con Canva y eligió la **B** (mesa cinematográfica en perspectiva, paño verde, avatares). Desde ahora el diseño se construye contra ese comp: primero la imagen, después el código.
- 2026-11-25 (tarde) · Recursos gráficos listos (el orquestador los produjo; los agentes de UI no los editan):
  - **Mesas** `public/assets/mesa/mesa_{movil,escritorio}.webp`: Canva, exportadas a tamaño completo envolviendo la imagen en un diseño. Fondo de sala y lámpara desenfocados con máscara elíptica (pedido del usuario). Las originales nítidas están en `public/assets/originales_ia/`.
  - **Avatares** `public/assets/avatares/*.webp` (18, 512×512): 2 hojas 3×3 de Canva, recortadas con `scripts/recortar_avatares.sh`.
  - **Cartas**: mazo **Vectorized Playing Cards 3.2 de Chris Aguilar (LGPL 3.0)**, descargado de totalnonsense.com y guardado en `recursos/cartas_chris_aguilar/` (local, fuera de git, 76 MB). `scripts/acabado_cartas.sh` lo rasteriza a 640×894 con papel marfil, luz, fibra, canto y brillo, y genera `public/cartas/{clasico,cuatro_colores}/` y `dorso.webp` (el dorso se renderiza con Chrome sin ventana, por la fuente Barlow). Tarda unos 2,5 min. **La licencia exige mostrar el crédito**: ya está en Ajustes → Créditos (`LICENCIA.md`).
  - **Fichas** `public/assets/fichas/ficha_{1,5,10,25,50,100}.webp`: ChatGPT (hoja de sprites, fondo transparente), ver `ORIGEN.md`.
  - El usuario rechazó "SVG plano + retoques CSS" para las cartas ("Nada de mediocridad"): cartas y fichas deben verse como en el comp.
  - Distribución aprobada: tablero de 5 cartas arriba en el paño (≈170 px de ancho en la imagen de 1080), bote con pill debajo y héroe sobre el riel (`preview_cartas_fichas.png`). Caben justas: no agrandar las cartas del tablero.
- 2026-11-25 (tarde) · Pantalla de mesa construida en `src/ui/` (`PantallaMesa`, `mesa/*`, `datos/*`, `geometria.ts` coloca todo en coordenadas de la imagen). Ajustes: mazo de 4 colores y Créditos. Parámetros: `?mano=<key>&d=<idx>` (otra mano) y `?fuente=banco` (valores guardados). RAISE sube al mínimo legal (sin control de tamaño todavía).
  - **En vivo frente al banco** (mano 1687, MrBlue en el flop): las 46 variables deterministas son idénticas y la red coincide a 2e-4. La equity en vivo da **58.7 %** y el banco **61.7 %**: el banco usó un Monte Carlo corto (185/300, error ≈ ±3 puntos) y 200,000 simulaciones dan ≈59 %. Con esa diferencia, la élite pasa de Fold 69 % a **78 %**. Conclusión: la red es muy sensible a la equity (va al informe).
  - Detalles conocidos que el usuario decidió no corregir por ahora: en 360×640 los asientos de arriba se tapan con la pill de calle; el bote se arma con pilas "codiciosas" (13 BB = pocas pilas).
  - Mejoras posibles para después: cartas de índice grande para celular; figuras J/Q/K generadas con IA si hay cuota (ChatGPT ya probó un estilo que gustó: `public/assets/originales_ia/Qh_chatgpt.webp`).
- 2026-11-26 · Fase de jugabilidad. El usuario aprobó el curso y decidió: sin login (nombre o invitado, progreso en el navegador), portada y bienvenida en tono de juego, orden de módulos libre. Es una demostración para clase: sin respaldo descargable ni aviso de dinero real. Se instalaron en el proyecto las skills game-feel, card-game, game-ui-ux, audio-design, game-docs y gamification-loops. Documento de diseño del juego: `docs/GDD.md`, con notas de mano completa, Retador y progreso en `docs/features/`. Pendiente: aprobación del usuario.
- 2026-11-26 · GDD aprobado; todo en español. Portada: el usuario eligió la opción B de Gemini (ficha cobalto "NC" de canto). Fondo móvil en `public/assets/portada/portada_movil.webp`; los textos y el botón irán en código. Prompts en `public/assets/PROMPTS.md`.
- 2026-11-26 · Fase de jugabilidad, en modo desatendido. Contratos en `docs/CONTRATOS_JUGABILIDAD.md`. Frentes en paralelo (Sonnet): Juego (mano completa, esfuerzo alto), App (estructura, portada, bienvenida, inicio, progreso y sonido; alto), Curso (lector del contenido; medio), Contenido M00–M06 y M07–M12 (casos y evaluaciones; alto) y Recursos (imágenes de Gemini y sonidos de Kenney; medio). Siguen: Retador, Instructor y Analista, una vez auditada la fase 1.
- 2026-11-26 · Fase 1 auditada (85/85 pruebas, build bien) y subida en el commit 879dcdd. Validación del curso: 66 lecciones, 70 casos y 101 preguntas sin errores. Pendiente del usuario: la portada de PC y las 3 ilustraciones de bienvenida, porque Chrome bloquea las descargas repetidas desde Gemini. Fase 2 en curso: Retador, Instructor y Analista (Sonnet, esfuerzo alto, en paralelo).
- 2026-11-26 · Fase 2 auditada (165/165 pruebas, build bien) y subida en el commit f74537c: Retador, Instructor y Analista, más los modos de la mesa para los casos. Agente de prueba integral en curso (solo revisa y reporta).
- 2026-11-26 · Prueba integral: sin bloqueantes. Corregidos: PWA instalable (íconos de la ficha NC), favicon, carga diferida (chunk principal de 727 a 247 kB), motor precalentado y Worker compartido (primera lectura de la mano guiada de ~5.5 a ~2 s), restos de la mano guiada, aria-labels y ids internos del Instructor, y la ruta de la lección al recargar. 168/168 pruebas y build bien. Pendiente del usuario: la portada de PC y las 3 ilustraciones de bienvenida; publicar en Vercel. Las lecciones aprobadas usan "correcto" 5 veces (M02_L06, M04_L02, M04_L05, M06_L01, M11_L01), y no describen la app.
