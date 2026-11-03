// Formato cocina: piezas dibujadas. Todo en coordenadas del mundo (ver estado.ts).
// Estilo: ilustración cálida con luz de ventana desde arriba a la izquierda, sombras suaves y detalle (vetas, brillos, migas).
import React from 'react';
import {rnd} from '../dibujos/base';
import {HORNO, MH, MW, PARED, MOLDE, Estado, INGR, aclara, oscurece, clamp, lerp, salida, suave} from './estado';

/** Degradados y filtros comunes (una sola vez, dentro del <svg> del mundo) */
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="c-sombra">
      <stop offset="0" stopColor="#2a1408" stopOpacity={0.45} />
      <stop offset="0.6" stopColor="#2a1408" stopOpacity={0.18} />
      <stop offset="1" stopColor="#2a1408" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="c-madera" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0" stopColor="#d2a06d" />
      <stop offset="0.5" stopColor="#c08c58" />
      <stop offset="1" stopColor="#a8723f" />
    </linearGradient>
    <linearGradient id="c-canto" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e2b585" />
      <stop offset="0.18" stopColor="#a8723f" />
      <stop offset="1" stopColor="#6e4423" />
    </linearGradient>
    <linearGradient id="c-luz" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0" stopColor="#fff6dd" stopOpacity={0.34} />
      <stop offset="1" stopColor="#fff6dd" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="c-azulejo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e6dccb" />
      <stop offset="1" stopColor="#f5eee2" />
    </linearGradient>
    <linearGradient id="c-acero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#eef0f2" />
      <stop offset="0.45" stopColor="#c7cbd0" />
      <stop offset="1" stopColor="#9aa0a7" />
    </linearGradient>
    <linearGradient id="c-acero-v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f4f5f7" />
      <stop offset="0.5" stopColor="#c3c8ce" />
      <stop offset="1" stopColor="#8e949b" />
    </linearGradient>
    <radialGradient id="c-ceramica" cx="0.42" cy="0.38" r="0.62">
      <stop offset="0" stopColor="#fffdf8" />
      <stop offset="0.8" stopColor="#f1e9db" />
      <stop offset="1" stopColor="#d9ccb7" />
    </radialGradient>
    <radialGradient id="c-interior" cx="0.6" cy="0.64" r="0.62">
      <stop offset="0" stopColor="#e9eff1" />
      <stop offset="0.65" stopColor="#d2dde1" />
      <stop offset="1" stopColor="#a7b7be" />
    </radialGradient>
    <radialGradient id="c-metal-molde" cx="0.42" cy="0.4" r="0.65">
      <stop offset="0" stopColor="#bfc3c8" />
      <stop offset="0.85" stopColor="#8c9198" />
      <stop offset="1" stopColor="#5f646b" />
    </radialGradient>
    <radialGradient id="c-huevo" cx="0.38" cy="0.32" r="0.75">
      <stop offset="0" stopColor="#fff4e2" />
      <stop offset="0.65" stopColor="#ecd2ad" />
      <stop offset="1" stopColor="#c9a57a" />
    </radialGradient>
    <radialGradient id="c-yema" cx="0.38" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#ffd56b" />
      <stop offset="0.7" stopColor="#f4a62a" />
      <stop offset="1" stopColor="#de8a17" />
    </radialGradient>
    <radialGradient id="c-corteza" cx="0.45" cy="0.42" r="0.6">
      <stop offset="0" stopColor="#ecb469" />
      <stop offset="0.65" stopColor="#d08c45" />
      <stop offset="1" stopColor="#9a5a28" />
    </radialGradient>
    <radialGradient id="c-calor" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stopColor="#ffb15a" stopOpacity={0.85} />
      <stop offset="0.6" stopColor="#e5702a" stopOpacity={0.45} />
      <stop offset="1" stopColor="#5a2010" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="c-vidrio" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity={0.2} />
      <stop offset="0.4" stopColor="#ffffff" stopOpacity={0.04} />
      <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="c-kraft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#d9b98a" />
      <stop offset="1" stopColor="#b58f5e" />
    </linearGradient>
    <filter id="c-brillo" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

export const Sombra: React.FC<{rx: number; ry?: number; dx?: number; dy?: number; o?: number}> = ({rx, ry, dx = 26, dy = 34, o = 1}) => (
  <ellipse cx={dx} cy={dy} rx={rx} ry={ry ?? rx * 0.92} fill="url(#c-sombra)" opacity={o} />
);

// ---------------- Pared y horno ----------------
export const Pared: React.FC = () => {
  const filas = Math.ceil(PARED / 74);
  return (
    <g>
      <rect x={0} y={0} width={MW} height={PARED} fill="url(#c-azulejo)" />
      {Array.from({length: filas}).map((_, r) => (
        <g key={r}>
          <line x1={0} y1={r * 74} x2={MW} y2={r * 74} stroke="#cbbda7" strokeWidth={4} />
          {Array.from({length: 16}).map((__, c) => {
            const x = c * 148 + (r % 2 ? 74 : 0);
            return <line key={c} x1={x} y1={r * 74} x2={x} y2={r * 74 + 74} stroke="#cbbda7" strokeWidth={4} />;
          })}
          {/* brillo de cada fila de azulejos */}
          <rect x={0} y={r * 74 + 6} width={MW} height={10} fill="#fff" opacity={0.18} />
        </g>
      ))}
      {/* barra con utensilios colgados (izquierda) */}
      <g>
        <rect x={110} y={250} width={400} height={16} rx={8} fill="url(#c-acero-v)" />
        {[170, 290, 410].map((x, i) => (
          <g key={x}>
            <path d={`M${x},258 C${x - 14},282 ${x + 14},298 ${x},318`} stroke="#8e949b" strokeWidth={6} fill="none" />
            {i === 0 && (
              <g transform={`translate(${x} 318)`}>
                <rect x={-11} y={0} width={22} height={170} rx={11} fill="#8a5a3a" />
                <ellipse cx={0} cy={250} rx={52} ry={82} fill="none" stroke="#c9cdd2" strokeWidth={6} />
                <ellipse cx={0} cy={250} rx={28} ry={82} fill="none" stroke="#c9cdd2" strokeWidth={6} />
              </g>
            )}
            {i === 1 && (
              <g transform={`translate(${x} 318)`}>
                <rect x={-10} y={0} width={20} height={230} rx={10} fill="#a8723f" />
                <ellipse cx={0} cy={262} rx={44} ry={56} fill="#b98450" />
                <ellipse cx={-10} cy={250} rx={16} ry={26} fill="#d7a874" opacity={0.6} />
              </g>
            )}
            {i === 2 && (
              <g transform={`translate(${x} 318)`}>
                <rect x={-9} y={0} width={18} height={200} rx={9} fill="#d65f4a" />
                <path d="M-40,200 L40,200 L34,300 C20,320 -20,320 -34,300 Z" fill="#e8806a" />
              </g>
            )}
          </g>
        ))}
      </g>
      {/* planta colgando (derecha) */}
      <g transform="translate(1860 230)">
        <path d="M0,0 L0,90" stroke="#8a6a4a" strokeWidth={4} />
        <path d="M-80,90 L80,90 L62,190 L-62,190 Z" fill="#c8623e" />
        <rect x={-86} y={84} width={172} height={22} rx={8} fill="#a84e30" />
        {Array.from({length: 9}).map((_, i) => {
          const a = -0.9 + i * 0.22;
          const largo = 120 + rnd(i + 3) * 260;
          return (
            <g key={i}>
              <path d={`M${Math.sin(a) * 50},190 C${Math.sin(a) * 90},${190 + largo * 0.4} ${Math.sin(a) * 60},${190 + largo * 0.8} ${Math.sin(a) * 70},${190 + largo}`} stroke="#3f6b3a" strokeWidth={5} fill="none" />
              {Array.from({length: 4}).map((__, j) => (
                <ellipse key={j} cx={Math.sin(a) * 75 + (j % 2 ? 22 : -22)} cy={210 + (largo / 4) * j} rx={26} ry={16} fill={j % 2 ? '#5f9a57' : '#4f8a48'} transform={`rotate(${j % 2 ? 30 : -30} ${Math.sin(a) * 75 + (j % 2 ? 22 : -22)} ${210 + (largo / 4) * j})`} />
              ))}
            </g>
          );
        })}
      </g>
      {/* sombra de la pared sobre el canto de la encimera */}
      <rect x={0} y={PARED - 60} width={MW} height={60} fill="#3a2414" opacity={0.12} />
    </g>
  );
};

