// Render del vídeo.
//   node motor/scripts/render.mjs videos/<slug>            → out/video.mp4 + out/portada.jpg
//   node motor/scripts/render.mjs videos/<slug> --hoja     → out/hoja.jpg (un fotograma por frase, para revisar)
//   node motor/scripts/render.mjs videos/<slug> --still 4.2 → out/still.png (un instante, en segundos)
//   node motor/scripts/render.mjs videos/<slug> --portada   → solo out/portada.jpg
// Antes: voz.mjs (voz y tiempos) y stock.mjs (clips).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {leerGuion, config, raiz} from './guion.mjs';

const dir = path.resolve(process.argv[2] || '');
const args = process.argv.slice(3);
if (!process.argv[2] || !fs.existsSync(path.join(dir, 'guion.txt'))) {
  console.log('Uso: node motor/scripts/render.mjs videos/<slug> [--hoja|--still S|--portada]');
  process.exit(1);
}
const FPS = 30;
const motor = path.join(raiz, 'motor');
const pub = path.join(motor, 'public');
const slug = path.basename(dir);
const out = path.join(dir, 'out');
fs.mkdirSync(out, {recursive: true});
const cfg = config();
const lineas = leerGuion(dir);
const fallo = (m) => {
  console.log(`FALLO · ${m}`);
  process.exit(1);
};
const wf = path.join(dir, 'words.json');
if (!fs.existsSync(wf)) fallo('falta words.json: ejecuta antes voz.mjs');
const palabras = JSON.parse(fs.readFileSync(wf, 'utf8'));
const total = lineas.reduce((a, l) => a + l.words.length, 0);
if (palabras.length !== total) fallo(`el texto en darija cambió (${total} palabras, words.json tiene ${palabras.length}): vuelve a ejecutar voz.mjs`);
const cj = path.join(dir, 'clips.json');
const cjson = fs.existsSync(cj) ? JSON.parse(fs.readFileSync(cj, 'utf8')) : {};
const modo = lineas.formato;
const pov = modo === 'pov';

const finVoz = palabras[palabras.length - 1].e;
const duracion = finVoz + 0.3 + 2.4; // voz + respiro + cierre
const durF = Math.ceil(duracion * FPS);
const tiempos = lineas.map((_, i) => {
  const ws = palabras.filter((w) => w.l === i);
  return {ini: ws[0].s, fin: ws[ws.length - 1].e};
});
const desde = (i) => (i === 0 ? 0 : Math.round(tiempos[i].ini * FPS) - 4);
const hasta = (i) => (i === lineas.length - 1 ? durF : desde(i + 1) + 8);

// Prepara un clip: vertical 1080×1920, 30 fps, sin audio, de la duración pedida (en bucle si hace falta)
const cdir = path.join(pub, 'clips', slug);
fs.mkdirSync(cdir, {recursive: true});
// archivo: nombre dentro de clips/ (Mixkit) o ruta absoluta (vídeo propio). ini: segundo de inicio.
const preparar = (archivo, seg, nombre, ini = 0) => {
  const dst = path.join(cdir, `${nombre}.mp4`);
  const meta = `${dst}.txt`;
  const src = path.isAbsolute(archivo) ? archivo : path.join(dir, 'clips', archivo);
  const firma = `${src}|${fs.statSync(src).size}|${seg}|${ini}`;
  if (!fs.existsSync(dst) || !fs.existsSync(meta) || fs.readFileSync(meta, 'utf8') !== firma) {
    execFileSync('ffmpeg', [
      '-v', 'error', '-y', '-stream_loop', '-1', ...(ini > 0 ? ['-ss', String(ini)] : []), '-i', src, '-t', seg,
      '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1',
      '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', dst,
    ]);
    fs.writeFileSync(meta, firma);
  }
  return `clips/${slug}/${nombre}.mp4`;
};

