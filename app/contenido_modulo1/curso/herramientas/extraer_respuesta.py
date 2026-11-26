import json, sys
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf-8'))
open(dst, 'w', encoding='utf-8').write(d['answer'])
print(len(d['answer']), 'chars ->', dst)