const fmtTiempo = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const Horno: React.FC<{e: Estado; frame: number; pantalla: string; colorMasa: string}> = ({e, frame, pantalla, colorMasa}) => {
  const {x, y, w, h} = HORNO;
  const on = e.hornoEncendido;
  const parpadeo = 0.92 + 0.08 * Math.sin(frame * 0.35) * Math.sin(frame * 0.13);
  const vx = x + 90, vy = y + 260, vw = w - 180, vh = h - 360;
  const cx = x + w / 2;
  const base = vy + vh - 120; // bandeja
  const sube = suave(e.subida);
  const colorArriba = sube < 0.35 ? colorMasa : sube < 0.8 ? '#e2a65e' : '#cf8a46';
  return (
    <g>
      <Sombra rx={560} ry={70} dx={x + w / 2 + 20} dy={y + h + 40} o={0.8} />
      <rect x={x} y={y} width={w} height={h} rx={34} fill="url(#c-acero)" />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={30} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={4} />
      {/* panel */}
      <rect x={x + 24} y={y + 24} width={w - 48} height={140} rx={20} fill="#26282c" />
      {[x + 110, x + 230, x + w - 230, x + w - 110].map((kx, i) => (
        <g key={i} transform={`translate(${kx} ${y + 94})`}>
          <circle r={44} fill="url(#c-acero)" />
          <circle r={34} fill="#d9dce0" />
          <rect x={-5} y={-34} width={10} height={26} rx={4} fill="#3a3d42" transform={`rotate(${i === 0 ? lerp(-120, 40, on) : i === 1 ? lerp(-120, 10, on) : -120 + i * 30})`} />
        </g>
      ))}
      <rect x={cx - 170} y={y + 50} width={340} height={88} rx={12} fill="#0d0e10" />
      <text x={cx} y={y + 118} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={64} fill={on > 0.05 ? '#ffb347' : '#5a5f66'} opacity={on > 0.05 ? 0.6 + 0.4 * on : 1} letterSpacing={4}>
        {pantalla}
      </text>
      {/* puerta */}
      <rect x={x + 24} y={y + 190} width={w - 48} height={h - 214} rx={24} fill="url(#c-acero-v)" opacity={0.9} />
      <rect x={x + 110} y={y + 205} width={w - 220} height={34} rx={17} fill="url(#c-acero)" />
      <rect x={x + 110} y={y + 236} width={w - 220} height={12} rx={6} fill="#000" opacity={0.15} />
      {/* ventana */}
      <rect x={vx} y={vy} width={vw} height={vh} rx={26} fill="#16100d" />
      <rect x={vx} y={vy} width={vw} height={vh} rx={26} fill="url(#c-calor)" opacity={on * parpadeo} />
      {/* resistencias */}
      <path d={Array.from({length: 9}).map((_, i) => `${i ? 'L' : 'M'}${vx + 50 + i * ((vw - 100) / 8)},${vy + 40 + (i % 2) * 16}`).join(' ')} stroke={on > 0.05 ? '#ff7a2a' : '#4a3a32'} strokeWidth={8} fill="none" filter={on > 0.3 ? 'url(#c-brillo)' : undefined} opacity={0.5 + 0.5 * on} />
      {/* rejilla */}
      {[0, 1].map((r) => (
        <line key={r} x1={vx + 30} y1={base + 8 + r * 10} x2={vx + vw - 30} y2={base + 8 + r * 10} stroke="#6a6e74" strokeWidth={5} opacity={0.8} />
      ))}
      {/* el bizcocho dentro, visto de lado */}
      {e.enHorno && (
        <g opacity={salida(clamp(e.subida * 8 + 0.3))}>
          <path d={`M${cx - 200},${base - 100} L${cx + 200},${base - 100} L${cx + 186},${base} L${cx - 186},${base} Z`} fill="#7c8188" />
          <path d={`M${cx - 200},${base - 100} L${cx + 200},${base - 100}`} stroke="#c3c8ce" strokeWidth={8} />
          <path d={`M${cx - 192},${base - 98} C${cx - 140},${base - 110 - 120 * sube} ${cx + 140},${base - 110 - 120 * sube} ${cx + 192},${base - 98} Z`} fill={colorArriba} />
          <path d={`M${cx - 120},${base - 110 - 70 * sube} C${cx - 40},${base - 128 - 84 * sube} ${cx + 40},${base - 124 - 84 * sube} ${cx + 110},${base - 108 - 70 * sube}`} stroke="#fff" strokeOpacity={0.25} strokeWidth={8} fill="none" strokeLinecap="round" />
          {sube > 0.6 && <path d={`M${cx - 60},${base - 112 - 100 * sube} C${cx - 20},${base - 96 - 100 * sube} ${cx + 20},${base - 120 - 100 * sube} ${cx + 70},${base - 108 - 100 * sube}`} stroke="#8a4f22" strokeWidth={6} fill="none" opacity={(sube - 0.6) * 2.5} />}
        </g>
      )}
      <rect x={vx} y={vy} width={vw} height={vh} rx={26} fill="url(#c-vidrio)" />
      <path d={`M${vx + 40},${vy + vh - 40} L${vx + 260},${vy + 40} L${vx + 330},${vy + 40} L${vx + 110},${vy + vh - 40} Z`} fill="#fff" opacity={0.06} />
      <rect x={vx} y={vy} width={vw} height={vh} rx={26} fill="none" stroke="#2b2d31" strokeWidth={10} />
    </g>
  );
};

// ---------------- Encimera ----------------
export const Encimera: React.FC = () => {
  const y0 = PARED;
  return (
    <g>
      <rect x={0} y={y0} width={MW} height={MH - y0} fill="url(#c-madera)" />
      {/* vetas: líneas onduladas a lo largo de cada tablón */}
      {Array.from({length: 4}).map((_, t) => (
        <g key={t}>
          {Array.from({length: 26}).map((__, i) => {
            const x = t * 540 + 12 + rnd(t * 40 + i) * 516;
            const amp = 6 + rnd(i * 7 + t) * 18;
            const fase = rnd(i + t * 13) * 600;
            const pts = Array.from({length: 12}).map((___, k) => {
              const yy = y0 + 90 + k * ((MH - y0) / 11);
              return `${k ? 'L' : 'M'}${(x + Math.sin((yy + fase) / 260) * amp).toFixed(1)},${yy.toFixed(0)}`;
            });
            return <path key={i} d={pts.join(' ')} stroke={i % 3 ? '#8a5a30' : '#e0b282'} strokeOpacity={i % 3 ? 0.1 + rnd(i + 9) * 0.1 : 0.18} strokeWidth={2 + rnd(i * 3 + t) * 4} fill="none" />;
          })}
          {/* nudo */}
          <g transform={`translate(${t * 540 + 120 + rnd(t + 50) * 300} ${y0 + 500 + rnd(t + 70) * 2000})`}>
            {[34, 24, 14].map((r, j) => (
              <ellipse key={j} rx={r * 1.0} ry={r * 2.2} fill="none" stroke="#7a4a24" strokeOpacity={0.25 - j * 0.05} strokeWidth={3} />
            ))}
          </g>
          {t > 0 && (
            <>
              <line x1={t * 540} y1={y0} x2={t * 540} y2={MH} stroke="#5a3418" strokeOpacity={0.45} strokeWidth={5} />
              <line x1={t * 540 + 5} y1={y0} x2={t * 540 + 5} y2={MH} stroke="#f0c493" strokeOpacity={0.3} strokeWidth={3} />
            </>
          )}
        </g>
      ))}
      {/* canto delantero de la encimera (junto a la pared) */}
      <rect x={0} y={y0} width={MW} height={80} fill="url(#c-canto)" />
      <rect x={0} y={y0 + 80} width={MW} height={40} fill="#2a1408" opacity={0.18} />
      {/* luz de ventana en diagonal */}
      <path d={`M0,${y0} L${MW * 0.7},${y0} L${MW * 0.15},${MH} L0,${MH} Z`} fill="url(#c-luz)" />
      <path d={`M${MW * 0.78},${y0} L${MW * 0.92},${y0} L${MW * 0.42},${MH} L${MW * 0.26},${MH} Z`} fill="#fff6dd" opacity={0.07} />
      {/* harina esparcida */}
      {Array.from({length: 70}).map((_, i) => {
        const a = rnd(i * 5 + 1) * Math.PI * 2;
        const d = 380 + rnd(i * 5 + 2) * 260;
        return <circle key={i} cx={1080 + Math.cos(a) * d * 1.1} cy={2560 + Math.sin(a) * d * 0.8} r={2 + rnd(i * 5 + 3) * 6} fill="#fffaf0" opacity={0.25 + rnd(i * 5 + 4) * 0.35} />;
      })}
      {/* paño de cocina */}
      <g transform="translate(1710 4140) rotate(-12)">
        <Sombra rx={300} ry={150} dx={14} dy={20} o={0.7} />
        <rect x={-270} y={-130} width={540} height={260} rx={10} fill="#f1e7d6" />
        {[-200, -150, 150, 200].map((sx) => (
          <rect key={sx} x={sx} y={-130} width={18} height={260} fill="#c8473c" opacity={0.85} />
        ))}
        <rect x={-270} y={-20} width={540} height={10} fill="#c8473c" opacity={0.5} />
        <path d="M-270,60 C-120,40 60,90 270,50" stroke="#d8ccb6" strokeWidth={10} fill="none" opacity={0.7} />
        {Array.from({length: 26}).map((_, i) => (
          <line key={i} x1={-262 + i * 21} y1={130} x2={-266 + i * 21} y2={156} stroke="#e6dac4" strokeWidth={5} />
        ))}
      </g>
    </g>
  );
};

