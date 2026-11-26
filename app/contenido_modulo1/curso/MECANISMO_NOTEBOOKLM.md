# Mecanismo de trabajo con NotebookLM

Este documento explica cómo se trabaja con NotebookLM en este proyecto y qué trampas conocemos. Léelo antes de hacer tu primera consulta.

## 1. Por qué se usa NotebookLM

Los 4 libros viven solo en NotebookLM. El agente no los lee: le hace preguntas y recibe respuestas con citas. Eso ahorra contexto y deja el estudio y la consolidación de los libros a NotebookLM. El usuario lo pidió así a propósito y teme que el agente termine leyendo los libros él mismo. **No leas los PDF/EPUB de `libros/`.**

## 2. Datos del cuaderno

- **Cuaderno:** "Curso Poker Cash – Principiantes"
- **ID:** `bcab9fe8-19f1-4f7f-bbf6-a2e51e2df83d`
- **URL:** https://notebook.google.com/notebook/bcab9fe8-19f1-4f7f-bbf6-a2e51e2df83d
- **Cuenta:** Google Pro del usuario (más fuentes y más consultas diarias que la gratuita).
- **Fuentes cargadas (4):**

| Libro | Autor | ID de fuente |
|---|---|---|
| Essential Poker Math | Alton Hardin | `1f116229-9d45-44ab-9bcf-62a849449691` |
| Play Optimal Poker | Andrew Brokos | `dae4b5e2-3dbe-4646-8832-93f92de7897f` |
| The Grinder's Manual | Peter Clarke | `dafbf82e-ccaa-4280-ae0a-01371ed3f584` |
| Modern Poker Theory | Michael Acevedo | `62f5fb6d-280c-472b-b087-ee2e631dc65f` |

Los archivos originales están en `libros/` (ignorada por git; no se sube nunca).

## 3. Herramientas MCP

Son herramientas diferidas: se cargan con `ToolSearch` antes de usarlas, por ejemplo `select:mcp__notebooklm__notebook_query,mcp__notebooklm__server_info,mcp__notebooklm__refresh_auth`.

| Herramienta | Para qué |
|---|---|
| `server_info` | Ver versión y estado de la sesión de Google |
| `refresh_auth` | Renovar la sesión cuando expira |
| `notebook_query` | Preguntarle al cuaderno (la principal) |
| `source_add`, `source_list_drive`, `source_get_content` | Gestionar fuentes |
| `studio_create`, `studio_status`, `download_artifact` | Informes, guías de estudio, cuestionarios, etc. |
| `note`, `chat_save_to_note` | Guardar respuestas como notas del cuaderno |

## 4. Trampas conocidas y cómo resolverlas

1. **La sesión expira aunque `server_info` diga "configured".** Si una herramienta devuelve "Authentication expired", llama a `refresh_auth`. Si no basta, pide al usuario que ejecute `! nlm login`.
2. **Las respuestas de `notebook_query` son enormes** (100.000+ caracteres) porque incluyen citas y referencias. La herramienta las guarda en un archivo y te da la ruta. La respuesta útil está en el campo `answer`. Extráela con:
   `python -I curso/herramientas/extraer_respuesta.py "<ruta del archivo>" "<destino.md>"`
   Después lee el `.md`, que pesa unos 10.000–40.000 caracteres. No intentes leer el JSON original.
3. **Consultas largas (más de 120 s) pasan a segundo plano.** Recibes una notificación al terminar. Si lanzas varias consultas en paralelo, espera todas las notificaciones antes de seguir.
4. **Usa `new_conversation: true`** en consultas independientes para que no arrastren contexto. Para seguir un hilo, pasa el `conversation_id` devuelto.
5. **`jq` no está instalado** en esta máquina; usa Python (`python -I`).
6. **Las rutas de archivos con caracteres especiales** (como `’`) funcionan si pasas la ruta completa entre comillas.

## 5. Calidad de lo que devuelve NotebookLM

NotebookLM es bueno estructurando y citando, pero **cometió errores reales** en la primera pasada:
- Atribuyó a un autor una clasificación que era de otro.
- Dio tamaños de apuesta que no coincidían con el texto.
- Equivocó cálculos en ejemplos con cartas y apuestas (bote, equity requerida, cartas que no completan la jugada que dice).
- Mezcló cifras de torneos (9 jugadores) con cash 6-max.

**Regla del proyecto:** toda cifra, tamaño o porcentaje que aparezca en una lección debe (a) pedirse a NotebookLM con "CONFIRMADA / CORREGIDA / NO RESPALDADA + libro y capítulo", y (b) recalcularse tú aparte (idealmente con un script). Los ejemplos de cartas se verifican a mano o con código.

## 6. Prompts que funcionaron

- **Mapa de contenidos:** "Para cada uno de los 4 libros, dame un mapa de contenidos ordenado, con nivel (básico/intermedio/avanzado) para un principiante absoluto de cash, qué temas se repiten y dónde los autores discrepan."
- **Estructura curricular:** se dieron reglas pedagógicas explícitas (lecciones de 5–10 min, una idea, progresión estricta, ejemplos con cartas y apuestas, contenido propio) y se pidió un formato fijo por módulo.
- **Verificación:** una lista numerada de afirmaciones del borrador, cada una con la instrucción de responder CONFIRMADA / CORREGIDA / NO RESPALDADA con cifra exacta y capítulo. Es el patrón más útil y debe repetirse por cada módulo.
- **Piezas faltantes:** se pidió explícitamente que dijera cuándo un libro **no** cubre un tema, y lo dijo con honestidad.

## 7. Respuestas en bruto ya obtenidas (locales, no están en git)

En `curso/notebooklm/` (ignorada por git porque deriva de libros con derechos de autor):
- `01_esqueleto_bruto.md`: esqueleto curricular original de NotebookLM (con errores).
- `02_verificacion.md`: verificación de 12 cifras (útil como referencia de datos confirmados).
- `03_modulo0_y_final.md`: lecciones del Módulo 0 y del módulo de mentalidad.

Si esa carpeta no existe en tu copia, repite las consultas; no es crítico, porque lo importante quedó consolidado en `ESTRUCTURA_CURRICULAR.md`.
