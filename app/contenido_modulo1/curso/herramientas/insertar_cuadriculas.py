"""Rellena en las lecciones los bloques <!-- cuadricula:NOMBRE --> ... <!-- /cuadricula -->
con la cuadrícula 13x13 generada a partir de rangos_clarke.R (NOMBRE=VACIA muestra todas las manos)."""
import sys, os, re, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from poker_calc import grid_md
from rangos_clarke import R

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pat = re.compile(r'(<!-- cuadricula:(\w+) -->\n)(.*?)(<!-- /cuadricula -->)', re.S)
n = 0
for f in glob.glob(os.path.join(BASE, 'lecciones', '*.md')):
    t = open(f, encoding='utf-8').read()
    def rep(m):
        global n
        n += 1
        g = grid_md(None if m.group(2) == 'VACIA' else R[m.group(2)])
        return m.group(1) + g + '\n' + m.group(4)
    t2 = pat.sub(rep, t)
    if t2 != t:
        open(f, 'w', encoding='utf-8').write(t2)
print(n, 'cuadrículas insertadas')