// ---------------- Ingredientes (vistos desde arriba, sobre la encimera) ----------------
/** n = huevos que quedan en el plato · lleno = 0…1 lo que queda en el recipiente */
export const Ingrediente: React.FC<{k: string; n?: number; lleno?: number; inclina?: number}> = ({k, n = 3, lleno = 1, inclina = 0}) => {
  switch (k) {
    case 'huevos':
      return (
        <g>
          <Sombra rx={160} />
          <circle r={150} fill="url(#c-ceramica)" />
          <circle r={118} fill="none" stroke="#2f5f8f" strokeWidth={5} opacity={0.6} />
          <circle r={108} fill="#f5efe4" />
          {Array.from({length: n}).map((_, i) => {
            const a = (i / Math.max(1, n)) * Math.PI * 2 - 0.6;
            const r = n === 1 ? 0 : 52;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r}) rotate(${a * 57 + 20})`}>
                <ellipse cx={8} cy={10} rx={46} ry={58} fill="#3a2010" opacity={0.18} />
                <ellipse rx={44} ry={56} fill="url(#c-huevo)" />
                <ellipse cx={-14} cy={-20} rx={12} ry={18} fill="#fff" opacity={0.55} />
              </g>
            );
          })}
        </g>
      );
    case 'harina':
    case 'levadura':
      if (k === 'levadura')
        return (
          <g transform="rotate(-14)">
            <Sombra rx={110} ry={130} />
            <path d={`M-80,-110 ${Array.from({length: 9}).map((_, i) => `L${-80 + i * 20},${-110 + (i % 2 ? -10 : 0)}`).join(' ')} L80,-110 L80,110 L-80,110 Z`} fill="#f4f0e6" />
            <rect x={-80} y={-60} width={160} height={70} fill="#c8473c" />
            <text x={0} y={-14} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={30} fill="#fff">
              LEVADURA
            </text>
            <circle cx={0} cy={60} r={26} fill="none" stroke="#c8473c" strokeWidth={6} />
            <rect x={-80} y={-110} width={160} height={220} fill="none" stroke="#d9d0bf" strokeWidth={3} />
          </g>
        );
      return (
        <g transform={`rotate(${-8 + inclina * 30})`}>
          <Sombra rx={170} ry={190} />
          <rect x={-140} y={-170} width={280} height={340} rx={14} fill="url(#c-kraft)" />
          <path d="M-140,-60 L140,-60" stroke="#9c7748" strokeWidth={4} opacity={0.5} />
          {/* boca doblada con la harina dentro */}
          <rect x={-128} y={-160} width={256} height={120} rx={10} fill="#a6814f" />
          <rect x={-114} y={-150} width={228} height={100} rx={8} fill="#f7f1e4" opacity={clamp(lleno * 1.2)} />
          {Array.from({length: 26}).map((_, i) => (
            <circle key={i} cx={-100 + rnd(i * 3) * 200} cy={-140 + rnd(i * 3 + 1) * 80} r={3 + rnd(i * 3 + 2) * 5} fill="#fff" opacity={0.7 * lleno} />
          ))}
          <rect x={-120} y={0} width={240} height={110} rx={8} fill="#f4ecdb" />
          <text x={0} y={60} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={50} fill="#6e4423">
            Harina
          </text>
          <path d="M-70,80 L70,80" stroke="#c8473c" strokeWidth={4} />
        </g>
      );
    case 'azucar':
    case 'cacao':
      return (
        <g>
          <Sombra rx={k === 'cacao' ? 100 : 130} />
          <circle r={k === 'cacao' ? 98 : 125} fill={k === 'cacao' ? 'url(#c-ceramica)' : '#e7eef0'} opacity={k === 'cacao' ? 1 : 0.9} />
          <circle r={k === 'cacao' ? 80 : 108} fill={k === 'cacao' ? '#5c3320' : '#fbfaf6'} opacity={0.35 + 0.65 * lleno} />
          {Array.from({length: k === 'cacao' ? 18 : 40}).map((_, i) => {
            const a = rnd(i * 2) * Math.PI * 2;
            const d = Math.sqrt(rnd(i * 2 + 1)) * (k === 'cacao' ? 70 : 95);
            return k === 'cacao' ? (
              <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={4 + rnd(i + 5) * 5} fill="#7a4a30" opacity={0.6 * lleno} />
            ) : (
              <rect key={i} x={Math.cos(a) * d} y={Math.sin(a) * d} width={7} height={7} fill="#fff" stroke="#d8e4ea" strokeWidth={1.5} transform={`rotate(${i * 37} ${Math.cos(a) * d} ${Math.sin(a) * d})`} opacity={lleno} />
            );
          })}
          {k === 'azucar' && (
            <>
              <circle r={125} fill="none" stroke="#fff" strokeWidth={8} opacity={0.7} />
              <path d="M-80,-80 A115,115 0 0 1 20,-112" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
              {/* cuchara de madera */}
              <g transform="rotate(40)">
                <rect x={60} y={-12} width={190} height={24} rx={12} fill="#b98450" />
                <ellipse cx={30} cy={0} rx={52} ry={36} fill="#c99662" />
                <ellipse cx={30} cy={0} rx={38} ry={24} fill="#fbfaf6" />
              </g>
            </>
          )}
        </g>
      );
    case 'yogur':
      return (
        <g transform={`rotate(${inclina * 25})`}>
          <Sombra rx={98} />
          <circle r={95} fill="#f7f4ee" />
          <circle r={95} fill="none" stroke="#5b8fc2" strokeWidth={12} />
          <circle r={80} fill="#fffdf9" opacity={0.3 + 0.7 * lleno} />
          <ellipse cx={-14} cy={-12} rx={40} ry={26} fill="#fff" opacity={0.6 * lleno} />
          {/* tapa de aluminio despegada */}
          <path d="M40,-82 C110,-120 150,-60 128,-6 C100,-30 70,-40 40,-82 Z" fill="#cfd6dc" />
          <path d="M50,-80 C100,-104 128,-64 120,-24" stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
        </g>
      );
    case 'aceite':
      return (
        <g transform={`rotate(${-18 + inclina * 40})`}>
          <Sombra rx={210} ry={70} dx={20} dy={30} />
          <path d="M-190,-62 L80,-62 C110,-62 120,-30 150,-26 L190,-26 L190,26 L150,26 C120,30 110,62 80,62 L-190,62 C-205,62 -210,50 -210,0 C-210,-50 -205,-62 -190,-62 Z" fill="#cfe0c8" opacity={0.55} />
          <path d={`M-196,${lerp(0, -52, lleno)} L80,${lerp(0, -52, lleno)} C100,-40 110,-26 120,-20 L120,20 C110,26 100,40 80,52 L-196,52 C-204,40 -204,${lerp(10, -40, lleno)} -196,${lerp(0, -52, lleno)} Z`} fill="#d7a52a" opacity={0.85} />
          <rect x={186} y={-22} width={40} height={44} rx={8} fill="#a8723f" />
          <path d="M-180,-40 L60,-40" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.45} />
          <rect x={-120} y={-44} width={140} height={88} rx={6} fill="#f4ecdb" opacity={0.9} />
          <text x={-50} y={10} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={32} fill="#3f6b3a">
            Aceite
          </text>
        </g>
      );
    case 'leche':
      return (
        <g transform={`rotate(${inclina * 25})`}>
          <Sombra rx={110} />
          <circle r={105} fill="#e9f0f2" opacity={0.85} />
          <circle r={90} fill="#fffefb" opacity={0.3 + 0.7 * lleno} />
          <path d="M70,-70 L120,-110 L112,-60 Z" fill="#e9f0f2" />
          <circle r={105} fill="none" stroke="#fff" strokeWidth={8} opacity={0.8} />
          <path d="M-70,-60 A95,95 0 0 1 10,-94" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'mantequilla':
      return (
        <g transform="rotate(10)">
          <Sombra rx={150} ry={110} />
          <path d="M-170,-100 L170,-120 L160,110 L-160,120 Z" fill="#f4f1ea" />
          <path d="M-170,-100 L-60,-40 M170,-120 L60,-40 M160,110 L60,40 M-160,120 L-60,40" stroke="#ddd6c7" strokeWidth={3} />
          <rect x={-110} y={-62} width={220} height={124} rx={10} fill="#f7dc80" opacity={0.5 + 0.5 * lleno} />
          <rect x={-110} y={-62} width={220} height={22} rx={8} fill="#fff1b8" opacity={0.7} />
          <line x1={40} y1={-62} x2={40} y2={62} stroke="#e0bf5a" strokeWidth={5} />
        </g>
      );
    case 'chocolate':
      return (
        <g transform="rotate(-12)">
          <Sombra rx={150} ry={110} />
          <path d="M-150,-100 L60,-100 L60,100 L-150,100 Z" fill="#c9cdd2" />
          <rect x={-60} y={-100} width={210} height={200} fill="#c8473c" />
          <text x={45} y={14} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={30} fill="#fff" transform="rotate(-90 45 0)">
            CHOCOLATE
          </text>
          {Array.from({length: 3}).map((_, r) =>
            Array.from({length: 3}).map((__, c) =>
              r === 0 && c === 0 && lleno < 0.99 ? null : (
                <g key={`${r}${c}`}>
                  <rect x={-146 + c * 66} y={-96 + r * 64} width={60} height={58} rx={4} fill="#4a2617" />
                  <rect x={-140 + c * 66} y={-90 + r * 64} width={48} height={46} rx={3} fill="#5c3220" />
                </g>
              ),
            ),
          )}
        </g>
      );
    case 'limon':
      return (
        <g>
          <Sombra rx={130} ry={110} />
          <g transform="translate(-40 10) rotate(-20)">
            <ellipse rx={78} ry={60} fill="#f2d33a" />
            <ellipse cx={-80} cy={0} rx={12} ry={9} fill="#e0b92a" />
            <ellipse cx={-18} cy={-24} rx={26} ry={12} fill="#fff6a8" opacity={0.6} />
            {Array.from({length: 14}).map((_, i) => (
              <circle key={i} cx={-55 + rnd(i) * 110} cy={-40 + rnd(i + 3) * 80} r={2} fill="#d9b42a" />
            ))}
            <path d="M70,-10 C110,-50 150,-40 160,-10 C130,-6 100,-4 70,-10 Z" fill="#4f8a48" />
          </g>
          <g transform="translate(70 40)">
            <circle r={62} fill="#f2d33a" />
            <circle r={54} fill="#fbf1b4" />
            {Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <path key={i} d={`M0,0 L${Math.cos(a) * 48},${Math.sin(a) * 48} A48,48 0 0 1 ${Math.cos(a + 0.7) * 48},${Math.sin(a + 0.7) * 48} Z`} fill="#f4e06a" opacity={0.9} />;
            })}
            <circle r={8} fill="#fbf1b4" />
          </g>
        </g>
      );
    default:
      return null;
  }
};

// ---------------- Bol con su contenido ----------------
export const Bol: React.FC<{e: Estado; color: string; frame: number; girando: number; nHuevos: number; huevosCaidos: number; dirs?: Record<string, number>}> = ({e, color, frame, girando, nHuevos, huevosCaidos, dirs = {}}) => {
  const R = 300;
  const rc = (R - 46) * (0.42 + 0.52 * clamp(e.total / 1.25));
  const hay = e.total > 0.008;
  const oc = oscurece(color, 0.1), cl = aclara(color, 0.35);
  const huevosSueltos = e.sueltos.filter((s) => s.k === 'huevos').reduce((a, s) => a + s.w, 0);
  const visHuevo = huevosCaidos > 0 ? clamp(huevosSueltos / (INGR.huevos.peso * huevosCaidos)) : 0;
  return (
    <g>
      <Sombra rx={350} ry={330} dx={34} dy={46} />
      <circle r={R} fill="url(#c-ceramica)" />
      {/* banda decorativa del borde */}
      <circle r={R - 16} fill="none" stroke="#2f5f8f" strokeWidth={10} opacity={0.75} />
      {Array.from({length: 28}).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return <rect key={i} x={Math.cos(a) * (R - 16) - 6} y={Math.sin(a) * (R - 16) - 6} width={12} height={12} fill="#f2c165" transform={`rotate(${a * 57 + 45} ${Math.cos(a) * (R - 16)} ${Math.sin(a) * (R - 16)})`} />;
      })}
      <circle r={R - 34} fill="url(#c-interior)" />
      <path d={`M${-(R - 40)},-10 A${R - 40},${R - 40} 0 0 1 -10,${-(R - 40)}`} stroke="#fff" strokeWidth={14} fill="none" opacity={0.55} strokeLinecap="round" />
      {hay && (
        <g transform="translate(10 12)">
          <defs>
            <radialGradient id="c-masa" cx="0.42" cy="0.4" r="0.6">
              <stop offset="0" stopColor={cl} />
              <stop offset="0.75" stopColor={color} />
              <stop offset="1" stopColor={oc} />
            </radialGradient>
          </defs>
          {e.mezcla.length > 0 && <circle r={rc} fill="url(#c-masa)" />}
          {e.mezcla.length === 0 && <circle r={rc} fill="#f8f1e2" opacity={0.0} />}
          {/* remolinos del batido: se ven mientras se bate y quedan suaves después */}
          {e.mezcla.length > 0 &&
            Array.from({length: 7}).map((_, i) => {
              const rr = rc * (0.18 + i * 0.11);
              const a0 = frame * 0.16 * girando + i * 0.9;
              const largo = 1.6 + (i % 3) * 0.5;
              return <path key={i} d={`M${Math.cos(a0) * rr},${Math.sin(a0) * rr} A${rr},${rr} 0 0 1 ${Math.cos(a0 + largo) * rr},${Math.sin(a0 + largo) * rr}`} stroke={i % 2 ? cl : oc} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.18 + 0.32 * girando + 0.1 * e.aire} />;
            })}
          {/* ingredientes aún sin mezclar: cada uno queda donde cayó, con su aspecto */}
          {e.sueltos.map((s, i) => {
            if (s.w < 0.004) return null;
            const ing = INGR[s.k];
            if (!ing) return null;
            const a = dirs[s.k] ?? i * 2.1 + 0.6;
            const d = s.k === 'huevos' ? 0 : Math.min(rc * 0.42, 40 + i * 18);
            const sx = Math.cos(a) * d, sy = Math.sin(a) * d;
            if (s.k === 'huevos') {
              return (
                <g key={i} opacity={visHuevo}>
                  {Array.from({length: Math.min(nHuevos, Math.ceil(huevosCaidos - 0.02))}).map((__, j) => {
                    const aj = (j / Math.max(1, nHuevos)) * Math.PI * 2 + 0.4;
                    const dj = nHuevos === 1 ? 0 : 70;
                    const hx = Math.cos(aj) * dj, hy = Math.sin(aj) * dj;
                    const cae = clamp(huevosCaidos - j);
                    return (
                      <g key={j} transform={`translate(${hx} ${hy}) scale(${lerp(1.25, 1, salida(cae))})`} opacity={clamp(cae * 3)}>
                        <path d={blob(76, 7, j + 3, 0.08)} fill="#fffaf0" opacity={0.78} />
                        <circle r={38} fill="url(#c-yema)" />
                        <ellipse cx={-12} cy={-14} rx={11} ry={8} fill="#fff" opacity={0.7} />
                      </g>
                    );
                  })}
                </g>
              );
            }
            const r = ing.tipo === 'polvo' ? 40 + 135 * Math.sqrt(s.w) : 46 + 170 * Math.sqrt(s.w);
            if (ing.tipo === 'polvo') return <Monton key={i} x={sx} y={sy} r={r} k={s.k} frame={frame} semilla={i} />;
            if (ing.tipo === 'liquido') return <Charco key={i} x={sx} y={sy} r={r * 1.1} k={s.k} frame={frame} semilla={i} />;
            return (
              <g key={i} transform={`translate(${sx} ${sy})`}>
                {Array.from({length: s.k === 'limon' ? 22 : s.k === 'chocolate' ? 7 : 5}).map((__, j) => {
                  const ax = (rnd(j + i * 3) - 0.5) * r * 1.3, ay = (rnd(j + i * 3 + 7) - 0.5) * r * 1.3;
                  if (s.k === 'limon') return <rect key={j} x={ax} y={ay} width={20} height={5} rx={2.5} fill="#f2c92a" transform={`rotate(${j * 47} ${ax} ${ay})`} />;
                  const lado = s.k === 'chocolate' ? 40 : 48;
                  return (
                    <g key={j} transform={`translate(${ax} ${ay}) rotate(${j * 31})`}>
                      <rect x={-lado / 2 + 5} y={-lado / 2 + 7} width={lado} height={lado} rx={7} fill="#2a1408" opacity={0.18} />
                      <rect x={-lado / 2} y={-lado / 2} width={lado} height={lado} rx={7} fill={s.k === 'chocolate' ? '#4a2617' : ing.color} />
                      <rect x={-lado / 2 + 5} y={-lado / 2 + 5} width={lado - 18} height={8} rx={4} fill="#fff" opacity={s.k === 'chocolate' ? 0.18 : 0.45} />
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* brillo de la superficie */}
          {e.mezcla.length > 0 && <ellipse cx={-rc * 0.32} cy={-rc * 0.36} rx={rc * 0.34} ry={rc * 0.13} fill="#fff" opacity={0.16 + 0.18 * e.aire} transform={`rotate(-30 ${-rc * 0.32} ${-rc * 0.36})`} />}
        </g>
      )}
    </g>
  );
};

// ---------------- Utensilios ----------------
export const Batidor: React.FC<{ang: number}> = ({ang}) => (
  <g transform={`rotate(${ang})`}>
    <g transform="translate(10 16)" opacity={0.22}>
      <rect x={120} y={-16} width={300} height={32} rx={16} fill="#2a1408" />
    </g>
    {[0, 30, 60, 90, 120, 150].map((r) => (
      <ellipse key={r} rx={115} ry={44} fill="none" stroke="#7b8087" strokeWidth={7} transform={`rotate(${r})`} opacity={0.5} />
    ))}
    {[0, 30, 60, 90, 120, 150].map((r) => (
      <ellipse key={`b${r}`} cx={-2} cy={-3} rx={115} ry={44} fill="none" stroke="#eef0f3" strokeWidth={5} transform={`rotate(${r})`} />
    ))}
    <rect x={100} y={-20} width={60} height={40} rx={8} fill="url(#c-acero)" />
    <rect x={150} y={-18} width={290} height={36} rx={18} fill="#8a5a3a" />
    <rect x={160} y={-12} width={270} height={10} rx={5} fill="#b98450" opacity={0.7} />
  </g>
);

export const Espatula: React.FC<{ang: number}> = ({ang}) => (
  <g transform={`rotate(${ang})`}>
    <rect x={130} y={-14} width={320} height={28} rx={14} fill="#2a1408" opacity={0.2} transform="translate(10 14)" />
    <path d="M-110,-58 L90,-58 C120,-58 130,-30 130,0 C130,30 120,58 90,58 L-110,58 C-130,58 -140,40 -140,0 C-140,-40 -130,-58 -110,-58 Z" fill="#e8806a" />
    <path d="M-120,-36 L80,-36" stroke="#fff" strokeOpacity={0.35} strokeWidth={10} strokeLinecap="round" />
    <rect x={120} y={-14} width={330} height={28} rx={14} fill="#f2ede4" />
  </g>
);

export const Cuchillo: React.FC = () => (
  <g>
    <path d="M0,-18 L320,-14 C340,-12 350,0 340,10 L0,18 Z" fill="url(#c-acero)" />
    <path d="M10,-12 L300,-10" stroke="#fff" strokeWidth={4} opacity={0.7} />
    <rect x={-210} y={-24} width={210} height={48} rx={14} fill="#3a2414" />
    {[-170, -110, -50].map((x) => (
      <circle key={x} cx={x} cy={0} r={6} fill="#c9cdd2" />
    ))}
  </g>
);

// ---------------- Molde, plato y bizcocho ----------------
export const Molde: React.FC<{lleno: number; color: string; frame: number}> = ({lleno, color, frame}) => {
  const R = MOLDE.r;
  const r = (R - 30) * Math.sqrt(clamp(lleno));
  return (
    <g>
      <Sombra rx={R + 30} />
      <circle r={R} fill="url(#c-metal-molde)" />
      <circle r={R - 14} fill="#7d828a" />
      <circle r={R - 22} fill="#f3ead8" />
      {Array.from({length: 7}).map((_, i) => (
        <path key={i} d={`M${Math.cos(i) * 60},${Math.sin(i) * 60} L${Math.cos(i) * (R - 30)},${Math.sin(i) * (R - 30)}`} stroke="#e1d5bd" strokeWidth={3} />
      ))}
      {lleno > 0.01 && (
        <>
          <circle r={r} fill={color} />
          <circle r={r} fill="none" stroke={oscurece(color, 0.08)} strokeWidth={6} />
          <ellipse cx={-r * 0.3} cy={-r * 0.32} rx={r * 0.35} ry={r * 0.12} fill="#fff" opacity={0.25} transform={`rotate(-30 ${-r * 0.3} ${-r * 0.32})`} />
          <circle r={r * (0.6 + 0.05 * Math.sin(frame * 0.1))} fill="none" stroke={aclara(color, 0.3)} strokeWidth={4} opacity={lleno < 0.98 ? 0.4 : 0} />
        </>
      )}
      <circle r={R - 4} fill="none" stroke="#fff" strokeWidth={5} opacity={0.35} />
    </g>
  );
};

export const Bizcocho: React.FC<{e: Estado; miga: string; frame: number; tFuera: number}> = ({e, miga, frame, tFuera}) => {
  const R = 228;
  const pop = salida(e.fuera);
  const c = e.corte;
  // la porción: cuña de 44° hacia abajo a la derecha; sale, se tumba y enseña la miga
  const a1 = (25 * Math.PI) / 180, a2 = (69 * Math.PI) / 180;
  const sale = suave(clamp(c / 0.55)) * 130;
  const tumba = suave(clamp((c - 0.5) / 0.5));
  const bis = (a1 + a2) / 2;
  const pastel = c > 0.001 ? `M0,0 L${Math.cos(a2) * R},${Math.sin(a2) * R} A${R},${R} 0 1 1 ${Math.cos(a1) * R},${Math.sin(a1) * R} Z` : '';
  const cuna = `M0,0 L${Math.cos(a1) * R},${Math.sin(a1) * R} A${R},${R} 0 0 1 ${Math.cos(a2) * R},${Math.sin(a2) * R} Z`;
  const vapor = clamp(1 - tFuera / 6);
  const dec = e.decoracion;
  return (
    <g transform={`scale(${lerp(0.9, 1, pop)})`} opacity={clamp(e.fuera * 2.5)}>
      {/* plato */}
      <Sombra rx={350} ry={330} dx={30} dy={40} />
      <circle r={325} fill="url(#c-ceramica)" />
      <circle r={262} fill="#f7f2e9" />
      <circle r={262} fill="none" stroke="#e3d9c8" strokeWidth={6} />
      <circle r={300} fill="none" stroke="#2f5f8f" strokeWidth={6} opacity={0.55} />
      {/* bizcocho */}
      <g>
        <circle r={R + 14} fill="#2a1408" opacity={0.18} transform="translate(10 14)" />
        {c > 0.001 ? <path d={pastel} fill="url(#c-corteza)" /> : <circle r={R} fill="url(#c-corteza)" />}
        <path d="M-150,-30 C-90,-70 -40,10 10,-40 C60,-90 110,-20 160,-60" stroke="#8a4f22" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.75} />
        <path d="M-150,-24 C-90,-62 -40,18 10,-32 C60,-82 110,-12 160,-52" stroke="#f3c47e" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
        {Array.from({length: 40}).map((_, i) => {
          const a = rnd(i * 4) * Math.PI * 2;
          const d = Math.sqrt(rnd(i * 4 + 1)) * (R - 20);
          const ang = Math.atan2(Math.sin(a), Math.cos(a));
          if (c > 0.001 && ang > a1 && ang < a2) return null;
          return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={2 + rnd(i * 4 + 2) * 3} fill="#9a5a28" opacity={0.35} />;
        })}
        {/* cara de corte visible en el hueco */}
        {c > 0.001 && (
          <>
            <path d={`M0,0 L${Math.cos(a1) * R},${Math.sin(a1) * R}`} stroke={miga} strokeWidth={22 * clamp(c * 4)} strokeLinecap="round" />
            <path d={`M0,0 L${Math.cos(a2) * R},${Math.sin(a2) * R}`} stroke={oscurece(miga, 0.12)} strokeWidth={14 * clamp(c * 4)} strokeLinecap="round" />
          </>
        )}
        {/* decoración: azúcar glas o chocolate */}
        {dec && dec.tipo !== 'chocolate' && (
          <g opacity={dec.p}>
            {Array.from({length: 160}).map((_, i) => {
              const a = rnd(i * 6) * Math.PI * 2;
              const d = Math.sqrt(rnd(i * 6 + 1)) * (R - 6);
              const ang = Math.atan2(Math.sin(a), Math.cos(a));
              if (c > 0.001 && ang > a1 && ang < a2) return null;
              return i / 160 < dec.p ? <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={3 + rnd(i * 6 + 2) * 5} fill="#fffdf8" opacity={0.85} /> : null;
            })}
          </g>
        )}
        {dec && dec.tipo === 'chocolate' && (
          <path d={Array.from({length: 13}).map((_, i) => `${i ? 'L' : 'M'}${-190 + i * 32},${(i % 2 ? -1 : 1) * Math.sqrt(Math.max(0, R * R - (-190 + i * 32) ** 2)) * 0.82}`).join(' ')} stroke="#4a2617" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dec.p} />
        )}
      </g>
      {/* la porción */}
      {c > 0.001 && (
        <g transform={`translate(${Math.cos(bis) * sale} ${Math.sin(bis) * sale})`}>
          <g opacity={1 - tumba}>
            <path d={cuna} fill="url(#c-corteza)" />
            <path d={`M0,0 L${Math.cos(a1) * R},${Math.sin(a1) * R}`} stroke={miga} strokeWidth={16} strokeLinecap="round" />
          </g>
          {/* tumbada: se ve la miga con sus alveolos y la corteza */}
          <g opacity={tumba} transform={`translate(${Math.cos(bis) * 20} ${Math.sin(bis) * 10}) rotate(${-20}) scale(0.85)`}>
            <path d={`M-20,-120 L230,-60 L230,70 L-20,70 Z`} fill="#2a1408" opacity={0.18} transform="translate(12 16)" />
            <path d="M-20,-120 L230,-60 L230,70 L-20,70 Z" fill={miga} />
            {Array.from({length: 22}).map((_, i) => (
              <ellipse key={i} cx={10 + rnd(i * 3) * 200} cy={-40 + rnd(i * 3 + 1) * 100} rx={4 + rnd(i) * 8} ry={3 + rnd(i + 1) * 5} fill={oscurece(miga, 0.18)} opacity={0.6} />
            ))}
            <path d="M-20,-120 L230,-60" stroke="#b56f35" strokeWidth={18} strokeLinecap="round" />
            <path d="M230,-60 L230,70" stroke="#c98a4b" strokeWidth={12} />
            <path d="M-20,70 L230,70" stroke="#b07a46" strokeWidth={8} />
          </g>
        </g>
      )}
      {/* vapor recién salido */}
      {vapor > 0.02 &&
        [0, 1, 2].map((i) => {
          const u = ((frame * 0.012 + i / 3) % 1);
          const x0 = -80 + i * 80;
          return <path key={i} d={`M${x0},${-40 - u * 260} c${30},-40 ${-30},-80 0,-120 c30,-40 -30,-80 0,-120`} stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" opacity={vapor * 0.35 * Math.sin(u * Math.PI)} />;
        })}
    </g>
  );
};

/** Chorro de polvo (harina, azúcar…) de (x0,y0) a (x1,y1): partículas que caen y se hacen pequeñas al llegar */
export const ChorroPolvo: React.FC<{x0: number; y0: number; x1: number; y1: number; color: string; frame: number; o: number}> = ({x0, y0, x1, y1, color, frame, o}) => (
  <g opacity={o}>
    {Array.from({length: 46}).map((_, i) => {
      const u = (frame * 0.045 + i / 46) % 1;
      const jx = (rnd(i * 3) - 0.5) * 60 * u, jy = (rnd(i * 3 + 1) - 0.5) * 40 * u;
      return <circle key={i} cx={lerp(x0, x1, u) + jx} cy={lerp(y0, y1, u) + jy} r={lerp(9, 4, u) * (0.6 + rnd(i) * 0.8)} fill={color} opacity={0.9 - u * 0.3} />;
    })}
    <circle cx={x1} cy={y1} r={70} fill={color} opacity={0.18} />
  </g>
);

/** Chorro de líquido: una cinta que se ondula */
export const ChorroLiquido: React.FC<{x0: number; y0: number; x1: number; y1: number; color: string; frame: number; o: number; ancho?: number}> = ({x0, y0, x1, y1, color, frame, o, ancho = 22}) => {
  const mx = (x0 + x1) / 2 + Math.sin(frame * 0.3) * 10, my = (y0 + y1) / 2;
  return (
    <g opacity={o}>
      <path d={`M${x0},${y0} Q${mx},${my} ${x1},${y1}`} stroke={oscurece(color, 0.1)} strokeWidth={ancho + 6} fill="none" strokeLinecap="round" />
      <path d={`M${x0},${y0} Q${mx},${my} ${x1},${y1}`} stroke={color} strokeWidth={ancho} fill="none" strokeLinecap="round" />
      <path d={`M${x0 - 4},${y0} Q${mx - 5},${my} ${x1 - 4},${y1}`} stroke="#fff" strokeWidth={ancho * 0.25} fill="none" strokeLinecap="round" opacity={0.4} />
      <circle cx={x1} cy={y1} r={ancho * 2.2 + Math.sin(frame * 0.5) * 6} fill="none" stroke={aclara(color, 0.3)} strokeWidth={5} opacity={0.6} />
    </g>
  );
};

/** Contorno orgánico (círculo con ondas suaves) */
export const blob = (r: number, n: number, semilla: number, amp = 0.12) => {
  const pts = Array.from({length: 48}).map((_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(a * n + semilla * 1.7) * 0.6 + amp * 0.4 * Math.sin(a * (n + 3) + semilla));
    return `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  });
  return pts.join(' ') + ' Z';
};

/** Montón de polvo (harina, azúcar, cacao, levadura): mate y esponjoso, con sombra y textura; el azúcar brilla */
export const Monton: React.FC<{x: number; y: number; r: number; k: string; frame: number; semilla: number}> = ({x, y, r, k, frame, semilla}) => {
  const base = k === 'cacao' ? '#6b3d27' : k === 'azucar' ? '#fbfaf6' : '#f6f0e3';
  const sombra = k === 'cacao' ? '#3e2214' : k === 'azucar' ? '#c9d3d8' : '#d8cdb8';
  const id = `c-monton-${k}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id} cx="0.4" cy="0.38" r="0.7">
          <stop offset="0" stopColor={aclara(base, 0.5)} />
          <stop offset="0.55" stopColor={base} />
          <stop offset="1" stopColor={sombra} />
        </radialGradient>
      </defs>
      <path d={blob(r * 1.12, 6, semilla + 2, 0.1)} fill="#2a1408" opacity={0.1} transform="translate(10 14)" />
      <path d={blob(r, 5, semilla, 0.14)} fill={`url(#${id})`} />
      {/* polvo suelto alrededor */}
      {Array.from({length: 22}).map((_, j) => {
        const a = rnd(j * 3 + semilla) * Math.PI * 2;
        const d = r * (0.95 + rnd(j * 3 + 1 + semilla) * 0.35);
        return <circle key={j} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={2 + rnd(j) * 4} fill={base} opacity={0.75} />;
      })}
      {/* textura del grano */}
      {Array.from({length: 30}).map((_, j) => {
        const a = rnd(j * 5 + 11 + semilla) * Math.PI * 2;
        const d = Math.sqrt(rnd(j * 5 + 12)) * r * 0.85;
        return <circle key={`g${j}`} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={1.5 + rnd(j + 4) * 2.5} fill={j % 2 ? sombra : aclara(base, 0.6)} opacity={0.55} />;
      })}
      {k === 'azucar' &&
        Array.from({length: 9}).map((_, j) => {
          const a = rnd(j * 7 + 3) * Math.PI * 2;
          const d = Math.sqrt(rnd(j * 7 + 4)) * r * 0.8;
          const b = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.15 + j * 1.3));
          const px = Math.cos(a) * d, py = Math.sin(a) * d;
          return <path key={`b${j}`} d={`M${px - 9},${py} L${px + 9},${py} M${px},${py - 9} L${px},${py + 9}`} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={b} />;
        })}
      <ellipse cx={-r * 0.28} cy={-r * 0.32} rx={r * 0.35} ry={r * 0.22} fill="#fff" opacity={k === 'cacao' ? 0.12 : 0.35} />
    </g>
  );
};

