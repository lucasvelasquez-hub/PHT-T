# 🏗️ PHT-T · Arquitectura y decisiones técnicas

> Cómo está construida la app y por qué. El objetivo y los módulos están en `01_OBJETIVO_Y_FUNCIONAMIENTO.md`.

**Última actualización:** 25 de noviembre de 2026
**Prioridades:** calidad, desempeño y estabilidad.

---

## 1. Decisión principal: todo corre en el navegador

| Opción evaluada | Resultado |
|---|---|
| Streamlit (todo en Python) | ❌ Descartada. Venía del documento teórico inicial "por rapidez", pero el aspecto es genérico y da poco control del diseño. |
| Interfaz a medida + servidor Python (por ejemplo en Hugging Face Spaces) | ❌ Descartada. Son dos piezas que mantener, y el servicio gratuito se suspende si nadie lo usa, así que la primera visita tarda en despertarlo. |
| **App web que corre en el navegador** | ✅ **Elegida.** Diseño libre, gratis sin límite de tiempo, respuesta instantánea, sin servidor que mantener. |

**Por qué es posible:** Python solo hizo falta para entrenar. El Modelo 4 ya entrenado es una red pequeña (47 → 256 → 128 → 64 → 3, con BatchNormalization y Dropout) de unos 700 KB, y calcular una predicción es multiplicar números, cosa que hace cualquier navegador.

**El riesgo y cómo se controla:** el cálculo de las 47 variables y el motor de equity se reescriben en otro lenguaje. Cualquier diferencia con Python cambia las predicciones sin avisar. Por eso **ninguna pieza se da por buena hasta que pasa la prueba de comparación con Python** (sección 5).

## 2. Conversión del modelo: ONNX

| | **ONNX + onnxruntime-web** ✅ | TensorFlow.js |
|---|---|---|
| Mantenimiento | Microsoft, desarrollo muy activo | Google, cada vez menos actualizaciones |
| Compatibilidad con Keras 3 | Buena, con una conversión intermedia | El convertidor tiene problemas conocidos con Keras 3 |
| Velocidad | Muy alta (WebAssembly, WebGPU) | Buena |
| Estabilidad | Estándar de la industria para producción | Funciona, con más casos raros |

- Se convierten **los 4 modelos**, porque la app los compara.
- Los modelos entrenados de `models/` **no se tocan**. Los convertidos viven en `app/modelo_transformado/`.
- Proceso y reporte de verificación: `app/modelo_transformado/CONVERSION_Y_VERIFICACION.md`.

## 3. Etapas del sistema

### Etapa A · Preparación en Python (una sola vez, en el PC)
1. Convertir los 4 modelos a ONNX.
2. Exportar a JSON:
   - Los escaladores (promedio y desviación por variable).
   - Las listas de variables y las variables con transformación logarítmica (`variables_log`).
   - La tabla de equity preflop de las 169 manos.
3. Crear el **banco de manos**:
   - Manos reales del test de Pluribus (licencia MIT).
   - Manos generadas, con predicciones y equity ya calculadas.
   - Cada mano marcada como "real" o "generada".
4. Crear el **archivo de referencia** (`golden`): unas 1,000 situaciones con las variables, la equity y las probabilidades exactas de Python. Es contra lo que se mide la app.

> Siguiendo las reglas del proyecto, esta etapa se hace en un notebook nuevo con el estilo de los anteriores. Propuesta: `13_exportar_app.ipynb`.

### Etapa B · La app (en el navegador del usuario)

| Pieza | Herramienta | Notas |
|---|---|---|
| Estructura | **React + Vite + TypeScript** | TypeScript revisa los errores antes de ejecutar |
| Estilos y diseño adaptable | **Tailwind CSS** | Mesa horizontal en PC, vertical en celular |
| Animaciones de interfaz | **Motion** | Paneles, botones, transiciones |
| Coreografía del reparto y las fichas | **GSAP** | Secuencias: reparto, volteo, fichas al bote |
| Reglas del póker | Código propio | Turnos, apuestas, bote, acciones legales |
| Evaluador de manos | Traducción del algoritmo de **treys** | Debe dar **exactamente** lo mismo que el Notebook 12 |
| Equity (Monte Carlo) | Código propio, en un **Web Worker** | Segundo plano: la pantalla nunca se congela |
| 47 variables del Modelo 4 | Traducción de la lógica del Notebook 10 | Pieza más delicada; se prueba variable por variable |
| Predicción de la red | **onnxruntime-web**, en el Web Worker | Carga los modelos desde `app/modelo_transformado/` |
| Generador de manos | Código propio | Los rivales eligen cada acción según las probabilidades del Modelo 4 |
| Contenido del Instructor | Archivos `.md` de `app/contenido_modulo1/` | Se leen al construir la app |
| Puntajes y preferencias | Almacenamiento del navegador | Sin cuentas ni servidor |
| Instalable en el celular | **vite-plugin-pwa** | |

