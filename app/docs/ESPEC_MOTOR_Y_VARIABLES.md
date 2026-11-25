# Especificación Técnica: Motor de Variables y Equity — Modelo 4

> **Versión:** 1.0  
> **Fecha:** 2026-11-25  
> **Propósito:** Permitir la reimplementación exacta, en TypeScript y sin acceso al código Python original, de las 47 variables de entrada del Modelo 4 y del motor de equity asociado.  
> **Fuentes de verdad:**
> - `notebooks/10_m4_reconstruccion_pluribus.ipynb` — funciones `reconstruir_decisiones_v4`, `variables_cartas`, `textura_mesa`, parsing PHH, caché de equity preflop, Monte Carlo.
> - `notebooks/12_motor_matematico_equity.ipynb` — funciones `calcular_equity_monte_carlo`, `variables_cartas` (reutilizable), `entrenador_inteligente`.
> - `models/v4_pluribus/variables_modelo4.json` — orden de features y `variables_log`.

---

## Índice

1. [Reglas de parsing PHH](#1-reglas-de-parsing-phh)
2. [Tabla de las 47 features](#2-tabla-de-las-47-features)
3. [Funciones `textura_mesa` y `variables_cartas`](#3-funciones-textura_mesa-y-variables_cartas)
4. [Motor de Equity](#4-motor-de-equity)
5. [Uso de treys](#5-uso-de-treys)
6. [Función `entrenador_inteligente`](#6-función-entrenador_inteligente)
7. [Ambigüedades o riesgos](#7-ambigüedades-o-riesgos)

---

## 1. Reglas de parsing PHH

### 1.1 Formato del archivo

Cada mano está en un archivo `.phh` con formato TOML. Los campos relevantes son:

| Campo TOML               | Tipo            | Ejemplo                                     |
|---------------------------|-----------------|---------------------------------------------|
| `players`                | `string[]`      | `["MrBlue", "MrBlonde", "MrWhite", ...]`   |
| `starting_stacks`        | `number[]`      | `[10000, 10000, 10000, 10000, 10000, 10000]`|
| `blinds_or_straddles`    | `number[]`      | `[50, 100, 0, 0, 0, 0]`                    |
| `actions`                | `string[]`      | Lista ordenada de tokens de acción           |

> **Formato del dataset de Pluribus:** 6 jugadores, ciegas 50/100 (BB = 100), stacks iniciales de 10 000 (100 BB). No hay antes.

### 1.2 Tokens de acción

Cada elemento de `actions` es una cadena con la siguiente gramática:

| Token                      | Significado                                                                 |
|----------------------------|-----------------------------------------------------------------------------|
| `d dh p{i} {cartas}`      | **Deal hole cards:** el crupier reparte cartas privadas al jugador `p{i}`. Ejemplo: `d dh p1 TcQc` |
| `d db {cartas}`            | **Deal board:** el crupier reparte cartas comunitarias. Ejemplo: `d db 7d5h9d` (flop) o `d db Qh` (turn/river) |
| `p{i} f`                  | **Fold:** el jugador `p{i}` se retira.                                     |
| `p{i} cc`                 | **Check/Call:** el jugador `p{i}` pasa (si `to_call == 0`) o paga la apuesta vigente. |
| `p{i} cbr X`              | **Raise TO X:** el jugador `p{i}` sube **hasta** un total de `X` fichas en la calle actual. El pago real es `min(max(0, X − already_put), stack)`. |
| `sm` (u otros no listados)| Tokens de showdown/mucking; se **ignoran** (no generan decisiones).        |

> **Regla clave de `cbr X`:** `X` es la cantidad **total** que el jugador tendrá puesta en la calle, NO la cantidad que añade. El pago efectivo se calcula así:
> ```python
> total = float(partes[2])  # X del token 'cbr X'
> pago = min(max(0.0, total - puesto[pid]), stack)
> ```

### 1.3 Cartas

Las cartas se representan con 2 caracteres: rango + palo.

- **Rangos:** `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `T`, `J`, `Q`, `K`, `A`
- **Palos:** `c` (clubs/tréboles), `d` (diamonds/diamantes), `h` (hearts/corazones), `s` (spades/picas)

La función `separar_cartas` convierte una cadena concatenada en un arreglo:

```python
def separar_cartas(texto):
    """Convierte 'Qs9c2h' en ['Qs', '9c', '2h']."""
    return [texto[i:i + 2] for i in range(0, len(texto), 2)]
```

### 1.4 Codificación numérica de rangos

```python
RANKS = {r: i for i, r in enumerate('23456789TJQKA', start=2)}
# Resultado: {'2': 2, '3': 3, ..., '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14}
```

El As vale **14** (no 1) como valor de rango de carta. Sin embargo, para detectar proyectos de escalera el As también puede contar como 1 (ver sección 3).

### 1.5 Ciegas y posiciones

**Inicialización de ciegas:**

```python
n = len(mano.players)
ciegas = [float(c) for c in mano.blinds_or_straddles]
bb = max(ciegas)  # 100 en el dataset de Pluribus
pids = [f"p{i+1}" for i in range(n)]  # ["p1", "p2", ..., "p6"]
```

Las ciegas se publican en orden de asientos: `p1` = SB (50), `p2` = BB (100), el resto 0.

> **Inversión de ciegas en heads-up:** El código Python contiene la lógica `if n == 2: ciegas = ciegas[::-1]`, que invierte el orden de las ciegas en manos de 2 jugadores. Sin embargo, el dataset de Pluribus es siempre de 6 jugadores, por lo que esta inversión **no se activa** en la práctica. La implementación TypeScript debe incluirla para mantener compatibilidad si se reutiliza el motor con formatos de 2 jugadores.

**Orden preflop:**

```python
orden_pre = {p: (int(p[1:]) - 1 - 2) % n for p in pids}
```

Esto produce para n = 6: `{p1: 5, p2: 0, p3: 1, p4: 2, p5: 3, p6: 4}` — es decir, preflop actúa primero `p3` (UTG) y último `p1` (SB). El orden real de juego no se deduce de `orden_pre` directamente; los tokens `actions` ya están en el orden de actuación real. `orden_pre` y `orden_post` se usan para calcular `pos_pre`, `pos_post` y `detras`.

**Orden postflop:**

```python
orden_post = {p: int(p[1:]) - 1 for p in pids}
```

Resultado para n = 6: `{p1: 0, p2: 1, ..., p6: 5}` — postflop actúa primero `p1` (SB).

**Posiciones nominales:**

| Variable   | Condición                 |
|------------|---------------------------|
| `es_sb`    | `pid == 'p1'`            |
| `es_bb`    | `pid == 'p2'`            |
| `es_boton` | `pid == pids[-1]` (p6)   |

### 1.6 Máquina de estados — Regla clave: "snapshot antes de actuar"

> **Regla:** La "foto de la mesa" se captura **ANTES** de que el jugador ejecute su acción. Todos los valores de bote, stack, pot odds, etc., corresponden al estado justo antes de que el jugador actúe.

**Estado global que se mantiene a lo largo de la mano:**

```python
stacks = {pid: float(starting_stack) for cada jugador}
inicial = dict(stacks)   # copia de los stacks iniciales, no se modifica
puesto = {p: 0.0 for p in pids}  # dinero puesto en la calle actual
bote = 0.0                       # dinero total en el bote
apuesta_alta = 0.0               # apuesta más alta en la calle actual
activos = set(pids)              # jugadores que no han hecho fold
calle = 0                        # 0=preflop, 1=flop, 2=turn, 3=river
board = []                       # cartas comunitarias
cartas_privadas = {}             # {pid: [carta1, carta2]}
subidas_calle = 0                # raises en la calle actual
callers_calle = 0                # calls en la calle actual
checks_calle = 0                 # checks en la calle actual
subidas_pre = 0                  # raises totales en preflop (se acumula; NO se reinicia en nuevas calles)
ultimo_agresor = None            # pid del último raise en la calle actual
agresor_prev = None              # pid del último raise de la calle ANTERIOR
agresor_pre = None               # pid del último raise en preflop (se acumula)
ult_apuesta = 0.0                # ratio del último raise vs. bote (en la calle actual)
actuo_calle = {p: 0 for p in pids}   # cuántas veces ha actuado el jugador en la calle
subio_calle = {p: 0 for p in pids}   # cuántas veces ha subido el jugador en la calle
```

**Al publicar las ciegas (antes de cualquier acción):**

```python
for i, c in enumerate(ciegas):
    if c > 0:
        p = pids[i]
        bote += c
        stacks[p] -= c
        puesto[p] = c
        apuesta_alta = max(apuesta_alta, c)
```

### 1.7 Procesamiento de cada acción

#### A. Acción del crupier (`actor == 'd'`)

- **`d dh p{i} {cartas}`**: Almacena las cartas privadas del jugador.
  ```python
  cartas_privadas[partes[2]] = separar_cartas(partes[3])
  ```
- **`d db {cartas}`**: Reparte cartas comunitarias. Se avanza de calle y se reinician contadores de calle:
  ```python
  calle += 1
  board += separar_cartas(partes[2])
  agresor_prev = ultimo_agresor  # el agresor de la calle que termina pasa a "prev"
  ultimo_agresor = None
  puesto = {p: 0.0 for p in pids}
  apuesta_alta = 0.0
  subidas_calle = 0
  callers_calle = 0
  checks_calle = 0
  ult_apuesta = 0.0
  actuo_calle = {p: 0 for p in pids}
  subio_calle = {p: 0 for p in pids}
  ```

#### B. Acción de un jugador

Condiciones para procesar: `len(partes) >= 2 and partes[1] in ('f', 'cc', 'cbr') and actor in stacks`.

**B1. Captura del snapshot (ANTES de actuar):**

```python
to_call = max(0.0, apuesta_alta - puesto[pid])
stack = stacks[pid]
rivales = [stacks[q] + puesto[q] for q in activos if q != pid]
efectivo = min(stack + puesto[pid], max(rivales)) if rivales else stack
orden = orden_pre if calle == 0 else orden_post
detras = sum(1 for q in activos if q != pid and stacks[q] > 0 and orden[q] > orden[pid])
label = {'f': 0, 'cc': 1, 'cbr': 2}[tipo]
```

> **Decisiones incluidas/excluidas:** Toda acción `f`, `cc` o `cbr` de un jugador en `stacks` genera una decisión (fila). No se excluyen decisiones de jugadores all-in ni de acciones forzadas; si un jugador aparece con `stacks[q] <= 0` todavía puede aparecer en una acción `cc` y se genera su decisión. Los tokens que no sean `f`, `cc` o `cbr` se ignoran.

**B2. Guardar la fila con todas las variables:**

Se construye un diccionario con las features del modelo y metadatos. Las variables de cartas y equity se calculan con `variables_cartas(mis_cartas, board, len(activos) - 1)` y la textura de la mesa con `textura_mesa(board)`.

**Metadatos (no son features del modelo):**

| Campo         | Derivación                                                                |
|---------------|---------------------------------------------------------------------------|
| `hand_key`    | Índice secuencial de la mano (0, 1, 2, ...) asignado al leer el dataset en orden de archivo |
| `sesion`      | Nombre de la carpeta que contiene el `.phh`: `os.path.basename(os.path.dirname(ruta))` |
| `jugador`     | Nombre del jugador (`nombre[pid]`, mapeado de `mano.players`)             |
| `es_pluribus` | `int(nombre[pid] == 'Pluribus')` — 1 si el jugador es Pluribus, 0 si no |
| `cartas`      | Concatenación de las cartas privadas: `''.join(mis_cartas)`              |
| `mesa`        | Concatenación de las cartas comunitarias: `''.join(board)`               |
| `accion`      | Label de la acción: 0 = Fold, 1 = Check/Call, 2 = Bet/Raise             |
| `split`       | Partición train/val/test (asignada por sesión)                            |

**B3. Aplicar la acción a la mesa (DESPUÉS de guardar):**

```python
actuo_calle[pid] += 1

if tipo == 'f':
    activos.discard(pid)

elif tipo == 'cc':
    pago = min(to_call, stack)
    bote += pago
    stacks[pid] -= pago
    puesto[pid] += pago
    if to_call > 0:
        callers_calle += 1
    else:
        checks_calle += 1

else:  # 'cbr'
    total = float(partes[2])  # 'cbr X' = subir HASTA X
    pago = min(max(0.0, total - puesto[pid]), stack)
    ult_apuesta = pago / bote if bote > 0 else 0.0
    bote += pago
    stacks[pid] -= pago
    puesto[pid] += pago
    apuesta_alta = max(apuesta_alta, puesto[pid])
    subidas_calle += 1
    subio_calle[pid] += 1
    ultimo_agresor = pid
    if calle == 0:
        subidas_pre += 1
        agresor_pre = pid
```

### 1.8 Mapeo de clases de acción

| Código | Nombre         | Tokens que lo generan |
|--------|----------------|-----------------------|
| 0      | Fold           | `f`                   |
| 1      | Check/Call     | `cc`                  |
| 2      | Bet/Raise      | `cbr`                 |

---

## 2. Tabla de las 47 features

Las features se listan en el **orden exacto** definido en `variables_modelo4.json`. Este orden es el que debe usarse al construir el vector de entrada para el modelo.

> **`variables_log`**: Las features marcadas con ✓ en la columna "Log" reciben la transformación `np.log1p(X.clip(lower=0))` antes del escalado. La función `log1p(x) = ln(1 + x)` y `clip(lower=0)` fuerza negativos a 0 antes de aplicar log.

| #  | Nombre                | Fórmula / Definición                                                                                      | Tipo     | Log | Casos borde                                                                                           |
|----|------------------------|-----------------------------------------------------------------------------------------------------------|----------|-----|--------------------------------------------------------------------------------------------------------|
| 1  | `calle`               | Calle actual: 0 = Preflop, 1 = Flop, 2 = Turn, 3 = River                                                 | int      |     |                                                                                                        |
| 2  | `bote_bb`             | `bote / bb`                                                                                                | float    | ✓   | `bb` siempre > 0 (100 en Pluribus)                                                                    |
| 3  | `to_call_bb`          | `to_call / bb`                                                                                             | float    | ✓   | 0 si nadie ha apostado                                                                                 |
| 4  | `stack_bb`            | `stack / bb` (stack del jugador ANTES de actuar)                                                           | float    | ✓   |                                                                                                        |
| 5  | `pot_odds`            | `to_call / (bote + to_call)` si `(bote + to_call) > 0`, sino `0.0`                                       | float    |     | Si `to_call == 0`, pot_odds = 0 (no hay apuesta que pagar)                                            |
| 6  | `n_activos`           | `len(activos)` — jugadores que no han hecho fold                                                           | int      |     | Mínimo 2 (siempre quedan al menos 2 cuando alguien decide)                                            |
| 7  | `n_allin`             | `sum(1 for q in activos if stacks[q] <= 0)` — jugadores activos con stack ≤ 0                             | int      |     | 0 si nadie está all-in                                                                                 |
| 8  | `detras`              | Número de jugadores activos con stack > 0 cuyo `orden` es mayor que el del jugador actual                 | int      |     | Usa `orden_pre` si `calle == 0`, `orden_post` en otro caso                                            |
| 9  | `pos_pre`             | `orden_pre[pid] / (n - 1)` — posición preflop normalizada a [0, 1]                                        | float    |     | n siempre ≥ 2                                                                                          |
| 10 | `pos_post`            | `orden_post[pid] / (n - 1)` — posición postflop normalizada a [0, 1]                                      | float    |     |                                                                                                        |
| 11 | `es_sb`               | `1` si `pid == 'p1'`, `0` en otro caso                                                                    | int(0/1) |     |                                                                                                        |
| 12 | `es_bb`               | `1` si `pid == 'p2'`, `0` en otro caso                                                                    | int(0/1) |     |                                                                                                        |
| 13 | `es_boton`            | `1` si `pid == pids[-1]` (p6 en 6-max), `0` en otro caso                                                  | int(0/1) |     |                                                                                                        |
| 14 | `eff_bb`              | `efectivo / bb`. `efectivo = min(stack + puesto[pid], max(rivales))` donde `rivales = [stacks[q] + puesto[q] for q in activos if q != pid]`. Si no hay rivales: `efectivo = stack`. | float | ✓ | Si solo queda el jugador (edge case teórico), `efectivo = stack` |
| 15 | `spr`                 | `efectivo / bote` si `bote > 0`, sino `0.0`                                                                | float    | ✓   | División por 0 protegida                                                                               |
| 16 | `call_vs_bote`        | `to_call / bote` si `bote > 0`, sino `0.0`                                                                | float    |     | División por 0 protegida                                                                               |
| 17 | `call_es_allin`       | `1` si `to_call > 0 AND to_call >= stack`, `0` en otro caso                                                | int(0/1) |     | Si `to_call == 0`, siempre 0                                                                          |
| 18 | `invertido_bb`        | `(inicial[pid] - stack) / bb` — fichas ya invertidas por el jugador                                       | float    | ✓   | Siempre ≥ 0 (el stack solo baja)                                                                       |
| 19 | `subidas_calle`       | Contador de raises en la calle actual (se reinicia cada calle)                                             | int      |     | 0 al inicio de cada calle                                                                              |
| 20 | `callers_calle`       | Contador de calls en la calle actual (solo cuando `to_call > 0`)                                           | int      |     | 0 al inicio de cada calle                                                                              |
| 21 | `checks_calle`        | Contador de checks en la calle actual (solo cuando `to_call == 0`)                                         | int      |     | 0 al inicio de cada calle                                                                              |
| 22 | `subidas_pre`         | Contador total de raises en preflop (**no se reinicia** en calles posteriores)                              | int      |     | Se acumula durante toda la mano                                                                        |
| 23 | `ult_apuesta_vs_bote` | Ratio del último raise: `pago / bote` al momento del raise. Se reinicia a `0.0` al cambiar de calle.      | float    | ✓   | 0 si no ha habido raises en la calle actual. Si `bote == 0` al momento del raise: `0.0`               |
| 24 | `ya_actuo_calle`      | `actuo_calle[pid]` — veces que el jugador ha actuado en la calle actual (antes de esta acción)             | int      |     | 0 si es su primera acción en la calle                                                                  |
| 25 | `ya_subio_calle`      | `subio_calle[pid]` — veces que el jugador ha subido en la calle actual (antes de esta acción)              | int      |     | 0 si no ha subido                                                                                      |
| 26 | `es_agresor_pre`      | `1` si `agresor_pre == pid`, `0` en otro caso. `agresor_pre` es el último jugador que hizo raise en preflop. | int(0/1) |     | 0 si nadie subió en preflop                                                                           |
| 27 | `es_agresor_prev`     | `1` si `agresor_prev == pid`, `0` en otro caso. `agresor_prev` = último agresor de la calle **anterior**.  | int(0/1) |     | 0 si no hubo calle anterior o nadie subió                                                              |
| 28 | `hay_agresor_prev`    | `1` si `agresor_prev is not None`, `0` en otro caso                                                        | int(0/1) |     |                                                                                                        |
| 29 | `b_n`                 | Número de cartas comunitarias visibles: 0 (preflop), 3 (flop), 4 (turn), 5 (river)                        | int      |     |                                                                                                        |
| 30 | `b_pareada`           | `1` si algún rango de carta en el board se repite ≥ 2 veces, `0` en otro caso                              | int(0/1) |     | 0 en preflop (board vacío)                                                                             |
| 31 | `b_trio`              | `1` si algún rango de carta en el board se repite ≥ 3 veces, `0` en otro caso                              | int(0/1) |     | 0 en preflop                                                                                           |
| 32 | `b_max_palo`          | Máximo número de cartas del mismo palo en el board                                                         | int      |     | 0 en preflop                                                                                           |
| 33 | `b_alta`              | Rango de la carta más alta del board (2..14)                                                               | int      |     | 0 en preflop                                                                                           |
| 34 | `b_broadway`          | Número de cartas del board con rango ≥ 10 (T, J, Q, K, A)                                                  | int      |     | 0 en preflop                                                                                           |
| 35 | `b_conect`            | Máxima conectividad: `max(sum(1 for k in range(lo, lo+5) if k in unicos) for lo in range(1, 11))`. `unicos` incluye los rangos + el 1 si hay un As. | int |     | 0 en preflop. Ver detalle en sección 3.                                                                |
| 36 | `es_pluribus`         | `1` si el jugador es "Pluribus", `0` en otro caso                                                          | int(0/1) |     |                                                                                                        |
| 37 | `c_alta`              | Rango de la carta más alta de la mano privada (2..14)                                                      | int      |     |                                                                                                        |
| 38 | `c_baja`              | Rango de la carta más baja de la mano privada (2..14)                                                      | int      |     | Igual a `c_alta` en caso de pareja                                                                     |
| 39 | `c_pareja`            | `1` si ambas cartas privadas tienen el mismo rango, `0` en otro caso                                       | int(0/1) |     |                                                                                                        |
| 40 | `c_suited`            | `1` si ambas cartas privadas tienen el mismo palo, `0` en otro caso                                        | int(0/1) |     |                                                                                                        |
| 41 | `c_gap`               | `c_alta - c_baja` — distancia entre los rangos de las cartas privadas                                      | int      |     | 0 para parejas, 1 para conectores (ej. KQ)                                                            |
| 42 | `c_fuerza`            | `1 - rank / 7462` donde `rank` es el resultado de `evaluador.evaluate(board, mis_cartas)`. Fuerza absoluta en [0, 1], donde 1 = escalera real. | float |     | **Preflop:** `0.0` (no hay board para evaluar)                                                         |
| 43 | `c_clase`             | `evaluador.get_rank_class(rank)` — clase de mano según treys (1..9). Ver sección 5.                       | int      |     | **Preflop:** `10` (valor centinela fuera del rango 1-9)                                                |
| 44 | `c_proy_color`        | Proyecto de color: `1` si hay exactamente 4 cartas del mismo palo entre privadas + board, **el palo aparece en al menos una de las cartas privadas**, y el board tiene < 5 cartas. `0` en otro caso. | int(0/1) |     | 0 en preflop. 0 en river (board tiene 5 cartas)                                                       |
| 45 | `c_proy_escalera`     | Proyecto de escalera: `1` si hay exactamente 4 cartas de un rango dentro de alguna ventana de 5 consecutivos (1-5, 2-6, ..., 10-14) entre privadas + board, y board < 5 cartas. | int(0/1) |     | 0 en preflop. 0 en river. El As cuenta como 1 y como 14 (se agrega `{1}` si hay un As).               |
| 46 | `c_eq_pre`            | Equity preflop de la mano como clase de 169 manos. Se obtiene de un caché `lru_cache`. Ver sección 4.      | float    |     | Siempre se calcula; valor entre 0.0 y 1.0                                                              |
| 47 | `c_equity`            | Equity actual. **Preflop:** `c_equity = c_eq_pre`. **Postflop:** se calcula con Monte Carlo contra `num_rivales` rivales aleatorios, usando las cartas privadas y el board visible. | float |     | Valor entre 0.0 y 1.0. Puede diferir de `c_eq_pre` en postflop.                                      |

---

## 3. Funciones `textura_mesa` y `variables_cartas`

### 3.1 `textura_mesa(board)`

Calcula las features `b_*` del board.

```python
def textura_mesa(board):
    if not board:
        return dict(b_n=0, b_pareada=0, b_trio=0, b_max_palo=0,
                    b_alta=0, b_broadway=0, b_conect=0)
    valores = [RANKS[c[0]] for c in board]
    palos = [c[1] for c in board]
    repeticiones = np.bincount(valores, minlength=15)
    unicos = set(valores) | ({1} if 14 in valores else set())
    return dict(
        b_n=len(board),
        b_pareada=int(repeticiones.max() >= 2),
        b_trio=int(repeticiones.max() >= 3),
        b_max_palo=max(palos.count(s) for s in set(palos)),
        b_alta=max(valores),
        b_broadway=sum(v >= 10 for v in valores),
        b_conect=max(
            sum(1 for k in range(lo, lo + 5) if k in unicos)
            for lo in range(1, 11)
        )
    )
```

**Notas de implementación:**

- `np.bincount(valores, minlength=15)` crea un arreglo de 15 posiciones (índices 0-14) contando ocurrencias de cada valor. Como los rangos van de 2 a 14, las posiciones 0 y 1 siempre serán 0.
- **`b_conect`**: mide cuántas cartas de rangos únicos caen dentro de alguna ventana de 5 consecutivos. Para escaleras tipo `A-2-3-4-5` (wheel), el As se incluye como valor 1 en `unicos`. Las ventanas van de `[1,5]` a `[10,14]`.
- **`b_broadway`**: cartas con rango ≥ 10, es decir T(10), J(11), Q(12), K(13), A(14).

### 3.2 `variables_cartas(mis_cartas, mesa, num_rivales)`

Calcula las features `c_*` de las cartas privadas del jugador.

```python
def variables_cartas(mis_cartas, mesa, num_rivales):
    valores = sorted([RANKS[c[0]] for c in mis_cartas], reverse=True)
    suited = mis_cartas[0][1] == mis_cartas[1][1]
    letra = {v: k for k, v in RANKS.items()}  # inverso: {2: '2', ..., 14: 'A'}

    f = dict(
        c_alta=valores[0],
        c_baja=valores[1],
        c_pareja=int(valores[0] == valores[1]),
        c_suited=int(suited),
        c_gap=valores[0] - valores[1],
        c_eq_pre=equity_preflop(
            letra[valores[0]], letra[valores[1]],
            suited and valores[0] != valores[1],
            max(1, min(num_rivales, 4))
        ),
    )

    if mesa:  # postflop
        mias = [Card.new(c) for c in mis_cartas]
        rank = evaluador.evaluate([Card.new(c) for c in mesa], mias)
        todas = mis_cartas + mesa
        palos = [c[1] for c in todas]
        valores_todos = (
            set(RANKS[c[0]] for c in todas)
            | ({1} if any(c[0] == 'A' for c in todas) else set())
        )
        f.update(
            c_fuerza=1 - rank / 7462,
            c_clase=evaluador.get_rank_class(rank),
            c_proy_color=int(
                len(mesa) < 5
                and any(
                    palos.count(s) == 4
                    and s in (mis_cartas[0][1], mis_cartas[1][1])
                    for s in set(palos)
                )
            ),
            c_proy_escalera=int(
                len(mesa) < 5
                and any(
                    sum(k in valores_todos for k in range(lo, lo + 5)) == 4
                    for lo in range(1, 11)
                )
            ),
            c_equity=equity_monte_carlo(mis_cartas, mesa, num_rivales),
        )
    else:  # preflop
        f.update(
            c_fuerza=0.0,
            c_clase=10,
            c_proy_color=0,
            c_proy_escalera=0,
            c_equity=f['c_eq_pre'],
        )
    return f
```

**Reglas críticas:**

1. **`c_eq_pre` — clave de clase para el caché preflop:**
   ```python
   equity_preflop(alta_letra, baja_letra, suited_bool, num_rivales)
   ```
   - `alta_letra` = letra del rango mayor (ej. `'A'`).
   - `baja_letra` = letra del rango menor (ej. `'K'`).
   - `suited_bool` = `suited AND valores[0] != valores[1]`. Para **parejas**, `suited` se fuerza a `False` aunque ambas cartas sean suited (ya que las 169 clases no distinguen palos en parejas).
   - `num_rivales` = `max(1, min(num_rivales, 4))` — clamped entre 1 y 4.

2. **`c_proy_color`**: Solo detecta proyectos donde **al menos una de las cartas privadas** contribuye al flush draw (el palo con 4 cartas debe coincidir con `mis_cartas[0][1]` o `mis_cartas[1][1]`). No cuenta proyectos "del board" donde el jugador no tiene carta de ese palo. Además, solo se activa si `len(mesa) < 5` (no en river con board completo).

3. **`c_proy_escalera`**: Se busca que haya exactamente 4 de 5 rangos consecutivos cubiertos por las 5-7 cartas disponibles (privadas + board). Se considera el As como 1 para la rueda (A-2-3-4-5). Solo activo si `len(mesa) < 5`.

4. **`c_equity` en preflop**: Se asigna directamente el valor de `c_eq_pre` (no se llama a Monte Carlo con board vacío por separado).

5. **`c_equity` en postflop (notebook 10)**: Se usa `equity_monte_carlo(mis_cartas, mesa, num_rivales)` con 150 simulaciones (el default de la función en el notebook 10). En el notebook 12, la función homóloga `calcular_equity_monte_carlo` usa 1000 simulaciones por defecto en `variables_cartas`. El valor usado en el **dataset de entrenamiento** proviene del notebook 10 con **150 simulaciones**.

---

## 4. Motor de Equity

### 4.1 Equity preflop (caché de 169 clases)

```python
@lru_cache(maxsize=None)
def equity_preflop(alta, baja, suited, num_rivales):
    """Equity preflop de una de las 169 manos iniciales.
    Se calcula UNA SOLA VEZ por clave, con 3.000 simulaciones."""
    cartas = [alta + 's', baja + ('s' if suited else 'h')]
    return equity_monte_carlo(cartas, [], num_rivales, simulaciones=3000)
```

**Mapeo de mano a clave de clase:**

Dadas las cartas privadas del jugador:

1. Extraer rangos numéricos: `valores = sorted([RANKS[c[0]] for c in mis_cartas], reverse=True)`
2. Determinar si son suited: `suited = mis_cartas[0][1] == mis_cartas[1][1]`
3. Generar la clave como tupla `(alta_letra, baja_letra, suited_para_cache, num_rivales)`:
   - `alta_letra` = `letra[valores[0]]` (ej. `'A'` para 14)
   - `baja_letra` = `letra[valores[1]]` (ej. `'K'` para 13)
   - `suited_para_cache` = `suited AND (valores[0] != valores[1])` — para parejas, **siempre False**
   - `num_rivales` = `max(1, min(len(activos) - 1, 4))`

**Cartas canónicas usadas para simular:**
```python
cartas = [alta + 's', baja + ('s' if suited else 'h')]
```
Es decir, la carta alta siempre se simula como spade (`s`), y la carta baja como spade (si suited) o heart (`h`) (si offsuit). Para parejas, `suited` es False, por lo que se usa `[alta + 's', baja + 'h']` (p.ej. `['As', 'Ah']` para AA).

**Número de claves posibles por rival count:** 169 × 4 = 676 entradas máximas en el caché (169 clases × num_rivales 1..4).

**Simulaciones para preflop:** 3 000 por clase.

### 4.2 Equity postflop — Monte Carlo (Notebook 10)

```python
def equity_monte_carlo(mis_cartas, mesa, num_rivales, simulaciones=150):
    """
    Probabilidad de ganar (empates cuentan la mitad) frente a
    'num_rivales' manos aleatorias.
    """
    mias = [Card.new(c) for c in mis_cartas]
    tablero = [Card.new(c) for c in mesa]
    usadas = set(mias + tablero)
    disponibles = [c for c in MAZO_COMPLETO if c not in usadas]
    num_rivales = max(1, min(num_rivales, 4))
    faltan = 5 - len(tablero)
    puntos = 0.0

    for _ in range(simulaciones):
        muestra = rng.sample(disponibles, faltan + 2 * num_rivales)
        mesa_final = tablero + muestra[:faltan]
        mi_rank = evaluador.evaluate(mesa_final, mias)
        mejor_rival = min(
            evaluador.evaluate(
                mesa_final,
                muestra[faltan + 2 * k : faltan + 2 * k + 2]
            )
            for k in range(num_rivales)
        )
        puntos += (
            1.0 if mi_rank < mejor_rival
            else (0.5 if mi_rank == mejor_rival else 0.0)
        )

    return puntos / simulaciones
```

**Parámetros clave:**

| Parámetro               | Valor                                                       |
|--------------------------|-------------------------------------------------------------|
| Número de rivales        | `max(1, min(num_rivales, 4))` — clamped entre 1 y 4         |
| Cartas muertas           | Las cartas propias + las del board (`usadas`)                |
| Cartas de rivales        | Se asignan aleatoriamente del pool `disponibles`             |
| Cartas faltantes del board| `5 - len(tablero)` — se completan aleatoriamente del pool   |
| Simulaciones (entrenamiento)| **150** (default en el notebook 10)                       |
| Simulaciones (preflop caché)| **3 000**                                                |
| Semilla                  | `random.Random(42)` — **determinística** en el notebook 10  |

**Manejo de empates:** Un empate con el mejor rival cuenta como **0.5 puntos** (ni victoria ni derrota). La equity final es `puntos / simulaciones`.

> **Importante:** La comparación es contra el **mejor** rival: `mejor_rival = min(...)`. Si algún rival tiene mejor mano que el jugador, el jugador pierde. Si el jugador empata con el mejor rival (pero gana a otros), cuenta como 0.5.

### 4.3 Equity postflop — Monte Carlo (Notebook 12)

El notebook 12 presenta una versión alternativa `calcular_equity_monte_carlo` con estas diferencias:

```python
def calcular_equity_monte_carlo(mis_cartas_str, mesa_str=[], num_rivales=1, simulaciones=2000):
    # ...
    for _ in range(simulaciones):
        deck = Deck()
        for c in cartas_conocidas:
            deck.cards.remove(c)
        manos_rivales = []
        for _ in range(num_rivales):
            manos_rivales.append([deck.draw(1)[0], deck.draw(1)[0]])
        mesa_simulada = list(mesa)
        if cartas_restantes_mesa > 0:
            mesa_simulada.extend(deck.draw(cartas_restantes_mesa))
        # ...
        equity = (victorias + (empates / 2.0)) / simulaciones
```

| Diferencia                        | Notebook 10                     | Notebook 12                        |
|-----------------------------------|---------------------------------|-------------------------------------|
| Default simulaciones              | 150                             | 2 000 (toplevel) / 1 000 (`variables_cartas`) |
| Aleatorización                    | `rng.sample()` con semilla fija | `Deck()` + `draw()` (sin semilla fija) |
| `num_rivales` clamp               | `max(1, min(num_rivales, 4))`   | No tiene clamp explícito (pero `equity_preflop` y `variables_cartas` sí lo aplican) |
| Retorno                           | `float` (0..1)                  | `dict` con `equity_total` (0..100) |
| Empates                           | 0.5                             | `empates / 2.0` (equivalente)      |

> **Para el dataset de entrenamiento**, la implementación del notebook 10 con **150 simulaciones y semilla fija `Random(42)`** es la fuente de verdad.

### 4.4 Resumen para reimplementación

Para obtener resultados idénticos al dataset de entrenamiento:

1. **Preflop**: Usar un caché keyed por `(alta_letra, baja_letra, suited_bool, num_rivales_clamped)` con 3 000 simulaciones por clave. Usar `Random(42)` como semilla.
2. **Postflop**: 150 simulaciones por decisión. Semilla `Random(42)` reinicializada **una sola vez** al inicio del proceso (no por cada decisión).
3. El pool de cartas disponibles excluye solo las cartas propias y las del board visible. Las cartas de otros jugadores **no** se excluyen (son desconocidas desde la perspectiva del jugador que decide).

---

## 5. Uso de treys

### 5.1 Librería

[treys](https://github.com/ihenderson/treys) (versión 0.1.8) es un evaluador de manos de póker Texas Hold'em.

### 5.2 Formato de cartas

```python
from treys import Card
c = Card.new('Ac')  # As de tréboles
```

El formato es `{Rango}{Palo}` con:
- Rangos: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `T`, `J`, `Q`, `K`, `A`
- Palos: `s` (spades), `h` (hearts), `d` (diamonds), `c` (clubs)

Internamente, treys representa cada carta como un entero de 32 bits con un esquema bit a bit particular. La implementación TypeScript debe replicar exactamente la tabla de lookup de treys.

### 5.3 Evaluación de manos

```python
from treys import Evaluator
evaluador = Evaluator()

# Evaluar una mano de 5-7 cartas
rank = evaluador.evaluate(board_cards, hand_cards)
# board_cards: list[int] (3-5 cartas del board, formato treys)
# hand_cards: list[int] (2 cartas privadas, formato treys)
# rank: int entre 1 (mejor: escalera real) y 7462 (peor: 7-5-4-3-2 high)
```

**Escala de rank:**
- 1 = mejor mano posible (escalera real)
- 7462 = peor mano posible
- Un rank **menor** = mano **más fuerte**

**Conversión a `c_fuerza`:**
```python
c_fuerza = 1 - rank / 7462
```
Esto mapea: escalera real → ~1.0, peor mano → ~0.0.

### 5.4 Clases de mano (`get_rank_class`)

```python
clase = evaluador.get_rank_class(rank)
```

Mapeo de clases en treys:

| Clase | Nombre                      |
|-------|-----------------------------|
| 0     | Straight Flush (escalera de color) — _incluye escalera real_ |
| 1     | Four of a Kind (póker)       |
| 2     | Full House                   |
| 3     | Flush (color)                |
| 4     | Straight (escalera)          |
| 5     | Three of a Kind (trío)       |
| 6     | Two Pair (doble pareja)      |
| 7     | Pair (pareja)                |
| 8     | High Card (carta alta)       |

> **Nota:** Los valores de `get_rank_class` en treys van de **0 a 8** (9 clases totales). Sin embargo, en los datos de salida del notebook se observa `c_clase = 9` para "carta alta". Esto se debe a que la API de treys `get_rank_class` retorna valores **1 a 9** en la versión usada (0.1.8), donde:
> - 1 = Straight Flush
> - 2 = Four of a Kind
> - ...
> - 9 = High Card

La implementación TypeScript debe usar la **misma tabla de rangos de treys** (lookup tables) para garantizar resultados idénticos.

> **Valor centinela en preflop:** `c_clase = 10` cuando no hay board.

### 5.5 Mazo completo

```python
MAZO_COMPLETO = Deck.GetFullDeck()  # 52 cartas en formato int de treys
```

Este arreglo se usa como pool para las simulaciones Monte Carlo.

---

## 6. Función `entrenador_inteligente`

### 6.1 Firma

```python
def entrenador_inteligente(fila, mis_cartas=None):
```

**Inputs:**
- `fila`: Un `dict` o `Series` con todas las columnas de una decisión del conjunto de Test (las 47 features + metadatos como `cartas`, `mesa`, `n_activos`, `to_call`, `pot_odds`, `jugador`, `accion`).
- `mis_cartas`: Opcional. Lista de 2 cartas (ej. `['As', 'Ah']`). Si se proporciona, reemplaza las cartas reales del jugador para un análisis "what-if".

**Outputs:**
- `equity`: float, la equity del motor matemático (en porcentaje, 0-100).
- `prob`: array numpy de 3 floats, las probabilidades de la red neuronal para [Fold, Check/Call, Bet/Raise].

### 6.2 Lógica interna

```python
def entrenador_inteligente(fila, mis_cartas=None):
    situacion = fila.copy()
    mesa = separar_cartas(situacion['mesa'])
    cartas = mis_cartas or separar_cartas(situacion['cartas'])
    rivales = num_rivales_de(situacion)  # max(1, min(int(fila['n_activos']) - 1, 4))

    # A. MOTOR MATEMÁTICO
    for nombre, valor in variables_cartas(cartas, mesa, rivales).items():
        situacion[nombre] = valor    # sobrescribe c_alta, c_baja, c_equity, etc.
    equity = situacion['c_equity'] * 100
    equity_minima = situacion['pot_odds'] * 100
    rentable = equity >= equity_minima

    # B. RED NEURONAL
    prob = modelo_ia.predict(preparar(pd.DataFrame([situacion])), verbose=0)[0]
    jugada_elite = NOMBRES[prob.argmax()]

    # C. LECTURA CONJUNTA (ver reglas abajo)
    # ...
    return equity, prob
```

### 6.3 Lógica de "lectura conjunta"

La lectura conjunta compara el veredicto del motor matemático (equity vs pot odds) con la predicción de la red neuronal.

| Condición                                     | Mensaje                                                                                              |
|------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `to_call == 0`                                | "Sin apuesta que pagar, la élite elegiría sobre todo: {jugada_elite}."                              |
| `rentable AND jugada_elite == 'Fold'`         | "La matemática dice pagar, pero la élite suele retirarse: la equity se mide contra manos aleatorias, y quien apuesta normalmente no tiene una mano aleatoria." |
| `rentable AND jugada_elite != 'Fold'`         | "Coinciden: la matemática permite continuar y la élite elegiría {jugada_elite}."                   |
| `NOT rentable AND jugada_elite == 'Fold'`     | "Coinciden: el precio es demasiado alto y la élite se retiraría."                                   |
| `NOT rentable AND jugada_elite != 'Fold'`     | "El precio no compensa, pero la élite elegiría {jugada_elite}: farol, posición o ganancias futuras."|

**Umbral:** No hay umbrales numéricos adicionales. La comparación es simplemente `equity >= pot_odds * 100` (rentable) vs. `argmax(prob)` (jugada de la élite).

### 6.4 Función `num_rivales_de`

```python
def num_rivales_de(fila):
    return max(1, min(int(fila['n_activos']) - 1, 4))
```

### 6.5 Función `preparar` (preprocessing del modelo)

```python
def preparar(df):
    X = df[FEATURES].astype('float64').copy()
    for c in VARIABLES_LOG:
        if c in X.columns:
            X[c] = np.log1p(X[c].clip(lower=0))
    return scaler_ia.transform(X.values.astype('float32'))
```

**Pasos:**
1. Seleccionar las 47 columnas en el orden exacto de `FEATURES`.
2. Convertir a `float64`.
3. Para cada columna en `VARIABLES_LOG`: `X[c] = log(1 + max(0, X[c]))`.
4. Convertir a `float32`.
5. Aplicar `scaler_ia.transform()` — un `StandardScaler` de scikit-learn previamente ajustado en train (media y desviación estándar por columna).

---

## 7. Ambigüedades o riesgos

### 7.1 Número de simulaciones Monte Carlo

El notebook 10 usa **150 simulaciones** por defecto para `equity_monte_carlo` postflop. El notebook 12 usa **1 000** (en `variables_cartas`) o **2 000** (en `calcular_equity_monte_carlo`). El dataset de entrenamiento fue generado con 150. Para inferencia en producción, el notebook 12 sugiere usar más simulaciones (1 000). **La implementación TypeScript debe decidir cuántas simulaciones usar en tiempo real**, documentando que 150 reproduce el entrenamiento y ≥1 000 produce estimaciones más estables.

### 7.2 Semilla del generador aleatorio

El notebook 10 inicializa `rng = random.Random(42)` **una sola vez** al inicio y lo reutiliza para todas las simulaciones de todas las manos. Esto hace que el dataset sea determinísticamente reproducible, pero **la secuencia de números aleatorios depende del orden de procesamiento de las manos**. En producción (inferencia en tiempo real), la semilla debe ser diferente en cada sesión para evitar sesgos. La reproducción exacta del dataset requiere procesar las manos en el mismo orden.

### 7.3 `ult_apuesta_vs_bote` — definición del snapshot

El campo `ult_apuesta_vs_bote` se guarda en el snapshot con el valor actual de `ult_apuesta` **antes** de la acción del jugador. Pero `ult_apuesta` se actualiza solo cuando hay un `cbr`:
```python
ult_apuesta = pago / bote if bote > 0 else 0.0
```
El valor `pago` es **después de calcular el pago del raise**; `bote` es el bote **antes** de sumar el pago. Esto es sutil: el ratio se calcula sobre el bote previo al raise, no después. Se reinicia a 0 al cambiar de calle.

### 7.4 `c_clase` — rango exacto de valores

La documentación de treys varía entre versiones. En la versión 0.1.8 usada aquí, `get_rank_class` retorna valores **1–9** (observado en la salida: `c_clase = 9` para carta alta). La implementación TypeScript **debe usar la misma versión de la tabla de lookup de treys** o verificar empíricamente el mapeo.

### 7.5 Inversión de ciegas en heads-up

El código incluye `if n == 2: ciegas = ciegas[::-1]` pero esta rama **nunca se ejecuta** en el dataset de Pluribus (siempre n=6). La implementación debe incluirla pero es **no testeada** con los datos actuales.

### 7.6 Falta de exclusión de decisiones forzadas

El código **no excluye** decisiones de jugadores que ya están all-in (stack=0 pero siguen en `activos`). Un jugador all-in puede aparecer con una acción `cc` (pago de 0). Esto genera decisiones con `stack_bb=0` y `to_call_bb=0`. La red neuronal se entrenó con estas filas incluidas.

### 7.7 `c_proy_escalera` — falsos positivos

La detección de proyecto de escalera no distingue si las cartas privadas contribuyen a la escalera (a diferencia de `c_proy_color`, que sí exige que al menos una carta privada sea del palo). Podría marcar `1` para un proyecto de escalera donde las 4 cartas consecutivas están todas en el board. Esto es un rasgo del diseño original, no un bug.

### 7.8 `c_proy_color` y `c_proy_escalera` en el river

Ambas features valen `0` si `len(mesa) >= 5` (river con board completo). Esto es intencional: en el river ya no hay "proyectos" porque no quedan cartas por salir. Sin embargo, sí puede haber 4 cartas de un palo sin que el jugador tenga la quinta; estas no se detectan.

### 7.9 Compatibilidad de treys en TypeScript

No existe un port oficial de treys a TypeScript/JavaScript. La implementación debe replicar:
- Las lookup tables de evaluación (que mapean combinaciones de cartas a ranks 1–7462).
- La función `get_rank_class` que agrupa los 7462 ranks en 9 clases (1-9 según la versión 0.1.8).
- El formato interno de representación de cartas (entero de 32 bits con bitfield de prime, rank, suit, bit_rank).

### 7.10 Transformación `log1p` y `StandardScaler`

Las features en `variables_log` reciben `log1p` antes del escalado. Los parámetros del `StandardScaler` (media, std por feature) están almacenados en `models/v4_pluribus/scaler_modelo4.pkl` (formato joblib de scikit-learn). La implementación TypeScript debe cargar estos parámetros y aplicar la misma transformación: `(log1p(clamp(x, 0, ∞)) - mean) / std`.