/** Charco de líquido en el bol: aceite dorado translúcido, yogur cremoso, leche fina */
export const Charco: React.FC<{x: number; y: number; r: number; k: string; frame: number; semilla: number}> = ({x, y, r, k, frame, semilla}) => {
  const ond = Math.sin(frame * 0.08 + semilla) * 0.02;
  if (k === 'aceite')
    return (
      <g transform={`translate(${x} ${y}) scale(${1 + ond})`}>
        <path d={blob(r, 4, semilla, 0.18)} fill="#fff3c4" opacity={0.28} />
        <path d={blob(r, 4, semilla, 0.18)} fill="none" stroke="#d9a21e" strokeWidth={4} opacity={0.55} />
        <path d={blob(r * 0.62, 3, semilla + 2, 0.22)} fill="none" stroke="#e8b42e" strokeWidth={3} opacity={0.35} />
        {[0, 1, 2].map((j) => (
          <path key={j} d={`M${-r * (0.6 - j * 0.15)},${-r * (0.1 + j * 0.12)} C${-r * (0.4 - j * 0.1)},${-r * (0.5 - j * 0.05)} ${r * 0.1},${-r * (0.6 - j * 0.1)} ${r * (0.35 - j * 0.05)},${-r * (0.45 - j * 0.12)}`} stroke="#fffdf2" strokeWidth={10 - j * 3} fill="none" strokeLinecap="round" opacity={0.85 - j * 0.2} />
        ))}
        {[[0.35, 0.2, 11], [-0.2, 0.38, 8], [0.1, 0.5, 6], [0.45, -0.1, 5]].map(([fx, fy, rr], j) => (
          <circle key={`g${j}`} cx={r * fx} cy={r * fy} r={rr} fill="#fff8d8" stroke="#d9a21e" strokeWidth={2} opacity={0.8} />
        ))}
      </g>
    );
  const color = k === 'chocolate' ? '#4e2a1a' : k === 'leche' ? '#fffdf9' : '#fffbf3';
  const borde = k === 'chocolate' ? '#2e170d' : '#d9d4c8';
  return (
    <g transform={`translate(${x} ${y}) scale(${1 + ond})`}>
      <path d={blob(r * 1.05, 5, semilla + 1, 0.14)} fill="#2a1408" opacity={0.08} transform="translate(6 10)" />
      <path d={blob(r, 5, semilla, 0.14)} fill={color} opacity={k === 'leche' ? 0.85 : 1} />
      <path d={blob(r, 5, semilla, 0.14)} fill="none" stroke={borde} strokeWidth={4} opacity={0.6} />
      {k === 'yogur' &&
        [0.75, 0.5, 0.28].map((f, j) => (
          <path key={j} d={`M${-r * f},0 A${r * f},${r * f} 0 0 1 ${r * f * 0.7},${-r * f * 0.7}`} stroke="#ece6d8" strokeWidth={7} fill="none" strokeLinecap="round" transform={`rotate(${j * 70 + semilla * 20})`} />
        ))}
      <ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.32} ry={r * 0.12} fill="#fff" opacity={k === 'chocolate' ? 0.22 : 0.7} transform={`rotate(-25 ${-r * 0.3} ${-r * 0.35})`} />
    </g>
  );
};

