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



# ---------------------------------------------------------------- Módulo 3
def outs_cartas(hand, board, ranks):
    """outs que emparejan alguna de las cartas indicadas (p. ej. sobrecartas)."""
    return [x for x in remaining(cards(hand) + cards(board)) if x[0] in ranks]


@modulo
def m03():
    ok('3.1', 'color 9; trío 2; escalera 8', n_outs('9♥8♥', 'K♥4♥2♣') == 9 and len(outs_to(cards('7♣7♦'), cards('K♠9♥2♣'), {'trío'})) == 2 and n_outs('J♠T♠', '9♦8♣2♥') == 8)
    ok('3.1', 'ej A5c en K9c3d = 9; 65h en 87K = 8', n_outs('A♣5♣', 'K♣9♣3♦') == 9 and n_outs('6♥5♥', '8♠7♦K♣') == 8)
    ok('3.2', 'tabla: 8, 4, 6, 12, 15', n_outs('J♠T♦', 'Q♣9♥2♠') == 8 and n_outs('Q♣T♣', 'K♦9♠8♠') == 4
       and len(outs_cartas('A♦K♣', '9♠6♥2♦', 'AK')) == 6 and n_outs('K♥J♥', 'Q♥9♥4♠') == 12 and n_outs('J♥T♥', '9♥8♣2♥') == 15)
    ok('3.2', 'ej 87d en 65K = 8 sin color; A4s en K7s3 = 9', n_outs('8♦7♦', '6♣5♦K♥') == 8 and n_outs('A♠4♠', 'K♠7♠3♦') == 9)
    filas = {4: (.085, .165), 8: (.170, .315), 9: (.191, .350), 12: (.255, .450), 15: (.319, .541)}
    ok('3.3', 'tabla exacta 1 y 2 cartas', all(near(o / 47, a, .001) and near(1 - (47 - o) * (46 - o) / (47 * 46), b, .001) for o, (a, b) in filas.items()))
    ok('3.3', '1/47=2,13%; 1/46=2,17%', near(1 / 47, .0213, .0001) and near(1 / 46, .0217, .0001))
    o = outs_to(cards('J♠T♦'), cards('9♥8♥2♣'), {'escalera'})
    ok('3.4', 'JT en 98hh2: Qh 7h sucios, 6 limpios', len(o) == 8 and sorted(x for x in o if x[1] == 'h') == ['7h', 'Qh'])
    o = outs_to(cards('K♠Q♠'), cards('J♥T♥2♠'), {'escalera'})
    ok('3.4', 'KQ en JT2: A y 9; Ah 9h sucios', sorted(set(x[0] for x in o)) == ['9', 'A'] and len(o) == 8)
    ok('3.4', 'ej AKd en Qd J 5d = 12', n_outs('A♦K♦', 'Q♦J♠5♦') == 12)
    o = outs_to(cards('8♣7♣'), cards('6♠5♠K♥'), {'escalera'})
    ok('3.4', 'ej 87c en 65s: 4s 9s sucios', len(o) == 8 and sorted(x for x in o if x[1] == 's') == ['4s', '9s'])
    ok('M3', 'Q1 AQ en JT3: 4 + 6', n_outs('A♦Q♣', 'J♠T♥3♦') == 4 and len(outs_cartas('A♦Q♣', 'J♠T♥3♦', 'AQ')) == 6)
    ok('M3', 'Q2 98c en 7c6d2c = 15', n_outs('9♣8♣', '7♣6♦2♣') == 15)
    o = outs_to(cards('Q♠J♠'), cards('T♦9♦4♣'), {'escalera'})
    ok('M3', 'Q4 QJ en T9dd4: 8, sucios Kd 8d', len(o) == 8 and sorted(x for x in o if x[1] == 'd') == ['8d', 'Kd'])
    ok('M3', 'Q5 K6s no CO, sí BU', not en('CO', 'K6s') and en('BU', 'K6s'))



