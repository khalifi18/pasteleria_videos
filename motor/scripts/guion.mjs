// Lee videos/<slug>/guion.txt
//
// # formato: receta | truco | historia     (alias internos: receta → leccion, truco → hikma)
// # idioma: es | darija                    es → una sola frase por línea (voz y subtítulo iguales)
//                                          darija → "darija | español" (voz en darija, subtítulo en español)
// # ingredientes: 3 huevos; 150 g de azúcar; 200 g de harina   (separados por ;)
//   receta → [qué se ve] frase                     un clip por paso
//            [mio]               siguiente vídeo suyo de videos/<slug>/mis-clips/ (orden alfabético)
//            [mio batir.mp4 12]  ese vídeo suyo, empezando en el segundo 12
//            [búsqueda en inglés] clip gratis de Mixkit (si no tiene vídeo propio de ese paso)
//            [ingredientes]      tarjeta con la lista de # ingredientes
//            [texto]             tarjeta con una frase grande (el truco, la cantidad clave)
//            [=]                 sigue el mismo clip
//   truco  → # pov: …  # color: …  # elemento: …   y líneas sin corchetes (frase grande en el centro)
//   cocina → [accion objeto opciones] frase   (mundo dibujado de la cocina; ver guias/cocina.md)
//   historia → [escena] frase      (dibujos 2D a medida; ver guias/historia.md)
//
// FORMATO POV con vídeo de fondo:
//   # pov: POV: el día que entendí este refrán…     ← texto fijo arriba durante todo el vídeo
//   # fondo: rain, candle                           ← 1–2 búsquedas en inglés: clips lentos de fondo para todo el vídeo
//   frase en darija | frase en español con *clave*  ← la frase en español sale grande en el centro
//   [texto] الما والشطابة حتى لقاع البحر | "Agua y escoba…"   ← refrán/aleya: el árabe también sale en grande
//   Etiquetas de voz dentro de la darija: [short pause] [warmly]… (no salen en pantalla)
//
// FORMATO CLIPS (antiguo, si no hay "# fondo:"): [búsqueda] al principio de cada línea = un clip por frase.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function leerGuion(dir) {
  const raw = fs.readFileSync(path.join(dir, 'guion.txt'), 'utf8');
  const filas = raw.split(/\r?\n/).map((l) => l.trim());
  const cab = (k) => {
    const f = filas.find((l) => new RegExp(`^#\\s*${k}\\s*:`, 'i').test(l));
    return f ? f.replace(new RegExp(`^#\\s*${k}\\s*:\\s*`, 'i'), '').trim() : null;
  };
  const lista = (s) => (s ? s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) : null);
  const fondo = lista(cab('fondo'));
  const pov = cab('pov');
  const ALIAS = {infografía: 'infografia', 'infografia-viva': 'infografia', receta: 'leccion', 'mis-clips': 'leccion', truco: 'hikma', hikmah: 'hikma', error: 'hikma'};
  const nombre = (cab('formato') || (fondo ? 'pov' : 'receta')).toLowerCase().split(/\s/)[0];
  const formato = ALIAS[nombre] || nombre;
  const idioma = /^es/i.test(cab('idioma') || '') ? 'es' : 'darija';
  const ingredientes = (cab('ingredientes') || '').split(';').map((x) => x.trim()).filter(Boolean);
  const centrado = formato === 'hikma' || formato === 'pov';
  const ambiente = lista(cab('ambiente')) || ['baking', 'dough', 'flour', 'oven', 'pastry'];

  const lineas = [];
  let n = 0;
  for (let l of filas) {
    if (!l || l.startsWith('#')) continue;
    let busqueda = '';
    const m = l.match(/^\[([^\]]+)\]\s*(.*)$/);
    if (m) {
      const b0 = m[1].trim();
      const b = /^mio\b/i.test(b0) ? 'mio' + b0.slice(3) : b0.toLowerCase(); // el nombre del vídeo propio conserva mayúsculas
      // en hikma/pov solo [texto] es especial; cualquier otra [..] inicial es una etiqueta de voz
      if (!centrado || b === 'texto') {
        busqueda = b;
        l = m[2];
      }
    }
    if ((formato === 'cocina' || formato === 'infografia') && !busqueda) busqueda = 'sigue';
    if (formato === 'leccion') {
      if (!busqueda) busqueda = ambiente[n++ % ambiente.length];
      if (busqueda === '=' && !lineas.length) busqueda = ambiente[n++ % ambiente.length];
    }
    let [darija, es = ''] = l.split('|').map((x) => x.trim());
    // En español (o si falta la traducción) el subtítulo es la misma frase, sin etiquetas de voz
    if (!es) es = darija.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
    // Etiquetas de emoción (eleven_v4): van a ElevenLabs pero no a pantalla ni a las palabras.
    const tts = darija.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
    const words = tts
      .replace(/\[[^\]]*\]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({w, key: false}));
    lineas.push({busqueda, texto: words.map((w) => w.w).join(' '), tts, words, es});
  }
  if (!lineas.length) throw new Error('guion.txt está vacío');
  lineas.formato = formato;
  lineas.nombre = nombre;
  lineas.idioma = idioma;
  lineas.ingredientes = ingredientes;
  lineas.mesa = lista(cab('mesa'));
  // infografía: # imagen: archivo.jpg  y  # zona nombre: x y ancho alto (en % de la imagen)
  lineas.imagen = cab('imagen');
  lineas.zonas = {};
  for (const f of filas) {
    const m = f.match(/^#\s*zona\s+([\w-]+)\s*:\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
    if (m) lineas.zonas[m[1].toLowerCase()] = {x: +m[2], y: +m[3], w: +m[4], h: +m[5]};
  }
  // dónde está la receta completa (pisa a config.json) · "# aviso: no" lo quita en este vídeo
  lineas.recetaEn = (cab('receta-en') || '').toLowerCase() || null;
  lineas.aviso = !/^no/i.test(cab('aviso') || '');
  lineas.fondo = formato === 'pov' ? fondo : null;
  lineas.pov = pov;
  lineas.color = cab('color');
  lineas.elemento = (cab('elemento') || '').toLowerCase() || null;
  lineas.mundo = (cab('mundo') || '').toLowerCase() || null;
  return lineas;
}

export const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function config() {
  return JSON.parse(fs.readFileSync(path.join(raiz, 'config.json'), 'utf8'));
}

export function clave() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const env = path.join(raiz, '.env');
  if (fs.existsSync(env)) {
    for (const l of fs.readFileSync(env, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\s]+)"?/);
      if (m) return m[1];
    }
  }
  return null;
}
