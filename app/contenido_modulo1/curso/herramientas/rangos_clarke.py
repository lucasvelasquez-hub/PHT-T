"""Rangos de apertura por defecto de Clarke (The Grinder's Manual, Cap. 2, Figuras 5, 7, 10, 15, 16),
tal como los describió NotebookLM, y otros rangos de Clarke usados en el curso.
Ejecutar para ver combos y porcentajes."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from poker_calc import range_combos, range_pct, range_hands

R = {
    'UTG': '77+,ATs+,KTs+,QTs+,JTs,T9s,AJo+,KQo',
    'HJ': '66+,A2s+,KTs+,QTs+,JTs,T9s,98s,ATo+,KJo+',
    'CO': '22+,A2s+,K8s+,Q9s+,J9s+,T8s+,97s+,87s,76s,65s,A9o+,KTo+,QTo+,JTo,T9o',
    'BU': '22+,A2s+,K2s+,Q2s+,J6s+,T6s+,96s+,86s+,75s+,64s+,53s+,43s,32s,A8o+,K8o+,Q8o+,J8o+,T8o+,98o,87o',
    'SB': '22+,A2s+,K2s+,Q7s+,J7s+,T7s+,97s+,86s+,75s+,65s,54s,43s,A9o+,K9o+,Q9o+,J9o+,T8o+,98o,87o',
    # Clarke Cap. 6, Fig. 32: defensa de BB contra apertura de BU a 2,5x (pago)
    'BBvsBU25': '22+,A2s+,K8s+,Q8s+,J8s+,T8s+,97s+,86s+,76s,65s,A8o+,KTo+,QTo+,JTo,T9o',
    # Clarke Cap. 6, Figs. 28-30: pagos en posición (manos jugables)
    'HJvsUTG': 'JJ,TT,99,88,77,66,AQs,AJs,KQs,AQo',
    'BUvsUTG': 'JJ,TT,99,88,77,66,55,44,33,22,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,AQo',
    'BUvsCO': 'JJ,TT,99,88,77,66,AQs,AJs,ATs,A9s,A8s,KQs,KJs,KTs,QJs,QTs,JTs,T9s,98s,87s,AQo,AJo,ATo,KQo,KJo',
    # Clarke Cap. 11.2, Fig. 64: CO contra 3-bet de SB
    '4bet': 'QQ+,AKs,AKo',
    'pagar3bet': 'JJ,TT,99,AQs,AJs,ATs,KQs,KJs,QJs,JTs,AQo,KQo,AJo',
}

if __name__ == '__main__':
    for k, v in R.items():
        print(f'{k:10} {range_combos(v):4d} combos  {100*range_pct(v):5.1f}%   manos={len(range_hands(v))}')
