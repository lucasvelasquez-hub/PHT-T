#!/usr/bin/env bash
# Recorta las hojas de avatares 3×3 (generadas en Canva) en archivos individuales de 512×512 en WebP.
# Uso: bash app/scripts/recortar_avatares.sh <hoja_1.png> <hoja_2.png>
set -euo pipefail
destino="$(dirname "$0")/../public/assets/avatares"
mkdir -p "$destino"
hoja1=(Pluribus MrBlue MrOrange MrPink MrWhite MrBlonde Eddie Bill Hattori)
hoja2=(MrBrown Budd ORen Joe rival_1 rival_2 rival_3 rival_4 rival_5)

recortar() {
  local hoja="$1"; shift
  local nombres=("$@")
  local w h celda_w celda_h margen
  w=$(magick identify -format "%w" "$hoja")
  h=$(magick identify -format "%h" "$hoja")
  celda_w=$((w / 3)); celda_h=$((h / 3))
  margen=$((celda_w * 4 / 100))   # recorta un 4 % por lado para quitar las líneas de separación
  local i=0
  for fila in 0 1 2; do
    for col in 0 1 2; do
      local x=$((col * celda_w + margen)) y=$((fila * celda_h + margen))
      local cw=$((celda_w - 2 * margen)) ch=$((celda_h - 2 * margen))
      magick "$hoja" -crop "${cw}x${ch}+${x}+${y}" +repage -resize 512x512^ -gravity center -extent 512x512 \
        -quality 82 "$destino/${nombres[$i]}.webp"
      i=$((i + 1))
    done
  done
}
recortar "$1" "${hoja1[@]}"
recortar "$2" "${hoja2[@]}"
ls -la "$destino"
