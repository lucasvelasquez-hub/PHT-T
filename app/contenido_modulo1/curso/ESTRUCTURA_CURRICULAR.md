# Curso de Texas Hold'em Cash 6-max para principiantes — Estructura curricular v1

Estado: borrador completo, verificado contra los 4 libros en NotebookLM. Pendiente de tu revisión (ver sección 8).

## 1. Cómo se construyó

- **Fuentes (solo en NotebookLM, cuaderno "Curso Poker Cash – Principiantes"):** Hardin (*Essential Poker Math*), Clarke (*The Grinder's Manual*), Brokos (*Play Optimal Poker*), Acevedo (*Modern Poker Theory*).
- **Método:** NotebookLM leyó los libros y propuso el esqueleto. Luego se verificaron 12 cifras clave contra el texto y se corrigieron los errores (sección 7). Los ejemplos de cartas y apuestas se recalcularon uno por uno.
- **Contenido propio:** los libros solo dan estructura y conceptos. Toda la redacción de las lecciones será original.

## 2. Perfil, objetivos y formato

**Alumno de entrada:** nunca ha jugado póker con dinero real. Puede conocer vagamente las reglas.
**Modalidad:** No-Limit Hold'em, cash, mesas de 6 jugadores, 100 ciegas grandes (100bb). Ejemplos en ciegas $1/$2 (1bb = $2, stack = $200).

**Al terminar el curso, el alumno sabrá:**
1. Pensar cada decisión en valor esperado (EV) y no por el resultado de una mano.
2. Abrir, aislar, defender y resubir antes del flop según su posición.
3. Calcular al instante sus *outs*, su *equity* y el precio del bote (*pot odds*).
4. Jugar después del flop con criterio: apostar por valor, hacer *c-bets* selectivas, defenderse y farolear con matemáticas.
5. Cuidar su banca y su cabeza.

**Formato de cada lección (5 a 10 minutos, una sola idea):**
1. *Gancho* (30 s): una situación o pregunta.
2. *Idea única* explicada con lenguaje simple.
3. *Ejemplo guiado* con cartas, bote y apuestas.
4. *Tu turno*: un mini ejercicio con respuesta.
5. *Resumen* en una frase.

**Reglas de diseño:** cada lección solo usa lo ya enseñado; los términos técnicos se explican la primera vez; al final de cada módulo hay una mini-evaluación; cada 3 módulos hay un repaso.

**Ritmo estimado:** 64 lecciones, unas 13 semanas a una lección por día de lunes a viernes.

## 3. Mapa general

| Módulo | Tema | Lecciones |
|---|---|---|
| 0 | Primeros pasos antes de tu primera mano | 8 |
| 1 | La mesa 6-max, el EV y tus rivales | 4 |
| 2 | Matemáticas de bolsillo: outs y regla del 2 y 4 | 4 |
| 3 | ¿Pago o me retiro? Equity, pot odds, implied odds | 5 |
| 4 | Abrir la mano antes del flop | 6 |
| 5 | Defender antes del flop y *set-mining* | 4 |
| 6 | La apuesta de continuación (*c-bet*) | 5 |
| 7 | Apostar por valor | 5 |
| 8 | Defensa después del flop | 4 |
| 9 | Faroles y semifaroles | 5 |
| 10 | *3-bet* y botes grandes | 5 |
| 11 | Mentalidad, banca y hábitos | 5 |
| 12 | Opcional: puente a GTO | 4 |

---

## 4. Módulos y lecciones

### Módulo 0 — Primeros pasos antes de tu primera mano
**Objetivo:** que alguien que nunca jugó en dinero real entienda cómo fluye una mano y cómo se habla en la mesa.
**Al terminar sabrá:** seguir una mano de principio a fin, elegir su acción, contar el bote y leer la notación básica.
**Nota de fuentes:** los libros asumen que el lector ya conoce las reglas. Las lecciones 0.1, 0.2 (parte de reglas) y 0.7 (jerarquía) son contenido estándar propio, sin base en los libros. Se redactarán desde las reglas públicas del juego.

- **0.1 El viaje de una mano: del preflop al showdown.** Idea: cuatro rondas de apuestas (preflop, flop, turn, river) y quién gana al final. Base: sin base en libros. Ejemplo: recibes A♠K♣; flop K♥7♦2♠; llega el turn y el river; si quedan dos jugadores, muestran cartas.
- **0.2 Tus botones y la regla de las subidas.** Idea: *fold*, *check*, *call*, *bet*, *raise*, *all-in*; la subida mínima. Base: Acevedo Cap. 1 (definiciones de acciones). Ejemplo: en BB ($2) un rival abre a $6. Puedes retirarte, pagar $4 más, o subir; la subida mínima es a $10 (aumentar al menos lo que subió el rival). *Ojo: el libro simplifica "minraise = el doble"; usaremos la regla estándar.*
- **0.3 Ciegas, botón y por qué pensamos en "bb".** Idea: las ciegas crean el bote inicial; medir en ciegas grandes unifica todos los límites. Base: Hardin Cap. 2 y Glosario; Acevedo Cap. 1 y 4. Ejemplo: $1/$2: SB pone $1, BB pone $2; $200 = 100bb.
- **0.4 Cuenta el bote en segundos.** Idea: el bote es todo el dinero ya en el centro. Base: Hardin Cap. 6; Acevedo Cap. 10 (subida del tamaño del bote). Ejemplo: bote $100, rival apuesta $50: el bote es $150. Si pagas queda en $200. Una subida del tamaño del bote sería a $250.
- **0.5 El *rake*: el peaje de la mesa.** Idea: la sala cobra una parte de cada bote, y por eso conviene jugar menos manos marginales. Base: Acevedo Cap. 1 y 4 (*Rake Effect*); Hardin Glosario. Ejemplo: con 5% y tope de $5, un bote de $60 paga $3 de rake y uno de $200 paga $5; si no hay flop, no hay rake.
- **0.6 Cash o torneo: dos juegos distintos.** Idea: en cash las fichas valen dinero real y puedes recargar; en torneo no. Base: Acevedo Cap. 6. Ejemplo: en cash pierdes $100 y recargas; en un torneo perder tu pila te elimina.
- **0.7 Jerarquía de manos y por qué el *kicker* decide botes.** Idea: qué mano gana a cuál, y la carta de desempate. Base: jerarquía sin base en libros; *kicker* en Hardin (Glosario), Clarke Cap. 2. Ejemplo: K♦J♠ contra K♠Q♥ en flop K♣8♦3♠: ambos tienen pareja de Reyes, gana la Q. Antes del flop, KQ tiene alrededor de 73% contra KJ (Hardin).
- **0.8 Cómo leer el idioma del póker.** Idea: AKs, AKo, JJ+, Hero/Villain, 3-bet. Base: Hardin Cap. 2; Acevedo Cap. 1; Clarke Cap. 9 y Apéndice 2. Ejemplo: AKs = A♣K♣ (4 combinaciones), T9o = 12 combinaciones, JJ+ = JJ, QQ, KK, AA.

**Mini-evaluación M0:** (1) En una mano de $1/$2 la apertura es a $6. ¿Cuál es la subida mínima? *(a $10)*. (2) ¿Qué gana: K♦J♠ o K♠Q♥ en flop K♣8♦3♠? *(K♠Q♥, por el kicker)*.

---

### Módulo 1 — La mesa 6-max, el EV y tus rivales
**Objetivo:** entender la mesa, la posición y qué significa decidir bien.
**Al terminar sabrá:** nombrar las 6 posiciones, explicar qué es el stack efectivo, distinguir una decisión +EV de un buen resultado y clasificar a un rival.

- **1.1 El mapa de la mesa: las 6 sillas.** Idea: UTG, HJ, CO, BU, SB, BB, y actuar último es una ventaja. Base: Clarke Cap. 2; Hardin Cap. 2. Ejemplo: en $1/$2, UTG habla primero antes del flop; BU habla último en flop, turn y river.
- **1.2 Tu pila de fichas: por qué jugamos con 100bb.** Idea: el stack efectivo es el menor de los dos stacks. Base: Clarke Cap. 1; Hardin Cap. 2. Ejemplo: tú tienes $200 y el rival $100: lo máximo en juego es $100 (50bb).
- **1.3 El EV: la moneda del póker.** Idea: una decisión se juzga por lo que gana a largo plazo, no por cómo salió. Base: Hardin Caps. 1 y 10; Clarke Cap. 1. Ejemplo: A♠A♥ contra K♠K♥ gana cerca del 82%; si pierdes una vez porque sale un Rey, la jugada seguía siendo +EV.
- **1.4 ¿Quién está sentado contigo? Tipos de rivales.** Idea: etiquetar con cinco perfiles simples: *nit* (juega muy pocas manos), *reg* (jugador sólido), *fish que paga* (calling station), *fish agresivo* (maniac) y *fish fit-or-fold* (entra a ver flops y se retira ante presión). Base: Hardin Cap. 3 (NIT, TAG, LAG, loose passive, calling station, maniac); Clarke Cap. 3.3 (cuatro tipos de fish). Ejemplo: quien paga tres apuestas seguidas con pareja de 4 en K♥Q♠9♦2♣7♠ es un fish que paga; quien entra a 1 de cada 10 manos es un nit.

**Mini-evaluación M1:** (1) En CO con $240 contra BU con $130, ¿cuál es el stack efectivo y quién actúa último después del flop? *($130 = 65bb; BU)*. (2) Un rival entra a casi todo y casi nunca sube: ¿perfil y qué implica? *(fish que paga; no conviene farolearle)*.

---

### Módulo 2 — Matemáticas de bolsillo: *outs* y la regla del 2 y del 4
**Objetivo:** estimar sin calculadora qué porcentaje de veces mejorará una mano incompleta.
**Al terminar sabrá:** contar *outs* y convertirlos en porcentaje.

- **2.1 ¿Qué son los *outs*?** Idea: cartas que quedan en la baraja y completan tu proyecto. Base: Hardin Cap. 8. Ejemplo: 9♥8♥ en flop K♥4♥2♣: hay 13 corazones, ves 4, quedan 9 *outs* a color.
- **2.2 Los 4 proyectos que debes memorizar.** Idea: color = 9 outs, escalera abierta = 8, dos sobrecartas = 6, *gutshot* (escalera interna) = 4; combos: color + gutshot = 12, color + escalera abierta = 15. Base: Hardin Caps. 8, 9 y 15. Ejemplo: J♠T♦ en Q♣9♥2♠: cualquier K o 8 = 8 *outs*.
- **2.3 La regla del 2 y del 4.** Idea: *outs* × 2 si ves una carta; × 4 si ves dos. Base: Hardin Cap. 9. Ejemplo: 9 *outs* × 2 = 18%; × 4 = 36%.
- **2.4 Cuidado con los *outs* sucios.** Idea: restar cartas que te completan pero también le dan algo mejor al rival. Base: Hardin Cap. 8. Ejemplo: J♠T♦ en 9♥8♥2♣: la Q♥ y el 7♥ completan tu escalera pero ponen tres corazones en mesa; si el rival tiene dos corazones, completa color. Cuenta 6 *outs* limpios en lugar de 8 (≈12%).

**Mini-evaluación M2:** A♦Q♣ en flop J♠T♥3♦: ¿cuántos *outs* a escalera y qué probabilidad en el turn? *(4 Reyes; 4 × 2 = 8%)*.

---

### Módulo 3 — ¿Pago o me retiro? *Equity*, *pot odds* e *implied odds*
**Objetivo:** decidir con matemáticas cuando enfrentas una apuesta con un proyecto.
**Al terminar sabrá:** calcular lo que te cuesta ver una carta y compararlo con tus posibilidades.

- **3.1 ¿Qué es la *equity*? Tu parte del bote.** Idea: el porcentaje de veces que ganarías si la mano llegara hasta el final. Base: Hardin Cap. 5. Ejemplo: con 36% en un *all-in* de bote $100, tu parte justa vale $36.
- **3.2 *Pot odds*: el precio de ver una carta.** Idea: porcentaje mínimo que necesitas = lo que pagas ÷ bote final. Base: Hardin Cap. 6; Acevedo Cap. 2. Ejemplo: bote $20, rival apuesta $10, pagas $10 para un bote de $40: 10 ÷ 40 = 25%.
- **3.3 Los precios estándar.** Idea: tabla rápida (apuesta → equity que necesitas): 1/4 = 16,7%; 1/3 = 20%; 1/2 = 25%; 2/3 = 28,6%; 3/4 = 30%; bote completo = 33,3%. Base: Hardin Cap. 6 y Apéndice. Ejemplo: bote $30, apuesta $15 (1/2): necesitas 25%.
- **3.4 ¿Puedo pagar con mi proyecto?** Idea: comparar tu *equity* (regla del 2) con las *pot odds*. Base: Hardin Cap. 11. Ejemplo: bote $40, apuesta $10 (1/4): necesitas 16,7%; tienes color (9 × 2 = 18%) → pagar es +EV.
- **3.5 *Implied odds*: el premio que cobras después.** Idea: a veces pagas sin tener el precio directo porque si ligas ganarás más en calles futuras. Base: Hardin Cap. 7; Clarke Cap. 6. Ejemplo: bote $20, apuesta $15 (necesitas 30%, tienes ~16% con escalera abierta); contra un fish que paga mucho y con stacks profundos detrás, puede valer la pena.

**Mini-evaluación M3:** bote $60, apuesta $30, tienes 8♠7♠ en K♥6♣5♦ (8 *outs*, 16%): ¿te dan las *pot odds*? *(No: necesitas 25%. Solo por *implied odds* con stacks profundos y un rival que pague fuerte.)*

---

### Módulo 4 — Abrir la mano antes del flop
**Objetivo:** construir una base sólida cuando eres el primero en entrar o cuando alguien hizo *limp*.
**Al terminar sabrá:** qué manos abrir según su posición, cuánto apostar y cómo castigar a los *limpers*.

- **4.1 Piensa en rangos, no en una sola mano.** Idea: el rango es el conjunto de manos con las que haces una acción. Base: Hardin Cap. 2; Clarke Cap. 2. Ejemplo: en vez de "tengo A♠Q♥", piensas "desde UTG abro parejas, AQs+, AKo y algunas conectadas".
- **4.2 La cuadrícula 13×13: tu mapa de manos.** Idea: cómo leer una tabla de rangos (parejas en la diagonal, *suited* arriba, *offsuit* abajo). Base: Acevedo Cap. 1. Ejemplo: ubicar AKs, AKo y 77 en la cuadrícula.
- **4.3 ¿Por qué nunca hacemos *open limp*?** Idea: solo pagar la ciega regala la iniciativa y la posibilidad de ganar el bote sin ver flop. Base: Clarke Cap. 3; Acevedo Cap. 4. Ejemplo: A♦J♣ en CO: si pagas $2, SB y BB ven flop barato; si subes a $5 y todos se retiran, ganas $3 al instante.
- **4.4 Rangos de apertura por posición.** Idea: cuanto más atrás estás, más manos puedes abrir. Base: Clarke Cap. 2 (UTG ≈ 11%, HJ ≈ 15,5%); Acevedo Caps. 2 y 7 (BU ≈ 43% en cash). *Los porcentajes de CO y SB y la tabla final se fijarán al diseñar la lección (ver decisiones pendientes).* Ejemplo: K♠9♠ en UTG es retirarse; en BU abres.
- **4.5 Tamaño de apertura y robo de ciegas.** Idea: una apuesta simple (**2,5bb**, entre los 2 y 3bb que dan los libros) para todas las posiciones. Base: Clarke Cap. 2; Acevedo Cap. 5. Ejemplo: Q♥8♥ en BU, todos se retiran: subes a $5 para robar $3 de ciegas.
- **4.6 Cuando alguien hace *limp*: aislar.** Idea: subir para quedarte a solas con el *limper*: **3bb + 1bb por cada limper** (+1bb si estás fuera de posición). Base: Clarke Cap. 3.6. Ejemplo: fish hace *limp* en HJ; tú en BU con A♣T♦ subes a $8 (4bb).

**Mini-evaluación M4:** (1) Q♦9♦ en UTG: ¿abres, haces *limp* o te retiras? *(retirarse)*. (2) Un jugador hace *limp* ($2) en CO y tú tienes K♥Q♠ en BU: ¿qué haces y de qué tamaño? *(subes a $8)*.

---

### Módulo 5 — Defender antes del flop y *set-mining*
**Objetivo:** saber cuándo pagar una subida y no perder fichas con manos dominadas.
**Al terminar sabrá:** aplicar el concepto del "hueco" (*gap*), defender la ciega grande y calcular si una pareja pequeña merece buscar trío.

- **5.1 El *gap concept*: necesitas más para pagar que para abrir.** Idea: quien ya subió tiene un rango fuerte; tu rango de pago debe ser más cerrado que tu rango de apertura. Base: Clarke Cap. 6. Ejemplo: A♥T♦ en HJ contra la apertura de UTG: aunque la abrirías, contra UTG es retirarse (dominada por AK, AQ, AJ).
- **5.2 Pagar en posición y defender la ciega grande.** Idea: en BB ya pusiste dinero y cierras la acción, así que te dan mejor precio. Base: Clarke Caps. 6 y 7. Ejemplo: BU abre a $5 y SB se retira: pagas $3 para ganar $8 (bote $11): necesitas ~27%; puedes defender K♠7♠ o 9♥8♥. *(Cálculo propio; el libro no da esta cifra.)*
- **5.3 Matemáticas del *set-mining*.** Idea: con pareja pequeña ligas trío (*set*) 1 de cada 8,5 veces (11,8%); para que valga la pena necesitas ganar 10 a 15 veces lo que pagas (Clarke: 10×; Hardin: 15×). Base: Hardin Caps. 4 y 13; Clarke Cap. 6. Ejemplo: UTG abre a $6; pagas con 4♠4♥ en BU: necesitas ganar $60 a $90 cuando salga un 4.
- **5.4 ¿Cuándo NO hacer *set-mining*?** Idea: retirarse con parejas pequeñas si el stack efectivo es corto o la subida ya es cara. Base: Hardin Cap. 13; Clarke Cap. 6. Ejemplo: abres a $6 con 3♥3♣, un nit te resube a $20: pagar $14 más exige ganar $140–$210; no vale.

**Mini-evaluación M5:** UTG con $40 de stack (20bb) abre a $6; tú, con 2♦2♣ en BU y $200, ¿pagas para buscar trío? *(No: solo quedan $34 detrás, menos de 6 veces lo invertido.)*

---

### Módulo 6 — La apuesta de continuación (*c-bet*)
**Objetivo:** decidir cuándo apostar y cuándo pasar el flop cuando fuiste el agresor antes del flop.
**Al terminar sabrá:** elegir si hace *c-bet*, a qué tamaño y por qué no debe ser automática.

- **6.1 ¿Qué es una *c-bet* y por qué no es automática?** Idea: apostar el flop tras haber subido antes; hacerlo siempre es un error. Base: Clarke Cap. 4; Brokos Introducción; Acevedo Cap. 12. Ejemplo: abres con 7♦6♦, un fish que paga mucho te paga; flop Q♠J♥T♠: no tienes pareja ni proyecto; apostar quema fichas, pasas.
- **6.2 Flops secos y flops mojados.** Idea: seco = pocos proyectos posibles (K♠7♦2♣); mojado = muchos (J♥T♥8♣). Base: Clarke Cap. 4; Acevedo Cap. 12. Ejemplo: en Q♠7♦2♣ el rival rara vez conectó; en 9♥8♥6♣ su rango tiene parejas, dobles y proyectos.
- **6.3 Tres factores para una *c-bet* de farol.** Idea: textura seca, rival que se retira lo suficiente, y algo de *equity* de respaldo. Base: Clarke Cap. 4. Ejemplo: 7♠6♠ en K♦6♣2♠, BB pagó: tienes pareja baja y un proyecto de color lejano; buena *c-bet*.
- **6.4 ¿De qué tamaño?** Idea: pequeña (1/3 a 1/2 del bote) en flops secos; grande (2/3 a bote) en flops mojados. Base: Clarke Cap. 4.2; Acevedo Cap. 12. Ejemplo: bote $12; en A♣8♦2♠ apuestas $4; en J♥T♥5♣ con A♠J♠ apuestas $8.
- **6.5 Botes con 3 o más jugadores (*multiway*).** Idea: con más rivales es más probable que alguien ligue; apuesta casi solo con manos fuertes o proyectos grandes. Base: Clarke Cap. 4. Ejemplo: abres Q♣T♣ en CO y pagan BU y BB (bote $16); en K♦9♠8♠ tienes solo un *gutshot*: pasas.

**Mini-evaluación M6:** abres A♥5♥ en BU a $5, paga BB (reg). Bote $11. Flop K♠7♦2♣ y BB pasa: ¿*c-bet*? *(Sí; flop seco con ventaja de cartas altas; apuesta pequeña de $4 a $5.)*

---

### Módulo 7 — Apostar por valor
**Objetivo:** cobrar el máximo cuando tienes la mejor mano.
**Al terminar sabrá:** distinguir fuerza absoluta de fuerza relativa, apostar por valor en varias calles y ajustar el tamaño al rival.

- **7.1 Fuerza relativa: ¿qué mano es fuerte de verdad?** Idea: el valor de una mano depende del tablero y del rival. Base: Clarke Cap. 5. Ejemplo: A♠Q♦ en Q♣8♥4♠ es excelente; en Q♣J♥T♥9♥ esa pareja ya es débil frente a la agresión.
- **7.2 La regla de oro: ¿te pagan manos peores?** Idea: solo apuestas por valor si lo que paga es en su mayoría peor que tu mano. Base: Hardin Cap. 14; Clarke Cap. 5. Ejemplo: K♥Q♥ en K♦9♠4♣, bote $12, apuestas $8: pagan K con kicker menor, 9x, parejas pequeñas y proyectos.
- **7.3 Construir el bote en tres calles.** Idea: con manos muy fuertes apuesta flop, turn y river en lugar de esperar con *slowplay*. Base: Clarke Cap. 5. Ejemplo: 7♠7♥ en K♣7♦3♠, bote $15: apuestas $10, luego $25, luego $55.
- **7.4 Elasticidad: ajusta el tamaño al rival.** Idea: contra rivales que pagan casi cualquier cantidad, apuesta más grande. Base: Clarke Cap. 5. Ejemplo: un fish que paga tiene J♣T♣ en J♥8♦2♠ y tú A♥J♦; en un bote de $25 pagará igual $15 que $22: apuesta $22.
- **7.5 Valor fino (*thin value*) en el river.** Idea: apostar manos medias cuando el rival mostró debilidad. Base: Clarke Cap. 5; Brokos Cap. 6. Ejemplo: A♦J♣ en J♥7♣2♠4♦9♣, ambos pasaron el turn: en river apuestas $7 en bote de $20 para que paguen J peores o parejas bajas.

**Mini-evaluación M7:** BU con A♣A♦ contra un fish que paga en BB; flop Q♥8♠3♣, bote $15. ¿Pasas o apuestas, y de qué tamaño? *(Apuestas por valor, $10 a $12.)*

---

### Módulo 8 — Defensa después del flop
**Objetivo:** dejar de pagar por curiosidad y de retirarte de más.
**Al terminar sabrá:** decidir ante una apuesta en river, flop y turn, y distinguir un *donk bet*.

- **8.1 El river: la decisión cerrada.** Idea: en el river no hay más apuestas; comparas el precio con la frecuencia de farol del rival. Base: Clarke Cap. 7; Hardin Cap. 16. Ejemplo: bote $100, rival apuesta $50: necesitas ganar 25%.
- **8.2 Flop y turn: la decisión abierta.** Idea: aquí también pesan las calles futuras; las fórmulas del river no se aplican literalmente (advertencia de Acevedo). Base: Clarke Cap. 8; Acevedo Cap. 12. Ejemplo: 7♥7♦ en K♠9♠5♣, rival apuesta $6 en bote $11: necesitas 26% inmediato, pero además cuenta qué cartas te dejan en aprietos en el turn.
- **8.3 Defender el flop: manos hechas y proyectos.** Idea: pagar con parejas decentes para no regalar el bote, y con proyectos usando precio. Base: Clarke Cap. 8. Ejemplo: defiendes BB con 9♥8♥ y el flop es K♣8♦3♠: con segunda pareja, defender una *c-bet* pequeña es lo habitual.
- **8.4 El *donk bet*.** Idea: cuando quien solo pagó antes del flop apuesta primero, suele tener mano media o proyecto. Base: Clarke Cap. 8; Acevedo Cap. 11. Ejemplo: abres A♠K♦, BB paga, flop Q♥7♣4♠ y BB apuesta $8 en $11: con K♠Q♠ pagas o subes; con AK sin ligar te retiras contra un rival pasivo.

**Mini-evaluación M8:** en el river, bote $80, rival apuesta $80. ¿Qué porcentaje de veces debe estar faroleando para que pagar sea rentable? *(33,3%)*.

---

### Módulo 9 — Faroles y semifaroles
**Objetivo:** ganar botes sin tener la mejor mano, con matemáticas.
**Al terminar sabrá:** calcular cuántas veces debe funcionar un farol, usar semifaroles y saber cuándo rendirse.

- **9.1 La matemática del farol.** Idea: porcentaje de equilibrio = apuesta ÷ (bote + apuesta). Base: Hardin Cap. 16; Acevedo Cap. 2. Ejemplo: bote $100, faroleas $50: necesitas que se retire 33%.
- **9.2 El semifarol: dos formas de ganar.** Idea: apostar con un proyecto fuerte te da dos caminos: que se retire o que tú ligues. Base: Hardin Cap. 15. Ejemplo: J♥T♥ en 9♥6♣2♥ tiene 15 *outs* (color + escalera); apostar fuerte es mejor que pagar pasivo.
- **9.3 El segundo tiro (*double barrel*).** Idea: seguir apostando en el turn si la carta mantiene o mejora tu rango. Base: Clarke Cap. 12. Ejemplo: K♥J♥ en Q♥9♣4♠: *c-bet*; cae el 2♥: ahora tienes color + *gutshot*, sigues.
- **9.4 No farolees al fish que paga.** Idea: si paga flop y el turn no cambia nada, deja de farolear. Base: Clarke Cap. 12. Ejemplo: un fish que paga la *c-bet* en J♠8♦4♣; cae 2♥; tú A♣5♣: pasas.
- **9.5 La *delayed c-bet*.** Idea: si ambos pasaron el flop, el rival suele estar débil en el turn. Base: Clarke Cap. 12. Ejemplo: abres 7♠6♥ en BU, BB paga; flop K♠8♣4♦ ambos pasan; turn 2♠ BB pasa: apuestas $3 en bote $5,50.

**Mini-evaluación M9:** en river, bote $60, faroleas $40: ¿qué porcentaje de retiradas necesitas? *(40%)*. ¿Lo harías contra un fish que paga? *(No.)*

---

### Módulo 10 — *3-bet* y botes grandes
**Objetivo:** usar la resubida antes del flop y reaccionar cuando te la hacen.
**Al terminar sabrá:** elegir entre rango lineal y polarizado, dimensionar la resubida y defender su propia apertura.

- **10.1 ¿Qué es el *3-bet*?** Idea: resubir una apertura para cobrar valor y ganar dinero muerto. Base: Clarke Cap. 10; Hardin Cap. 13. Ejemplo: HJ abre a $6, tú en BU con Q♠Q♥ resubes a $16–$18.
- **10.2 Rango lineal y rango polarizado.** Idea: lineal (solo manos fuertes: JJ+, AQ+) contra rivales que pagan; polarizado (manos muy fuertes + algunos faroles con *blockers* como A5s) contra rivales que se retiran. Base: Clarke Cap. 10; Hardin Cap. 13. Ejemplo: contra un reg que se retira mucho, resubes QQ+, AK y A5s, A4s.
- **10.3 Tamaños de *3-bet*.** Idea: en posición ≈ 3× la apertura; fuera de posición ≈ 3,5× a 4×. Base: Clarke Cap. 10.5 (IP 7bb, OOP 8bb contra apertura de 2,5bb); Acevedo Cap. 7 (IP 8,5bb, OOP 10bb). Ejemplo: BU abre a $5 y tú estás en BB: resubes a $16–$20; si CO abre a $5 y estás en BU, resubes a $14–$17.
- **10.4 Cuando te hacen *3-bet*.** Idea: *4-bet* por valor (KK+, AK), pagar manos con buena jugabilidad en posición, retirarse con el resto. Base: Clarke Cap. 11. Ejemplo: abres K♦J♦ en CO a $5; un nit en BB resube a $20: fácil retirarse.
- **10.5 Botes de *3-bet* y SPR.** Idea: el SPR es el stack efectivo ÷ el bote; con SPR bajo las *c-bets* son más pequeñas y las parejas altas bastan para ir *all-in*. Base: Clarke Cap. 13; Acevedo Caps. 4 y 12; Hardin Cap. 2. Ejemplo: bote $39 con $182 detrás (SPR ≈ 4,7): en Q♥7♦2♣ apuestas $10–$12.

**Mini-evaluación M10:** un fish agresivo abre en CO y nunca se retira ante *3-bet*. ¿Resubes con A♠Q♠ o con A♥4♥? *(Con A♠Q♠, por valor; no con A♥4♥, porque no tiene *fold equity*.)*

---

### Módulo 11 — Mentalidad, banca y hábitos
**Objetivo:** proteger tu dinero y tu cabeza para que lo aprendido rinda.
**Al terminar sabrá:** gestionar su banca, reconocer el tilt y organizar su estudio.

- **11.1 La varianza: jugar bien no garantiza ganar hoy.** Idea: los resultados de corto plazo oscilan mucho alrededor del EV. Base: Clarke Cap. 1.2; Acevedo Cap. 6. Ejemplo: un ganador de 5 bb/100 tiene ~22,8% de probabilidad de estar en pérdidas tras 10.000 manos (Acevedo).
- **11.2 Gestión de banca.** Idea: tu banca es dinero aparte y debe cubrir malas rachas. Base: Acevedo Cap. 6 (mínimos teóricos: ≈13,5 *buy-ins* a 5 bb/100 y ≈27 a 2,5 bb/100); Clarke Cap. 1.4. *Los libros no dan una tabla por límite; la regla para el alumno se decide (ver pendientes).*
- **11.3 Tilt y juego mental.** Idea: el tilt convierte una mala racha en un error tras otro. Base: Clarke Cap. 1.4 y Apéndice 2; Acevedo Cap. 6. Ejemplo: tras perder con AA contra un trío, pagas un *3-bet* con K♦T♣ fuera de posición: eso es tilt.
- **11.4 Cómo estudiar y revisar tus manos.** Idea: revisar 3 a 5 manos dudosas por sesión y calcular su EV. Base: Acevedo Cap. 6 (50% jugar / 50% estudiar al empezar); Hardin Cap. 17; Clarke Cap. 8. Ejemplo: un *all-in* de $180 para ganar $399: ¿era +EV?
- **11.5 Cuántas mesas y qué mesa elegir.** Idea: ganas más sentándote con rivales débiles y sin abrir más mesas de las que puedes atender. Base: Clarke Cap. 1.4; Acevedo Caps. 4 y 6. Ejemplo: 10 bb/100 en una partida blanda de $2/$5 rinde más que 2 bb/100 en una dura de $10/$20.

**Mini-evaluación M11:** ¿Por qué perder un bote en el que tenías 82% no significa que decidiste mal? *(Porque se juzga la decisión por su EV, no el resultado de una vez.)*

---

### Módulo 12 (opcional) — Puente a GTO
**Objetivo:** dar una primera ventana, sin fórmulas pesadas ni *solvers*, al póker basado en equilibrio.
**Al terminar sabrá:** contar *combos*, distinguir rangos polarizados y condensados y entender la idea del equilibrio.

- **12.1 Contando *combos*.** Idea: pareja = 6 combos, *suited* = 4, *offsuit* = 12; tus cartas bloquean combos del rival (*blockers*). Base: Hardin Cap. 18; Clarke Cap. 9; Brokos Cap. 8. Ejemplo: con A♠K♥ en mano, al rival le quedan 3 combos de AA y 3 de KK.
- **12.2 Rango polarizado y rango condensado.** Idea: polarizado = muy fuertes y faroles; condensado = manos medias. Base: Brokos Cap. 2. Ejemplo: el "juego de la clarividencia" con A, K, Q.
- **12.3 El equilibrio y el principio de indiferencia.** Idea: apostar la mezcla justa de valor y farol para que al rival le dé igual pagar o no. Base: Brokos Caps. 1 y 2; Acevedo Cap. 2. Ejemplo: apuesta del tamaño del bote: el rival necesita 33%; con 2 combos de valor por cada 1 de farol, pagar le da EV = 0.
- **12.4 El equilibrio como brújula para explotar.** Idea: imaginar la jugada de equilibrio, ver dónde se equivoca el rival y desviarte en proporción. Base: Brokos Cap. 5. Ejemplo: si el rival se retira más de lo que debería, haces más faroles.

**Mini-evaluación M12:** flop A♥K♣7♦, tienes A♠Q♥: ¿cuántos combos de AA y de KK puede tener el rival? *(1 de AA y 3 de KK.)*

---

## 5. Cómo resolvemos las discrepancias entre autores

| Tema | Autores | Regla del curso |
|---|---|---|
| GTO frente a explotar | Acevedo defiende base GTO; Clarke y Brokos explotan; Hardin ignora el GTO | Módulos 1–11 enseñan reglas simples y explotación; el equilibrio queda para el Módulo 12 |
| *C-bet* automática | Brokos y Acevedo la critican; Clarke la usa sin automatismo | Nunca automática: pequeña en flops secos, pasar en flops mojados o *multiway* sin mano ni proyecto |
| *Open limp* | Clarke lo rechaza; Acevedo lo acepta en SB y torneos | Regla simple: o subes o te retiras |
| Fórmulas de *alpha* y MDF en el flop | Hardin y Clarke las aplican; Acevedo advierte que engañan en el flop | Fórmulas estrictas solo en el river o *all-in*; en flop y turn se considera la *equity* futura |
| Umbrales de SPR | Hardin: bajo 0–2, medio 3–6, alto 7+. Acevedo: bajo 0–5, medio 6–11, alto 11+ | Pendiente de decidir (sección 8) |

## 6. Fuera de alcance

- Todo el bloque de torneos de Acevedo (Caps. 6–9): ICM, *push/fold*, bancas de torneo.
- *Solvers* y software avanzado (Acevedo Cap. 3, Hardin Cap. 17 más allá del EV básico).
- Teoría post-flop de *solvers* (Acevedo Caps. 10, 11, 13, 14).
- Juegos teóricos complejos de Brokos (Caps. 3, 6, 7, 8) más allá de los fundamentos del Módulo 12.
- Stacks muy profundos o cortos, *4-bet/5-bet* avanzados, *probe bets* y *bluff-raises* (Clarke Caps. 11–14).

## 7. Registro de verificación

**Cifras confirmadas contra los libros:** regla del 2 y 4 y *outs* por proyecto (Hardin); tabla de *pot odds* (Hardin; el 1/3 sale impreso como 19,9%); probabilidad de ligar *set* 11,76% (Hardin); múltiplos de *set-mining* 10× (Clarke) y 15× (Hardin); SPR como stack efectivo ÷ bote.

**Errores del borrador de NotebookLM, corregidos aquí:**
- La clasificación "fish pasivo, fish agresivo, nit, reg" estaba atribuida a Hardin; en realidad Hardin usa NIT, TAG, LAG, loose passive, calling station y maniac, y Clarke usa fish, reg y nit.
- Aislamiento contra *limpers*: la regla de Clarke es 3bb + 1bb por limper + 1bb fuera de posición (no "4bb + 1bb por limper").
- Tamaños de *c-bet*: Clarke da 1/2 a 3/5 en flops secos, no 1/3; Acevedo propone 1/3. El curso usa 1/3 a 1/2.
- Tamaños de *3-bet*: Clarke y Acevedo dan 7–8,5bb en posición y 8–10bb fuera de posición contra apertura de 2,5bb; el borrador decía 3× y 4× sin respaldo exacto.
- Porcentajes de apertura: Clarke solo da UTG ≈ 11% y HJ ≈ 15,5% en el texto; los de Acevedo son de torneos 9-max. El borrador usaba "UTG 15% / BU 43%" sin distinguir.
- Ejemplo de BB: el bote y la *equity* requerida estaban mal. Corregido: pagas $3 para ganar $8 (27%).
- Ejemplo de *outs* sucios: el K♥ no completaba escalera. Corregido a Q♥ y 7♥.
- Ejemplo de *multiway*: el bote era $16, no $19.
- Ejemplo de valor 7.2 tenía texto confuso; ejemplo 7.5 usaba una mesa con escalera posible; ejemplo 9.3 completaba una escalera ya hecha. Se reescribieron.
- Mini-evaluación del Módulo 5: con $70 detrás el cálculo quedaba al borde; se cambió a $40.
- Regla del *minraise*: el libro simplifica; se usa la regla estándar.

**Contenido sin respaldo en los libros (se redactará desde las reglas públicas o criterio propio):** reglas básicas y jerarquía de manos (0.1, 0.2, 0.7); equity requerida para defender BB contra 2,5bb (cálculo propio, 27%); tabla de banca por límite.

## 8. Decisiones pendientes tuyas

1. **Banca:** los libros solo dan mínimos teóricos (13,5 a 27 *buy-ins*). ¿Qué recomendación fijamos para el alumno? Mi propuesta: 30 *buy-ins* como mínimo prudente.
2. **SPR:** ¿adoptamos los umbrales de Hardin, los de Acevedo o una regla simple propia (bajo ≤ 4, alto ≥ 10)?
3. **Rangos de apertura:** hay que fijar la tabla final por posición. Propuesta: sacar los gráficos de Clarke (Figuras 10, 15 y 16) con NotebookLM para diseñarla.
4. **Ritmo:** 64 lecciones es una estimación; si prefieres menos, se pueden fusionar algunas del Módulo 0 y el Módulo 9.
5. **Formato de entrega** de las lecciones (texto, imágenes de cartas, ejercicios, otro formato que el usuario prefiera).

## 9. Siguiente fase

1. Con tu visto bueno, redactar una **lección piloto completa** (propuesta: 3.2, *pot odds*) para validar tono y formato.
2. Después, producir los módulos de a uno, con NotebookLM verificando cada cifra antes de publicar.

## 10. Origen de cada decisión

Para que puedas cuestionar lo que no te convenza. "Libros" significa que NotebookLM lo extrajo de los 4 libros. "Agente" significa que lo decidió el asistente que armó esta versión, sin que el usuario lo pidiera.

| Decisión | Origen |
|---|---|
| Curso para principiantes, de cash, con lecciones cortas y paulatinas | Usuario |
| Ejemplos con cartas y apuestas en cada lección | Usuario |
| Contenido propio, no copiado de los libros | Usuario |
| NotebookLM lee y consolida los libros; el agente no los lee | Usuario |
| Definir primero la estructura, de forma detallada | Usuario (el agente propuso hacerla en capas) |
| Mesas de 6 jugadores y 100 ciegas grandes | Libros (Clarke y Acevedo); el agente lo adoptó sin consultarte |
| Ciegas $1/$2 y stack de $200 en los ejemplos | Agente |
| Temas, orden de módulos y nivel por tema | Libros, con correcciones del agente |
| Módulo 0 (primeros pasos) y Módulo 11 (mentalidad y banca) | Idea del agente; contenido de los libros |
| Lección 4.2 (cuadrícula 13×13) | Agente |
| 64 lecciones, ritmo de 13 semanas, formato de cinco pasos por lección, repaso cada 3 módulos | Agente |
| Reglas para resolver discrepancias entre autores | Propuestas por NotebookLM; adoptadas por el agente |
| Jerarquía de manos, reglas básicas, regla estándar del *minraise* | Agente (reglas públicas del juego) |
| Equity de 27% para defender la ciega grande contra 2,5bb | Agente (cálculo propio) |
| Propuesta de 30 *buy-ins* de banca | Agente (pendiente de tu decisión) |
| Corrección de cifras y ejemplos | Agente, con verificación de NotebookLM |
| Commit local y `.gitignore` de `libros/` y respuestas en bruto | Agente (no pedido por el usuario) |

**Nota de procedencia:** el agente tuvo cargada, al inicio, la memoria de otro proyecto del mismo repositorio y la usó en una primera versión de los documentos de traspaso. Esas referencias ya se eliminaron. No hay constancia de que ninguna regla de ese otro proyecto se haya usado en el contenido, pero la auditoría independiente existe para comprobarlo.
