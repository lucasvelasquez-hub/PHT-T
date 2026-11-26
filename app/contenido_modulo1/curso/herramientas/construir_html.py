"""Construye curso.html (un solo archivo, sin internet) a partir de lecciones/*.md.
Ejecutar desde curso/:  python -I herramientas/construir_html.py
Soporta el Markdown que usan las lecciones: títulos, párrafos, listas, tablas, citas (>),
negrita, cursiva, <details>, separadores. Colorea las cartas con baraja de cuatro colores.
"""
import html, os, re, glob

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEC = os.path.join(BASE, 'lecciones')
OUT = os.path.join(BASE, 'curso.html')

TITULOS = {
    0: 'Primeros pasos antes de tu primera mano', 1: 'La mesa, el EV y la suerte',
    2: 'Abrir el bote antes del flop', 3: 'Matemáticas de bolsillo: outs y regla del 2 y del 4',
    4: '¿Pago o me retiro? Equity, pot odds e implied odds', 5: 'Defender antes del flop y set-mining',
    6: 'La apuesta de continuación (c-bet)', 7: 'Apostar por valor', 8: 'Defensa después del flop',
    9: 'Faroles y semifaroles', 10: '3-bet y botes grandes', 11: 'Mente y hábitos',
    12: 'Opcional: puente a GTO',
}

CARD = re.compile(r'(?<![\w])(10|[2-9TJQKA])([♠♥♦♣])')
SUITCLS = {'♠': 's', '♥': 'h', '♦': 'd', '♣': 'c'}


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    t = CARD.sub(lambda m: f'<span class="card {SUITCLS[m.group(2)]}">{m.group(1)}{m.group(2)}</span>', t)
    return t


