// Ficha: dibujos (iconos de ingredientes, ilustración de cada paso, tarta de portada y porción).
// Mismo estilo que el formato cocina: luz desde arriba a la izquierda, sombras suaves, brillo y detalle.
import React from 'react';
import {rnd} from '../dibujos/base';
import {Batidor, Espatula, Ingrediente, Monton, blob} from '../cocina/piezas';
import {aclara, oscurece, piezaDe} from '../cocina/estado';
import {Tarta, color, io} from './datos';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ---------------- Iconos de ingredientes (dibujados en ~r150, se escalan al usarlos) ----------------
const Galletas: React.FC = () => (
  <g>
    {[[-40, 30, -12], [30, -10, 8], [-10, -40, -4]].map(([x, y, a], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
        <rect x={-96} y={-62} width={192} height={124} rx={22} fill="#2a1408" opacity={0.15} transform="translate(8 12)" />
        <rect x={-96} y={-62} width={192} height={124} rx={22} fill="#b8692f" />
        <rect x={-84} y={-50} width={168} height={100} rx={16} fill="none" stroke="#8a4a1e" strokeWidth={4} />
        {Array.from({length: 16}).map((_, j) => (
          <circle key={j} cx={-80 + (j % 8) * 23} cy={j < 8 ? -56 : 56} r={6} fill="#9a5424" />
        ))}
        {i === 2 && (
          <text x={0} y={14} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={40} fill="#8a4a1e">
            Lotus
          </text>
        )}
      </g>
    ))}
  </g>
);

const Brick: React.FC<{texto: string; col: string}> = ({texto, col}) => (
  <g>
    <rect x={-70} y={-120} width={150} height={250} rx={10} fill="#2a1408" opacity={0.15} transform="translate(10 14)" />
    <path d="M-70,-90 L0,-140 L70,-90 L70,120 L-70,120 Z" fill="#f7f9fb" />
    <path d="M-70,-90 L0,-140 L70,-90 Z" fill="#dfe6ea" />
    <rect x={-70} y={-40} width={140} height={110} fill={col} />
    <text x={0} y={22} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={30} fill="#fff">
      {texto}
    </text>
    <rect x={18} y={-128} width={22} height={30} rx={4} fill="#5b8fc2" />
  </g>
);

const Tarrina: React.FC = () => (
  <g>
    <ellipse cx={14} cy={20} rx={140} ry={124} fill="#2a1408" opacity={0.15} />
    <ellipse rx={135} ry={118} fill="#e8eef2" />
    <ellipse rx={118} ry={100} fill="#fbfaf6" />
    <path d="M-80,-20 C-40,-60 40,-60 80,-20" stroke="#ece7dc" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M-60,30 C-20,0 30,0 70,30" stroke="#ece7dc" strokeWidth={8} fill="none" strokeLinecap="round" />
    <ellipse cx={-50} cy={-50} rx={34} ry={14} fill="#fff" opacity={0.8} />
    <ellipse rx={135} ry={118} fill="none" stroke="#5b8fc2" strokeWidth={10} />
  </g>
);

const Tarro: React.FC<{relleno: string; texto?: string}> = ({relleno, texto}) => (
  <g>
    <circle cx={12} cy={16} r={128} fill="#2a1408" opacity={0.15} />
    <circle r={124} fill="#eef3f4" opacity={0.95} />
    <circle r={106} fill={relleno} />
    <path d={blob(64, 5, 3, 0.18)} fill={aclara(relleno, 0.18)} />
    <path d="M-40,-10 C-20,-40 20,-40 40,-10 C20,10 -20,10 -40,-10 Z" fill={aclara(relleno, 0.3)} opacity={0.8} />
    <ellipse cx={-50} cy={-56} rx={30} ry={12} fill="#fff" opacity={0.6} />
    <circle r={124} fill="none" stroke="#fff" strokeWidth={8} opacity={0.7} />
    {texto && (
      <g transform="translate(0 92)">
        <rect x={-92} y={-26} width={184} height={52} rx={10} fill="#3a2414" />
        <text x={0} y={10} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={26} fill="#fff">
          {texto}
        </text>
      </g>
    )}
  </g>
);

