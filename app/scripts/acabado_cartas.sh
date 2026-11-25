#!/usr/bin/env bash
# Acabado de las cartas de Next Chip.
# Toma el mazo vectorial de Chris Aguilar (v3.2, LGPL 3.0) y le da el material de la imagen aprobada (comp-b):
# papel marfil con luz cenital, fibra fina, tinta mas rica, canto con volumen y un brillo tenue.
# El angulo (perspectiva) y la sombra sobre el pano los aplica la app segun la posicion de cada carta.
#
# Uso: bash app/scripts/acabado_cartas.sh
# Salida: app/public/cartas/clasico/<rango><palo>.webp  y  app/public/cartas/cuatro_colores/<rango><palo>.webp (solo d y c)
set -euo pipefail

raiz="$(cd "$(dirname "$0")/../.." && pwd)"
origen="$raiz/recursos/cartas_chris_aguilar/v3.2/Vector Cards (Version 3.2)/FACES (BORDERED)/STANDARD BORDERED/Single Cards (One Per FIle)"
destino="$raiz/app/public/cartas"
tmp="$(mktemp -d)"; command -v cygpath >/dev/null && tmp="$(cygpath -m "$tmp")"   # ruta que entienda magick.exe en Windows
trap 'rm -rf "$tmp"' EXIT

W=640; H=894   # proporcion del mazo (63 x 88 mm)

# 1. Capas comunes (se generan una vez) ---------------------------------------------------------
# Papel: marfil calido con luz cenital (arriba mas claro, abajo un poco mas tibio y oscuro).
magick -size ${W}x${H} gradient:'#f8f1e2'-'#e7dbc3' "$tmp/papel.png"
# Fibra del papel: ruido fino + fibras horizontales y verticales muy suaves.
magick -size ${W}x${H} xc:gray50 -seed 7 +noise Gaussian -modulate 100,0 -blur 0x0.5 \
  \( -size ${W}x${H} xc:gray50 -seed 11 +noise Gaussian -modulate 100,0 -motion-blur 0x6+0 \) \
  \( -size ${W}x${H} xc:gray50 -seed 13 +noise Gaussian -modulate 100,0 -motion-blur 0x6+90 \) \
  -evaluate-sequence mean -auto-level +level 45%,55% -type TrueColor PNG24:"$tmp/fibra.png"   # gris 50 % +- 5 %: textura apenas perceptible
# Brillo: barrido diagonal muy tenue, como el reflejo de la lampara sobre el carton plastificado.
# Se aplica en modo "screen": negro = sin cambio; la banda llega a un gris de ~9 % (luz muy sutil).
magick -size $((H*2))x$((H*2)) xc:black \
  \( -size $((H*2))x$((H/2)) gradient:black-'#181818' \) -gravity center -geometry +0-$((H/4)) -composite \
  \( -size $((H*2))x$((H/2)) gradient:'#181818'-black \) -gravity center -geometry +0+$((H/4)) -composite \
  -background black -rotate -32 -gravity center -crop ${W}x${H}+0+0 +repage -type TrueColor PNG24:"$tmp/brillo.png"

