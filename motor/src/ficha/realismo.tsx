// Piezas "lo más realistas posible" en dibujo: texturas, volumen, brillos y sombras de contacto.
// Luz siempre desde arriba a la izquierda.
import React from 'react';
import {rnd} from '../dibujos/base';
import {aclara, oscurece} from '../cocina/estado';

/** Filtros de textura (una vez por <svg>): grano fino (cremas) y miga gruesa (bases de galleta) */
export const DefsRealismo: React.FC = () => (
  <defs>
    <filter id="r-cremoso" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.5 -0.18" result="nc" />
      <feComposite in="nc" in2="SourceGraphic" operator="in" result="ni" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="ni" />
      </feMerge>
    </filter>
    <filter id="r-miga" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed="3" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 1.6 -0.62" result="osc" />
      <feComposite in="osc" in2="SourceGraphic" operator="in" result="o" />
      <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="11" result="n2" />
      <feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 1.4 -0.78" result="cla" />
      <feComposite in="cla" in2="SourceGraphic" operator="in" result="c" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="o" />
        <feMergeNode in="c" />
      </feMerge>
    </filter>
    <filter id="r-galleta" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="5" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0 0.05  0 0 0 0.9 -0.32" result="nc" />
      <feComposite in="nc" in2="SourceGraphic" operator="in" result="ni" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="ni" />
      </feMerge>
    </filter>
    <filter id="r-suave" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="10" />
    </filter>
    <radialGradient id="r-contacto">
      <stop offset="0" stopColor="#2a1408" stopOpacity={0.55} />
      <stop offset="0.7" stopColor="#2a1408" stopOpacity={0.15} />
      <stop offset="1" stopColor="#2a1408" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="r-lateral" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#4a2814" stopOpacity={0.38} />
      <stop offset="0.12" stopColor="#4a2814" stopOpacity={0.1} />
      <stop offset="0.32" stopColor="#fff6e6" stopOpacity={0.18} />
      <stop offset="0.55" stopColor="#fff6e6" stopOpacity={0.04} />
      <stop offset="0.85" stopColor="#4a2814" stopOpacity={0.14} />
      <stop offset="1" stopColor="#4a2814" stopOpacity={0.4} />
    </linearGradient>
    <radialGradient id="r-plato" cx="0.42" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.6" stopColor="#f3eee6" />
      <stop offset="0.9" stopColor="#ddd3c4" />
      <stop offset="1" stopColor="#c9bca8" />
    </radialGradient>
  </defs>
);

/** Galleta tipo Lotus vista desde arriba: borde ondulado, relieve y textura tostada */
export const GalletaLotus: React.FC<{w?: number; h?: number; texto?: boolean; mordida?: boolean}> = ({w = 190, h = 124, texto = true, mordida}) => {
  const n = Math.round(w / 15), m = Math.round(h / 15);
  const ondas: [number, number][] = [];
  for (let i = 0; i <= n; i++) ondas.push([-w / 2 + (i * w) / n, -h / 2]);
  for (let i = 0; i <= m; i++) ondas.push([w / 2, -h / 2 + (i * h) / m]);
  for (let i = 0; i <= n; i++) ondas.push([w / 2 - (i * w) / n, h / 2]);
  for (let i = 0; i <= m; i++) ondas.push([-w / 2, h / 2 - (i * h) / m]);
  const id = `r-gl-${w}-${h}`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor="#d48a45" />
          <stop offset="0.6" stopColor="#b8692f" />
          <stop offset="1" stopColor="#8e4d1f" />
        </radialGradient>
      </defs>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={14} fill="url(#r-contacto)" opacity={0.7} />
      <g filter="url(#r-galleta)">
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={`url(#${id})`} />
        {ondas.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={8} fill={`url(#${id})`} />
        ))}
      </g>
      {/* marco en relieve: sombra abajo-derecha y luz arriba-izquierda */}
      <rect x={-w / 2 + 16} y={-h / 2 + 15} width={w - 32} height={h - 30} rx={10} fill="none" stroke="#7a3f16" strokeWidth={5} opacity={0.75} />
      <rect x={-w / 2 + 14} y={-h / 2 + 13} width={w - 32} height={h - 30} rx={10} fill="none" stroke="#f0b072" strokeWidth={3} opacity={0.6} />
      {texto && (
        <>
          <text x={2} y={h * 0.13 + 2} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={h * 0.36} fill="#f2b679" opacity={0.7}>
            Lotus
          </text>
          <text x={0} y={h * 0.13} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={h * 0.36} fill="#7a3f16">
            Lotus
          </text>
        </>
      )}
      <ellipse cx={-w * 0.2} cy={-h * 0.26} rx={w * 0.22} ry={h * 0.1} fill="#fff" opacity={0.12} />
      {mordida && <circle cx={w / 2} cy={-h / 2} r={h * 0.38} fill="#f7efe3" />}
    </g>
  );
};