const clips = cjson.lineas || [];
const md = path.join(dir, 'mis-clips');
const misClips = fs.existsSync(md) ? fs.readdirSync(md).filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f)).sort() : [];
let usadosMios = 0;
function plano(li, a, b) {
  const l = lineas[li];
  const seg = ((b - a) / FPS + 0.4).toFixed(2);
  const nom = String(li).padStart(2, '0');
  if (l.busqueda === 'texto') return {texto: l.es.replace(/\*/g, ''), arabe: /[\u0600-\u06FF]/.test(l.texto) ? l.texto : null, clip: null, a, b};
  if (l.busqueda === 'ingredientes') {
    if (!lineas.ingredientes.length) fallo('falta la cabecera "# ingredientes: …; …" para la tarjeta [ingredientes]');
    return {texto: '', ingredientes: lineas.ingredientes, clip: null, a, b};
  }
  if (l.busqueda.startsWith('mio')) {
    // vídeo propio: [mio] = el siguiente por orden; [mio nombre.mp4 12] = ese, desde el segundo 12
    const [, nombreMio, desdeSeg] = l.busqueda.split(/\s+/);
    let f = nombreMio;
    if (!f) {
      f = misClips[usadosMios++];
      if (!f) fallo(`línea ${li + 1}: no quedan vídeos en mis-clips/ (hay ${misClips.length})`);
    } else if (!misClips.includes(f)) fallo(`línea ${li + 1}: no existe mis-clips/${f}`);
    return {texto: '', a, b, clip: preparar(path.join(dir, 'mis-clips', f), seg, nom, parseFloat(desdeSeg) || 0)};
  }
  const c = clips[li]?.clip;
  if (!c || clips[li].busqueda !== l.busqueda) fallo(`línea ${li + 1} sin clip: ejecuta stock.mjs`);
  return {texto: l.texto, a, b, clip: preparar(c.archivo, seg, nom)};
}

let planos;
if (modo === 'hikma') {
  planos = [];
} else if (modo === 'historia' && lineas.mundo) {
  planos = []; // mundo 3D continuo: la cámara va al plano de cada línea
} else if (modo === 'historia') {
  // un dibujo por línea; el momento clave cae al 40 % de la frase
  planos = lineas.map((l, i) => {
    const a = desde(i), b = hasta(i);
    if (l.busqueda === 'texto') return {texto: l.texto, a, b};
    const [escena, ...opts] = (l.busqueda || 'luna').split(/\s+/);
    const k = Math.round((tiempos[i].ini + 0.4 * (tiempos[i].fin - tiempos[i].ini)) * FPS) - a;
    return {texto: '', escena, opts, k, a, b};
  });
} else if (pov) {
  // Formato POV: 1–2 clips de fondo que cubren todo el vídeo
  const fondos = (cjson.fondo || []).filter((f) => f?.clip);
  if (!fondos.length || fondos.length < Math.min(2, lineas.fondo.length)) fallo('faltan clips de fondo: ejecuta stock.mjs');
  const n = fondos.length;
  planos = fondos.map((f, k) => {
    const a = Math.round((k * durF) / n);
    const b = k === n - 1 ? durF : Math.round(((k + 1) * durF) / n) + 12;
    return {texto: '', a, b, clip: preparar(f.clip.archivo, ((b - a) / FPS + 0.4).toFixed(2), `fondo-${k}`)};
  });
} else if (modo === 'cocina') {
  // Mundo dibujado de la cocina: la cámara viaja por él. Encima solo van sus vídeos [mio] y las tarjetas [texto].
  planos = [];
  lineas.forEach((l, i) => {
    if (l.busqueda === 'texto' || l.busqueda.startsWith('mio')) {
      let j = i;
      while (j + 1 < lineas.length && lineas[j + 1].busqueda === '=') j++;
      planos.push({li: i, ...plano(i, desde(i), hasta(j))});
    }
  });
} else {
  // Formato clips: uno por línea; [=] alarga el plano anterior
  const planosLineas = [];
  lineas.forEach((l, i) => {
    if (l.busqueda === '=' && planosLineas.length) planosLineas[planosLineas.length - 1].hasta = i;
    else planosLineas.push({desde: i, hasta: i});
  });
  planos = planosLineas.map(({desde: li, hasta: lf}) => {
    const a = desde(li), b = hasta(lf);
    return {li, ...plano(li, a, b)};
  });
}
const lineasProps = lineas.map((l, i) => ({
  es: l.es,
  ini: tiempos[i].ini,
  fin: tiempos[i].fin,
  arabe: (pov || modo === 'hikma' || (modo === 'historia' && lineas.mundo)) && l.busqueda === 'texto' ? l.texto : null,
}));