/**
 * Recipiente levantado e inclinado, visto desde arriba. Dibujado con la boca hacia +x (hacia el bol);
 * inc = 0…1 cuánto se inclina (se acorta en perspectiva y el contenido corre hacia la boca).
 * Devuelve también dónde está la boca, en coordenadas locales.
 */
export const bocaVertedor = (k: string) => (k === 'aceite' ? 230 : k === 'harina' ? 150 : k === 'levadura' ? 95 : k === 'yogur' || k === 'leche' ? 95 : 120);

export const Vertedor: React.FC<{k: string; inc: number; lleno: number; ang?: number}> = ({k, inc, lleno, ang = 0}) => {
  // si el recipiente apunta hacia la izquierda, el texto quedaría del revés: se le da la vuelta
  const alReves = Math.cos((ang * Math.PI) / 180) < -0.2;
  const leer = (x: number, y: number) => (alReves ? `rotate(180 ${x} ${y})` : undefined);
  const sx = 1 - 0.32 * inc;
  const corre = inc * 0.6; // el contenido se va hacia la boca
  if (k === 'aceite')
    return (
      <g transform={`scale(${sx} 1)`}>
        <path d="M-150,-60 L70,-60 C100,-60 115,-30 150,-24 L230,-20 L230,20 L150,24 C115,30 100,60 70,60 L-150,60 C-175,60 -185,40 -185,0 C-185,-40 -175,-60 -150,-60 Z" fill="#dfe9d6" opacity={0.6} />
        <path d={`M${-180 + 260 * corre},-48 L70,-48 C95,-40 110,-24 140,-18 L225,-14 L225,14 L140,18 C110,24 95,40 70,48 L${-180 + 260 * corre},48 Z`} fill="#e3b236" opacity={0.85 * Math.max(0.3, lleno)} />
        <rect x={-120} y={-44} width={130} height={88} rx={6} fill="#f4ecdb" opacity={0.92} />
        <text x={-55} y={10} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={30} fill="#3f6b3a" transform={leer(-55, 0)}>
          Aceite
        </text>
        <path d="M-160,-36 L60,-36" stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.5} />
        <ellipse cx={230} cy={0} rx={8} ry={20} fill="#c99117" />
      </g>
    );
  if (k === 'harina' || k === 'levadura') {
    const L = k === 'harina' ? 150 : 95, A = k === 'harina' ? 140 : 90;
    return (
      <g transform={`scale(${sx} 1)`}>
        <rect x={-L} y={-A} width={L * 2} height={A * 2} rx={12} fill={k === 'harina' ? 'url(#c-kraft)' : '#f4f0e6'} />
        {k === 'harina' ? (
          <>
            <path d={`M${-L + 20},${-A + 10} L${-L + 20},${A - 10}`} stroke="#9c7748" strokeWidth={4} opacity={0.5} />
            <path d={`M${-L + 60},${-A} L${-L + 50},${A}`} stroke="#c9a46f" strokeWidth={10} opacity={0.4} />
            <rect x={-L + 70} y={-A * 0.55} width={L * 0.95} height={A * 1.1} rx={8} fill="#f4ecdb" />
            <text x={-L + 70 + L * 0.475} y={14} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={40} fill="#6e4423" transform={leer(-L + 70 + L * 0.475, 0)}>
              Harina
            </text>
          </>
        ) : (
          <>
            <rect x={-L} y={-28} width={L * 1.4} height={56} fill="#c8473c" />
            <text x={-L + L * 0.7} y={12} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={24} fill="#fff" transform={leer(-L + L * 0.7, 0)}>
              LEVADURA
            </text>
          </>
        )}
        {/* boca abierta hacia el bol, con el polvo asomando */}
        <path d={`M${L - 40},${-A} L${L + 18},${-A - 14} L${L + 18},${A + 14} L${L - 40},${A} Z`} fill={k === 'harina' ? '#a6814f' : '#d9d0bf'} />
        <path d={`M${L - 30},${-A + 14} L${L + 12},${-A + 4} L${L + 12},${A - 4} L${L - 30},${A - 14} Z`} fill="#f9f4ea" opacity={0.4 + 0.6 * lleno} />
        {Array.from({length: 12}).map((_, i) => (
          <circle key={i} cx={L - 20 + rnd(i) * 30} cy={-A + 20 + rnd(i + 5) * (A * 2 - 40)} r={3 + rnd(i + 2) * 4} fill="#fff" opacity={0.8 * lleno} />
        ))}
      </g>
    );
  }
  // tarro, cuenco o vaso: un círculo que se acorta al inclinarse, con el contenido corriendo hacia la boca
  const R = k === 'yogur' ? 90 : k === 'leche' ? 100 : k === 'cacao' ? 95 : 120;
  const borde = k === 'yogur' ? '#5b8fc2' : k === 'azucar' || k === 'leche' ? '#e7eef0' : '#efe5d4';
  const dentro = k === 'cacao' ? '#5c3320' : k === 'yogur' ? '#fffdf9' : k === 'leche' ? '#fffefb' : k === 'chocolate' ? '#4e2a1a' : k === 'mantequilla' ? '#f6d873' : k === 'limon' ? '#f2d33a' : '#fbfaf6';
  return (
    <g transform={`scale(${sx} 1)`}>
      <circle r={R} fill={borde} />
      <circle r={R - 12} fill="#f7f4ee" opacity={0.9} />
      <ellipse cx={R * corre * 0.9} cy={0} rx={(R - 16) * (1 - corre * 0.45)} ry={(R - 16) * (1 - corre * 0.15)} fill={dentro} opacity={0.35 + 0.65 * lleno} />
      {k === 'azucar' &&
        Array.from({length: 16}).map((_, i) => (
          <rect key={i} x={R * corre * 0.9 + (rnd(i) - 0.5) * R} y={(rnd(i + 3) - 0.5) * R * 1.2} width={6} height={6} fill="#fff" stroke="#d8e4ea" strokeWidth={1.2} opacity={lleno} />
        ))}
      <circle r={R} fill="none" stroke="#fff" strokeWidth={7} opacity={0.6} />
      <path d={`M${R - 4},-22 L${R + 22},0 L${R - 4},22 Z`} fill={borde} />
      {k === 'yogur' && <path d={`M${-R * 0.2},${-R - 10} C${-R * 0.9},${-R * 1.4} ${-R * 1.4},${-R * 0.6} ${-R * 1.1},${-R * 0.1}`} stroke="#cfd6dc" strokeWidth={16} fill="none" strokeLinecap="round" />}
    </g>
  );
};

