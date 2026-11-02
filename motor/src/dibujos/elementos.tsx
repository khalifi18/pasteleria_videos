// Elementos para el formato hikma: un dibujo pequeño que flota sobre el fondo de color.
// Se dibujan centrados en (0,0) y caben en un círculo de radio ~150.
import React from 'react';
import {P} from '../tema';

export const ELEMENTOS: Record<string, (f: number) => React.ReactNode> = {
  // Repostería
  bizcocho: (f) => (
    <g>
      <ellipse cx={0} cy={120} rx={170} ry={26} fill="rgba(0,0,0,0.25)" />
      <ellipse cx={0} cy={112} rx={165} ry={30} fill="#f3ead8" />
      <path d="M-130,100 L-130,-10 L130,-10 L130,100 Z" fill="#c98a4b" />
      <ellipse cx={0} cy={100} rx={130} ry={28} fill="#c98a4b" />
      <path d="M-130,45 L130,45" stroke="#fff3df" strokeWidth={14} />
      <path d="M-130,45 L130,45" stroke="#e8b4a0" strokeWidth={5} />
      <ellipse cx={0} cy={-10} rx={130} ry={30} fill="#fff6e8" />
      <path d={`M-130,-10 C-120,${30 + Math.sin(f * 0.05) * 3} -105,22 -100,-2 C-92,40 -78,36 -70,4 C-60,24 -48,20 -40,0 C-30,48 -14,44 -6,6 C4,26 18,24 26,2 C36,40 52,38 60,6 C70,22 84,20 92,0 C100,34 116,30 130,-10`} fill="#fff6e8" />
      {[-60, 0, 60].map((x, i) => (
        <g key={i} transform={`translate(${x} ${-30 - (i === 1 ? 6 : 0)})`}>
          <circle r={20} fill="#d23b4a" />
          <circle cx={-6} cy={-6} r={6} fill="#ff8a95" />
          <path d="M0,-18 C4,-34 14,-40 22,-42" stroke="#3b6b2a" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
  magdalena: (f) => (
    <g transform={`translate(0 ${Math.sin(f * 0.05) * 4})`}>
      <path d="M-95,10 L-70,140 L70,140 L95,10 Z" fill="#e9c8a8" />
      {[-60, -30, 0, 30, 60].map((x) => (
        <path key={x} d={`M${x * 1.25},10 L${x},140`} stroke="#cfa47c" strokeWidth={6} />
      ))}
      <path d="M-115,20 C-140,-40 -90,-80 -50,-70 C-40,-120 40,-120 50,-70 C90,-80 140,-40 115,20 C80,40 -80,40 -115,20 Z" fill="#7a4a2e" />
      <path d="M-100,-10 C-90,-40 -60,-55 -40,-50 M10,-90 C30,-95 45,-85 50,-70" stroke="#a87048" strokeWidth={8} fill="none" strokeLinecap="round" />
      {[[-50, -20], [10, -50], [55, -10], [-10, 0], [80, -40], [-80, -45]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={18} height={8} rx={4} fill={['#f2c165', '#ff8a95', '#fff6e8'][i % 3]} transform={`rotate(${i * 47} ${x + 9} ${y + 4})`} />
      ))}
    </g>
  ),
  batidor: (f) => (
    <g transform={`rotate(${-25 + Math.sin(f * 0.08) * 8})`}>
      <rect x={-18} y={40} width={36} height={130} rx={18} fill="#8a5a3a" />
      <rect x={-22} y={30} width={44} height={22} rx={6} fill="#d9d9de" />
      {[-60, -32, 0, 32, 60].map((w, i) => (
        <path key={i} d={`M${w * 0.15},32 C${w * 1.2},0 ${w},-150 0,-165 C${-w},-150 ${-w * 1.2},0 ${-w * 0.15},32`} stroke="#e6e6ea" strokeWidth={6} fill="none" opacity={0.92 - i * 0.05} />
      ))}
    </g>
  ),
  huevo: (f) => (
    <g>
      <ellipse cx={0} cy={135} rx={110} ry={18} fill="rgba(0,0,0,0.2)" />
      <path d="M0,-150 C80,-150 115,10 105,60 C95,115 50,140 0,140 C-50,140 -95,115 -105,60 C-115,10 -80,-150 0,-150 Z" fill="#f4e4cf" />
      <path d="M-60,-80 C-45,-115 -20,-130 0,-132" stroke="#fffaf2" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8} />
      <path d={`M-104,40 L-70,${10 + Math.sin(f * 0.06) * 2} L-40,45 L-5,8 L30,48 L65,12 L104,40`} stroke="#b89f84" strokeWidth={5} fill="none" strokeLinejoin="round" opacity={0.7} />
    </g>
  ),
  luna: () => (
    <g>
      <defs>
        <mask id="el-luna">
          <rect x={-200} y={-200} width={400} height={400} fill="#fff" />
          <circle cx={48} cy={-34} r={110} fill="#000" />
        </mask>
      </defs>
      <circle r={125} fill="#fff1c9" mask="url(#el-luna)" />
      <circle cx={95} cy={60} r={8} fill="#fff1c9" />
    </g>
  ),
  estrella: (f) => (
    <g transform={`rotate(${f * 0.2})`}>
      <rect x={-95} y={-95} width={190} height={190} fill={P.oro} />
      <rect x={-95} y={-95} width={190} height={190} fill={P.oro} transform="rotate(45)" />
      <rect x={-62} y={-62} width={124} height={124} fill={P.turquesaOsc} />
      <rect x={-62} y={-62} width={124} height={124} fill={P.turquesaOsc} transform="rotate(45)" />
      <circle r={36} fill={P.crema} />
    </g>
  ),
  te: (f) => (
    <g>
      <path d="M-70,120 L-90,-90 L90,-90 L70,120 Z" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeOpacity={0.6} strokeWidth={5} />
      <path d="M-73,120 L-86,-40 L86,-40 L73,120 Z" fill="#b5651d" opacity={0.9} />
      <path d="M-84,-20 L84,-20 M-80,30 L80,30" stroke={P.oro} strokeWidth={7} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${-25 + i * 25},-110 C${-45 + i * 25 + Math.sin(f * 0.08 + i) * 16},-160 ${-5 + i * 25},-190 ${-25 + i * 25 + Math.sin(f * 0.06 + i) * 18},-240`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.35} strokeLinecap="round" />
      ))}
    </g>
  ),
  vela: (f) => {
    const fl = 1 + 0.06 * Math.sin(f * 0.7);
    return (
      <g>
        <rect x={-50} y={-30} width={100} height={170} rx={12} fill="#f6e8d2" />
        <line x1={0} y1={-30} x2={0} y2={-52} stroke="#2b2025" strokeWidth={5} />
        <g transform={`translate(0 -48) scale(${fl})`}>
          <path d="M0,0 C26,-22 20,-70 0,-110 C-20,-70 -26,-22 0,0 Z" fill={P.oro} />
          <path d="M0,-4 C14,-18 11,-46 0,-70 C-11,-46 -14,-18 0,-4 Z" fill="#fffbe8" />
        </g>
      </g>
    );
  },
  hoja: (f) => (
    <g transform={`rotate(${-20 + Math.sin(f * 0.04) * 6})`}>
      <path d="M0,140 C-120,40 -100,-100 0,-150 C100,-100 120,40 0,140 Z" fill={P.verde} />
      <path d="M0,140 L0,-130 M0,40 L-50,-10 M0,-20 L45,-70 M0,90 L50,40" stroke="#a8d08a" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  ),
  corazon: (f) => (
    <g transform={`scale(${1 + 0.04 * Math.sin(f * 0.2)})`}>
      <path d="M0,110 C-200,-30 -120,-210 0,-100 C120,-210 200,-30 0,110 Z" fill={P.terracota} />
      <path d="M0,-100 L-26,-50 L20,-12 L-16,30 L10,66 L0,110" stroke={P.oro} strokeWidth={7} fill="none" strokeLinejoin="round" />
    </g>
  ),
  llave: () => (
    <g transform="rotate(-35)">
      <circle cx={0} cy={-80} r={58} fill="none" stroke={P.oro} strokeWidth={20} />
      <rect x={-10} y={-24} width={20} height={190} fill={P.oro} />
      <rect x={10} y={110} width={44} height={18} fill={P.oro} />
      <rect x={10} y={140} width={30} height={18} fill={P.oro} />
    </g>
  ),
  arco: () => (
    <g>
      <path d="M-110,150 L-110,-10 A120,120 0 1 1 110,-10 L110,150" fill="none" stroke={P.oro} strokeWidth={14} />
      <path d="M-80,150 L-80,-10 A90,90 0 1 1 80,-10 L80,150 Z" fill={P.oroClaro} opacity={0.3} />
    </g>
  ),
  pajaro: (f) => {
    const ala = Math.sin(f * 0.5) * 30;
    return (
      <g>
        <ellipse cx={0} cy={0} rx={70} ry={46} fill={P.oro} />
        <circle cx={56} cy={-36} r={34} fill={P.oro} />
        <circle cx={66} cy={-40} r={5} fill="#2a1a10" />
        <path d="M86,-40 L118,-30 L86,-22 Z" fill={P.terracota} />
        <path d="M-60,-4 L-120,-32 L-110,16 Z" fill="#d99a3a" />
        <g transform={`rotate(${-ala} -6 -14)`}>
          <path d="M-6,-14 C-46,-110 16,-140 46,-94 C34,-62 16,-30 -6,-14 Z" fill={P.oroClaro} />
        </g>
      </g>
    );
  },
};

/** Fondos de color de la hikma (o un color hex en el guion) */
export const COLORES: Record<string, [string, string]> = {
  noche: ['#141a33', '#2a2350'],
  terracota: ['#7a3424', '#c8623e'],
  verde: ['#163a32', '#2f6b5a'],
  arena: ['#8a6a4a', '#c9a77e'],
  azul: ['#14304f', '#2f5f8f'],
  rosa: ['#5a2a3a', '#a85a6a'],
  ciruela: ['#2a1630', '#5a2e5a'],
  chocolate: ['#22140e', '#5a3423'],
  vainilla: ['#7a5a32', '#c9a26a'],
  fresa: ['#5a1f2a', '#b5465a'],
  pistacho: ['#24402a', '#5f8a4a'],
};
