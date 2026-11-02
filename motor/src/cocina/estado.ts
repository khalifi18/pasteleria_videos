// Formato cocina: lógica del mundo (sin dibujo).
// Un único mundo: pared con el horno arriba y la encimera vista desde arriba abajo.
// Cada línea del guion es una acción ([batir], [echar harina], [hornear 180]…) y la cámara viaja a donde pasa.

export const MW = 2160; // ancho del mundo
export const MH = 4300; // alto del mundo
export const PARED = 1500; // la pared (con el horno) ocupa y < PARED
export const HORNO = {x: 600, y: 420, w: 960, h: 900}; // cuerpo del horno
export const BOL = {x: 1080, y: 2560, r: 300};
export const MOLDE = {x: 1080, y: 3660, r: 245};

// Huecos de la encimera alrededor del bol (en orden de uso)
export const HUECOS = [
  {x: 420, y: 1960}, {x: 1740, y: 1960},
  {x: 380, y: 2560}, {x: 1780, y: 2560},
  {x: 420, y: 3160}, {x: 1740, y: 3160},
  {x: 400, y: 3780}, {x: 1760, y: 3780},
];

export type Tipo = 'huevo' | 'polvo' | 'liquido' | 'solido';
export type Ingr = {color: string; peso: number; tipo: Tipo; r: number};
/** Ingredientes que existen como pieza: color al mezclar, cuánto llenan el bol, cómo se echan, tamaño */
export const INGR: Record<string, Ingr> = {
  huevos: {color: '#f6c34a', peso: 0.12, tipo: 'huevo', r: 150},
  azucar: {color: '#fbf6ec', peso: 0.2, tipo: 'polvo', r: 125},
  harina: {color: '#f2e8d6', peso: 0.32, tipo: 'polvo', r: 160},
  yogur: {color: '#fbf8f1', peso: 0.16, tipo: 'liquido', r: 95},
  aceite: {color: '#e3bf4e', peso: 0.1, tipo: 'liquido', r: 190},
  leche: {color: '#fffdf8', peso: 0.16, tipo: 'liquido', r: 105},
  levadura: {color: '#efe7d6', peso: 0.03, tipo: 'polvo', r: 110},
  mantequilla: {color: '#f6d873', peso: 0.13, tipo: 'solido', r: 130},
  chocolate: {color: '#4e2a1a', peso: 0.16, tipo: 'liquido', r: 130},
  cacao: {color: '#6b3d27', peso: 0.1, tipo: 'polvo', r: 100},
  limon: {color: '#f2dc6a', peso: 0.02, tipo: 'solido', r: 120},
};

/** Qué pieza corresponde a cada texto de ingrediente ("3 medidas de harina" → harina) */
export const piezaDe = (txt: string): string | null => {
  const s = txt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const reglas: [RegExp, string][] = [
    [/huevo/, 'huevos'], [/harina|maicena/, 'harina'], [/cacao/, 'cacao'], [/chocolate/, 'chocolate'],
    [/azucar/, 'azucar'], [/yogur/, 'yogur'], [/aceite/, 'aceite'], [/leche|nata/, 'leche'],
    [/levadura|polvo de hornear|royal|gasificante/, 'levadura'], [/mantequilla|margarina/, 'mantequilla'],
    [/limon|naranja/, 'limon'],
  ];
  for (const [re, k] of reglas) if (re.test(s)) return k;
  return null;
};

/** Número que va delante del ingrediente ("3 huevos" → 3) */
export const cantidad = (txt: string, def = 3) => {
  const m = txt.match(/\d+/);
  return m ? Math.max(1, Math.min(6, parseInt(m[0], 10))) : def;
};