/** Cascada de polvo: densa en la boca, se abre al caer, nube al llegar */
export const Cascada: React.FC<{x0: number; y0: number; x1: number; y1: number; color: string; frame: number; o: number}> = ({x0, y0, x1, y1, color, frame, o}) => {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l, ny = dx / l;
  return (
    <g opacity={o}>
      <path d={`M${x0 + nx * 16},${y0 + ny * 16} L${x1 + nx * 50},${y1 + ny * 50} L${x1 - nx * 50},${y1 - ny * 50} L${x0 - nx * 16},${y0 - ny * 16} Z`} fill={color} opacity={0.22} />
      {Array.from({length: 90}).map((_, i) => {
        const u = (frame * 0.06 + i / 90) % 1;
        const lado = (rnd(i * 3) - 0.5) * (18 + 80 * u);
        return <circle key={i} cx={lerp(x0, x1, u) + nx * lado} cy={lerp(y0, y1, u) + ny * lado} r={lerp(7, 4, u) * (0.6 + rnd(i) * 0.8)} fill={color} opacity={0.95 - u * 0.35} />;
      })}
      {Array.from({length: 16}).map((_, i) => {
        const u = (frame * 0.04 + i / 16) % 1;
        const a = (i / 16) * Math.PI * 2 + rnd(i) * 0.5;
        return <circle key={`n${i}`} cx={x1 + Math.cos(a) * (30 + 90 * u)} cy={y1 + Math.sin(a) * (30 + 90 * u)} r={10 + 14 * u} fill={color} opacity={0.35 * (1 - u)} />;
      })}
    </g>
  );
};

