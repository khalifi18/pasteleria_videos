# Guía paso a paso

## Parte 1 · Configuración (una sola vez, desde un ordenador, con la cuenta de Claude de ella abierta)

1. **Voz en ElevenLabs**
   - Lo mejor: **clonar su propia voz** (plan Starter). Voices → Create a voice → Instant Voice Clone.
     Grabar 1–2 minutos hablando tranquila, sin ruido ni música. Si va a hacer vídeos en español y en darija,
     que hable un poco en cada idioma.
   - Copiar el **voice ID** de la voz (My voices → la voz → Copy voice ID).
   - Perfil → API Keys → crear una clave. Copiarla (no pegarla en ningún chat).
2. **Claude de ella → Ajustes → Capacidades** (dominios permitidos de la red), añadir:
   `api.elevenlabs.io`, `mixkit.co`, `assets.mixkit.co`, `registry.npmjs.org`.
3. **Entorno en la nube de Claude** (claude.ai/code → selector de entorno → crear o editar):
   - Acceso a red: el que permita los dominios del paso 2.
   - Variable de entorno `ELEVENLABS_API_KEY` = la clave del paso 1.
4. **Abrir el proyecto** `khalifi18/pasteleria_videos` en Claude Code con ese entorno y escribir:
   "Cambia la firma por @NOMBRE_DE_SU_CUENTA y la voz por este ID: …".
5. **Prueba juntos**: "Hazme un vídeo truco sobre por qué se hunde el bizcocho" (no necesita grabar nada).

## Parte 2 · Ella (cada vez, desde el móvil)

1. Graba los pasos de la receta con el móvil (vertical, desde arriba, 5–10 s cada paso, el dulce terminado al final).
2. Abre Claude → Code → proyecto **pasteleria_videos**.
3. Escribe, por ejemplo: "Hazme un vídeo en español de mi bizcocho de yogur. Ingredientes: … Pasos: …"
   y adjunta los vídeos.
4. Claude le enseña el guion y qué vídeo va en cada frase. Corrige lo que haga falta y responde "OK".
5. Le llegan **el vídeo, la portada y el texto con la receta**. Los descarga y los publica.
6. Una vez por semana: le pasa a Claude una captura de las estadísticas.

Otras cosas que puede pedir: "dame 5 ideas para esta semana", "hazme un truco sobre…", "cuéntame el origen de la chebakia".