export type Accion = {verbo: string; obj: string | null; opts: string[]; ini: number; fin: number; li: number};
export type Etiqueta = {texto: string; x: number; y: number; desde: number; hasta: number; dy?: number};
export type DatosCocina = {
  acciones: Accion[];
  ingredientes: string[]; // textos de "# ingredientes:"
  mesa: string[]; // piezas sobre la encimera, en orden de hueco
  fin: number; // segundo en que acaba la voz
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const suave = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
export const io = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const salida = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

/** Progreso 0→1 de una acción: empieza cuando la cámara ya está llegando, dura al menos 1,4 s */
export const avance = (a: Accion, t: number) => clamp((t - (a.ini + 0.3)) / Math.max(1.4, a.fin - a.ini - 0.1));

export const hueco = (d: DatosCocina, k: string) => {
  const i = d.mesa.indexOf(k);
  return HUECOS[i >= 0 ? i % HUECOS.length : 0];
};
export const textoDe = (d: DatosCocina, k: string) => d.ingredientes.find((x) => piezaDe(x) === k) || null;

// ---------- Colores ----------
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const aHex = (v: number[]) => '#' + v.map((x) => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0')).join('');
export const mezclaColor = (cs: {c: string; w: number}[], def = '#f3e2b8') => {
  const tot = cs.reduce((a, x) => a + x.w, 0);
  if (tot <= 0) return def;
  const acc = [0, 0, 0];
  cs.forEach(({c, w}) => hex(c).forEach((v, i) => (acc[i] += v * w)));
  return aHex(acc.map((v) => v / tot));
};
export const aclara = (c: string, k: number) => aHex(hex(c).map((v) => v + (255 - v) * k));
export const oscurece = (c: string, k: number) => aHex(hex(c).map((v) => v * (1 - k)));

// ---------- Estado del bol, la encimera y el molde en el instante t ----------
export type Estado = {
  mezcla: {c: string; w: number}[]; // lo ya mezclado
  sueltos: {k: string; w: number}[]; // echado pero sin mezclar (yemas, montón de harina…)
  total: number; // cuánto hay en el bol
  aire: number; // 0…1 batido (aclara y da brillo)
  usados: Record<string, number>; // 0…1 cuánto se ha gastado cada pieza (los huevos desaparecen del plato)
  molde: number; // 0…1 lleno de masa
  enHorno: boolean;
  subida: number; // 0…1 cuánto ha subido en el horno
  hornoEncendido: number; // 0…1
  fuera: number; // 0…1 el bizcocho ya está en el plato
  corte: number; // 0…1
  decoracion: {tipo: string; p: number} | null;
};

export const estado = (d: DatosCocina, t: number): Estado => {
  const e: Estado = {mezcla: [], sueltos: [], total: 0, aire: 0, usados: {}, molde: 0, enHorno: false, subida: 0, hornoEncendido: 0, fuera: 0, corte: 0, decoracion: null};
  let totalHorno = 0; // tiempo previsto en el horno (hornear + esperar)
  for (const a of d.acciones) if (a.verbo === 'hornear' || a.verbo === 'esperar') totalHorno += Math.max(1.4, a.fin - a.ini);
  let enHornoHecho = 0;
  for (const a of d.acciones) {
    if (t < a.ini) break;
    const p = avance(a, t);
    if (a.verbo === 'echar' && a.obj && INGR[a.obj]) {
      const ing = INGR[a.obj];
      const n = a.obj === 'huevos' ? cantidad(textoDe(d, 'huevos') || '', 3) : 1;
      const caido = a.obj === 'huevos' ? clamp((p - 0.15) / 0.8) : clamp((p - 0.25) / 0.5);
      const w = ing.peso * n * caido;
      e.usados[a.obj] = Math.max(e.usados[a.obj] || 0, caido);
      // los líquidos se mezclan solos un poco; el resto queda suelto hasta batir
      if (ing.tipo === 'liquido' && e.total > 0.05) {
        e.mezcla.push({c: ing.color, w: w * 0.5});
        e.sueltos.push({k: a.obj, w: w * 0.5});
      } else e.sueltos.push({k: a.obj, w});
      e.total += w;
    } else if (a.verbo === 'batir' || a.verbo === 'mezclar') {
      const m = suave(clamp(p / 0.85));
      e.sueltos = e.sueltos.map((s) => {
        e.mezcla.push({c: INGR[s.k]?.color || '#f3e2b8', w: s.w * m});
        return {k: s.k, w: s.w * (1 - m)};
      });
      if (a.verbo === 'batir') e.aire = Math.max(e.aire, m);
    } else if (a.verbo === 'verter') {
      const v = clamp((p - 0.2) / 0.65);
      e.molde = Math.max(e.molde, v);
      e.total *= 1 - 0.88 * v;
      e.sueltos = e.sueltos.map((s) => ({k: s.k, w: s.w * (1 - 0.88 * v)}));
    } else if (a.verbo === 'hornear' || a.verbo === 'esperar') {
      if (e.molde === 0) e.molde = 1; // si el guion no tiene [verter], el molde ya está lleno
      e.enHorno = p > 0.02 || a.verbo === 'esperar';
      e.hornoEncendido = Math.max(e.hornoEncendido, salida(p * 3));
      const dur = Math.max(1.4, a.fin - a.ini);
      e.subida = clamp((enHornoHecho + clamp(t - a.ini - 0.3, 0, dur)) / Math.max(1, totalHorno));
      enHornoHecho += dur;
    } else if (a.verbo === 'sacar') {
      if (e.molde === 0) e.molde = 1;
      e.subida = 1;
      e.fuera = salida(clamp(p / 0.6));
      e.enHorno = e.fuera < 0.5;
      e.hornoEncendido = 1 - e.fuera;
    } else if (a.verbo === 'corte' || a.verbo === 'cortar') {
      if (e.fuera < 1) {
        e.fuera = 1;
        e.subida = 1;
        e.molde = 1;
        e.enHorno = false;
        e.hornoEncendido = 0;
      }
      e.corte = Math.max(e.corte, io(p));
    } else if (a.verbo === 'decorar') {
      if (e.fuera < 1) {
        e.fuera = 1;
        e.subida = 1;
        e.molde = 1;
        e.enHorno = false;
        e.hornoEncendido = 0;
      }
      e.decoracion = {tipo: a.obj || 'azucar', p: clamp(p / 0.9)};
    }
  }
  return e;
};

/** Color de la masa ahora mismo (lo mezclado, aclarado por el batido) */
export const colorMasa = (e: Estado) => aclara(mezclaColor(e.mezcla, '#f3dc9a'), 0.12 * e.aire);

// ---------- Cámara ----------
export type Cam = {x: number; y: number; z: number};

export const objetivo = (d: DatosCocina, a: Accion): Cam => {
  const hacia = (k: string | null, f: number, z: number): Cam => {
    const h = k ? hueco(d, k) : BOL;
    return {x: BOL.x + (h.x - BOL.x) * f, y: BOL.y + (h.y - BOL.y) * f, z};
  };
  switch (a.verbo) {
    case 'general':
      return {x: MW / 2, y: MH / 2, z: 0.47};
    case 'mesa':
    case 'ingredientes':
      return {x: MW / 2, y: 2880, z: 0.6};
    case 'ver':
      return a.obj ? {...hueco(d, a.obj), z: 1.45} : {x: BOL.x, y: BOL.y, z: 1};
    case 'echar':
      return hacia(a.obj, 0.32, 1.02);
    case 'batir':
    case 'mezclar':
      return {x: BOL.x, y: BOL.y + 20, z: 1.5};
    case 'verter':
      return {x: MW / 2, y: (BOL.y + MOLDE.y) / 2, z: 0.82};
    case 'hornear':
      return {x: MW / 2, y: HORNO.y + HORNO.h / 2, z: 1.05};
    case 'esperar':
      return {x: MW / 2, y: HORNO.y + 330, z: 1.45};
    case 'sacar':
      return {x: MOLDE.x, y: MOLDE.y - 40, z: 1.25};
    case 'corte':
    case 'cortar':
      return {x: MOLDE.x + 60, y: MOLDE.y + 40, z: 1.65};
    case 'decorar':
      return {x: MOLDE.x, y: MOLDE.y, z: 1.45};
    default:
      return {x: MW / 2, y: 2880, z: 0.6};
  }
};

const limita = (c: Cam): Cam => {
  const hx = 540 / c.z, hy = 960 / c.z;
  return {
    z: c.z,
    x: hx * 2 >= MW ? MW / 2 : clamp(c.x, hx, MW - hx),
    y: hy * 2 >= MH ? MH / 2 : clamp(c.y, hy, MH - hy),
  };
};

/**
 * Cámara en el instante t: viaja al objetivo de cada línea como un "vuelo" de mapa
 * (se aleja un poco a mitad de un viaje largo), llega con suavidad y nunca se queda quieta
 * (deriva lenta mientras se habla). Nunca va y vuelve.
 */
export const camara = (d: DatosCocina, t: number): Cam => {
  const acc = d.acciones;
  const objs = acc.map((a, i) => {
    // [mio] y [texto] no mueven la cámara: se queda donde estaba
    let j = i;
    while (j > 0 && ['mio', 'texto', 'sigue'].includes(acc[j].verbo)) j--;
    return limita(objetivo(d, acc[j]));
  });
  let i = 0;
  for (let k = 0; k < acc.length; k++) if (t >= acc[k].ini - 0.35) i = k;
  const destino = objs[i];
  const origen = i === 0 ? limita({x: destino.x, y: destino.y + 120, z: destino.z * 0.88}) : objs[i - 1];
  const dist = Math.hypot(destino.x - origen.x, destino.y - origen.y);
  const durViaje = clamp(0.75 + dist / 2600, 0.8, 1.5);
  const t0 = i === 0 ? 0 : acc[i].ini - 0.35;
  const e = io((t - t0) / durViaje);
  const lz = lerp(Math.log(origen.z), Math.log(destino.z), e) - 0.55 * Math.sin(Math.PI * e) * clamp(dist / 1800);
  let c: Cam = {x: lerp(origen.x, destino.x, e), y: lerp(origen.y, destino.y, e), z: Math.exp(lz)};
  // deriva mientras se habla: acercamiento muy lento y un paneo lateral alterno
  const llegada = t0 + durViaje;
  const hasta = i + 1 < acc.length ? acc[i + 1].ini - 0.35 : d.fin + 2.5;
  const h = clamp((t - llegada) / Math.max(0.5, hasta - llegada));
  const ease = 1 - Math.pow(1 - h, 2);
  const lado = i % 2 === 0 ? 1 : -1;
  c = {x: c.x + lado * 26 * ease / c.z, y: c.y - 14 * ease / c.z, z: c.z * (1 + 0.045 * ease)};
  return limita(c);
};

export const aPantalla = (c: Cam, x: number, y: number) => ({x: (x - c.x) * c.z + 540, y: (y - c.y) * c.z + 960});

// ---------- Etiquetas: aparecen pegadas al objeto cuando la voz lo nombra ----------
export const etiquetas = (d: DatosCocina): Etiqueta[] => {
  const out: Etiqueta[] = [];
  d.acciones.forEach((a) => {
    const fin = a.fin + 0.2;
    if (a.verbo === 'mesa' || a.verbo === 'ingredientes') {
      const ks = d.mesa.filter((k) => textoDe(d, k));
      const paso = Math.min(0.55, Math.max(0.25, (a.fin - a.ini - 0.6) / Math.max(1, ks.length)));
      ks.forEach((k, i) => {
        const h = hueco(d, k);
        out.push({texto: textoDe(d, k)!, x: h.x, y: h.y, desde: a.ini + 0.5 + i * paso, hasta: fin, dy: -(INGR[k].r + 30)});
      });
    } else if ((a.verbo === 'echar' || a.verbo === 'ver') && a.obj && textoDe(d, a.obj)) {
      const h = hueco(d, a.obj);
      out.push({texto: textoDe(d, a.obj)!, x: h.x, y: h.y, desde: a.ini + 0.25, hasta: a.verbo === 'echar' ? a.ini + 1.6 : fin, dy: -(INGR[a.obj].r + 30)});
    } else if (a.verbo === 'hornear') {
      const temp = a.opts.find((o) => /^\d+$/.test(o));
      if (temp) out.push({texto: `${temp} °C`, x: MW / 2, y: HORNO.y + 90, desde: a.ini + 0.7, hasta: fin, dy: -40});
    } else if (a.verbo === 'esperar') {
      const min = a.opts.find((o) => /^\d+$/.test(o));
      if (min) out.push({texto: `${min} min`, x: MW / 2 + 260, y: HORNO.y + 90, desde: a.ini + 0.6, hasta: fin, dy: -40});
    }
  });
  return out;
};