/** Chorro de líquido con ondas donde cae */
export const Chorro: React.FC<{x0: number; y0: number; x1: number; y1: number; color: string; frame: number; o: number; ancho: number; espeso?: boolean}> = ({x0, y0, x1, y1, color, frame, o, ancho, espeso}) => {
  const mx = (x0 + x1) / 2 + Math.sin(frame * 0.3) * (espeso ? 4 : 9), my = (y0 + y1) / 2;
  return (
    <g opacity={o}>
      {!espeso &&
        [0, 1, 2].map((i) => {
          const u = (frame * 0.035 + i / 3) % 1;
          return <circle key={i} cx={x1} cy={y1} r={ancho + 120 * u} fill="none" stroke={aclara(color, 0.4)} strokeWidth={5} opacity={0.6 * (1 - u)} />;
        })}
      {espeso &&
        [0, 1, 2].map((i) => <circle key={i} cx={x1 + Math.cos(frame * 0.2 + i * 2) * 14} cy={y1 + Math.sin(frame * 0.2 + i * 2) * 14} r={ancho * (1.3 - i * 0.3)} fill={color} stroke={oscurece(color, 0.08)} strokeWidth={3} />)}
      <path d={`M${x0},${y0} Q${mx},${my} ${x1},${y1}`} stroke={oscurece(color, 0.12)} strokeWidth={ancho + 6} fill="none" strokeLinecap="round" />
      <path d={`M${x0},${y0} Q${mx},${my} ${x1},${y1}`} stroke={color} strokeWidth={ancho} fill="none" strokeLinecap="round" />
      <path d={`M${x0 - 3},${y0 - 3} Q${mx - 4},${my - 4} ${x1 - 3},${y1 - 3}`} stroke="#fff" strokeWidth={Math.max(3, ancho * 0.28)} fill="none" strokeLinecap="round" opacity={0.55} />
    </g>
  );
};

