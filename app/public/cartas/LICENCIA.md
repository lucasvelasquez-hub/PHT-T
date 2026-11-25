# Mazo de cartas

## Caras (clasico/ y cuatro_colores/)
- Fuente: **Vectorized Playing Cards 3.2**, de Chris Aguilar.
  https://totalnonsense.com/open-source-vector-playing-cards/
- Licencia: **LGPL 3.0** (https://www.gnu.org/licenses/lgpl-3.0.html).
  Los términos exigen mostrar el texto de crédito en un lugar público (pantalla "Créditos" de la app)
  y prohíben usar las cartas para crear NFT.
- Original sin modificar: `recursos/cartas_chris_aguilar/` (zip y SVG de la versión 3.2).
- Cambios hechos aquí (`app/scripts/acabado_cartas.sh`): se rasterizan a 640×894 y se les da material:
  papel marfil con luz cenital, fibra de papel, tinta un poco más saturada, canto con volumen y brillo tenue.
  `cuatro_colores/` solo trae diamantes (rojo #c8102e → azul #1d5fc4) y tréboles (negro → verde #1b6e3a, figura incluida).
- Nombres: rango (`2`-`9`, `T`, `J`, `Q`, `K`, `A`) + palo (`s`, `h`, `d`, `c`), igual que el motor: `Qd.webp`.

### Texto de crédito obligatorio (mostrar en "Créditos")
> Cartas: Vectorized Playing Cards 3.2 — Copyright 2011, 2024 Chris Aguilar — conjurenation@gmail.com —
> Licensed under LGPL 3.0 (https://www.gnu.org/licenses/lgpl-3.0.html) —
> https://totalnonsense.com/open-source-vector-playing-cards/

## Dorso (dorso.svg → dorso.webp)
Diseño propio de Next Chip. Sin restricciones de uso.

## Mazo anterior
El mazo de Dmitry Fomin (CC0) que se usó antes quedó guardado en `recursos/cartas_fomin/`.
