# Formato cocina: la receta contada en una cocina dibujada

Es el formato principal. Como la referencia de Google Maps (`guias/referencia-google-maps.md`): **un solo mundo**
(la pared con el horno arriba y la encimera vista desde arriba) y **una cámara que viaja** a donde pasa cada paso.
Nada de escenas sueltas ni fondos quietos: el huevo va al bol, el batidor gira, la masa cambia de color, el horno se enciende,
el bizcocho sube, sale y se corta. Los datos aparecen pegados al objeto cuando la voz los nombra ("3 huevos", "180 °C", "35 min").

Ejemplo completo: `videos/piloto-bizcocho/guion.txt`.

## El guion
```
# receta: bizcocho de yogur
# formato: cocina
# idioma: es
# ingredientes: 3 huevos; 1 yogur natural; 2 medidas de azúcar; 3 medidas de harina; 1 medida de aceite; 1 sobre de levadura
[general] El bizcocho más fácil del mundo, y *sin báscula*.
[ingredientes] El vaso del yogur es tu medida.
[echar huevos] Tres huevos al bol…
[batir] y bate hasta que *blanquee*.
…
[mio corte.mp4 2] Y así queda por dentro.
```
Cada línea: `[acción]` + la frase. La acción dice qué pasa y a dónde va la cámara.

| Acción | Qué pasa | Cámara |
|---|---|---|
| `[general]` | toda la cocina | muy lejos, se ve todo |
| `[ingredientes]` o `[mesa]` | aparece la etiqueta de cada ingrediente, uno a uno | la encimera entera |
| `[ver harina]` | etiqueta de ese ingrediente | se acerca a él |
| `[echar X]` o `[X]` | X va al bol y se echa (huevos: se rompen; polvos: caen; líquidos: chorro) | el bol y X |
| `[batir]` | el batidor da vueltas, todo se mezcla y aclara | muy cerca del bol |
| `[mezclar]` | espátula, mezcla envolvente | muy cerca del bol |
| `[verter]` | el bol va al molde y la masa cae | bol y molde |
| `[hornear 180]` | el molde entra al horno, se enciende, etiqueta "180 °C" | el horno |
| `[esperar 35]` | el reloj del horno corre, el bizcocho sube, etiqueta "35 min" | cerca del horno |
| `[sacar]` | el bizcocho sale al plato humeando | el plato |
| `[corte]` | cuchillo, sale una porción y se tumba enseñando la miga | muy cerca |
| `[decorar azucar]` / `[decorar chocolate]` | azúcar glas con colador / hilos de chocolate | el bizcocho |
| `[mio nombre.mp4 2]` | **su vídeo real** encima del mundo (desde el segundo 2) | — |
| `[texto]` | tarjeta con una frase grande | — |
| sin corchete | sigue lo mismo, la cámara deriva despacio | — |

Ingredientes dibujados (X): huevos, harina, azucar, yogur, aceite, leche, levadura, mantequilla, chocolate, cacao, limon.
Las piezas que hay en la mesa salen de `# ingredientes:` (se reconocen por el nombre: "3 medidas de harina" → harina);
si hace falta otro orden, `# mesa: huevos, azucar, harina`. Caben 8.

## Reglas para que tenga vida
- **Una acción por frase**, y la frase dice lo que se ve en ese momento. Frases cortas (3–9 palabras):
  cada frase es un movimiento de cámara.
- Empieza con `[general]` o directamente con el resultado si hay un vídeo suyo bonito (`[mio …]`).
- **El final, si se puede, con su dulce real**: `[mio …]` del corte o de la miga. Lo dibujado explica;
  lo real da ganas de hacerlo.
- Lo más corto posible: una receta sencilla, 12–16 líneas (35–45 s). Máximo 1:30; si no cabe, en partes.
- La última frase avisa de dónde está la receta ("La receta completa, en la descripción"); en pantalla sale solo.
- Lo que no existe como pieza (otro ingrediente, otro utensilio) se dice en la frase pero se apoya en una acción que sí existe
  (p. ej. "un chorrito de vainilla" con `[mezclar]`). Si una receta lo necesita de verdad, se dibuja una pieza nueva en
  `motor/src/cocina/piezas.tsx` (función `Ingrediente`) y se añade a `INGR` en `estado.ts`, con el mismo estilo:
  vista desde arriba, sombra suave, brillo arriba a la izquierda.

## Revisión
1. `render.mjs --hoja` (un fotograma por frase): ¿se entiende el paso sin sonido? ¿las etiquetas se leen? ¿algo tapa el subtítulo?
2. `render.mjs --tira 9.2,9.8,10.4,…` (instantes en segundos, mira `words.json` para saber cuándo empieza cada frase):
   revisa los movimientos (echar, verter, cortar) fotograma a fotograma. Cosas que fallaban y ya están resueltas;
   si vuelven a pasar con una pieza nueva, corrígelo igual:
   - el recipiente no se mete encima del bol: se queda fuera, con la boca sobre el borde, y se inclina;
   - cada ingrediente cae del lado por el que se echa y se ve distinto (polvo mate, azúcar con brillos, aceite como brillo dorado, yogur cremoso);
   - el texto de los envases nunca sale del revés.