/** Estrella redondeada (boca de la boquilla) como path, achatada en y */
const estrella = (r: number, puntas: number, hondo: number, aplasta: number, giro: number) => {
  const pts: string[] = [];
  const N = puntas * 6;
  for (let k = 0; k <= N; k++) {
    const a = (k / N) * Math.PI * 2 + giro;
    const rr = r * (1 - hondo * (0.5 - 0.5 * Math.cos(a * puntas - giro * puntas)));
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr * aplasta).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
};

/** Rosetón de manga (boquilla de estrella) visto de 3/4: pisos con estrías, degradado de luz y punta */
export const Roseton: React.FC<{c: string; s?: number; giro?: number}> = ({c, s = 1, giro = 0}) => {
  const cl = aclara(c, 0.32), os = oscurece(c, 0.3);
  const id = `r-ros-${c.replace('#', '')}`;
  const pisos = [
    {y: 0, r: 33},
    {y: -11, r: 26},
    {y: -20, r: 17},
  ];
  return (
    <g transform={`scale(${s})`}>
      <defs>
        <linearGradient id={id} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={cl} />
          <stop offset="0.55" stopColor={c} />
          <stop offset="1" stopColor={os} />
        </linearGradient>
      </defs>
      <ellipse cx={5} cy={9} rx={38} ry={13} fill="url(#r-contacto)" />
      {pisos.map((p, j) => (
        <g key={j} transform={`translate(0 ${p.y})`}>
          {/* canto del piso (más oscuro) y cara de arriba con estrías */}
          <path d={estrella(p.r, 8, 0.22, 0.5, giro + j * 0.35)} fill={os} transform="translate(0 6)" />
          <path d={estrella(p.r, 8, 0.22, 0.5, giro + j * 0.35)} fill={`url(#${id})`} />
          {Array.from({length: 8}).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + giro + j * 0.35 + Math.PI / 8;
            return <path key={i} d={`M${Math.cos(a) * p.r * 0.25},${Math.sin(a) * p.r * 0.12} L${Math.cos(a) * p.r * 0.8},${Math.sin(a) * p.r * 0.4}`} stroke={os} strokeWidth={2.2} opacity={0.55} strokeLinecap="round" />;
          })}
        </g>
      ))}
      <path d="M-6,-24 C-6,-33 4,-36 10,-30 C4,-30 2,-27 3,-22 Z" fill={c} />
      <ellipse cx={-12} cy={-12} rx={6} ry={8} fill="#fff" opacity={0.28} transform="rotate(-25 -12 -12)" />
    </g>
  );
};

/** Rosetón visto desde arriba (para la tarta vista en planta) */
export const RosetonArriba: React.FC<{c: string; r?: number; giro?: number}> = ({c, r = 24, giro = 0}) => {
  const cl = aclara(c, 0.3), os = oscurece(c, 0.3);
  return (
    <g>
      <circle cx={4} cy={6} r={r + 6} fill="url(#r-contacto)" />
      <circle r={r} fill={os} />
      {Array.from({length: 9}).map((_, i) => {
        const a = (i / 9) * Math.PI * 2 + giro;
        const luz = 0.5 + 0.5 * Math.cos(a + 2.3);
        return (
          <path
            key={i}
            d={`M0,0 C${Math.cos(a - 0.5) * r * 0.9},${Math.sin(a - 0.5) * r * 0.9} ${Math.cos(a + 0.2) * r * 1.05},${Math.sin(a + 0.2) * r * 1.05} ${Math.cos(a + 0.45) * r * 0.7},${Math.sin(a + 0.45) * r * 0.7} Z`}
            fill={luz > 0.55 ? cl : luz > 0.25 ? c : os}
          />
        );
      })}
      <circle r={r * 0.22} fill={cl} />
      <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.16} fill="#fff" opacity={0.4} />
    </g>
  );
};

/** Migas sueltas irregulares, con su sombra */
export const Migas: React.FC<{n: number; w: number; h: number; c: string; semilla?: number; tam?: number}> = ({n, w, h, c, semilla = 1, tam = 10}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const x = (rnd(i * 3 + semilla) - 0.5) * w, y = (rnd(i * 3 + 1 + semilla) - 0.5) * h;
      const s = tam * (0.4 + rnd(i * 7 + semilla) * 0.9);
      const pts = Array.from({length: 6}).map((__, k) => {
        const a = (k / 6) * Math.PI * 2 + rnd(i + k);
        const rr = s * (0.6 + rnd(i * 11 + k) * 0.5);
        return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr * 0.8).toFixed(1)}`;
      });
      return (
        <g key={i}>
          <polygon points={pts.join(' ')} fill="#2a1408" opacity={0.18} transform="translate(3 4)" />
          <polygon points={pts.join(' ')} fill={i % 3 ? c : oscurece(c, 0.2)} />
          <circle cx={x - s * 0.2} cy={y - s * 0.25} r={s * 0.25} fill="#fff" opacity={0.15} />
        </g>
      );
    })}
  </g>
);