### Etapa C · Control de calidad

| Prueba | Herramienta | Criterio |
|---|---|---|
| Red convertida = red original | Python + onnxruntime | Diferencia máxima en probabilidades ≤ 1e-5 y misma acción elegida en el 100 % de los casos |
| Variables de la app = variables de Python | **Vitest** contra el archivo de referencia | Iguales en todas las situaciones |
| Evaluador de manos = treys | Vitest | Mismo resultado en todas las manos de prueba |
| Equity de la app ≈ equity de Python | Vitest | Dentro del margen esperado del Monte Carlo |
| Diseño en celular y PC | **Playwright** | Capturas en varios tamaños, revisadas una por una |
| Calidad de animaciones y accesibilidad | Skills de revisión (sección 6) | Sin hallazgos graves antes de publicar |

### Etapa D · Publicación

- **Puente GitHub → Vercel:** cada push a `main` publica la versión nueva sola, y cada rama o PR recibe un enlace de prueba.
- **Configuración en Vercel:**
  - Root Directory = `app`.
  - Publicar solo cuando cambie algo dentro de `app/`, para que los cambios en notebooks o en el informe no generen publicaciones.
- La cuenta de Vercel debe estar vinculada a `lucasvelasquez-hub`.
- Todo lo que la app necesita debe estar dentro de `app/`, porque `data/` no se sube a GitHub. Son pocos MB.

## 4. Estructura de carpetas

```
PHT-T/
└── app/
    ├── 01_OBJETIVO_Y_FUNCIONAMIENTO.md
    ├── 02_ARQUITECTURA_Y_DECISIONES_TECNICAS.md    (este archivo)
    ├── contenido_modulo1/
    │   ├── REQUISITOS_CONTENIDO_MODULO1.md          requisitos del contenido del Instructor
    │   └── (unidades .md que traerá el usuario)
    ├── modelo_transformado/
    │   ├── CONVERSION_Y_VERIFICACION.md             cómo, por qué y reporte de pruebas
    │   └── (modelos .onnx y archivos .json)
    └── (código de la app: se creará al construir; estructura de Vite)
```

## 5. Datos que usa la red (recordatorio)

- **47 variables:**
  - 36 públicas: contexto, posición, historial de apuestas, textura de la mesa y `es_pluribus`.
  - 9 de las cartas propias.
  - 2 de equity: `c_eq_pre` y `c_equity`.
- **Preparación de las variables:**
  1. `log1p` a las variables de `variables_log` (recortadas en 0).
  2. El escalador del Modelo 4.
  3. Salida en el orden Fold, Check/Call, Bet/Raise.
- **Equity:** contra `min(jugadores_activos − 1, 4)` rivales aleatorios.
  - Preflop: tabla de las 169 manos con 3,000 simulaciones.
  - Postflop: 150 simulaciones en el entrenamiento y 1,000 en el Notebook 12. La app usará 1,000 o más.
- **Fuentes de verdad:**
  - Notebook 10: `reconstruir_decisiones_v4`, `variables_cartas`, `textura_mesa`.
  - Notebook 12: `entrenador_inteligente`.
- **`es_pluribus`:** para jugadores generados se usará un valor fijo (por definir: 0 = estilo de los profesionales humanos).

## 6. Skills de apoyo instaladas

| Skill | Alcance | Uso en el proyecto |
|---|---|---|
| impeccable | Global | **Directora del diseño**: dirección visual, crítica y pulido |
| emil-design-eng, design-motion-principles, better-typography | Global | Sensación de calidad, movimiento y tipografía |
| audit-suite (accesibilidad, rendimiento, experiencia de uso) | Global | Auditorías antes de publicar |
| gsap-core, gsap-timeline, gsap-react, gsap-performance | Esta carpeta | Coreografía del reparto y las fichas |
| review-animations, improve-animations, apple-design | Esta carpeta | Revisar y pulir animaciones |
| playwright-cli | Esta carpeta | Capturas y pruebas en celular y PC. Falta instalar la herramienta `playwright-cli` |

Para el diseño hay **una sola directora (impeccable)**, porque varias skills de diseño a la vez se contradicen. `ui-ux-pro-max`, `card-game` y `game-ui-ux` se evaluaron y se descartaron.