def md_to_html(md):
    lines = md.splitlines()
    out, i = [], 0
    para = []

    def flush():
        if para:
            out.append('<p>' + inline(' '.join(para)) + '</p>')
            para.clear()

    while i < len(lines):
        ln = lines[i]
        s = ln.strip()
        if not s:
            flush(); i += 1; continue
        if s.startswith('<details'):
            flush(); out.append('<details>'); i += 1; continue
        if s.startswith('<summary>'):
            out.append('<summary>' + inline(re.sub(r'</?summary>', '', s)) + '</summary><div class="ans">'); i += 1; continue
        if s.startswith('</details>'):
            flush(); out.append('</div></details>'); i += 1; continue
        m = re.match(r'(#{1,4})\s+(.*)', s)
        if m:
            flush(); lvl = len(m.group(1)) + 1
            out.append(f'<h{lvl}>{inline(m.group(2))}</h{lvl}>'); i += 1; continue
        if s == '---':
            flush(); out.append('<hr>'); i += 1; continue
        if s.startswith('|'):
            flush(); rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                rows.append(lines[i].strip()); i += 1
            cells = [[c.strip() for c in r.strip('|').split('|')] for r in rows]
            body = [r for r in cells[1:] if not all(re.fullmatch(r':?-+:?', c) for c in r)]
            h = '<div class="tw"><table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in cells[0]) + '</tr></thead><tbody>'
            for r in body:
                h += '<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>'
            out.append(h + '</tbody></table></div>'); continue
        if s.startswith('>'):
            flush(); q = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                q.append(lines[i].strip()[1:].strip()); i += 1
            inner = md_to_html('\n'.join(q))
            out.append(f'<blockquote>{inner}</blockquote>'); continue
        if re.match(r'([-*]|\d+\.)\s', s):
            flush(); ordered = bool(re.match(r'\d+\.', s)); tag = 'ol' if ordered else 'ul'
            items = []
            while i < len(lines) and re.match(r'\s*([-*]|\d+\.)\s', lines[i]):
                items.append(re.sub(r'^\s*([-*]|\d+\.)\s+', '', lines[i])); i += 1
            out.append(f'<{tag}>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + f'</{tag}>'); continue
        para.append(s); i += 1
    flush()
    return '\n'.join(out)


CSS = """
:root{--bg:#f7f5f0;--fg:#1d1d1b;--mut:#5d5a53;--card:#fff;--line:#ddd8cc;--acc:#0f5c45;--accbg:#e4f0ea;
--s:#1d1d1b;--h:#c8102e;--d:#1f5fbf;--c:#1b7a2f}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#141513;--fg:#ecebe6;--mut:#a8a59c;--card:#1e1f1c;
--line:#34352f;--acc:#6fd0a8;--accbg:#1d2f27;--s:#ecebe6;--h:#ff6b7f;--d:#7fb2ff;--c:#6fd58a}}
:root[data-theme=dark]{--bg:#141513;--fg:#ecebe6;--mut:#a8a59c;--card:#1e1f1c;--line:#34352f;--acc:#6fd0a8;--accbg:#1d2f27;
--s:#ecebe6;--h:#ff6b7f;--d:#7fb2ff;--c:#6fd58a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.6 Georgia,'Iowan Old Style',serif}
.wrap{max-width:760px;margin:0 auto;padding:24px 16px 80px}
h1{font:700 2rem/1.2 system-ui,sans-serif;margin:.2em 0}h2,h3,h4{font-family:system-ui,sans-serif;line-height:1.25}
h2{font-size:1.55rem;margin-top:2.4em;padding-top:1em;border-top:2px solid var(--line)}
h3{font-size:1.15rem;margin-top:1.8em;color:var(--acc)}
p,li{max-width:68ch}a{color:var(--acc)}
.card{display:inline-block;font:700 .95em/1 system-ui,sans-serif;padding:.18em .32em;margin:0 .06em;border:1px solid var(--line);
border-radius:.3em;background:var(--card);white-space:nowrap}
.card.s{color:var(--s)}.card.h{color:var(--h)}.card.d{color:var(--d)}.card.c{color:var(--c)}
blockquote{margin:1.2em 0;padding:.6em 1em;background:var(--accbg);border-left:4px solid var(--acc);border-radius:0 8px 8px 0}
blockquote p{margin:.4em 0}
.tw{overflow-x:auto}table{border-collapse:collapse;margin:1em 0;font:15px/1.4 system-ui,sans-serif}
th,td{border:1px solid var(--line);padding:.45em .6em;text-align:left;vertical-align:top}th{background:var(--card)}
details{margin:.6em 0 1.4em;border:1px solid var(--line);border-radius:8px;background:var(--card)}
summary{cursor:pointer;padding:.6em .9em;font:600 15px system-ui,sans-serif;color:var(--acc)}
.ans{padding:0 1em .4em}hr{border:0;border-top:1px solid var(--line);margin:2em 0 1em}
hr+p{font-size:.85em;color:var(--mut)}
nav.toc{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:.8em 1.2em}
nav.toc ol{padding-left:1.4em}nav.toc li{margin:.2em 0}
.mod{font:700 .8rem system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-top:3em}
.leccion{scroll-margin-top:12px}
"""


def main():
    files = sorted(glob.glob(os.path.join(LEC, 'M*_*.md')))
    by_mod = {}
    for f in files:
        name = os.path.basename(f)
        m = int(name[1:3])
        by_mod.setdefault(m, []).append(f)
    toc, body = [], []
    for m in sorted(by_mod):
        fs = sorted(by_mod[m], key=lambda p: ('evaluacion' in p, p))
        toc.append(f'<li><a href="#m{m}">Módulo {m}: {html.escape(TITULOS.get(m, ""))}</a><ol>')
        body.append(f'<div class="mod" id="m{m}">Módulo {m} · {html.escape(TITULOS.get(m, ""))}</div>')
        for f in fs:
            md = open(f, encoding='utf-8').read()
            first = md.splitlines()[0].lstrip('# ').strip()
            anchor = os.path.basename(f)[:-3]
            toc.append(f'<li><a href="#{anchor}">{inline(first)}</a></li>')
            body.append(f'<section class="leccion" id="{anchor}">' + md_to_html(md) + '</section>')
        toc.append('</ol></li>')
    page = f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Curso de póker cash</title>
<style>{CSS}</style></head><body><div class="wrap">
<h1>Curso de Texas Hold'em cash para principiantes</h1>
<p>No-Limit Hold'em, mesas de 6 jugadores, 100 ciegas grandes. Una lección al día, de 5 a 10 minutos. Ejemplos en ciegas $1/$2.</p>
<p>Baraja de cuatro colores: <span class="card s">A♠</span> <span class="card h">A♥</span> <span class="card d">A♦</span> <span class="card c">A♣</span></p>
<nav class="toc"><strong>Índice</strong><ol>{''.join(toc)}</ol></nav>
{''.join(body)}
</div></body></html>"""
    open(OUT, 'w', encoding='utf-8').write(page)
    print(f'{len(files)} archivos -> {OUT}')


if __name__ == '__main__':
    main()
