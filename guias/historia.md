# Formato historia: el origen de un dulce

Para vídeos tipo "¿De dónde viene la chebakia?" o "El error que inventó el brownie". 35–45 s.
Es el formato más caro de hacer (dibujos a medida): úsalo como mucho una vez por semana.

## 1 · El guion
1. **Gancho con sorpresa en el segundo 0**: un dato que nadie espera ("El croissant no es francés").
2. **Giro corto**: "Te cuento…" / "غادي نحكي ليك…".
3. **El origen, con una persona o un lugar concreto** y un detalle humano.
4. **Un viaje** (de dónde a dónde llegó) o **una fecha** que sorprenda.
5. **Vuelta al presente**: cómo lo hace ella hoy (enlaza con su receta).
6. **CTA doble**: "¿Lo sabías?" + "¿Qué dulce quieres que te cuente ahora?".

Reglas: cada dato comprobado en la web (fuentes en un comentario `#` del guion). Si el origen es discutido, se dice
("se cuenta que…"). Nada de política.

## 2 · Lo visual (listón: los vídeos de Prográmelo)
- **Modelo a imitar: `guias/referencia-google-maps.md`** (léelo antes de dibujar): un mundo continuo y la cámara viaja de posición en posición dentro de él, con parallax. Lo que se mueve es la cámara, nunca el fotograma temblando.
- **Un solo mundo continuo**, no escenas sueltas: la cámara viaja (mapa visto desde arriba → zoom a la ciudad → la pastelería o la cocina → el dulce).
- **Cámara de verdad, no imagen temblando**: `Camara2D` hace UN movimiento continuo por escena (acercarse, paneo, alejarse, subir…),
  alternando entre escenas; nunca va y vuelve. Para que se sienta profundidad, divide cada dibujo en capas con
  `<Capa z={0}>` (cielo/fondo), `<Capa z={0.5}>` (edificios) y `<Capa z={1}>` (primer plano): el parallax hace que la cámara
  parezca moverse dentro del mundo. Para viajes (de dónde viene el dulce) usa un foco que se mueve con la ruta.
- **Cada frase = una imagen nueva que muestra lo que se dice**: fecha → número grande; viaje → ruta sobre el mapa
  (`mapa-norte-africa` ya existe); lugar → la ciudad o el obrador replicado; el dulce → dibujado con detalle (capas, brillo, migas).
  Ejemplo de código hecho a medida: `motor/src/historias/fatima-fihri.tsx`.
- **Calidad del dibujo**: degradados, luz cálida, sombras, grano, siluetas sin cara; detalles del lugar de origen del dulce.
  Nada de formas planas sueltas. Si una escena parece un icono, no vale.
- **Revisión obligatoria**: `render.mjs --hoja` y mirar cada fotograma: ¿se entiende sin sonido? ¿algo cortado? ¿el texto tapa el dibujo?
  Si una escena no está a la altura, se rehace antes de montar.

## 3 · Interacción
- Primera línea de la descripción = la sorpresa del gancho.
- Fijar un comentario con 3 dulces para que voten el próximo.
- Si el vídeo funciona, el siguiente es la receta de ese dulce ("Ahora te enseño a hacerlo").
