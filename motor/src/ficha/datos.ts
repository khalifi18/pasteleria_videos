// Ficha: infografía de la receta generada con código (nítida a cualquier zoom) que la cámara recorre.
// Este archivo: los datos, la maqueta (dónde cae cada bloque) y la cámara.

export type Grupo = {nombre: string; items: string[]};
export type Paso = {n: number; titulo: string; texto: string; escena: string[]};
// capas: tarta de bizcochos (base = bizcocho, relleno = frosting) · encima: rosetones o migas · goteo de la cobertura
export type Tarta = {base: string; relleno: string; cobertura: string; decor: string; galleta: boolean; capas?: number; encima?: 'rosetones' | 'migas'; goteo?: boolean};
export type DatosFicha = {
  titulo: [string, string]; // "La tarta de" · "Lotus"
  lema: string;
  datos: string[]; // "Sin horno", "8–10 porciones"…
  grupos: Grupo[];
  pasos: Paso[];
  tarta?: Tarta;
  tartaNombre?: string;
  foto?: string | null; // foto real del dulce (portada y final), si la hay
  t3d?: {portada: string; portadaFin: string; cerca: string; cercaIni: string; cercaFin: string; frames: number} | null; // tarta 3D girando (clips y fotogramas fijos)
  aviso?: string | null;
  tramos: {zona: string; ini: number; fin: number}[]; // a qué bloque va la cámara en cada línea
  fin: number;
};

/** Paletas por tipo de tarta: color de la base, el relleno, la cobertura y la decoración */
export const TARTAS: Record<string, Tarta> = {
  lotus: {base: '#8a4f22', relleno: '#ead2ae', cobertura: '#b8692f', decor: '#a65a27', galleta: true},
  limon: {base: '#a8723f', relleno: '#f8f0d8', cobertura: '#f4d43c', decor: '#fffaf0', galleta: false},
  chocolate: {base: '#3e2214', relleno: '#7a4a30', cobertura: '#3a1e12', decor: '#5c3320', galleta: false},
  fresa: {base: '#a8723f', relleno: '#f7d6dc', cobertura: '#d8344c', decor: '#fff6f6', galleta: false},
  'red-velvet': {base: '#9e1b2c', relleno: '#fbf6ee', cobertura: '#fbf6ee', decor: '#b3202f', galleta: false, capas: 3, encima: 'migas', goteo: false},
  vainilla: {base: '#d9a65e', relleno: '#fbf0d6', cobertura: '#fff8ea', decor: '#e8c47c', galleta: false},
};

/** Color por nombre en los pasos ([batir crema], [verter caramelo]…) o #hex */
export const COLORES: Record<string, string> = {
  galleta: '#a0612c', migas: '#a0612c', lotus: '#b8692f', caramelo: '#b8692f', crema: '#efe0c4', nata: '#fdfaf3',
  blanco: '#fbf8f1', masa: '#f3dc9a', chocolate: '#4e2a1a', cacao: '#6b3d27', limon: '#f2d33a', fresa: '#e0566b',
  frambuesa: '#c8243f', rojo: '#b3202f', queso: '#f6f0e2', mantequilla: '#f6d873', leche: '#fffdf8', vainilla: '#f6e7c1',
};
export const tartaDe = (d: Pick<DatosFicha, 'tarta' | 'tartaNombre'>): Tarta => d.tarta ?? TARTAS[d.tartaNombre ?? 'vainilla'] ?? TARTAS.vainilla;
export const color = (s: string | undefined, def = '#efe0c4') => (!s ? def : s.startsWith('#') ? s : COLORES[s.toLowerCase()] ?? def);

// ---------------- Maqueta ----------------
export const FW = 1600; // ancho del mundo
export type Caja = {x: number; y: number; w: number; h: number};
export type Maqueta = {
  portada: Caja;
  cabIngr: Caja;
  ingr: Caja[]; // una por grupo
  todosIngr: Caja;
  cabPasos: Caja;
  pasos: Caja[];
  porcion: Caja;
  alto: number;
};

export const FILA_INGR = 104;
export const altoGrupo = (g: Grupo) => 150 + g.items.length * FILA_INGR;
export const ALTO_PASO = 760;

