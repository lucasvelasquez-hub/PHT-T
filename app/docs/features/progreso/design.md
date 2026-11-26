# Progreso

**Estado:** diseñado · **Actualizado:** 2026-11-26 · [GDD](../../GDD.md)

El jugador entra con un nombre o como invitado, sin cuentas. Todo lo que hace suma experiencia, la experiencia sube su rango, y el juego recuerda dónde quedó en cada módulo. Todo se guarda solo en su navegador ([D-001](../../GDD.md#decisiones)). Sirve al pilar 5: el progreso nunca se pierde por jugar mal.

## Reglas

1. **Perfil:** un nombre de 1 a 16 caracteres, o "Invitado". Hay un perfil por navegador y el nombre se cambia en Ajustes.
2. **Experiencia (XP):** nunca baja.
   - Retador y "¿Adivinas?": cada decisión suma sus puntos de precisión.
   - Instructor: cada lección terminada suma una cantidad fija y cada estrella, otra.
3. **Rangos**, uno por ficha de la mesa: Novato (1) → Aprendiz (5) → Habitual (10) → Regular (25) → Profesional (50) → Élite (100). La pantalla de Inicio muestra la ficha del rango y una barra hasta el siguiente.
4. Al subir de rango, la ficha nueva gira y brilla: es una respuesta de nivel grande ([Retador › Sensación](../retador/design.md)).
5. **Racha:** cuenta los días seguidos con al menos una sesión o una lección. Si se rompe, vuelve a 1 sin ningún mensaje de culpa. También se muestra la mejor racha.
6. **Dónde quedó:**
   - Retador: la sesión en curso (número de mano y puntos).
   - Instructor: la última lección y la pantalla dentro de ella.
   - Analista: la última mano abierta.
7. Se guarda al terminar cada mano, cada pantalla de lección y cada cambio de ajustes.
8. Si el navegador no deja guardar (ventana privada), el juego funciona igual durante la visita y lo avisa con una línea discreta en Ajustes.

## Números

| Nombre | Valor | Unidad | Qué mirar al jugar |
|---|---|---|---|
| Aprendiz | 1,000 [SUPUESTO] | XP | Que se alcance en la primera o segunda sesión |
| Habitual | 3,000 [SUPUESTO] | XP | — |
| Regular | 6,000 [SUPUESTO] | XP | — |
| Profesional | 10,000 [SUPUESTO] | XP | — |
| Élite | 15,000 [SUPUESTO] | XP | Unas 18 sesiones: alcanzable, no regalado |
| Lección terminada | 100 [SUPUESTO] | XP | Equilibrar con una sesión del Retador (~800 XP) |
| Cada estrella de una lección | 50 [SUPUESTO] | XP | — |

## Casos límite

- Datos guardados de una versión anterior del juego: se leen si se puede; si no, se empieza de cero sin romper la app.
- Se recarga a mitad de mano: la mano vuelve a empezar, pero la sesión conserva sus puntos ([mano completa](../mano-completa/design.md)).
- Dos pestañas abiertas a la vez: gana la última que guardó [SUPUESTO].

## Preguntas abiertas

- [SUPUESTO] Los umbrales de rango se ajustan después de medir cuánta XP da una sesión real.

## Historia

- 2026-11-26: diseñado.
