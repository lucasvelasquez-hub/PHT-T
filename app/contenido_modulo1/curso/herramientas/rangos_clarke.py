"""Rangos de apertura por defecto de Clarke (The Grinder's Manual, Cap. 2, Figuras 5, 7, 10, 15, 16),
tal como los describió NotebookLM. Calcula combos y porcentaje de cada uno."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from poker_calc import range_combos, range_pct, range_hands

R = {
 'UTG': '77+,ATs+,KTs+,QTs+,JTs,T9s,AJo+,KQo',
 'HJ':  '66+,A2s+,KTs+,QTs+,JTs,T9s,98s,ATo+,KJo+',
 'CO':  '22+,A2s+,K8s+,Q9s+,J9s+,T8s+,97s+,87s,76s,65s,A9o+,KQo,QJo,QTo,JTo,T9o',
 'CO+KJo,KTo': '22+,A2s+,K8s+,Q9s+,J9s+,T8s+,97s+,87s,76s,65s,A9o+,KTo+,QJo,QTo,JTo,T9o',
 'BU':  '22+,A2s+,K2s+,Q2s+,J6s+,T6s+,96s+,86s+,75s+,64s+,53s+,43s,32s,A8o+,K8o+,Q8o+,J8o+,T8o+,98o,87o',
 'SB':  '22+,A2s+,K2s+,Q7s+,J7s+,T7s+,97s+,86s+,75s+,65s,54s,43s,A9o+,K9o+,Q9o+,J9o+,T8o+,98o,87o',
}
for k, v in R.items():
    print(f'{k:12} {range_combos(v):4d} combos  {100*range_pct(v):5.1f}%   manos={len(range_hands(v))}')