export const maqueta = (d: Pick<DatosFicha, 'grupos' | 'pasos'>): Maqueta => {
  const portada = {x: 0, y: 0, w: FW, h: 1380};
  let y = portada.h + 40;
  const cabIngr = {x: 0, y, w: FW, h: 130};
  y += cabIngr.h + 30;
  // tarjetas de ingredientes en dos columnas, se colocan en la columna más baja
  const col = [y, y];
  const W2 = 700, X = [70, 830];
  const ingr = d.grupos.map((g) => {
    const c = col[0] <= col[1] ? 0 : 1;
    const caja = {x: X[c], y: col[c], w: W2, h: altoGrupo(g)};
    col[c] += caja.h + 50;
    return caja;
  });
  y = Math.max(...col) + 20;
  const todosIngr = {x: 40, y: cabIngr.y, w: FW - 80, h: y - cabIngr.y};
  const cabPasos = {x: 0, y, w: FW, h: 130};
  y += cabPasos.h + 30;
  // pasos en zigzag: izquierda, derecha, izquierda… (la cámara viaja en diagonal)
  const pasos = d.pasos.map((_, i) => {
    const caja = {x: X[i % 2], y: y + Math.floor(i / 2) * (ALTO_PASO + 60) + (i % 2 ? 140 : 0), w: W2, h: ALTO_PASO};
    return caja;
  });
  if (pasos.length) y = Math.max(...pasos.map((p) => p.y + p.h)) + 80;
  const porcion = {x: 150, y, w: FW - 300, h: 1100};
  y += porcion.h;
  return {portada, cabIngr, ingr, todosIngr, cabPasos, pasos, porcion, alto: y};
};

export const zonaCaja = (m: Maqueta, d: DatosFicha, zona: string): Caja => {
  const z = zona.toLowerCase();
  if (z === 'portada' || z === 'todo') return m.portada;
  if (z === 'porcion' || z === 'final') return m.porcion;
  if (z === 'ingredientes') return m.todosIngr;
  if (z.startsWith('ingredientes ')) {
    const i = d.grupos.findIndex((g) => g.nombre.toLowerCase() === z.slice(13).trim());
    return m.ingr[Math.max(0, i)];
  }
  if (z === 'pasos') return {x: 0, y: m.cabPasos.y, w: FW, h: m.porcion.y - m.cabPasos.y};
  const p = z.match(/^paso\s*(\d+)/);
  if (p) return m.pasos[Math.max(0, Math.min(m.pasos.length - 1, parseInt(p[1], 10) - 1))];
  return m.portada;
};

// ---------------- Cámara ----------------
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const io = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const ARRIBA = 380, ABAJO = 1880; // arriba van los subtítulos
type Cam = {x: number; y: number; z: number};

const encuadra = (c: Caja): Cam => {
  const z = Math.min(1.7, (1080 - 70) / c.w, (ABAJO - ARRIBA - 70) / c.h);
  return {x: c.x + c.w / 2, y: c.y + c.h / 2 - ((ARRIBA + ABAJO) / 2 - 960) / z, z};
};

/** Vuelo de mapa entre bloques; mientras se habla, deriva lenta. Nunca quieta, nunca va y vuelve. */
export const camara = (d: DatosFicha, m: Maqueta, t: number): Cam => {
  const T = d.tramos;
  const objs = T.map((tr) => encuadra(zonaCaja(m, d, tr.zona)));
  let i = 0;
  for (let k = 0; k < T.length; k++) if (t >= T[k].ini - 0.35) i = k;
  const destino = objs[i];
  const origen = i === 0 ? {x: destino.x, y: destino.y + 80 / destino.z, z: destino.z * 0.9} : objs[i - 1];
  const dist = Math.hypot(destino.x - origen.x, destino.y - origen.y);
  const dur = clamp(0.75 + dist / 2400, 0.8, 1.5);
  const t0 = i === 0 ? 0 : T[i].ini - 0.35;
  const e = io((t - t0) / dur);
  const lz = lerp(Math.log(origen.z), Math.log(destino.z), e) - 0.5 * Math.sin(Math.PI * e) * clamp(dist / 1600);
  let c = {x: lerp(origen.x, destino.x, e), y: lerp(origen.y, destino.y, e), z: Math.exp(lz)};
  const llega = t0 + dur;
  const hasta = i + 1 < T.length ? T[i + 1].ini - 0.35 : d.fin + 2.5;
  const h = 1 - Math.pow(1 - clamp((t - llega) / Math.max(0.5, hasta - llega)), 2);
  const lado = i % 2 ? -1 : 1;
  c = {x: c.x + (lado * 18 * h) / c.z, y: c.y - (10 * h) / c.z, z: c.z * (1 + 0.05 * h)};
  return c;
};

/** Cuándo empieza y acaba la primera visita de la cámara a una zona (para animar lo que hay dentro) */
export const visita = (d: DatosFicha, zona: string) => {
  const ts = d.tramos.filter((tr) => tr.zona.toLowerCase() === zona.toLowerCase());
  if (!ts.length) return null;
  return {ini: ts[0].ini, fin: ts[ts.length - 1].fin};
};
