"""Herramientas de cálculo para verificar los ejemplos del curso.

Uso: se importa desde los scripts de verificación. No depende de librerías externas.
Cartas: 'As', 'Kh', 'Td', '2c' o con símbolos 'A♠', 'K♥', 'T♦', '2♣'.
"""
from itertools import combinations
from math import erf, exp, log, sqrt
from collections import Counter

RANKS = '23456789TJQKA'
SUITS = 'shdc'
SYM = {'♠': 's', '♥': 'h', '♦': 'd', '♣': 'c'}
DECK = [r + s for r in RANKS for s in SUITS]


def c(card):
    card = card.strip()
    r, s = card[0].upper(), card[1:]
    s = SYM.get(s, s.lower())
    assert r in RANKS and s in SUITS, card
    return r + s


def cards(text):
    """'A♠ K♣' o 'A♠K♣' -> ['As','Kc']"""
    t = text.replace(' ', '')
    out, i = [], 0
    while i < len(t):
        out.append(c(t[i:i + 2]))
        i += 2
    assert len(set(out)) == len(out), f'carta repetida en {text}'
    return out


CATS = ['carta alta', 'pareja', 'dobles parejas', 'trío', 'escalera', 'color',
        'full', 'póker', 'escalera de color']


def eval5(cs):
    rs = sorted((RANKS.index(x[0]) for x in cs), reverse=True)
    flush = len({x[1] for x in cs}) == 1
    u = sorted(set(rs), reverse=True)
    straight_hi = None
    if len(u) == 5:
        if u[0] - u[4] == 4:
            straight_hi = u[0]
        elif u == [12, 3, 2, 1, 0]:
            straight_hi = 3
    cnt = Counter(rs)
    groups = sorted(cnt.items(), key=lambda kv: (kv[1], kv[0]), reverse=True)
    shape = [g[1] for g in groups]
    kick = [g[0] for g in groups]
    if straight_hi is not None and flush:
        return (8, [straight_hi])
    if shape == [4, 1]:
        return (7, kick)
    if shape == [3, 2]:
        return (6, kick)
    if flush:
        return (5, rs)
    if straight_hi is not None:
        return (4, [straight_hi])
    if shape == [3, 1, 1]:
        return (3, kick)
    if shape == [2, 2, 1]:
        return (2, kick)
    if shape == [2, 1, 1, 1]:
        return (1, kick)
    return (0, rs)


def best(cs):
    return max(eval5(list(x)) for x in combinations(cs, 5))


def cat(cs):
    return CATS[best(cs)[0]]


def remaining(dead):
    return [x for x in DECK if x not in dead]


def outs_to(hand, board, cats_wanted):
    """Cartas de la baraja que, al caer, dan a 'hand' una categoría en cats_wanted."""
    res = []
    for x in remaining(hand + board):
        if cat(hand + board + [x]) in cats_wanted:
            res.append(x)
    return res


def equity(h1, h2, board=()):
    """Equity exacta heads-up de h1 contra h2 enumerando las cartas que faltan (flop o más)."""
    board = list(board)
    rest = remaining(h1 + h2 + board)
    need = 5 - len(board)
    w = t = n = 0
    for run in combinations(rest, need):
        b = board + list(run)
        a, bb = best(h1 + b), best(h2 + b)
        n += 1
        if a > bb:
            w += 1
        elif a == bb:
            t += 1
    return (w + t / 2) / n


def equity_mc(h1, h2, n=20000, seed=1):
    """Equity aproximada preflop (Monte Carlo, error típico < 0,5 %)."""
    import random
    rnd = random.Random(seed)
    rest = remaining(h1 + h2)
    w = 0.0
    for _ in range(n):
        b = rnd.sample(rest, 5)
        a, bb = best(h1 + b), best(h2 + b)
        w += 1 if a > bb else (0.5 if a == bb else 0)
    return w / n


# --- matemática de apuestas ---
def pot_odds(pot_before_bet, bet, to_call=None):
    """Equity necesaria para pagar: lo que pagas / bote final."""
    to_call = bet if to_call is None else to_call
    return to_call / (pot_before_bet + bet + to_call)


def bluff_be(pot, bet):
    """Frecuencia de retirada necesaria para un farol: apuesta / (bote + apuesta)."""
    return bet / (pot + bet)


def mdf(pot, bet):
    return pot / (pot + bet)


def spr(stack_behind, pot):
    return stack_behind / pot


def norm_cdf(z):
    return 0.5 * (1 + erf(z / sqrt(2)))


def prob_perdidas(wr_bb100, sd_bb100, hands):
    n = hands / 100
    return norm_cdf(-(wr_bb100 * n) / (sd_bb100 * sqrt(n)))


def riesgo_ruina(wr_bb100, sd_bb100, bankroll_bb):
    return exp(-2 * wr_bb100 * bankroll_bb / sd_bb100 ** 2)


def banca_para_riesgo(wr_bb100, sd_bb100, ror):
    return -log(ror) * sd_bb100 ** 2 / (2 * wr_bb100)


# --- rangos ---
def _hands_in_token(tok):
    """'77+', 'ATs+', 'KQo', 'T9s', 'A2s+', '97s+' -> lista de manos tipo 'AKs', '77', 'KQo'."""
    plus = tok.endswith('+')
    t = tok.rstrip('+')
    if len(t) == 2:  # pareja
        i = RANKS.index(t[0])
        return [r + r for r in RANKS[i:]] if plus else [t]
    hi, lo, kind = t[0], t[1], t[2]
    ih, il = RANKS.index(hi), RANKS.index(lo)
    if not plus:
        return [t]
    return [hi + RANKS[k] + kind for k in range(il, ih)]


def range_hands(text):
    hs = []
    for tok in text.replace(' ', '').split(','):
        if tok:
            hs += _hands_in_token(tok)
    assert len(set(hs)) == len(hs), f'mano repetida en rango: {text}'
    return hs


def combos(hand):
    if len(hand) == 2:
        return 6
    return 4 if hand[2] == 's' else 12


def range_combos(text):
    return sum(combos(h) for h in range_hands(text))


def range_pct(text):
    return range_combos(text) / 1326


def pct(x, d=1):
    return f'{100 * x:.{d}f}%'


def grid_md(range_text=None):
    """Cuadrícula 13x13 en Markdown. Manos del rango en negrita; el resto con '·'.
    Sin rango: muestra todas las manos (para enseñar la cuadrícula)."""
    inr = set(range_hands(range_text)) if range_text else None
    order = RANKS[::-1]  # A K Q ... 2
    rows = ['| | ' + ' | '.join(order) + ' |', '|' + '---|' * 14]
    for i, r1 in enumerate(order):
        cells = []
        for j, r2 in enumerate(order):
            if i == j:
                h = r1 + r2
            elif i < j:
                h = r1 + r2 + 's'
            else:
                h = r2 + r1 + 'o'
            if inr is None:
                cells.append(h)
            else:
                cells.append(f'**{h}**' if h in inr else '·')
        rows.append(f'| **{r1}** | ' + ' | '.join(cells) + ' |')
    return '\n'.join(rows)
