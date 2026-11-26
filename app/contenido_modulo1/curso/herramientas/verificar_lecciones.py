"""Recalcula cada cifra y cada ejemplo de cartas de las lecciones redactadas.
Ejecutar desde curso/:  python -I herramientas/verificar_lecciones.py
Cada comprobación lleva el código de la lección. Termina con el número de errores.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from poker_calc import *

R = []


def ok(cod, desc, cond, det=''):
    R.append((cod, cond, desc, det))


def near(a, b, tol=0.0005):
    return abs(a - b) < tol


def n_outs(hand, board, cats=('escalera', 'color', 'escalera de color')):
    return len(outs_to(cards(hand), cards(board), set(cats)))


def es(hand, board, categoria):
    return cat(cards(hand) + cards(board)) == categoria


def gana(h1, h2, board):
    return best(cards(h1) + cards(board)) > best(cards(h2) + cards(board))


def empate(h1, h2, board):
    return best(cards(h1) + cards(board)) == best(cards(h2) + cards(board))


MODULOS = []


def modulo(f):
    MODULOS.append(f)
    return f


# ---------------------------------------------------------------- Módulo 0
@modulo
def m00():
    # 0.1
    ok('0.1', 'AK gana a QQ en K72-9-4', gana('A♠K♣', 'Q♥Q♦', 'K♥7♦2♠9♣4♥') and es('A♠K♣', 'K♥7♦2♠9♣4♥', 'pareja'))
    # 0.2 ejemplos de la tabla
    tabla = [('A♠K♠Q♠J♠T♠', 'escalera de color'), ('9♥8♥7♥6♥5♥', 'escalera de color'), ('8♣8♦8♥8♠K♦', 'póker'),
             ('J♠J♥J♦4♣4♥', 'full'), ('A♦J♦8♦6♦2♦', 'color'), ('T♣9♦8♠7♥6♣', 'escalera'), ('7♠7♥7♦K♣2♠', 'trío'),
             ('Q♠Q♦5♣5♥9♠', 'dobles parejas'), ('T♥T♠A♣6♦3♠', 'pareja'), ('A♣Q♦9♠6♥3♣', 'carta alta')]
    ok('0.2', 'tabla de categorías', all(cat(cards(h)) == k for h, k in tabla))
    ok('0.2', 'color gana a trío', gana('A♥5♥', '7♠7♦', '7♣K♥9♥2♥4♠') and es('A♥5♥', '7♣K♥9♥2♥4♠', 'color'))
    ok('0.2', 'escalera gana a doble pareja', gana('K♠9♣', 'A♣A♥', 'Q♣J♦T♠3♥3♦'))
    ok('0.2', 'rueda A-5 es escalera', cat(cards('A♦2♣3♠4♥5♦')) == 'escalera')
    ok('0.2', 'K-A-2-3-4 no es escalera', cat(cards('K♣A♦2♥3♠4♣')) == 'carta alta')
    # 0.3
    ok('0.3', 'KQ gana a KJ por kicker', gana('K♠Q♥', 'K♦J♠', 'K♣8♦3♠'))
    ok('0.3', 'juegan la mesa: empate', empate('4♣4♦', '9♥9♣', 'A♠K♦Q♣J♥T♠'))
    ok('0.3', 'AA99K empate', empate('Q♠J♠', 'Q♥2♦', 'A♣A♦9♠9♥K♣'))
    ok('0.3', 'ej1 A kicker', gana('A♣3♥', 'K♠3♦', 'Q♦7♣7♥4♠2♦'))
    ok('0.3', 'ej2 A kicker doble pareja', gana('A♥2♣', 'K♣Q♣', 'J♠J♥8♣8♦5♠'))
    ok('0.3', 'ej3 póker de mesa, K kicker', gana('K♦2♥', 'Q♠J♣', '9♣9♦9♥9♠3♣'))
    ok('0.3', 'full JJJ44 > TTTAA', eval5(cards('J♠J♥J♦4♣4♥')) > eval5(cards('T♠T♥T♦A♣A♥')))
    # 0.4 subidas mínimas
    ok('0.4', 'min-raise 6 -> 10; 8 -> 16; 20 -> 40; 5,15 -> 25', 6 + 4 == 10 and 8 + 8 == 16 and 20 + 20 == 40 and 15 + 10 == 25)
    # 0.5
    ok('0.5', 'bb', 100 / 1 == 100 and 5 / 2 == 2.5 and 200 / 2 == 100)
    # 0.6
    ok('0.6', 'bote flop 11, 17, 23, 65%', 5 + 5 + 1 == 11 and 11 + 6 == 17 and 17 + 6 == 23 and round(15 / 23, 2) == .65)
    ok('0.6', 'tabla de fracciones', [3 / 12, 4 / 12, 6 / 12, 8 / 12] == [.25, 1 / 3, .5, 2 / 3])
    ok('0.6', 'ejercicios', 5 + 5 + 1 + 2 == 13 and near(20 / 30, 2 / 3) and 30 + 20 == 50)
    # 0.7
    rk = lambda b, p, cap: min(b * p, cap)
    ok('0.7', 'tabla rake 5% tope 5', [rk(b, .05, 5) for b in (20, 60, 100, 200)] == [1, 3, 5, 5])
    ok('0.7', 'ej 5% tope 3', rk(40, .05, 3) == 2 and rk(150, .05, 3) == 3)
    # 0.8
    ok('0.8', 'TT+,AQs+ = 38 combos', range_combos('TT+,AQs+') == 38)
    ok('0.8', 'KTs+ = 12; 99+ = 36', range_combos('KTs+') == 12 and range_combos('99+') == 36)
    # evaluación M0
    ok('M0', 'Q2 rival escalera, hero sin color', gana('9♥5♦', 'A♠4♣', '8♠7♠6♦2♠K♣') and es('A♠4♣', '8♠7♠6♦2♠K♣', 'carta alta'))
    ok('M0', 'Q3 rival gana por K', gana('A♠K♥', 'A♣4♠', 'A♦9♣9♠6♥3♦'))
    ok('M0', 'Q4 7 -> 12; Q5 27 = 13,5bb; Q6 2,5', 7 + 5 == 12 and 11 + 16 == 27 and rk(50, .05, 4) == 2.5)


# ---------------------------------------------------------------- Módulo 4
@modulo
def m04():
    # 4.2 piloto
    ok('4.2', '98hh en Kh7h2c: 9 outs', n_outs('9♥8♥', 'K♥7♥2♣') == 9)
    ok('4.2', '20/10 -> 25%', near(pot_odds(20, 10), .25))
    ok('4.2', '9 outs exactos 1 carta = 19,1%', near(9 / 47, .191, .001), pct(9 / 47))
    ev10 = .18 * 30 - .82 * 10
    ok('4.2', 'balance 100 manos -280', near(100 * ev10, -280, 1e-6), f'{100*ev10:.0f}')
    ok('4.2', '20/5 -> 16,7%', near(pot_odds(20, 5), 1 / 6))
    ok('4.2', '3 a 1 = 25%', near(1 / (3 + 1), pot_odds(20, 10)) and (20 + 10) / 10 == 3)
    ok('4.2', 'ej1 JT en Q92 8 outs, 30/10 -> 20%', n_outs('J♠T♦', 'Q♣9♥2♠') == 8 and near(pot_odds(30, 10), .20))
    ok('4.2', 'ej2 16/4 -> 16,7%', near(pot_odds(16, 4), 1 / 6))
    ok('4.2', 'ej3 12/12 -> 33,3%', near(pot_odds(12, 12), 1 / 3))


if __name__ == '__main__':
    only = sys.argv[1:]  # p. ej. m04
    for f in MODULOS:
        if not only or f.__name__ in only:
            f()
    err = 0
    for cod, cond, desc, det in R:
        if not cond:
            err += 1
        print(f"{'OK   ' if cond else 'ERROR'} {cod:6} {desc}  {det}")
    print(f'\n{len(R)} comprobaciones, {err} errores')
    sys.exit(1 if err else 0)