acabar() {   # $1 = svg de entrada, $2 = webp de salida, $3 = color opcional que reemplaza al negro (treboles verdes)
  local svg="$1" out="$2" tinta="${3:-}"
  # PNG32 obliga a guardar en color: si la carta solo tiene negro, ImageMagick la guardaria en grises y no tomaria el marfil.
  if [[ "$svg" == *.png ]]; then
    magick "$svg" -resize ${W}x${H}! PNG32:"$tmp/base.png"
  elif [[ -n "$tinta" ]]; then
    magick -density 260 -background none "$svg" -resize ${W}x${H}! -fuzz 35% -fill "$tinta" -opaque black PNG32:"$tmp/base.png" 2>/dev/null
  else
    magick -density 260 -background none "$svg" -resize ${W}x${H}! PNG32:"$tmp/base.png" 2>/dev/null
  fi
  magick "$tmp/base.png" -alpha extract "$tmp/mascara.png"
  # Canto: oscurece 3-4 px hacia el borde y deja una linea de luz arriba (grosor del carton).
  magick "$tmp/mascara.png" -morphology Erode Disk:2 -blur 0x3 -type TrueColor PNG24:"$tmp/canto.png"
  magick "$tmp/mascara.png" -morphology Erode Disk:1 \( +clone -roll +0+2 \) -compose minus_src -composite -blur 0x0.8 -level 0,60% "$tmp/luz_canto.png"

  magick "$tmp/base.png" -background white -alpha remove -alpha off \
    -modulate 100,104 \
    "$tmp/papel.png" -compose multiply -composite \
    "$tmp/fibra.png" -compose overlay -composite \
    \( "$tmp/canto.png" -level 0,100% -fill '#5a4a32' -colorize 0 \) -compose multiply -composite \
    "$tmp/brillo.png" -compose screen -composite \
    \( "$tmp/luz_canto.png" -alpha copy -fill '#fffaf0' -colorize 100 \) -compose over -composite \
    "$tmp/mascara.png" -alpha off -compose copyopacity -composite \
    -quality 88 -define webp:alpha-quality=100 "$out"
}

nombre() {   # CLUB-12-QUEEN.svg -> Qc
  local base="${1%.svg}" palo rango
  case "${base%%-*}" in CLUB) palo=c;; DIAMOND) palo=d;; HEART) palo=h;; SPADE) palo=s;; *) return 1;; esac
  rango="$(echo "$base" | cut -d- -f2)"
  case "$rango" in 1) rango=A;; 10) rango=T;; 11) rango=J;; 12) rango=Q;; 13) rango=K;; esac
  echo "$rango$palo"
}

mkdir -p "$destino/clasico" "$destino/cuatro_colores"
n=0
filtro="${1:-*}"   # opcional: un patron, p. ej. 'HEART-1*' para probar con pocas cartas, o 'dorso' para solo el dorso

# Dorso propio (dorso.svg). Usa la fuente Barlow, que ImageMagick no tiene: se renderiza con Chrome sin ventana.
if [[ "$filtro" == "*" || "$filtro" == "dorso" ]]; then
  chrome="/c/Program Files/Google/Chrome/Application/chrome.exe"
  fuente="$(cygpath -m "$raiz/app/public/fonts/barlow-700-latin.woff2" 2>/dev/null || echo "$raiz/app/public/fonts/barlow-700-latin.woff2")"
  svgdorso="$(cygpath -m "$destino/dorso.svg" 2>/dev/null || echo "$destino/dorso.svg")"
  cat > "$tmp/dorso.html" <<HTML
<!doctype html><html><head><style>
@font-face{font-family:Barlow;font-weight:700;src:url("file:///$fuente") format("woff2");}
html,body{margin:0;background:transparent;} svg{display:block;width:${W}px;height:${H}px;}
</style></head><body>$(cat "$destino/dorso.svg")</body></html>
HTML
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --default-background-color=00000000 --window-size=${W},${H} --screenshot="$tmp/dorso.png" "file:///$tmp/dorso.html" >/dev/null 2>&1
  acabar "$tmp/dorso.png" "$destino/dorso.webp"
  echo "Dorso terminado: $destino/dorso.webp (fuente: $svgdorso)"
  [[ "$filtro" == "dorso" ]] && exit 0
fi

for svg in "$origen"/$filtro.svg; do
  archivo="$(basename "$svg")"
  [[ "$archivo" == JOKER* ]] && continue
  id="$(nombre "$archivo")"
  acabar "$svg" "$destino/clasico/$id.webp"
  # Variante de cuatro colores: diamantes azules y treboles verdes (figura incluida).
  case "$id" in
    *d) sed 's/#c8102e/#1d5fc4/gI' "$svg" > "$tmp/cc.svg"; acabar "$tmp/cc.svg" "$destino/cuatro_colores/$id.webp";;
    *c) acabar "$svg" "$destino/cuatro_colores/$id.webp" '#1b6e3a';;
  esac
  n=$((n + 1))
done
echo "Cartas terminadas: $n (clasico) + $(ls "$destino/cuatro_colores" | wc -l) (cuatro colores)"
