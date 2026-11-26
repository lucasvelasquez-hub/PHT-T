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


# ---------------------------------------------------------------- Módulo 1
@modulo
def m01():
    ok('1.2', 'stacks efectivos', min(200, 100) == 100 and min(200, 300) == 200 and min(240, 130) / 2 == 65)
    ok('1.3', 'EV moneda +0,50; dado +0,83', near(.5 * 3 - .5 * 2, .5) and near(10 / 6 - 5 / 6, .8333, .001))
    e = equity_mc(cards('A♠A♥'), cards('K♣K♦'), 12000)
    ok('1.3', 'AA vs KK ≈ 82%', abs(e - .82) < .01, pct(e))
    ok('1.3', 'EV +128', near(.82 * 200 - .18 * 200, 128))
    tabla = {1000: .41, 10000: .23, 50000: .05, 100000: .01}
    ok('1.4', 'tabla prob. pérdidas 5bb/100 DE 67', all(abs(prob_perdidas(5, 67, n) - v) < .006 for n, v in tabla.items()),
       ', '.join(pct(prob_perdidas(5, 67, n)) for n in tabla))
    # Marta y Pablo: desviaciones plausibles (< 1 DE)
    sd = 67 * (1000 / 100) ** .5
    ok('1.4', 'Marta -75bb y Pablo +100bb a < 1 DE', abs(-75 - 50) < sd and abs(100 - (-100)) < sd, f'DE={sd:.0f}bb')
    ok('1.5', 'riesgo de ruina 30BI 3,5%, 20BI 11%', near(riesgo_ruina(2.5, 67, 3000), .035, .002) and near(riesgo_ruina(2.5, 67, 2000), .108, .002))
    ok('1.5', 'Luis 160=32BI NL5; 95=19BI -> 47BI NL2', 160 / 5 == 32 and 95 / 5 == 19 and int(95 / 2) == 47)
    ok('1.5', 'ejercicios 250->50BI NL5; 310-120=190 -> 19BI', 250 / 5 == 50 and 250 < 300 and (310 - 120) / 10 == 19 and 190 / 5 == 38)
    ok('1.6', 'K Q 9 2 7: pareja de 4 de la station sin escalera ni color', cat(cards('4♣4♦K♥Q♠9♦2♣7♠')) == 'pareja')
    ok('M1', 'Q2 37,5bb; Q3 EV -0,25; Q5 24BI', 75 / 2 == 37.5 and near(.25 * 5 - .75 * 2, -.25) and 120 / 5 == 24 and 120 / 2 == 60)
    ok('M1', 'Q7 18+12=30; Q8 A kicker', 18 + 12 == 30 and gana('A♥3♣', 'Q♠J♠', 'K♦K♣8♥5♠2♦'))



# ---------------------------------------------------------------- Módulo 2
from rangos_clarke import R as RG


def en(rango, mano):
    return mano in range_hands(RG[rango])


@modulo
def m02():
    ok('2.1', 'UTG 140 combos ~11%', range_combos(RG['UTG']) == 140)
    ok('2.1', 'UTG: AQo, KJs, QJs sí; 66, ATo no', en('UTG', 'AQo') and en('UTG', 'KJs') and en('UTG', 'QJs') and not en('UTG', '66') and not en('UTG', 'ATo'))
    ok('2.2', 'combos por zona 78/312/936', 13 * 6 == 78 and 78 * 4 == 312 and 78 * 12 == 936 and 78 + 312 + 936 == 1326)
    ok('2.2', '% por zona', near(78 / 1326, .0588) and near(312 / 1326, .2353) and near(936 / 1326, .7059))
    ok('2.4', 'HJ 206 combos 15,5%', range_combos(RG['HJ']) == 206 and near(range_pct(RG['HJ']), .155, .001))
    tabla = [('A5s', False, True), ('KJo', False, True), ('66', False, True), ('QTs', True, True), ('K9s', False, False),
             ('ATo', False, True), ('98s', False, True)]
    ok('2.4', 'tabla UTG/HJ', all(en('UTG', m) == u and en('HJ', m) == h for m, u, h in tabla))
    ok('2.5', 'CO 338, BU 562, SB 470', range_combos(RG['CO']) == 338 and range_combos(RG['BU']) == 562 and range_combos(RG['SB']) == 470)
    ok('2.5', 'K8s CO sí, HJ no', en('CO', 'K8s') and not en('HJ', 'K8s'))
    ok('2.5', 'Q4s BU sí, CO no, SB no', en('BU', 'Q4s') and not en('CO', 'Q4s') and not en('SB', 'Q4s'))
    ok('2.5', 'J9o BU; A7o ni CO ni BU; A7s ambos', en('BU', 'J9o') and not en('CO', 'A7o') and not en('BU', 'A7o') and en('CO', 'A7s') and en('BU', 'A7s'))
    ok('2.5', '53s BU sí, SB no', en('BU', '53s') and not en('SB', '53s'))
    ok('2.6', 'robo BU 62,5%, SB 57%, 4bb 72,7%', near(bluff_be(1.5, 2.5), .625) and near(bluff_be(1.5, 2), .5714) and near(bluff_be(1.5, 4), .7273))
    ok('2.6', 'QTs en CO', en('CO', 'QTs'))
    ok('2.7', 'ATo y KQo en BU; 86s no en HJ', en('BU', 'ATo') and en('BU', 'KQo') and not en('HJ', '86s'))
    ok('2.7', 'iso 4bb=8; bote 19; gana 5; 5bb; 6bb', 3 + 1 == 4 and 8 + 8 + 1 + 2 == 19 and 2 + 1 + 2 == 5 and 3 + 2 == 5 and 3 + 1 + 1 == 5 and 3 + 2 + 1 == 6)
    ok('2.3', 'limp: bote 8', 2 * 4 == 8)
    ok('M2', 'Q1 Q9s no UTG; Q2 A3s HJ; Q3 T7s no CO, sí BU; Q4 K5o no BU, K5s sí',
       not en('UTG', 'Q9s') and en('HJ', 'A3s') and not en('CO', 'T7s') and en('BU', 'T7s') and not en('BU', 'K5o') and en('BU', 'K5s'))
    ok('M2', 'Q6 AQo en rango SB; 6bb', en('SB', 'AQo'))


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
    sys.stdout.reconfigure(encoding='utf-8')
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