if (finVoz > 90) console.log(`AVISO · la voz dura ${finVoz.toFixed(0)} s: el máximo es 1:30 (y cuanto más corto, mejor). Recorta o parte la receta en dos vídeos`);
const donde = (lineas.recetaEn || cfg.receta_en || 'descripcion').startsWith('com') ? 'en el primer comentario' : 'en la descripción';
const aviso = lineas.aviso ? `Receta completa ${donde}` : null;
const props = {audio: null, modo, idioma: lineas.idioma, aviso, firma: cfg.firma, cierre: cfg.cierre, finVoz, duracion, lineas: lineasProps, planos, pov: pov || modo === 'hikma' ? lineas.pov || '' : null, color: lineas.color, elemento: lineas.elemento};
if (modo === 'cocina') {
  // ingrediente escrito de muchas formas → pieza dibujada (igual que piezaDe en src/cocina/estado.ts)
  const piezaDe = (txt) => {
    const t = txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const reglas = [[/huevo/, 'huevos'], [/harina|maicena/, 'harina'], [/cacao/, 'cacao'], [/chocolate/, 'chocolate'], [/azucar/, 'azucar'], [/yogur/, 'yogur'], [/aceite/, 'aceite'], [/leche|nata/, 'leche'], [/levadura|polvo de hornear|royal|gasificante/, 'levadura'], [/mantequilla|margarina/, 'mantequilla'], [/limon|naranja/, 'limon']];
    for (const [re, k] of reglas) if (re.test(t)) return k;
    return null;
  };
  const VERBOS = ['general', 'mesa', 'ingredientes', 'ver', 'echar', 'batir', 'mezclar', 'verter', 'hornear', 'esperar', 'sacar', 'corte', 'cortar', 'decorar', 'mio', 'texto', 'sigue', '='];
  const acciones = lineas.map((l, i) => {
    const toks = (l.busqueda || 'sigue').split(/\s+/);
    let verbo = toks[0], obj = null, opts = toks.slice(1);
    if (verbo === '=') verbo = 'sigue';
    if (!VERBOS.includes(verbo)) {
      const k = piezaDe(verbo);
      if (!k) fallo(`línea ${i + 1}: no conozco la acción [${l.busqueda}] (mira guias/cocina.md)`);
      verbo = 'echar';
      obj = k;
    } else if (['echar', 'ver'].includes(verbo)) {
      obj = piezaDe(opts.join(' ')) || null;
      if (!obj) fallo(`línea ${i + 1}: [${l.busqueda}] necesita un ingrediente que exista (huevos, harina, azucar, yogur, aceite, leche, levadura, mantequilla, chocolate, cacao, limon)`);
      opts = [];
    } else if (verbo === 'decorar') obj = opts[0] || 'azucar';
    return {verbo, obj, opts, ini: tiempos[i].ini, fin: tiempos[i].fin, li: i};
  });
  const mesa = [];
  const pon = (k) => k && !mesa.includes(k) && mesa.push(k);
  (lineas.mesa || []).forEach((x) => pon(piezaDe(x)));
  lineas.ingredientes.forEach((x) => pon(piezaDe(x)));
  acciones.forEach((a) => a.verbo === 'echar' && pon(a.obj));
  if (mesa.length > 8) console.log(`AVISO · ${mesa.length} piezas en la mesa y solo caben 8: las últimas se solapan`);
  props.cocina = {acciones, ingredientes: lineas.ingredientes, mesa, fin: finVoz};
}
if (modo === 'historia' && lineas.mundo) {
  props.mundo = lineas.mundo;
  let previo = 'general';
  props.tramos = lineas.map((l, i) => {
    const pl = (l.busqueda || 'general').split(/\s+/)[0];
    if (pl !== 'texto') previo = pl; // en el refrán/aleya la cámara sigue donde estaba
    return {plano: previo, t: i === 0 ? 0 : Math.max(0, tiempos[i].ini - 0.2)};
  });
}
// 3D: WebGL por software si no hay GPU (REMOTION_GL=angle | swangle | swiftshader)
const chromiumOptions = {gl: process.env.REMOTION_GL || 'angle'};
// En la nube se usa el Chromium ya instalado (REMOTION_BROWSER lo pone setup.sh)
const browserExecutable = process.env.REMOTION_BROWSER || null;
const audio = path.join(dir, 'audio.mp3');
if (fs.existsSync(audio)) {
  fs.mkdirSync(path.join(pub, 'audio'), {recursive: true});
  fs.copyFileSync(audio, path.join(pub, 'audio', `${slug}.mp3`));
  props.audio = `audio/${slug}.mp3`;
} else {
  console.log('AVISO · sin audio.mp3: vídeo mudo con tiempos estimados');
}

