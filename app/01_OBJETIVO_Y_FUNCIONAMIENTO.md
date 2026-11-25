# 🎯 PHT-T · Objetivo y funcionamiento de la app

> Qué es la aplicación, para quién es y qué hace cada módulo.
> Las decisiones técnicas están en `02_ARQUITECTURA_Y_DECISIONES_TECNICAS.md`.

**Última actualización:** 25 de noviembre de 2026
**Estado:** diseño acordado, construcción no iniciada.

---

## 1. Objetivo

Convertir el modelo entrenado en el proyecto (Modelo 4, entrenado con manos de Pluribus) en un **entrenador de Texas Hold'em elegante, rápido y usable en celular y PC**.

- El rigor académico está en los notebooks y en el modelo. Esta app busca **calidad de producto**: buen diseño, animaciones y una experiencia fluida.
- No hay intención comercial por ahora.
- Se publica gratis en internet y se abre con un enlace.

## 2. Principios que no se negocian

1. **Lenguaje:** la red describe **"lo que harían jugadores de élite"**. Nunca se habla de "jugada óptima", "jugada correcta" ni GTO.
2. **Motor y red van juntos:** en cada situación se muestran las dos lecturas lado a lado:
   - **Motor matemático:** probabilidad de ganar (equity) y pot odds.
   - **Red neuronal:** probabilidades de Fold, Check/Call y Bet/Raise según la élite.
   - **Lectura conjunta:** cuándo la élite coincide con la matemática y cuándo se aparta.
3. **Solo situaciones posibles:** la red nunca recibe una situación imposible. Las manos se juegan paso a paso, desde el reparto, o salen de manos reales.
4. **Formato fijo del modelo:** mesa de 6 jugadores, 100 ciegas grandes, ciegas 50/100. La lectura de la élite solo se muestra en ese formato.
5. **Origen visible:** cada mano indica si es **real** (Pluribus) o **generada**.

## 3. Los tres módulos

### Módulo 1 · Instructor
- Lecciones ordenadas de forma progresiva, con **contenido propio** basado en varios libros. El usuario lo prepara aparte y lo trae aprobado.
- Al final de cada unidad hay un botón **"Prueba en vivo lo que aprendiste"**, con casos construidos para esa unidad: el usuario decide y recibe retroalimentación.
- Las preguntas se califican según su tipo:
  - **Matemática** (pot odds, equity): tiene respuesta correcta y la verifica el motor.
  - **Concepto de la lección:** la respuesta es la que enseña la unidad.
  - Además, siempre que el caso esté en el formato del modelo, se muestra **qué haría la élite**.
- Requisitos del contenido: `contenido_modulo1/REQUISITOS_CONTENIDO_MODULO1.md`.

### Módulo 2 · Retador
- El usuario recibe una situación, elige una acción y obtiene un puntaje.
- **Puntaje = coincidencia con la élite**, proporcional a la probabilidad que la red da a la acción elegida. Si la élite subiría el 70 % de las veces y el usuario sube, gana 70 puntos.
- Las situaciones salen de dos fuentes:
  - **Generador en vivo:** juega manos completas desde el reparto. **Los rivales deciden con el propio Modelo 4**, eligiendo cada acción según las probabilidades de la élite, así que las manos se parecen a las de jugadores reales.
  - **Banco de manos:** manos ya calculadas y revisadas en Python, tanto reales (test de Pluribus) como generadas. Complementa al generador, no lo reemplaza. Permite agrupar por dificultad o tema y comparar puntajes.
- Al final de cada mano se revelan las cartas de los rivales y la lectura del motor y de la élite.

### Módulo 3 · Analista
- **Repetir manos reales:** se busca y se filtra por calle, posición o cartas, y se avanza decisión por decisión con la lectura del motor, de la red y la conjunta. Se puede mostrar qué hizo de verdad el jugador.
- **Generador con variables escogidas:** el usuario fija algunas condiciones (por ejemplo sus cartas, su posición o la calle) y el generador juega el resto de la mano de forma coherente.
- **"¿Y si...?":** sobre una situación se cambia una pieza, como las cartas o el tamaño de la apuesta, y se ve cómo cambia lo que haría la élite. Incluye la **curva de sensibilidad a la equity**, el hallazgo más didáctico del proyecto: la élite descuenta la equity calculada contra manos aleatorias.

### Sección complementaria · Comparar los 4 modelos (ubicación por definir)
- Se evalúa la misma situación con los 4 modelos del proyecto, para contar la historia de la investigación: la fuga de información del Modelo 1, el techo sin cartas privadas y el salto con Pluribus.
- Puede ir como pestaña del Analista o como sección aparte, "Cómo se construyó".

## 4. Experiencia visual

- **Mesa ovalada de 6 asientos** de fondo:
  - Los rivales muestran sus cartas boca abajo, su stack y su última acción.
  - Botón de dealer.
  - Fichas que se deslizan al bote y un bote que crece a la vista.
- **El jugador solo ve sus propias cartas.** Las de los rivales se revelan al final, en los módulos que lo permiten.
- **Cartas reales, no códigos:**
  - Mazo propio dibujado en vectores (SVG), nítido en cualquier pantalla.
  - Opción de **mazo de 4 colores**, que se lee mejor en el celular.
- **Dos diseños de mesa:**
  - **PC:** mesa horizontal clásica.
  - **Celular:** mesa vertical, con las cartas del jugador abajo y los botones al alcance del pulgar.
- **Panel de lecturas:**
  - Barra de equity frente a las pot odds.
  - Tres barras con lo que haría la élite.
  - Lectura conjunta.
  - En el celular sube desde abajo para no tapar la mesa.
- **Animaciones** de reparto, volteo de cartas, fichas y puntaje:
  - Cortas, de unos 0.3 segundos, para no frenar el aprendizaje.
  - Se reducen si el usuario desactivó las animaciones en su dispositivo.
- **Estilo:** oscuro y elegante, de app de entrenamiento premium, sin estética de casino barato (dorados y neón).
- **Sonido** opcional, con botón de silencio.
- La app se puede **instalar en el celular** como una aplicación, sin pasar por la tienda.

## 5. Orden de trabajo acordado

1. **Base:** convertir los modelos, exportar los datos y probar que la app da los mismos números que Python.
2. **Dirección de diseño:** mesa, cartas, panel y versiones para celular y PC.
3. **Módulo 3 con manos reales:** prueba toda la cadena de punta a punta.
4. **Módulo 2:** generador, puntaje y banco de manos.
5. **"¿Y si...?"** y generador con variables escogidas en el Módulo 3.
6. **Módulo 1:** cuando llegue el contenido aprobado.

## 6. Decisiones pendientes

- [ ] Dónde va la comparación de los 4 modelos y cómo se presenta el Modelo 1 (como "el modelo con fuga, para mostrar el error").
- [ ] Perfil de jugador que se le da al Modelo 3 en la comparación (necesita `pf_vpip`, `pf_pfr`, etc.). Propuesta: un perfil promedio.
- [ ] Tamaños de apuesta que usa el generador, por ejemplo 1/3, 1/2, 3/4 y 1 bote, y subidas preflop típicas.
- [ ] Nombre visible de la app y textos de bienvenida.
- [x] ~~Si estos documentos de `app/` se suben a GitHub~~. Decidido el 25-nov-2026: **sí se suben**, porque son la documentación de la app. También se sube `skills-lock.json`. Los archivos de `.claude/skills/` se reinstalan desde ese registro y no se suben.
