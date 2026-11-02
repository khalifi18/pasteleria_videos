---
name: video-receta
description: Crea vídeos verticales de recetas de repostería (receta paso a paso, truco/error común u origen de un dulce) con voz de ElevenLabs en español o darija y subtítulos en español. Úsala cuando la pastelera pida un vídeo, un guion o ideas de recetas.
---

# Vídeo de receta

Quien pide es la pastelera, desde el móvil. Háblale en español sencillo, sin comandos. Entrégale en el chat
`video.mp4`, `portada.jpg` y `texto-del-post.txt`.

## 0 · Preparar (cada sesión, en silencio)
`bash setup.sh && source .entorno`. Si avisa de que falta la clave de ElevenLabs, o `voz.mjs` dice que falta el
voice_id, díselo con estas palabras: "falta configurar la voz; pídele a Ayoub que lo revise".

## 1 · Qué vídeo hacer
| Formato | Cuándo | Cabecera del guion |
|---|---|---|
| **cocina** (el principal) | enseñar una receta paso a paso: cocina dibujada y cámara que viaja | `# formato: cocina` · `# ingredientes: …; …` — lee SIEMPRE `guias/cocina.md` |
| **receta** | cuando ella tiene vídeos de casi todos los pasos | `# formato: receta` · `# ingredientes: …; …` |
| **truco** | un error común o un consejo rápido | `# formato: truco` · `# pov: POV: …` · `# color: chocolate` · `# elemento: bizcocho` |
| **historia** | el origen de un dulce (máx. 1 por semana) | `# formato: historia` — lee `guias/historia.md` |

- En **cocina**, si ella manda vídeos suyos, úsalos con `[mio …]` sobre todo al final (el dulce real cortado).
- Colores truco: chocolate, vainilla, fresa, pistacho, terracota, arena, rosa, ciruela, noche, verde, azul.
  Elementos: bizcocho, magdalena, batidor, huevo, te, corazon, estrella, hoja, luna, vela.
- **Idioma**: pregúntale si no lo dice: `# idioma: es` (una frase por línea) o `# idioma: darija`
  (`darija | español`; reglas de darija en `guias/guion.md`). Los subtítulos siempre salen en español.

## 2 · Sus vídeos (receta y final de cocina)
Lo mejor es que la receta se vea con **sus propias manos**. Pídele que grabe y te mande clips cortos de cada paso
(cómo grabarlos: `guias/grabar.md`, pásale ese consejo en 3–4 líneas si es la primera vez).
- Copia los vídeos que te mande a `videos/<slug>/mis-clips/` con nombres en orden: `01-huevos.mp4`, `02-batir.mp4`…
- Para saber qué se ve en cada uno: `ffmpeg -ss 2 -i <clip> -frames:v 1 -vf scale=360:-1 x.jpg` y míralo con Read.
- En el guion, `[mio]` toma el siguiente por orden; `[mio 02-batir.mp4 4]` elige uno y empieza en el segundo 4
  (para saltar el principio aburrido).
- Si no tiene vídeo de un paso, `[búsqueda en inglés]` trae un clip gratis de Mixkit (`guias/grabar.md` tiene búsquedas que funcionan).
  Avísale de qué pasos van con clip de stock.

## 3 · Guion → `videos/<slug>/guion.txt`
`node motor/scripts/nuevo.mjs videos/<slug>` crea la plantilla. Lee `guias/guion.md`. Lo esencial:
- Cocina: 12–16 líneas, 35–45 s, una acción por frase (`guias/cocina.md`).
- Receta: **30–45 s**, 6–9 líneas. Estructura: dulce terminado (gancho) → `[ingredientes]` → pasos → `[texto]` truco → resultado + pregunta.
- Las cantidades, temperaturas y tiempos salen de ella: no los inventes.
- **Enséñale el guion (y el plano de cada línea) y espera su OK.**

## 4 · Voz
`node motor/scripts/voz.mjs videos/<slug> --simular` (caracteres) → `node motor/scripts/voz.mjs videos/<slug>`.
Solo cuesta si cambia el texto hablado.

## 5 · Imágenes y montaje
- Solo formato receta: `node motor/scripts/stock.mjs videos/<slug>` (descarga los pasos que no son `[mio]`; `--otro N` cambia el clip N).
- `node motor/scripts/render.mjs videos/<slug> --hoja` → abre `out/hoja.jpg` con Read y revisa: se ve el paso que se dice,
  nada cortado, textos legibles, ingredientes completos.
- `node motor/scripts/render.mjs videos/<slug>` → `out/video.mp4` + `out/portada.jpg`.
  Si la máquina es lenta (en la nube suele serlo): `bash motor/scripts/render-por-tramos.sh videos/<slug>` monta en paralelo y une.
  Un vídeo de cocina de 40 s puede tardar 30–60 min: avísale de que tardará.

## 6 · Entrega
Escribe `out/texto-del-post.txt`:
1. Gancho (1 línea) + pregunta para comentarios.
2. **La receta completa**: ingredientes y pasos numerados (la gente la guarda por esto).
3. "Guárdala para hacerla este finde" + 5–8 hashtags (#reposteria #recetasfaciles #postres #bizcocho …; en darija añade #حلويات #الطبخ_المغربي).
Envíale los tres archivos con una línea de resumen y la mejor hora para publicarlo (`guias/crecer.md`).