/** Trozos sólidos que caen (mantequilla, chocolate, ralladura) */
export const Trozos: React.FC<{x0: number; y0: number; x1: number; y1: number; k: string; frame: number; o: number}> = ({x0, y0, x1, y1, k, frame, o}) => (
  <g opacity={o}>
    {Array.from({length: k === 'limon' ? 26 : 7}).map((_, i) => {
      const u = (frame * (k === 'limon' ? 0.05 : 0.035) + i / (k === 'limon' ? 26 : 7)) % 1;
      const lado = (rnd(i * 5) - 0.5) * 60;
      const x = lerp(x0, x1, u) + lado * u, y = lerp(y0, y1, u) + lado * 0.5 * u;
      if (k === 'limon') return <rect key={i} x={x} y={y} width={18} height={5} rx={2.5} fill="#f2c92a" transform={`rotate(${i * 47 + frame * 4} ${x} ${y})`} />;
      const s = lerp(46, 30, u);
      return <rect key={i} x={x - s / 2} y={y - s / 2} width={s} height={s} rx={6} fill={k === 'chocolate' ? '#4a2617' : '#f6d873'} stroke={k === 'chocolate' ? '#2e170d' : '#e0bf5a'} strokeWidth={3} transform={`rotate(${i * 40 + u * 120} ${x} ${y})`} />;
    })}
  </g>
);
