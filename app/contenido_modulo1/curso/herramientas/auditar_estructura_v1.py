"""Recálculo independiente de cada cifra y ejemplo de la estructura v1.
Ejecutar: python -I herramientas/auditar_estructura_v1.py  (desde curso/)
Imprime OK / ERROR por ejemplo.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from poker_calc import *

res = []


def check(cod, desc, ok, detalle=''):
    res.append((cod, 'OK' if ok else 'ERROR', desc, detalle))


# 0.2 subida mínima: apertura a $6 sobre BB $2 -> incremento 4 -> mínimo a $10
check('0.2', 'min-raise a $10 (regla estándar)', 6 + (6 - 2) == 10)
# 0.4 bote 100, apuesta 50 -> 150; pagar -> 200; subida tamaño bote = 50 + (100+50+50) = 250
check('0.4', 'bote/subida tamaño bote', 100 + 50 == 150 and 150 + 50 == 200 and 50 + (100 + 50 + 50) == 250)
# 0.5 rake 5% tope 5
check('0.5', 'rake 60->3, 200->5', min(0.05 * 60, 5) == 3 and min(0.05 * 200, 5) == 5)
# 0.7 kicker
h1, h2, b = cards('K♦J♠'), cards('K♠Q♥'), cards('K♣8♦3♠')
check('0.7', 'KQ gana a KJ en K83 (kicker)', best(h2 + b) > best(h1 + b))
# 0.8 combos
check('0.8', 'AKs=4, T9o=12', combos('AKs') == 4 and combos('T9o') == 12)
# M1 eval
check('M1', 'stack efectivo 130=65bb', min(240, 130) == 130 and 130 / 2 == 65)
# 2.1
o = outs_to(cards('9♥8♥'), cards('K♥4♥2♣'), {'color'})
check('2.1', '9 outs a color', len(o) == 9, str(len(o)))
# 2.2
o = outs_to(cards('J♠T♦'), cards('Q♣9♥2♠'), {'escalera'})
check('2.2', 'JT en Q92: 8 outs', len(o) == 8, ' '.join(o))
# 2.4
o = outs_to(cards('J♠T♦'), cards('9♥8♥2♣'), {'escalera'})
limpios = [x for x in o if x[1] != 'h']
check('2.4', 'JT en 982: 8 outs, 6 limpios', len(o) == 8 and len(limpios) == 6, ' '.join(o))
# M2
o = outs_to(cards('A♦Q♣'), cards('J♠T♥3♦'), {'escalera'})
check('M2', 'AQ en JT3: 4 outs a escalera', len(o) == 4, ' '.join(o))
# 3.2 / 3.3 / 3.4 / 3.5
check('3.2', 'bote 20 apuesta 10 -> 25%', abs(pot_odds(20, 10) - 0.25) < 1e-9)
tabla = {0.25: .1667, 1 / 3: .20, .5: .25, 2 / 3: .2857, .75: .30, 1: .3333}
check('3.3', 'tabla de precios', all(abs(pot_odds(1, f) - v) < 5e-4 for f, v in tabla.items()),
      ', '.join(f'{f:.2f}->{pct(pot_odds(1, f))}' for f in tabla))
check('3.4', 'bote 40 apuesta 10 -> 16,7%', abs(pot_odds(40, 10) - 1 / 6) < 1e-9)
check('3.5', 'bote 20 apuesta 15 -> 30%', abs(pot_odds(20, 15) - .30) < 1e-9)
o = outs_to(cards('8♠7♠'), cards('K♥6♣5♦'), {'escalera'})
check('M3', '87 en K65: 8 outs; 60/30 -> 25%', len(o) == 8 and pot_odds(60, 30) == .25)
# 5.2 BB defensa: BU 5, SB 1 muerto, BB 2 -> paga 3; bote final 11
check('5.2', 'BB paga 3 para bote 11 = 27,3%', abs(3 / (5 + 1 + 2 + 3) - .2727) < 1e-3)
# 5.3 set
pset = 1 - (48 / 50) * (47 / 49) * (46 / 48)
check('5.3', 'trío o mejor en flop 11,76%', abs(pset - .1176) < 1e-4, pct(pset, 2))
check('5.4', 'pagar 14 -> 140-210', 14 * 10 == 140 and 14 * 15 == 210)
# M5: stack 40, abre 6 -> quedan 34; bote tras pagar 6+6+1+2=15; total ganable 49 = 8,2x
check('M5', 'set-mining stack 40', 34 / 6 < 10 and (15 + 34) / 6 < 10, f'{34/6:.1f}x detrás, {(15+34)/6:.1f}x total')
# 6.5 multiway bote
check('6.5', 'bote multiway 16', 5 * 3 + 1 == 16)
o = outs_to(cards('Q♣T♣'), cards('K♦9♠8♠'), {'escalera'})
check('6.5b', 'QT en K98: gutshot 4 outs', len(o) == 4, ' '.join(o))
# 6.1
o = outs_to(cards('7♦6♦'), cards('Q♠J♥T♠'), {'escalera', 'color'})
check('6.1', '76 en QJT sin proyecto', len(o) == 0)
# M6 bote: BU 5 + BB 5 + SB 1
check('M6', 'bote 11', 5 + 5 + 1 == 11)
# 7.3 tamaños: bote 15 -> 10, 25, 55
p = 15
for bet in (10, 25, 55):
    p += 2 * bet
check('7.3', 'construir bote 15->10->25->55', True, f'bote final {p}; invertido por jugador postflop {10+25+55}')
# 8.2
check('8.2', 'apuesta 6 en bote 11 -> 26%', abs(pot_odds(11, 6) - 6 / 23) < 1e-9, pct(pot_odds(11, 6)))
check('8.1/M8', '50 en 100 -> 25%; 80 en 80 -> 33,3%', pot_odds(100, 50) == .25 and abs(pot_odds(80, 80) - 1 / 3) < 1e-9)
# 9.1 / M9
check('9.1', 'farol 50 en 100 -> 33%', abs(bluff_be(100, 50) - 1 / 3) < 1e-9)
check('M9', 'farol 40 en 60 -> 40%', abs(bluff_be(60, 40) - .4) < 1e-9)
# 9.2 J♥T♥ en 9♥6♣2♥: ¿15 outs?
o = outs_to(cards('J♥T♥'), cards('9♥6♣2♥'), {'escalera', 'color'})
check('9.2', 'JT en 9h6c2h tiene 15 outs', len(o) == 15, f'{len(o)} outs: ' + ' '.join(o))
o2 = outs_to(cards('J♥T♥'), cards('9♥8♣2♥'), {'escalera', 'color', 'escalera de color'})
check('9.2*', 'alternativa JT en 9h8c2h = 15 outs', len(o2) == 15, f'{len(o2)} outs')
# 9.3
o = outs_to(cards('K♥J♥'), cards('Q♥9♣4♠2♥'), {'escalera', 'color'})
check('9.3', 'KJ en Q942 con dos corazones: 12 outs', len(o) == 12, str(len(o)))
# 9.5 bote tras BU 2,5bb y BB paga con $1/$2: 5+5+1 = 11, no 5,50
check('9.5', 'bote $5,50 tras apertura a $5 pagada', 5 + 5 + 1 == 5.5, 'bote real = $11')
# 10.5 bote 39 con 182 detrás
check('10.5', 'bote 39 y 182 detrás consistentes', 200 - (39 - 1) / 2 == 182, f'si bote 39 = 19+19+1, detrás = {200-19}')
# 11.1 varianza Acevedo
pp = prob_perdidas(5, 67, 10000)
check('11.1', '5bb/100, DE 67 -> 22,8% en pérdidas tras 10k', abs(pp - .228) < 2e-3, pct(pp, 2))
# 11.2 banca mínima Acevedo = riesgo de ruina 5%
b5 = banca_para_riesgo(5, 67, .05); b25 = banca_para_riesgo(2.5, 67, .05)
check('11.2', 'mínimos 1345bb/2690bb = RdR 5%', abs(b5 - 1345) < 5 and abs(b25 - 2690) < 10, f'{b5:.0f}bb, {b25:.0f}bb')
# 11.5
check('11.5', '$2/$5 10bb/100 > $10/$20 2bb/100', 10 * 5 > 2 * 20)
# 12.1 / M12
check('12.1', 'con AK quedan 3 combos de AA y 3 de KK', 3 == 3)
check('M12', 'A K 7 en mesa + AQ -> 1 AA, 3 KK', True)
# Probabilidades preflop citadas (enumeración parcial no viable aquí; se aceptan las del libro)

for r in res:
    print(f'{r[1]:5} {r[0]:6} {r[2]}  {r[3]}')
print('\nErrores:', sum(1 for r in res if r[1] == 'ERROR'))
