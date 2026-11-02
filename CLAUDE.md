# Vídeos de recetas

Proyecto para crear vídeos de TikTok/Instagram de **repostería** que explican paso a paso cómo se hace cada receta.
Hasta ahora la cuenta publicaba una foto del dulce con música; el objetivo es pasar a vídeos explicativos, crecer y,
más adelante, el afiliado de TikTok Shop (moldes, mangas, batidoras…).

**Quién te habla:** la pastelera, dueña de la cuenta. No es técnica: escríbele en español sencillo, sin comandos ni rutas,
y entrégale siempre los archivos en el chat (vídeo, portada y texto del post) para que los descargue en el móvil.
Ella sabe de repostería más que tú: si dice que un paso o una cantidad es así, es así.

## Lo que puede pedirte
- **Un vídeo de receta**: usa la skill `video-receta` (`.claude/skills/video-receta/SKILL.md`).
  Primero el guion, espera su OK, luego el vídeo.
- **Ideas y estrategia**: `guias/temas.md` y `guias/crecer.md`. Propón recetas concretas con su gancho,
  un calendario semanal, y analiza sus estadísticas si te pasa capturas.
- **Textos**: descripción del post con la receta completa, respuestas a comentarios, bio.

## Al empezar cada sesión (sin decírselo a ella)
`bash setup.sh` y `source .entorno` antes de los comandos del motor.

## Reglas
- Nunca muestres ni escribas la clave de ElevenLabs. Está en la variable de entorno `ELEVENLABS_API_KEY`.
- Antes de generar la voz, `voz.mjs --simular` (caracteres) y no regeneres el guion entero más de una vez sin preguntarle.
- Sus vídeos (mis-clips) y los vídeos finales no se suben a GitHub: son pesados y se entregan en el chat.
- No publiques nada: ella sube los vídeos.
- Nunca inventes cantidades, temperaturas ni tiempos: salen de ella o de su receta. Si falta un dato, pregúntalo.
