# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Decidido por el usuario el 2026-11-25 (ver `app/02_ARQUITECTURA_Y_DECISIONES_TECNICAS.md`):
- React + Vite + TypeScript, Tailwind CSS, Motion para la interfaz y GSAP para la coreografía de cartas y fichas.
- onnxruntime-web en un Web Worker.
- PWA instalable (vite-plugin-pwa).
- Corre entero en el navegador, sin servidor. Se publica en Vercel con el puente GitHub → Vercel, con Root Directory = `app/`.

## Users

- **Jugador principal:** un aficionado que ya sabe las reglas del Texas Hold'em y juega con amigos u online. Quiere mejorar entendiendo qué harían los jugadores de élite en cada situación.
- **Uso:** sobre todo en el **celular**, en ratos cortos (una mano o un reto); también estudia en PC.
- No conoce la investigación de fondo ni necesita conocerla.
- **Audiencia secundaria:** los profesores del curso de Redes Neuronales. Evalúan el proyecto y valoran la sección "Comparar los 4 modelos".

## Product Purpose

Next Chip es un entrenador de Texas Hold'em, mesa de 6 jugadores, que muestra en cada situación dos lecturas lado a lado:
- **Lectura de la élite:** lo que harían los jugadores de élite, según una red neuronal entrenada con 10,000 manos de Pluribus con cartas visibles (87.39 % de exactitud en test).
- **Lectura matemática:** probabilidad de ganar (equity) y pot odds.

Así el jugador ve cuándo la élite coincide con la matemática y cuándo se aparta. El éxito es que el jugador entienda por qué la élite actúa como actúa y que su "coincidencia con la élite" suba con la práctica. No tiene fines comerciales.

## Positioning

- Ningún otro entrenador muestra lado a lado lo que haría la élite (una red neuronal entrenada con manos reales de Pluribus) y la matemática del motor de equity, junto con el desacuerdo entre las dos.
- Un hallazgo central: la élite descuenta la equity calculada contra manos aleatorias. La curva de sensibilidad a la equity lo hace visible.

## Operating Context

- **Módulo 1 · Instructor:** lecciones progresivas con contenido propio, que el usuario traerá aprobado, y "Prueba en vivo lo que aprendiste" al final de cada unidad.
- **Módulo 2 · Retador:** situación → acción → puntaje de coincidencia con la élite, proporcional a la probabilidad que la red da a la acción elegida. Las manos vienen del generador en vivo, donde los rivales deciden con el Modelo 4, y de un banco de manos.
- **Módulo 3 · Analista:**
  - repetir manos reales de Pluribus, decisión por decisión;
  - generador con variables escogidas;
  - "¿Y si...?" con la curva de sensibilidad.
- **Sección "Comparar los 4 modelos":** la misma situación vista por los 4 modelos del proyecto. Su ubicación está por definir.

## Capabilities and Constraints

- **Formato fijo del modelo:** 6 jugadores, 100 ciegas grandes, ciegas 50/100. La lectura de la élite solo se muestra en ese formato.
- **Solo situaciones posibles:** las manos se juegan paso a paso desde el reparto o salen de manos reales.
- Cada mano indica si es **real** (Pluribus) o **generada**.
- El jugador solo ve sus cartas. Las de los rivales se revelan al final, en los módulos que lo permiten.
- Las animaciones duran unos 0.3 s y se reducen si el dispositivo lo pide. El sonido es opcional y tiene botón de silencio.
- El mazo es propio, en SVG, con opción de 4 colores.
- **Mesa:** horizontal en PC; vertical en celular, con las acciones al alcance del pulgar.
- **Panel de lecturas:**
  - barra de equity frente a las pot odds;
  - tres barras con lo que haría la élite;
  - lectura conjunta.

  En el celular sube desde abajo.
- **Idioma:** solo español. Los términos de póker van en inglés, como se usan en la mesa (Fold, Check, Call, Bet, Raise, flop, turn, river).
- Sin cuentas: puntajes y preferencias se guardan en el navegador.
- **Por decidir:**
  - ubicación de "Comparar los 4 modelos";
  - perfil de jugador para el Modelo 3;
  - tamaños de apuesta del generador;
  - textos de bienvenida.

## Brand Commitments

- **Nombre:** Next Chip.
- **Lenguaje obligatorio:** "lo que harían jugadores de élite". Nunca "jugada óptima", "jugada correcta" ni GTO.
- **Restricción visual dada por el usuario:** oscuro y elegante, de app de entrenamiento premium, con calidad de estudio de videojuegos. Nada de estética de casino barato (dorados y neón).

## Evidence on Hand

- Modelos convertidos y verificados: `app/modelo_transformado/`.
- Banco de manos reales: `app/modelo_transformado/banco_manos_reales.json`, con 1,849 manos y 16,599 decisiones de Pluribus (licencia MIT).
- Cifras verificadas del proyecto: `informe/resultados_experimentos.md`.
- No existen testimonios, usuarios ni métricas de uso. No se deben inventar.

## Product Principles

1. **Dos lecturas, nunca un veredicto:** la app muestra lo que haría la élite y lo que dice la matemática, no "la respuesta correcta".
2. **Aprender jugando:** las lecturas acompañan a la mano sin frenarla.
3. **Verdad antes que efecto:** cada número de la app es idéntico al de Python o está dentro del margen del Monte Carlo.
4. **Hecho para el pulgar:** el celular es el uso principal.