const Esencia: React.FC = () => (
  <g transform="rotate(-18)">
    <rect x={-50} y={-90} width={110} height={220} rx={20} fill="#2a1408" opacity={0.15} transform="translate(10 14)" />
    <rect x={-50} y={-70} width={100} height={190} rx={22} fill="#6b3d27" opacity={0.85} />
    <rect x={-22} y={-120} width={44} height={56} rx={8} fill="#2a2a2a" />
    <rect x={-50} y={-10} width={100} height={70} fill="#f4ecdb" />
    <text x={0} y={34} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={26} fill="#6b3d27">
      vainilla
    </text>
    <rect x={-40} y={-60} width={14} height={160} rx={7} fill="#fff" opacity={0.25} />
  </g>
);

/** Icono de un ingrediente a partir de su texto ("250 g de galletas Lotus" → galletas) */
export const Icono: React.FC<{texto: string; tam?: number}> = ({texto, tam = 92}) => {
  const s = norm(texto);
  let el: React.ReactNode;
  if (/galleta/.test(s)) el = <Galletas />;
  else if (/nata|crema de leche/.test(s)) el = <Brick texto="NATA" col="#5b8fc2" />;
  else if (/queso/.test(s)) el = <Tarrina />;
  else if (/crema lotus|biscoff/.test(s)) el = <Tarro relleno="#b8692f" texto="LOTUS" />;
  else if (/nutella|crema de cacao/.test(s)) el = <Tarro relleno="#4e2a1a" />;
  else if (/dulce de leche|caramelo/.test(s)) el = <Tarro relleno="#c08040" />;
  else if (/leche condensada/.test(s)) el = <Tarro relleno="#f6ecd2" texto="CONDENSADA" />;
  else if (/vainilla|esencia|extracto/.test(s)) el = <Esencia />;
  else if (/maicena/.test(s)) el = <Ingrediente k="harina" />;
  else {
    const k = piezaDe(texto);
    el = k ? <Ingrediente k={k} /> : <Tarro relleno="#efe0c4" texto={texto.replace(/^[\d½¼¾.,/\s]+(g|gr|kg|ml|l|cl|cdas?|cditas?|cdtas?|cucharadas?|cucharaditas?)?\s*(de\s+)?/i, '').split(' ').slice(0, 1).join(' ').toUpperCase().slice(0, 10)} />;
  }
  return (
    <svg width={tam} height={tam} viewBox="-190 -190 380 380" style={{overflow: 'visible', flex: 'none'}}>
      {el}
    </svg>
  );
};

// ---------------- Ilustraciones de los pasos (lienzo 600 × 400, centro 300,200) ----------------
type IlusProps = {op: string[]; a: number; vivo: boolean; frame: number; tarta: Tarta};