## 7. Registro de decisiones

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-11-25 | App en el navegador, sin servidor | Diseño libre, gratis, rápida y sin mantenimiento |
| 2026-11-25 | ONNX + onnxruntime-web | Más estable, rápido y mantenido que TensorFlow.js |
| 2026-11-25 | Generador que juega la mano completa, con rivales del Modelo 4 | Evita situaciones imposibles y produce manos realistas |
| 2026-11-25 | Banco de manos como complemento del generador | Revisado en Python, organizable y con carga instantánea |
| 2026-11-25 | Puntaje = coincidencia con la élite (proporcional) | La red da probabilidades, no una "respuesta correcta" |
| 2026-11-25 | App en `app/` del mismo repositorio | Mantiene unidos el proyecto académico y la app |
| 2026-11-25 | Publicación con el puente GitHub → Vercel | Publicación automática, enlaces de prueba y vuelta atrás fácil |
| 2026-11-25 | Orden: base → diseño → Módulo 3 → Módulo 2 → "¿y si...?" → Módulo 1 | La base asegura el rigor y el Módulo 3 prueba toda la cadena |
| 2026-11-25 | Skills instaladas solo en este proyecto (`.claude/skills/`) | Decisión del usuario; las globales se dejan como están |
| 2026-11-25 | Se versionan `app/` y `skills-lock.json`; `.claude/skills/` y `.impeccable/` quedan fuera de git | Los documentos son de la app. Las skills se reinstalan desde el registro, y `.impeccable/` es configuración local |
| 2026-11-25 | El README cuenta la evolución del proyecto: plan inicial → decisión actual → por qué | Mostrar el proceso, no solo el resultado |
| 2026-11-25 | Nombre visible de la app: **Next Chip** | Corto, juguetón y con lenguaje de póker. Se descartaron "Leak/Fuga" (solo lo entenderían los profesores) y "Next Coin" (suena a criptomoneda) |
| 2026-11-25 | Construcción con varios agentes: Opus dirige y revisa; Sonnet construye; Haiku hace tareas mecánicas; Gemini lee los notebooks grandes | Ahorro de tokens sin perder calidad. Ninguna pieza vale hasta pasar la prueba golden |
| 2026-11-25 | Memoria de la construcción en `app/BITACORA_CONSTRUCCION.md`, sin NotebookLM | Los archivos del repositorio son la fuente de verdad |
| 2026-11-25 | Un agente de prueba usa la app como jugador y reporta errores y sugerencias; impeccable critica el diseño | Control de calidad desde la mirada del usuario |
| 2026-11-25 | Se publica en Vercel solo cuando el agente de prueba aprueba la versión local | No publicar nada sin probar |
| 2026-11-25 | Commit y push a `main` en cada etapa auditada y funcionando | Igual que con los notebooks |
| 2026-11-25 | Tres revisiones obligatorias con el usuario: cifras del Notebook 13, dirección de diseño y Módulo 3 funcionando | Puntos de control antes de avanzar |
| 2026-11-25 | Diseño: mesa cinematográfica en perspectiva (comp B), con el prototipo plano "Mesa televisada" descartado | El usuario espera el acabado de un juego de estudio |
| 2026-11-25 | Cartas: mazo de Chris Aguilar 3.2 (LGPL 3.0) con acabado por script; fichas, mesa y avatares generados con IA | Gratis y exacto; la IA no garantiza las cartas correctas. La licencia obliga a mostrar Créditos |
| 2026-11-25 | Tablero de 5 cartas arriba en el paño, bote debajo, héroe sobre el riel | Espacio para el bote y para el river (aprobado por el usuario) |
| 2026-11-25 | Las descargas de terceros se guardan en `recursos/`, fuera de git | Pesan 76 MB; se conservan por si sirven después |

## 8. Cómo empezar la construcción (para el próximo agente)

**Antes de escribir código:**
1. Leer `CONTEXTO_Y_ESTADO_PROYECTO.md` en la raíz, que tiene las reglas del proyecto y el estilo de los notebooks, y luego `01_OBJETIVO_Y_FUNCIONAMIENTO.md` y este archivo.
2. No re-litigar lo de la sección 7. Las decisiones abiertas están en la sección 6 del documento 01. Se preguntan al usuario cuando hagan falta, no antes.

**Paso 1 · Base (Notebook 13, en Python):**
1. Crear `notebooks/13_exportar_app.ipynb` con el estilo obligatorio: solo celdas de código, comentarios numerados y prints con emojis.
2. Convertir los 4 modelos a ONNX y exportar escaladores, variables y la tabla de equity preflop a `app/modelo_transformado/`.
3. Ejecutar las pruebas 1 a 4 de `app/modelo_transformado/CONVERSION_Y_VERIFICACION.md` y llenar su sección 5.1 **solo con cifras del notebook ejecutado**.
4. Generar `referencia_golden.json` con unas 1,000 situaciones del test del Modelo 4: variables, equity y probabilidades.
5. Paquetes que probablemente falten en el entorno `ia_local`: `tf2onnx` u `onnx` y `onnxruntime`. Se instalan con `%pip` dentro del notebook.

**Paso 2 · Dirección de diseño:**
- Usar impeccable para definir la dirección visual de la mesa, las cartas, el panel de lecturas y las versiones para celular y PC.
- Mostrar al usuario antes de construir pantallas.

**Reglas de trabajo:**
- Auditar antes de cada commit.
- Nunca subir `data/` ni los archivos personales de la raíz.
- `app/` y `skills-lock.json` se versionan. `.claude/skills/` no se versiona: si faltan las skills, se reinstalan con `npx skills experimental_install`.
