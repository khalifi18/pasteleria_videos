// Formato infografía viva: la cámara recorre la infografía de la receta (su propia imagen) como un mapa.
// Cada línea del guion apunta a una zona (# zona base: x y ancho alto, en % de la imagen); la cámara vuela allí,
// se acerca lo justo para que se lea y el resto queda en penumbra. Nunca se queda quieta.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type Zona = {x: number; y: number; w: number; h: number}; // en píxeles de la imagen original
export type Tramo = {zona: Zona | null; ini: number}; // null = la infografía entera
export type DatosInfografia = {src: string; iw: number; ih: number; tramos: Tramo[]; fin: number};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const io = (t: number) => {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Zona útil de la pantalla: arriba van los subtítulos (hasta ~400 px) y abajo el aviso de la receta
const ARRIBA = 400, ABAJO = 1880;
type Cam = {x: number; y: number; z: number};

/** A dónde mira la cámara para una zona: la encuadra entera con margen, sin pasar del zoom máximo */
const encuadra = (d: DatosInfografia, zona: Zona | null): Cam => {
  const zTodo = Math.min(1080 / d.iw, 1920 / d.ih);
  if (!zona) return {x: d.iw / 2, y: d.ih / 2, z: zTodo};
  const alto = ABAJO - ARRIBA;
  // máximo ~2,6 px de pantalla por px de imagen: más se vería borroso
  const z = Math.min(2.6, (1080 - 90) / zona.w, (alto - 90) / zona.h);
  const cy = zona.y + zona.h / 2 - ((ARRIBA + ABAJO) / 2 - 960) / z; // el centro de la zona cae en el hueco útil
  return {x: zona.x + zona.w / 2, y: cy, z: Math.max(z, zTodo)};
};

const limita = (d: DatosInfografia, c: Cam): Cam => {
  const hx = 540 / c.z, hy = 960 / c.z;
  return {
    z: c.z,
    x: hx * 2 >= d.iw ? d.iw / 2 : clamp(c.x, hx, d.iw - hx),
    y: hy * 2 >= d.ih ? d.ih / 2 : clamp(c.y, hy - (ARRIBA - 120) / c.z, d.ih - hy + 60 / c.z),
  };
};

const camara = (d: DatosInfografia, t: number): Cam => {
  const T = d.tramos;
  const objs = T.map((tr) => limita(d, encuadra(d, tr.zona)));
  let i = 0;
  for (let k = 0; k < T.length; k++) if (t >= T[k].ini - 0.35) i = k;
  const destino = objs[i];
  const origen = i === 0 ? {x: destino.x, y: destino.y + 60 / destino.z, z: destino.z * 0.9} : objs[i - 1];
  const dist = Math.hypot((destino.x - origen.x) * 1.0, destino.y - origen.y);
  const dur = clamp(0.7 + dist / 900, 0.8, 1.4);
  const t0 = i === 0 ? 0 : T[i].ini - 0.35;
  const e = io((t - t0) / dur);
  // vuelo de mapa: en los viajes largos se aleja un poco a mitad de camino
  const lz = lerp(Math.log(origen.z), Math.log(destino.z), e) - 0.45 * Math.sin(Math.PI * e) * clamp(dist / 700);
  let c: Cam = {x: lerp(origen.x, destino.x, e), y: lerp(origen.y, destino.y, e), z: Math.exp(lz)};
  // deriva lenta mientras se habla (acercamiento y paneo alterno): nunca quieta, nunca va y vuelve
  const llega = t0 + dur;
  const hasta = i + 1 < T.length ? T[i + 1].ini - 0.35 : d.fin + 2.5;
  const h = 1 - Math.pow(1 - clamp((t - llega) / Math.max(0.5, hasta - llega)), 2);
  const lado = i % 2 ? -1 : 1;
  c = {x: c.x + (lado * 14 * h) / c.z, y: c.y - (8 * h) / c.z, z: c.z * (1 + 0.05 * h)};
  return limita(d, c);
};

export const ViajeInfografia: React.FC<{d: DatosInfografia}> = ({d}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const c = camara(d, t);
  // foco: la zona actual (en pantalla) brilla y el resto se oscurece; se funde al cambiar de zona
  let i = 0;
  for (let k = 0; k < d.tramos.length; k++) if (t >= d.tramos[k].ini - 0.35) i = k;
  const zona = d.tramos[i].zona;
  const desde = i === 0 ? 0 : d.tramos[i].ini - 0.35;
  const foco = zona ? io((t - desde - 0.5) / 0.5) : 0;
  const s = zona && {x: (zona.x - c.x) * c.z + 540, y: (zona.y - c.y) * c.z + 960, w: zona.w * c.z, h: zona.h * c.z};
  const pad = 22;
  return (
    <AbsoluteFill style={{backgroundColor: '#1c120c', overflow: 'hidden'}}>
      {/* fondo: la misma imagen, ampliada y desenfocada, para que no haya bordes vacíos */}
      <Img src={staticFile(d.src)} style={{position: 'absolute', inset: -80, width: 1240, height: 2080, objectFit: 'cover', filter: 'blur(40px) brightness(0.45) saturate(1.1)'}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: d.iw, height: d.ih, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile(d.src)} style={{width: d.iw, height: d.ih, display: 'block'}} />
      </div>
      {s && foco > 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="ig-difumina" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <mask id="ig-foco">
              <rect width={1080} height={1920} fill="#fff" />
              <rect x={s.x - pad} y={s.y - pad} width={s.w + pad * 2} height={s.h + pad * 2} rx={28} fill="#000" filter="url(#ig-difumina)" />
            </mask>
          </defs>
          <rect width={1080} height={1920} fill="#120a06" opacity={0.55 * foco} mask="url(#ig-foco)" />
          <rect x={s.x - pad} y={s.y - pad} width={s.w + pad * 2} height={s.h + pad * 2} rx={28} fill="none" stroke="#f2c165" strokeWidth={4} opacity={0.85 * foco} />
        </svg>
      )}
      {/* sombra arriba para que el subtítulo se lea */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 520, background: 'linear-gradient(180deg, rgba(18,10,6,0.72) 0%, rgba(18,10,6,0) 100%)'}} />
    </AbsoluteFill>
  );
};
