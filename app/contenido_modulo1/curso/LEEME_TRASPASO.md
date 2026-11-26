# Traspaso: Curso de póker (cash 6-max, principiantes)

Si eres el agente que continúa este trabajo, empieza aquí. Fecha del traspaso: 2026-11-25.

## 1. Qué se quiere construir

Un **curso de Texas Hold'em No-Limit cash 6-max (100bb) para principiantes absolutos**, hecho de lecciones pequeñas de 5 a 10 minutos, una idea por lección, que se puedan estudiar unos minutos al día. Cada lección lleva **ejemplos concretos con cartas, botes y apuestas**. Debe ser pedagógico, sencillo y atractivo.

El curso se basa en 4 libros que el usuario ya tiene, pero el **contenido es propio**: los libros dan estructura y conceptos, nunca texto para copiar.

El formato de entrega del curso no está definido. La carpeta vive dentro de un repositorio de otro proyecto, pero el usuario no ha dicho que este curso tenga relación con él. No asumas ninguna; decide el formato con criterio profesional y, si es indispensable, pregunta al usuario.

## 2. Qué ya está hecho

| Entregable | Archivo | Estado |
|---|---|---|
| Estructura curricular completa (64 lecciones, 13 módulos) | `ESTRUCTURA_CURRICULAR.md` | Hecho, verificado, commit `9060966` |
| Mecanismo de trabajo con NotebookLM | `MECANISMO_NOTEBOOKLM.md` | Hecho |
| Script para extraer respuestas de NotebookLM | `herramientas/extraer_respuesta.py` | Hecho |
| Cuaderno de NotebookLM con los 4 libros cargados | ver `MECANISMO_NOTEBOOKLM.md` | Hecho |
| Respuestas en bruto de NotebookLM | `notebooklm/` (local, ignorada por git) | Disponibles |

**Todavía no existe ninguna lección redactada.** Solo está la estructura.

## 3. Cómo se trabaja (el mecanismo)

1. **NotebookLM estudia los libros, tú no.** Nunca leas los PDF/EPUB de `libros/`. Se le pregunta al cuaderno y se reciben respuestas con citas.
2. **Tú estructuras y redactas.** Con lo que devuelve NotebookLM, redactas lecciones originales.
3. **Todo número se verifica dos veces:** NotebookLM responde "CONFIRMADA / CORREGIDA / NO RESPALDADA" con libro y capítulo, y tú recalculas aparte (idealmente con un script). En la primera pasada NotebookLM se equivocó varias veces (ver sección 7 de `ESTRUCTURA_CURRICULAR.md`).
4. Los detalles técnicos (IDs, herramientas, trampas, prompts) están en `MECANISMO_NOTEBOOKLM.md`.

## 4. Qué se busca como producto final

El curso completo listo para usar: las 64 lecciones redactadas (o las que tú decidas tras analizar la estructura), con ejemplos de cartas y apuestas verificados, mini-evaluaciones por módulo y un formato de entrega adecuado. La calidad pedagógica es lo central: claridad, progresión estricta (una lección solo usa lo ya enseñado), lenguaje sin jerga innecesaria y ejemplos que se entienden de un vistazo.

## 5. Tienes permiso para analizar y proponer mejoras

La estructura es un **buen borrador, no un dogma**. El usuario te pide expresamente que la analices y la mejores con criterio profesional. Algunas preguntas que vale la pena hacerte:

- ¿El orden de módulos es el mejor para un principiante? (por ejemplo, ¿conviene mover el módulo de mentalidad y banca antes?)
- ¿Faltan lecciones o sobran? ¿Hay saltos de dificultad?
- ¿Hay conceptos que se usan antes de enseñarse?
- ¿Cada lección realmente cabe en 10 minutos?
- ¿Se puede hacer más atractivo (casos, retos, repasos espaciados)?

Si cambias la estructura, **documenta el cambio y la razón** en `ESTRUCTURA_CURRICULAR.md` (o en un `REGISTRO_DE_CAMBIOS.md`).

## 6. Decisiones pendientes: las decides tú

El usuario delegó la autonomía. Decide con criterio profesional, justifica en un documento y avanza sin pedir permiso para cada cosa. Pendientes (también en la sección 8 de `ESTRUCTURA_CURRICULAR.md`):

1. **Banca:** los libros solo dan mínimos teóricos (13,5 a 27 buy-ins). Propuesta previa: 30 buy-ins mínimo.
2. **SPR:** Hardin y Acevedo dan umbrales distintos. Fijar una regla simple.
3. **Rangos de apertura por posición:** falta la tabla final. Se puede pedir a NotebookLM que describa los gráficos de Clarke (Figuras 10, 15 y 16), recordando que los porcentajes de CO y SB no están en el texto.
4. **Ritmo y número de lecciones.**
5. **Formato de entrega** de las lecciones (Markdown, imágenes de cartas, ejercicios, integración con la app).

## 7. Cómo sugiero producir las lecciones

1. **Lección piloto:** empezar con la 3.2 (*pot odds*) para validar tono, formato y flujo de verificación. Enseñarla al usuario antes de producir en masa.
2. **Por módulo:** consultar a NotebookLM lo que necesites para ese módulo, redactar, verificar cifras (NotebookLM + recálculo propio), guardar en una carpeta como `lecciones/M03_L02.md`.
3. **Recalcular ejemplos con código** para evitar los errores de aritmética que ya aparecieron.
4. **Cerrar cada módulo** con su mini-evaluación y una revisión de coherencia (¿usa solo lo ya enseñado?).

## 8. Preferencias del usuario (importante)

- **Respuestas cortas y directas.** Nada de discursos largos; el usuario se molestó cuando respondí demasiado largo.
- **Autonomía:** el usuario puede dejar el trabajo desatendido. Trabaja hasta el final, audita tu propio resultado y entrega un resumen claro.
- **Contenido propio:** el usuario lo pidió desde el principio; los libros son base, no texto para copiar.
- **Precaución de derechos de autor (decisión del agente anterior, no pedido del usuario):** los libros y las respuestas en bruto de NotebookLM no se suben a git (ya están en `.gitignore`). Commit local sí; push solo si el usuario lo pide.

## 9. Qué leer, en orden

1. Este archivo.
2. `MECANISMO_NOTEBOOKLM.md` (cómo hablar con el cuaderno).
3. `ESTRUCTURA_CURRICULAR.md` (el plan completo, el registro de verificación y las decisiones pendientes).
4. Opcional: `notebooklm/02_verificacion.md` (cifras confirmadas por libro y capítulo).