const BolIlus: React.FC<{relleno: string; nivel?: number; textura?: 'liso' | 'migas' | 'montado'; frame: number; giro?: number}> = ({relleno, nivel = 0.75, textura = 'liso', frame, giro = 0}) => {
  const R = 170;
  const rc = (R - 26) * nivel;
  return (
    <g>
      <ellipse cx={20} cy={26} rx={R + 20} ry={R + 10} fill="url(#c-sombra)" />
      <circle r={R} fill="url(#c-ceramica)" />
      <circle r={R - 10} fill="none" stroke="#2f5f8f" strokeWidth={7} opacity={0.75} />
      <circle r={R - 22} fill="url(#c-interior)" />
      {nivel > 0.02 && textura === 'liso' && (
        <g>
          <circle r={rc} fill={relleno} />
          {Array.from({length: 5}).map((_, i) => {
            const rr = rc * (0.25 + i * 0.15), a0 = frame * 0.14 * giro + i;
            return <path key={i} d={`M${Math.cos(a0) * rr},${Math.sin(a0) * rr} A${rr},${rr} 0 0 1 ${Math.cos(a0 + 1.8) * rr},${Math.sin(a0 + 1.8) * rr}`} stroke={i % 2 ? aclara(relleno, 0.3) : oscurece(relleno, 0.08)} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.45} />;
          })}
          <ellipse cx={-rc * 0.35} cy={-rc * 0.38} rx={rc * 0.32} ry={rc * 0.12} fill="#fff" opacity={0.3} transform={`rotate(-30 ${-rc * 0.35} ${-rc * 0.38})`} />
        </g>
      )}
      {nivel > 0.02 && textura === 'migas' && <Monton x={0} y={0} r={rc} k="galleta" frame={frame} semilla={2} />}
      {nivel > 0.02 && textura === 'migas' && <circle r={rc * 0.98} fill={relleno} opacity={0.55} />}
      {nivel > 0.02 && textura === 'migas' &&
        Array.from({length: 40}).map((_, i) => {
          const a = rnd(i * 3) * Math.PI * 2, d = Math.sqrt(rnd(i * 3 + 1)) * rc * 0.9;
          return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={3 + rnd(i) * 7} fill={i % 3 ? oscurece(relleno, 0.12) : aclara(relleno, 0.2)} />;
        })}
      {nivel > 0.02 && textura === 'montado' && (
        <g>
          <circle r={rc} fill={relleno} />
          {Array.from({length: 9}).map((_, i) => {
            const a = (i / 9) * Math.PI * 2 + 0.3, d = i === 8 ? 0 : rc * 0.55;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d})`}>
                <path d={blob(38, 5, i, 0.2)} fill={aclara(relleno, 0.15)} />
                <path d="M-20,-6 C-10,-24 10,-24 20,-6" stroke={oscurece(relleno, 0.06)} strokeWidth={5} fill="none" strokeLinecap="round" />
                <circle cx={-8} cy={-12} r={7} fill="#fff" opacity={0.8} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

const MoldeDesmontable: React.FC<{capas: string[]; lleno: number; brillo?: boolean; frame: number}> = ({capas, lleno, brillo, frame}) => {
  const R = 165;
  const top = capas[capas.length - 1] ?? '#efe0c4';
  return (
    <g>
      <ellipse cx={20} cy={24} rx={R + 26} ry={R + 18} fill="url(#c-sombra)" />
      <circle r={R} fill="url(#c-metal-molde)" />
      <circle r={R - 10} fill="#3a3d42" />
      {/* cierre del aro */}
      <rect x={R - 14} y={-20} width={40} height={40} rx={8} fill="#8c9198" />
      {capas.length > 1 && <circle r={R - 14} fill={capas[0]} />}
      <circle r={(R - 14) * Math.sqrt(clamp(lleno))} fill={top} />
      {brillo && <ellipse cx={-50} cy={-60} rx={70} ry={22} fill="#fff" opacity={0.35 + 0.1 * Math.sin(frame * 0.1)} transform="rotate(-30 -50 -60)" />}
      {capas.length > 1 && lleno < 0.999 && <circle r={(R - 14) * Math.sqrt(clamp(lleno))} fill="none" stroke={aclara(top, 0.3)} strokeWidth={5} />}
    </g>
  );
};

const Chorrito: React.FC<{x0: number; y0: number; x1: number; y1: number; col: string; frame: number; ancho?: number}> = ({x0, y0, x1, y1, col, frame, ancho = 22}) => {
  const mx = (x0 + x1) / 2 + Math.sin(frame * 0.3) * 6;
  return (
    <g>
      <path d={`M${x0},${y0} Q${mx},${(y0 + y1) / 2} ${x1},${y1}`} stroke={oscurece(col, 0.12)} strokeWidth={ancho + 6} fill="none" strokeLinecap="round" />
      <path d={`M${x0},${y0} Q${mx},${(y0 + y1) / 2} ${x1},${y1}`} stroke={col} strokeWidth={ancho} fill="none" strokeLinecap="round" />
      <path d={`M${x0 - 3},${y0} Q${mx - 3},${(y0 + y1) / 2} ${x1 - 3},${y1}`} stroke="#fff" strokeWidth={ancho * 0.25} fill="none" strokeLinecap="round" opacity={0.5} />
      {[0, 1].map((i) => {
        const u = (frame * 0.04 + i / 2) % 1;
        return <circle key={i} cx={x1} cy={y1} r={ancho + 60 * u} fill="none" stroke={aclara(col, 0.35)} strokeWidth={4} opacity={0.6 * (1 - u)} />;
      })}
    </g>
  );
};

const Nevera: React.FC<{texto: string; frame: number; a: number}> = ({texto, frame, a}) => (
  <g>
    <rect x={-120} y={-170} width={240} height={340} rx={30} fill="#2a1408" opacity={0.15} transform="translate(14 18)" />
    <rect x={-120} y={-170} width={240} height={340} rx={30} fill="#eef3f6" />
    <rect x={-120} y={-170} width={240} height={340} rx={30} fill="none" stroke="#c9d3da" strokeWidth={6} />
    <line x1={-120} y1={-40} x2={120} y2={-40} stroke="#c9d3da" strokeWidth={6} />
    <rect x={80} y={-140} width={14} height={70} rx={7} fill="#9aa6ae" />
    <rect x={80} y={-10} width={14} height={110} rx={7} fill="#9aa6ae" />
    <g transform={`translate(-10 60) rotate(${frame * 0.6})`}>
      {[0, 60, 120].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <line x1={0} y1={-60} x2={0} y2={60} stroke="#5b8fc2" strokeWidth={10} strokeLinecap="round" />
          <path d="M-18,-42 L0,-26 L18,-42 M-18,42 L0,26 L18,42" stroke="#5b8fc2" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
    <g transform="translate(190 -90)">
      <circle r={78} fill="#fff" stroke="#3a2414" strokeWidth={8} />
      <path d={`M0,0 L0,-56`} stroke="#3a2414" strokeWidth={8} strokeLinecap="round" transform={`rotate(${a * 360})`} />
      <path d={`M0,0 L36,0`} stroke="#c8473c" strokeWidth={8} strokeLinecap="round" transform={`rotate(${a * 30 - 90})`} />
      <circle r={9} fill="#3a2414" />
      <text x={0} y={128} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={40} fill="#3a2414">
        {texto}
      </text>
    </g>
  </g>
);

const Cazo: React.FC<{col: string; frame: number; calor: number}> = ({col, frame, calor}) => (
  <g>
    {/* fuego de la placa */}
    {Array.from({length: 12}).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const l = 22 + 8 * Math.sin(frame * 0.5 + i);
      return <path key={i} d={`M${Math.cos(a) * 170},${Math.sin(a) * 170} L${Math.cos(a) * (170 + l)},${Math.sin(a) * (170 + l)}`} stroke="#4a8fe0" strokeWidth={10} strokeLinecap="round" opacity={0.7 * calor} />;
    })}
    <circle r={176} fill="none" stroke="#2b2d31" strokeWidth={14} />
    <rect x={130} y={-22} width={260} height={44} rx={22} fill="#2b2d31" />
    <circle r={150} fill="url(#c-acero)" />
    <circle r={132} fill={col} />
    {Array.from({length: 9}).map((_, i) => {
      const u = (frame * 0.03 + i / 9) % 1;
      const a = rnd(i * 4) * Math.PI * 2, d = Math.sqrt(rnd(i * 4 + 1)) * 100;
      return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={4 + 12 * u} fill="none" stroke={aclara(col, 0.4)} strokeWidth={3} opacity={calor * (1 - u)} />;
    })}
    <ellipse cx={-50} cy={-56} rx={46} ry={14} fill="#fff" opacity={0.3} transform="rotate(-30 -50 -56)" />
  </g>
);

/** Tarta vista desde arriba con decoración (rosetones que aparecen uno a uno) */
export const TartaArriba: React.FC<{tarta: Tarta; decor: number; frame: number; r?: number}> = ({tarta, decor, frame, r = 165}) => (
  <g>
    <ellipse cx={20} cy={26} rx={r + 60} ry={r + 50} fill="url(#c-sombra)" />
    <circle r={r + 44} fill="url(#c-ceramica)" />
    <circle r={r} fill={tarta.cobertura} />
    <circle r={r} fill="none" stroke={oscurece(tarta.cobertura, 0.15)} strokeWidth={6} />
    <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.38} ry={r * 0.12} fill="#fff" opacity={0.28} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.4})`} />
    {Array.from({length: 12}).map((_, i) => {
      const ap = clamp(decor * 12 - i);
      if (ap <= 0) return null;
      const a = (i / 12) * Math.PI * 2;
      return (
        <g key={i} transform={`translate(${Math.cos(a) * r * 0.8} ${Math.sin(a) * r * 0.8}) scale(${0.6 + 0.4 * io(ap)})`} opacity={ap}>
          <circle r={22} fill={oscurece(tarta.decor, 0.1)} />
          {Array.from({length: 6}).map((__, j) => (
            <path key={j} d="M0,0 C8,-14 16,-18 22,-8" stroke={aclara(tarta.decor, 0.15)} strokeWidth={6} fill="none" transform={`rotate(${j * 60 + frame * 0})`} strokeLinecap="round" />
          ))}
          <circle cx={-5} cy={-6} r={5} fill="#fff" opacity={0.5} />
        </g>
      );
    })}
    {tarta.galleta && decor > 0.5 && (
      <g transform={`scale(${io((decor - 0.5) * 2)}) rotate(-8)`}>
        <rect x={-62} y={-40} width={124} height={80} rx={14} fill="#b8692f" stroke="#8a4a1e" strokeWidth={4} />
        <text x={0} y={10} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={28} fill="#8a4a1e">
          Lotus
        </text>
      </g>
    )}
  </g>
);

export const Ilustracion: React.FC<IlusProps> = ({op, a, vivo, frame, tarta}) => {
  const [tipo, c1, c2] = op;
  const col1 = color(c1, tipo === 'triturar' ? '#a0612c' : '#efe0c4');
  const col2 = color(c2, '#efe0c4');
  const anim = vivo ? a : 1; // fuera de su momento se ve el resultado del paso
  let el: React.ReactNode = null;
  switch ((tipo || '').toLowerCase()) {
    case 'triturar':
      el = (
        <g transform="translate(300 210)">
          <BolIlus relleno={col1} nivel={lerp(0.25, 0.8, io(anim))} textura="migas" frame={frame} />
          {vivo &&
            [0, 1, 2].map((i) => {
              const u = clamp(a * 3 - i);
              if (u <= 0 || u >= 1) return null;
              return (
                <g key={i} transform={`translate(${lerp(190 - i * 40, 20, u)} ${lerp(-170, 0, u)}) rotate(${u * 90}) scale(${lerp(0.42, 0.2, u)})`} opacity={1 - u * 0.6}>
                  <Galletas />
                </g>
              );
            })}
        </g>
      );
      break;
    case 'batir':
    case 'mezclar':
      el = (
        <g transform="translate(300 210)">
          <BolIlus relleno={col1} nivel={0.8} frame={frame} giro={vivo ? 1 : 0} />
          <g transform={`translate(${vivo ? Math.cos(frame * 0.25) * 40 : 20} ${vivo ? Math.sin(frame * 0.25) * 30 : 10}) scale(0.62)`}>
            {tipo === 'batir' ? <Batidor ang={38 + (vivo ? Math.sin(frame * 0.2) * 8 : 0)} /> : <Espatula ang={34 + (vivo ? Math.sin(frame * 0.12) * 22 : 0)} />}
          </g>
        </g>
      );
      break;
    case 'montar':
      el = (
        <g transform="translate(300 210)">
          <BolIlus relleno={col1} nivel={lerp(0.55, 0.85, io(anim))} textura="montado" frame={frame} />
          <g transform={`translate(${vivo ? Math.cos(frame * 0.3) * 30 : 20} ${vivo ? Math.sin(frame * 0.3) * 24 : 10}) scale(0.62)`}>
            <Batidor ang={42} />
          </g>
        </g>
      );
      break;
    case 'molde':
      el = (
        <g>
          <g transform="translate(410 220)">
            <MoldeDesmontable capas={[col1, col2]} lleno={io(clamp(anim * 1.3))} frame={frame} />
          </g>
          {vivo && a < 0.75 && (
            <g transform="translate(150 120) rotate(30) scale(0.55)">
              <BolIlus relleno={col2} nivel={lerp(0.8, 0.2, a)} frame={frame} />
            </g>
          )}
          {vivo && a < 0.75 && <Chorrito x0={210} y0={150} x1={400} y1={210} col={col2} frame={frame} ancho={30} />}
        </g>
      );
      break;
    case 'nevera':
      el = (
        <g transform="translate(250 205) scale(0.9)">
          <Nevera texto={c1 ? `${c1} h` : ''} frame={vivo ? frame : 0} a={anim} />
        </g>
      );
      break;
    case 'calentar':
      el = (
        <g transform="translate(260 205) scale(0.95)">
          <Cazo col={col1} frame={frame} calor={vivo ? 1 : 0.5} />
        </g>
      );
      break;
    case 'verter':
    case 'cubrir':
      el = (
        <g>
          <g transform="translate(400 225)">
            <MoldeDesmontable capas={tipo === 'cubrir' ? [col2, col1] : [col1]} lleno={tipo === 'cubrir' ? io(clamp(anim * 1.2)) : io(anim)} brillo frame={frame} />
          </g>
          {vivo && a < 0.85 && (
            <>
              <g transform="translate(150 110) rotate(30) scale(0.52)">
                <BolIlus relleno={col1} nivel={lerp(0.8, 0.2, a)} frame={frame} />
              </g>
              <Chorrito x0={205} y0={140} x1={390} y1={215} col={col1} frame={frame} ancho={26} />
            </>
          )}
        </g>
      );
      break;
    case 'decorar':
      el = (
        <g transform="translate(300 210)">
          <TartaArriba tarta={tarta} decor={io(anim)} frame={frame} />
          {vivo && a < 0.95 && (
            <g transform={`translate(${Math.cos(a * Math.PI * 2 - 1.5) * 140 + 60} ${Math.sin(a * Math.PI * 2 - 1.5) * 140 - 90}) rotate(-35)`}>
              <path d="M-30,-160 L30,-160 L8,-10 L-8,-10 Z" fill="#f1e7d6" stroke="#d8ccb6" strokeWidth={4} />
              <path d="M-20,-160 L20,-160 L6,-60 L-6,-60 Z" fill={tarta.decor} opacity={0.8} />
              <path d="M-8,-10 L8,-10 L0,8 Z" fill="#c9cdd2" />
            </g>
          )}
        </g>
      );
      break;
    case 'hornear':
      el = (
        <g transform="translate(300 205)">
          <rect x={-230} y={-170} width={460} height={340} rx={26} fill="url(#c-acero)" />
          <rect x={-200} y={-150} width={400} height={60} rx={12} fill="#26282c" />
          <text x={0} y={-106} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={40} fill="#ffb347">
            {c1 ? `${c1}°` : 'ON'}
          </text>
          <rect x={-180} y={-70} width={360} height={210} rx={18} fill="#16100d" />
          <rect x={-180} y={-70} width={360} height={210} rx={18} fill="url(#c-calor)" opacity={vivo ? 0.9 + 0.1 * Math.sin(frame * 0.3) : 0.6} />
          <path d={`M-150,${90} L150,${90} L140,${130} L-140,${130} Z`} fill="#7c8188" />
          <path d={`M-146,90 C-80,${70 - 50 * anim} 80,${70 - 50 * anim} 146,90 Z`} fill={lerp(0, 1, anim) > 0.6 ? '#cf8a46' : col1} />
        </g>
      );
      break;
    case 'cortar':
      el = (
        <g transform="translate(300 220) scale(0.95)">
          <TartaArriba tarta={tarta} decor={1} frame={frame} />
        </g>
      );
      break;
    default:
      el = (
        <g transform="translate(300 210)">
          <BolIlus relleno={col1} nivel={0.7} frame={frame} />
        </g>
      );
  }
  return (
    <svg width={600} height={400} viewBox="0 0 600 400" style={{display: 'block', overflow: 'visible'}}>
      {el}
    </svg>
  );
};

// ---------------- Tarta de portada en 3/4 (capas y porción quitada) ----------------
export const TartaHero: React.FC<{tarta: Tarta; frame: number; aparece: number}> = ({tarta, frame, aparece}) => {
  const rx = 330, ry = 120, h = 240, cy = 0;
  const capas = [
    {c: tarta.base, h: 0.2},
    {c: tarta.relleno, h: 0.66},
    {c: tarta.cobertura, h: 0.14},
  ];
  // porción quitada: cuña hacia el espectador, de -25° a 25° alrededor de 90° (abajo)
  const a1 = (62 * Math.PI) / 180, a2 = (118 * Math.PI) / 180;
  const px = (a: number) => Math.cos(a) * rx, py = (a: number) => Math.sin(a) * ry;
  const flota = Math.sin(frame * 0.04) * 4;
  let acc = 0;
  return (
    <g transform={`translate(0 ${flota}) scale(${lerp(0.9, 1, io(aparece))})`} opacity={clamp(aparece * 2)}>
      <ellipse cx={20} cy={h + 70} rx={rx + 120} ry={ry + 50} fill="url(#c-sombra)" />
      <ellipse cx={0} cy={h + 30} rx={rx + 90} ry={ry + 40} fill="url(#c-ceramica)" />
      {/* lateral por capas */}
      {capas.map((cp, i) => {
        const y0 = cy + h * (1 - acc - cp.h), y1 = cy + h * (1 - acc);
        acc += cp.h;
        return <path key={i} d={`M${-rx},${y0} A${rx},${ry} 0 0 0 ${rx},${y0} L${rx},${y1} A${rx},${ry} 0 0 1 ${-rx},${y1} Z`} fill={oscurece(cp.c, 0.08)} />;
      })}
      {/* hueco de la porción: se ven las capas por dentro */}
      <path d={`M0,${cy} L${px(a1)},${py(a1) + cy} L${px(a1)},${py(a1) + cy + h} L0,${cy + h} Z`} fill={oscurece(tarta.relleno, 0.12)} />
      <path d={`M0,${cy} L${px(a2)},${py(a2) + cy} L${px(a2)},${py(a2) + cy + h} L0,${cy + h} Z`} fill={tarta.relleno} />
      <path d={`M0,${cy + h * 0.8} L${px(a2)},${py(a2) + cy + h * 0.8} L${px(a2)},${py(a2) + cy + h} L0,${cy + h} Z`} fill={tarta.base} />
      <path d={`M0,${cy} L${px(a2)},${py(a2) + cy} L${px(a2)},${py(a2) + cy + h * 0.14} L0,${cy + h * 0.14} Z`} fill={tarta.cobertura} />
      {Array.from({length: 14}).map((_, i) => (
        <circle key={i} cx={px(a2) * (0.15 + rnd(i) * 0.8)} cy={py(a2) * (0.15 + rnd(i) * 0.8) + cy + h * (0.25 + rnd(i + 3) * 0.5)} r={3 + rnd(i + 1) * 4} fill={oscurece(tarta.relleno, 0.15)} opacity={0.5} />
      ))}
      {/* tapa con la cuña quitada */}
      <path d={`M0,${cy} L${px(a2)},${py(a2) + cy} A${rx},${ry} 0 1 1 ${px(a1)},${py(a1) + cy} Z`} fill={tarta.cobertura} />
      <ellipse cx={-120} cy={cy - 50} rx={150} ry={34} fill="#fff" opacity={0.25} />
      {/* rosetones alrededor */}
      {Array.from({length: 13}).map((_, i) => {
        const a = (i / 13) * Math.PI * 2 + 0.2;
        if (a > a1 - 0.15 && a < a2 + 0.15) return null;
        const x = Math.cos(a) * rx * 0.84, y = Math.sin(a) * ry * 0.84 + cy;
        const s = 0.8 + 0.25 * (Math.sin(a) + 1) / 2;
        return (
          <g key={i} transform={`translate(${x} ${y - 20 * s}) scale(${s})`}>
            <path d="M-26,20 C-30,0 -16,-24 0,-34 C16,-24 30,0 26,20 Z" fill={tarta.decor} />
            <path d="M-14,12 C-14,-4 -6,-16 0,-22 M14,12 C14,-4 6,-16 0,-22" stroke={oscurece(tarta.decor, 0.2)} strokeWidth={4} fill="none" />
            <ellipse cx={-6} cy={-12} rx={5} ry={9} fill="#fff" opacity={0.35} />
          </g>
        );
      })}
      {tarta.galleta && (
        <g transform={`translate(0 ${cy - 34}) rotate(-6) scale(1 0.55)`}>
          <rect x={-90} y={-58} width={180} height={116} rx={20} fill="#b8692f" stroke="#8a4a1e" strokeWidth={5} />
          <text x={0} y={16} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={46} fill="#8a4a1e">
            Lotus
          </text>
        </g>
      )}
      {/* migas sobre el plato */}
      {Array.from({length: 18}).map((_, i) => (
        <circle key={`m${i}`} cx={-380 + rnd(i * 2) * 760} cy={h + 30 + (rnd(i * 2 + 1) - 0.5) * 90} r={4 + rnd(i) * 7} fill={tarta.base} opacity={0.8} />
      ))}
    </g>
  );
};

/** Porción vista de lado: el corte con todas las capas */
export const Porcion: React.FC<{tarta: Tarta; frame: number; aparece: number}> = ({tarta, frame, aparece}) => {
  const e = io(aparece);
  const capas = [
    {c: tarta.cobertura, h: 52},
    {c: tarta.relleno, h: 250},
    {c: tarta.base, h: 80},
  ];
  let y = -190;
  return (
    <g transform={`translate(${lerp(120, 0, e)} 0) rotate(${lerp(6, 0, e)})`} opacity={clamp(aparece * 2)}>
      <ellipse cx={30} cy={230} rx={470} ry={70} fill="url(#c-sombra)" />
      <ellipse cx={0} cy={210} rx={440} ry={70} fill="url(#c-ceramica)" />
      {/* parte de arriba de la porción (triángulo en perspectiva) */}
      <path d={`M-330,-190 L330,-190 L180,-260 Z`} fill={aclara(tarta.cobertura, 0.08)} />
      {capas.map((cp, i) => {
        const y0 = y;
        y += cp.h;
        return (
          <g key={i}>
            <path d={`M-330,${y0} L330,${y0} L330,${y} L-330,${y} Z`} fill={cp.c} />
            {i === 1 &&
              Array.from({length: 40}).map((_, j) => (
                <ellipse key={j} cx={-310 + rnd(j * 2) * 620} cy={y0 + 15 + rnd(j * 2 + 1) * (cp.h - 30)} rx={3 + rnd(j) * 7} ry={2 + rnd(j + 2) * 4} fill={oscurece(cp.c, 0.1)} opacity={0.6} />
              ))}
            {i === 2 &&
              Array.from({length: 50}).map((_, j) => (
                <circle key={j} cx={-320 + rnd(j * 5) * 640} cy={y0 + 6 + rnd(j * 5 + 1) * (cp.h - 12)} r={3 + rnd(j) * 6} fill={j % 2 ? oscurece(cp.c, 0.2) : aclara(cp.c, 0.15)} />
              ))}
          </g>
        );
      })}
      <path d={`M-330,-190 L330,-190 L180,-260 Z`} fill="none" stroke={oscurece(tarta.cobertura, 0.2)} strokeWidth={4} />
      <rect x={-330} y={-190} width={660} height={8} fill="#fff" opacity={0.3} />
      {/* rosetón y galleta encima */}
      <g transform="translate(120 -232)">
        <path d="M-36,20 C-40,-6 -22,-38 0,-50 C22,-38 40,-6 36,20 Z" fill={tarta.decor} />
        <path d="M-18,12 C-18,-6 -8,-22 0,-30 M18,12 C18,-6 8,-22 0,-30" stroke={oscurece(tarta.decor, 0.2)} strokeWidth={5} fill="none" />
      </g>
      {tarta.galleta && (
        <g transform="translate(-120 -236) rotate(-10)">
          <rect x={-70} y={-46} width={140} height={92} rx={16} fill="#b8692f" stroke="#8a4a1e" strokeWidth={4} />
          <text x={0} y={12} textAnchor="middle" fontFamily="Playfair Display" fontStyle="italic" fontWeight={700} fontSize={34} fill="#8a4a1e">
            Lotus
          </text>
        </g>
      )}
      {/* tenedor */}
      <g transform={`translate(380 120) rotate(${-30 + Math.sin(frame * 0.05) * 2})`}>
        <rect x={-14} y={-20} width={28} height={300} rx={14} fill="url(#c-acero)" />
        {[-24, -8, 8, 24].map((x) => (
          <rect key={x} x={x - 4} y={-140} width={8} height={130} rx={4} fill="url(#c-acero)" />
        ))}
        <rect x={-30} y={-30} width={60} height={30} rx={10} fill="url(#c-acero)" />
      </g>
    </g>
  );
};