const serveUrl = await bundle({entryPoint: path.join(motor, 'src', 'index.ts'), publicDir: pub});
const composition = await selectComposition({serveUrl, id: 'Video', inputProps: props, chromiumOptions, browserExecutable});

const still = async (frame, output, extra = {}, scale = 1) =>
  renderStill({
    chromiumOptions,
    browserExecutable,
    composition: {...composition, props: {...composition.props, ...extra}},
    serveUrl,
    frame: Math.min(composition.durationInFrames - 1, Math.max(0, Math.round(frame))),
    output,
    inputProps: {...props, ...extra},
    scale,
    imageFormat: output.endsWith('.png') ? 'png' : 'jpeg',
    ...(output.endsWith('.png') ? {} : {jpegQuality: 90}),
  });
const portada = () => still(Math.min(desde(1) - 2, FPS * 1.2), path.join(out, 'portada.jpg'), {portada: true});

if (args.includes('--hoja')) {
  const hd = path.join(out, 'hoja');
  fs.mkdirSync(hd, {recursive: true});
  for (const f of fs.readdirSync(hd)) fs.unlinkSync(path.join(hd, f));
  const frames = lineas.map((_, i) => (tiempos[i].ini + tiempos[i].fin) / 2 * FPS);
  frames.push(composition.durationInFrames - 10);
  for (let i = 0; i < frames.length; i++) await still(frames[i], path.join(hd, `h_${String(i).padStart(2, '0')}.jpg`), {}, 0.3);
  const cols = 4, rows = Math.ceil(frames.length / cols);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(hd, 'h_%02d.jpg'), '-vf', `tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', path.join(out, 'hoja.jpg')]);
  console.log(`OK · hoja con ${frames.length} fotogramas → ${path.join(out, 'hoja.jpg')}`);
} else if (args.includes('--tira')) {
  // --tira 3.2,3.6,4.0 → out/tira.jpg con esos instantes (segundos) en fila, para revisar un movimiento
  const ts = args[args.indexOf('--tira') + 1].split(',').map(Number);
  const hd = path.join(out, 'tira');
  fs.mkdirSync(hd, {recursive: true});
  for (const f of fs.readdirSync(hd)) fs.unlinkSync(path.join(hd, f));
  for (let i = 0; i < ts.length; i++) await still(ts[i] * FPS, path.join(hd, `t_${String(i).padStart(2, '0')}.jpg`), {}, 0.3);
  const cols = Math.min(6, ts.length), rows = Math.ceil(ts.length / cols);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(hd, 't_%02d.jpg'), '-vf', `tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', path.join(out, 'tira.jpg')]);
  console.log(`OK · tira con ${ts.length} fotogramas → ${path.join(out, 'tira.jpg')}`);
} else if (args.includes('--portada')) {
  await portada();
  console.log(`OK · ${path.join(out, 'portada.jpg')}`);
} else if (args.includes('--rango')) {
  // render parcial para máquinas lentas: --rango 0-299 → out/parte-0000.mp4 (luego se unen con ffmpeg concat)
  const [a, b] = args[args.indexOf('--rango') + 1].split('-').map(Number);
  const fin = Math.min(b, composition.durationInFrames - 1);
  await renderMedia({chromiumOptions, browserExecutable, concurrency: 1, composition, serveUrl, codec: 'h264', crf: 18, audioCodec: 'aac', frameRange: [a, fin], outputLocation: path.join(out, `parte-${String(a).padStart(4, '0')}.mp4`), inputProps: props});
  console.log(`OK · fotogramas ${a}-${fin} de ${composition.durationInFrames}`);
} else if (args.includes('--still')) {
  const s = parseFloat(args[args.indexOf('--still') + 1]);
  await still(s * FPS, path.join(out, 'still.png'));
  console.log(`OK · ${path.join(out, 'still.png')}`);
} else {
  let ult = -1;
  await renderMedia({
    chromiumOptions,
    browserExecutable,
    composition,
    serveUrl,
    codec: 'h264',
    crf: 18,
    audioCodec: 'aac',
    outputLocation: path.join(out, 'video.mp4'),
    inputProps: props,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 10);
      if (p !== ult) {
        ult = p;
        process.stdout.write(`${p * 10}% `);
      }
    },
  });
  await portada();
  console.log(`\nOK · ${(composition.durationInFrames / FPS).toFixed(1)} s → ${path.join(out, 'video.mp4')} + portada.jpg`);
}
