# Formato infografía viva

Para publicar rápido cualquier receta, también las complicadas. La cámara recorre **su propia infografía** (la imagen
con el título, los ingredientes y el paso a paso que ella ya hace) como en la referencia de Google Maps:
empieza en la foto del dulce y vuela de zona en zona mientras la voz lo explica. La zona de la que se habla queda
iluminada con un borde dorado y el resto en penumbra. No hay que dibujar nada.

Ejemplo completo: `videos/lotus/` (guion + infografía).

## Cómo se hace
1. Ella te manda la infografía. Guárdala en la carpeta del vídeo (`videos/<slug>/receta.jpg`).
   Cuanta más resolución, mejor: si tiene el original grande, pídeselo.
2. **Lee la infografía** (Read sobre la imagen): las cantidades y los pasos salen de ahí. No inventes nada.
3. Define las zonas: `# zona nombre: x y ancho alto`, en **% de la imagen** (0–100), y comprueba que encuadran bien
   dibujándolas encima:
   ```
   F=$(grep "^# zona" videos/<slug>/guion.txt | awk '{printf "drawbox=x=%d:y=%d:w=%d:h=%d:color=red@0.9:t=4,", $4*ANCHO/100, $5*ALTO/100, $6*ANCHO/100, $7*ALTO/100}' | sed 's/,$//')
   ffmpeg -y -i videos/<slug>/receta.jpg -vf "$F" zonas.jpg     # (ANCHO y ALTO de la imagen en píxeles) y míralo con Read
   ```
4. Guion: cada línea `[zona] frase`. `[todo]` = la infografía entera; sin corchete = sigue en la misma zona.
   `[mio …]` y `[texto]` también funcionan (su vídeo real o una frase grande encima).

```
# receta: tarta de Lotus
# formato: infografia
# idioma: es
# imagen: lotus.jpg
# zona tarta: 46 3 54 28
# zona base: 2 33 24 18
# zona paso1: 1 55 17 24
[tarta] La tarta de Lotus más cremosa… y *sin horno*.
[base] La base: galletas Lotus trituradas con *mantequilla derretida*.
[paso1] Al molde, bien presionada, y treinta minutos a la nevera.
…
[porcion] ¿Te atreves con ella? La receta completa, en la descripción.
```

## Reglas
- Empieza en la foto del dulce terminado (el gancho) y termina en la porción o el corte.
- Una zona por frase; frases cortas: cada frase es un vuelo de la cámara.
- No leas la infografía entera: resume cada paso en una frase. La receta completa va en la descripción o el primer comentario.
- Lo más corto posible (máximo 1:30). Una receta con muchas partes (entremets, hojaldre) se puede contar entera aquí
  resumida, o partir en vídeos.
- Zonas de unos 15–35 % de ancho: más pequeñas obligan a mucho zoom y se ve borroso (la cámara no pasa de cierto zoom).
- Revisa con `render.mjs --hoja` y un `--still` a tamaño real en la zona más pequeña: el texto tiene que leerse.
