# Formato ficha: infografía generada + cámara que la recorre

El formato para casi todas las recetas. Tú solo escribes la receta en el guion; el motor dibuja la infografía
(portada con la tarta, tarjetas de ingredientes con iconos, pasos ilustrados en zigzag y la porción final) y la cámara
la recorre como en la referencia de Google Maps. Cuando la cámara llega a un bloque, cobra vida: los ingredientes
se marcan uno a uno, la ilustración del paso se anima (cae la galleta al bol, gira la espátula, se llena el molde,
burbujea el cazo, aparecen los rosetones) y al acabar el paso sale un ✓ que se queda.

Además se exporta la infografía entera como imagen (`out/infografia.jpg`) para publicarla también como post.
Es vectorial: nítida a cualquier zoom.

Ejemplo completo: `videos/lotus-ficha/guion.txt`.

## El guion
```
# formato: ficha
# idioma: es
# tarta: lotus                       ← colores de la tarta dibujada: lotus, limon, chocolate, fresa, red-velvet, vainilla
# foto: tarta.jpg                    ← (opcional) foto real suya del dulce: sustituye a la tarta dibujada en portada y final
# titulo: La tarta de | Lotus        ← línea pequeña | palabra grande
# lema: Cremosa, crujiente e irresistible
# datos: Sin horno; 8–10 porciones; 4 h de nevera
# ingredientes base: 250 g de galletas Lotus; 100 g de mantequilla derretida
# ingredientes crema: 400 ml de nata para montar; 400 g de queso crema; …
# paso 1: La base | Tritura las galletas, mézclalas con la mantequilla y presiona en el molde. | triturar galleta
# paso 2: La crema | Monta la nata y únela con movimientos envolventes. | mezclar crema
[portada] La tarta de Lotus más cremosa… y *sin horno*.
[ingredientes base] Para la base, galletas Lotus y *mantequilla*.
[paso 1] Tritura las galletas, mézclalas y presiona en el molde.
…
[porcion] ¿Te atreves con ella? La receta completa, en la descripción.
```

- **Grupos de ingredientes** (`# ingredientes <grupo>:`): base, crema, cobertura, decorar, masa, relleno, frosting, bizcocho,
  almibar, glaseado, mousse, inserto, laminado, pintar… (salen como "Para la base", "Para decorar"…). Cantidad delante:
  sale destacada. Cada ingrediente lleva su icono (si no hay uno dibujado, sale un tarro con su nombre).
- **Pasos** (`# paso N: Título | texto | ilustración`): el texto es el de la infografía (completo pero corto, 1–3 frases).
- **Zonas para la cámara** (una por línea del guion): `[portada]`, `[ingredientes]` (todas las tarjetas),
  `[ingredientes <grupo>]`, `[paso N]`, `[porcion]`. Sin corchete = sigue en la misma. `[mio …]` y `[texto]` también valen.

## Ilustraciones de los pasos
`tipo color1 color2`. Colores por nombre (galleta, lotus, caramelo, crema, nata, blanco, masa, chocolate, cacao, limon,
fresa, frambuesa, rojo, queso, mantequilla, leche, vainilla) o `#hex`.

| Tipo | Qué se ve (y qué se anima cuando llega la cámara) |
|---|---|
| `triturar galleta` | bol con migas; caen galletas y se llena |
| `batir masa` / `mezclar crema` | bol con la mezcla; batidor o espátula girando |
| `montar nata` | bol con picos de nata montada |
| `molde galleta crema` | molde desmontable con la base; un bol vierte el relleno y se llena |
| `nevera 4` | nevera con copo girando y reloj ("4 h") |
| `calentar caramelo` | cazo al fuego burbujeando |
| `verter masa` / `cubrir caramelo crema` | un bol vierte sobre el molde y la capa se extiende con brillo |
| `decorar` | la tarta vista desde arriba; la manga va poniendo los rosetones |
| `hornear 180` | horno encendido con el bizcocho subiendo |
| `cortar` | la tarta terminada |

## Reglas
- Lo más corto posible (máximo 1:30). La voz resume; el texto completo está en la ficha y la receta en la descripción.
- Empieza en `[portada]` y acaba en `[porcion]` con el aviso de la receta.
- No hace falta visitar todos los bloques: un grupo de ingredientes o un paso pueden quedarse solo en la imagen.
- Revisa con `render.mjs --hoja` (vídeo) y `render.mjs --imagen` (la infografía entera; ábrela con Read por partes).
- Si una receta necesita un ingrediente o una ilustración que no existe, dibújala en `motor/src/ficha/dibujos.tsx`
  (`Icono` o `Ilustracion`) con el mismo estilo: luz arriba a la izquierda, sombra suave, brillo.
