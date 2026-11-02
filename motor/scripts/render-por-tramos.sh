#!/usr/bin/env bash
# Render en tramos paralelos (máquinas lentas o sin gráfica) y unión final con la portada.
#   bash motor/scripts/render-por-tramos.sh videos/<slug> [tramos]
# Por defecto tantos tramos como núcleos (máx. 4). Deja out/video.mp4 y out/portada.jpg.
set -e
D="${1:?Uso: bash motor/scripts/render-por-tramos.sh videos/<slug> [tramos]}"
N="${2:-$(nproc 2>/dev/null || echo 2)}"
[ "$N" -gt 4 ] && N=4
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$RAIZ"
[ -f .entorno ] && source .entorno
# fotogramas totales = fin de la voz + 2,7 s de cierre (igual que render.mjs)
TOTAL=$(node -e "const w=require('./$D/words.json');console.log(Math.ceil((w[w.length-1].e+2.7)*30))")
PASO=$(( (TOTAL + N - 1) / N ))
mkdir -p "$D/out"
rm -f "$D"/out/parte-*.mp4
echo "Montando $TOTAL fotogramas en $N tramos…"
for i in $(seq 0 $((N - 1))); do
  A=$((i * PASO)); B=$((A + PASO - 1))
  node motor/scripts/render.mjs "$D" --rango "$A-$B" > "$D/out/log-$i.txt" 2>&1 &
done
wait
for i in $(seq 0 $((N - 1))); do grep -q "^OK" "$D/out/log-$i.txt" || { echo "FALLO · tramo $i (mira $D/out/log-$i.txt)"; exit 1; }; done
ls "$D"/out/parte-*.mp4 | sort | sed "s#.*#file '$RAIZ/&'#" > "$D/out/lista.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$D/out/lista.txt" -c copy "$D/out/video.mp4"
rm -f "$D"/out/parte-*.mp4 "$D"/out/lista.txt "$D"/out/log-*.txt
node motor/scripts/render.mjs "$D" --portada | grep OK
echo "OK · $D/out/video.mp4"