# ---------------------------------------------------------------- Módulo 5
@modulo
def m05():
    PAGO = {('UTG', 'HJ'): RG['HJvsUTG'], ('UTG', 'CO'): RG['HJvsUTG'] + ',55,QJs', ('UTG', 'BU'): RG['BUvsUTG'],
            ('HJ', 'CO'): 'JJ,TT,99,88,77,66,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,AQo,AJo,KQo',
            ('HJ', 'BU'): 'JJ,TT,99,88,77,66,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,AQo,AJo,KQo,55,44,33,22,QTs,98s',
            ('CO', 'BU'): RG['BUvsCO']}
    p = lambda a, b, m: m in range_hands(PAGO[(a, b)])
    ok('5.1', 'BU vs UTG = HJ + 55,QJs + 44-22,ATs,KJs,JTs,T9s', set(range_hands(PAGO[('UTG', 'BU')])) == set(range_hands(PAGO[('UTG', 'CO')] + ',44,33,22,ATs,KJs,JTs,T9s')))
    ok('5.1', 'ATo HJ: abre sí, paga vs UTG no; 88 y AQs sí', en('HJ', 'ATo') and not p('UTG', 'HJ', 'ATo') and p('UTG', 'HJ', '88') and p('UTG', 'HJ', 'AQs'))
    ok('5.1', 'ej A9s BU vs CO; KJs CO vs UTG no, BU sí', p('CO', 'BU', 'A9s') and not p('UTG', 'CO', 'KJs') and p('UTG', 'BU', 'KJs'))
    ok('5.1', '3-bet KK IP 3x = 15', 3 * 5 == 15)
    ok('5.2', 'BB vs BU 2,5x: 362 combos 27%', range_combos(RG['BBvsBU25']) == 362)
    ok('5.2', 'precio 3/11', near(3 / (5 + 1 + 2 + 3), .2727, .0005))
    b = lambda m: m in range_hands(RG['BBvsBU25'])
    ok('5.2', '98s sí, K7s no, A4o no, QTo sí, J8s sí, T6o no, 76s sí', b('98s') and not b('K7s') and not b('A4o') and b('QTo') and b('J8s') and not b('T6o') and b('76s'))
    ok('5.2', 'QTo no en BU vs UTG', not p('UTG', 'BU', 'QTo'))
    ok('5.3', '11,76% y equilibrio 7,5x', near(1 - (48 / 50) * (47 / 49) * (46 / 48), .1176, .0001) and near((1 - .1176) / .1176, 7.5, .01))
    ok('5.3', '100 veces: 88x6=528, 528/12=44', 88 * 6 == 528 and 528 / 12 == 44)
    ok('5.3', '15x6=90; 15x5=75; 33 en BU vs HJ', 15 * 6 == 90 and 15 * 5 == 75 and p('HJ', 'BU', '33'))
    ok('5.4', 'stack 40 < 90; 15x19=285>200; 55 en BU vs HJ', 40 < 90 and 15 * 19 > 200 and p('HJ', 'BU', '55'))
    ok('5.4', 'ej 15x3=45<60 y 66 en BB; 15x15=225>200', 15 * 3 < 60 and b('66') and 15 * 15 > 200)
    ok('M5', 'Q1 KQs CO vs HJ; Q2 AJo no BU vs UTG; Q3 76s BB; Q4 55 no BU vs CO', p('HJ', 'CO', 'KQs') and not p('UTG', 'BU', 'AJo') and b('76s') and not p('CO', 'BU', '55'))


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
    # 4.1
    e = equity(cards('9♥8♥'), cards('K♠Q♦'), cards('K♥7♥2♣'))
    ok('4.1', 'equity exacta ~40%', abs(e - .40) < .006, pct(e))
    e2 = equity(cards('9♥8♥'), cards('K♠Q♦'), cards('K♥7♥2♣3♠'))
    ok('4.1', 'tras 3s: 9/44 = 20%', near(e2, 9 / 44, .001), pct(e2))
    ok('4.1', 'ej 25% de 80 = 20', .25 * 80 == 20)
    # 4.3
    f = lambda x: x / (1 + 2 * x)
    ok('4.3', 'tabla 1/4..2x', [round(100 * f(x), 1) for x in (.25, 1 / 3, .5, 2 / 3, .75, 1, 2)] == [16.7, 20.0, 25.0, 28.6, 30.0, 33.3, 40.0])
    ok('4.3', 'ejemplos 15/30, 60/90, 22/40', near(pot_odds(30, 15), .25) and near(60 / 90, 2 / 3) and near(pot_odds(40, 22), 22 / 84))
    ok('4.3', 'ej 8/24 = 1/3', near(8 / 24, 1 / 3))
    # 4.4
    ok('4.4', 'caso 1 A5s en K8s3: 9 outs, 16,7%', n_outs('A♠5♠', 'K♠8♠3♦') == 9 and near(pot_odds(40, 10), 1 / 6))
    ok('4.4', 'caso 2 JT en Q83: 4 outs, 33%', n_outs('J♥T♥', 'Q♣8♦3♠') == 4 and near(pot_odds(20, 20), 1 / 3))
    ok('4.4', 'caso 3 KQh en JTh2: 15 outs', n_outs('K♥Q♥', 'J♥T♥2♣') == 15)
    ok('4.4', 'ej1 76c en 85K: 8 outs; 20%', n_outs('7♣6♣', '8♥5♠K♦') == 8 and near(pot_odds(30, 10), .20))
    ok('4.4', 'ej2 A2d en Qd7d4: 9 outs; 18,75%', n_outs('A♦2♦', 'Q♦7♦4♣') == 9 and near(pot_odds(50, 15), .1875))
    # 4.5
    extra = lambda c, e, p: c / e - p
    ok('4.5', 'caso 1: 86 en K75 8 outs; 30%; extra 43,75', n_outs('8♣6♣', 'K♥7♦5♠') == 8 and near(pot_odds(20, 15), .30) and near(extra(15, .16, 50), 43.75))
    ok('4.5', 'caso 2 extra 33; caso 3 extra 85; ej 15,6', near(extra(15, .18, 50), 33.33, .01) and near(extra(10, .08, 40), 85) and near(extra(10, .18, 40), 15.56, .01))
    ok('M4', 'Q1 45; Q2 25%; Q4 87 en K65: 8 outs; Q5 67,5', .3 * 150 == 45 and pot_odds(60, 30) == .25 and n_outs('8♠7♠', 'K♥6♣5♦') == 8 and near(extra(30, .16, 120), 67.5))


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
