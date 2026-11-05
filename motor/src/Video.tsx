import React from 'react';
import {AbsoluteFill, Html5Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, W, amiri, sans, serif} from './tema';
import {back, easeOut, lerp, prog} from './util';
import {Subtitulo, trozosEs} from './Subtitulos';
import {ESCENAS, FOCOS} from './dibujos';
import {Camara2D} from './dibujos/camara2d';
import {COLORES, ELEMENTOS} from './dibujos/elementos';
import {Estrella8Fondo} from './dibujos/fondo';
import {ThreeCanvas} from '@remotion/three';
import {MUNDOS} from './mundos';
import {MundoCocina} from './cocina/Mundo';
import type {DatosCocina} from './cocina/estado';
import {ViajeInfografia, DatosInfografia} from './infografia/Viaje';
import {FichaViaje, PortadaFicha} from './ficha/Ficha';
import type {DatosFicha} from './ficha/datos';
import type {Tramo} from './mundos/camara';

// Formatos:
//  historia → un dibujo animado por frase (planos con escena), subtítulos abajo
//  hikma    → fondo de color + elemento dibujado, POV arriba, frase grande en el centro
//  leccion  → un clip de vídeo por frase, subtítulos abajo
//  pov      → 1–2 clips de fondo para todo el vídeo, POV arriba, frase grande en el centro
export type Modo = 'historia' | 'hikma' | 'leccion' | 'pov' | 'cocina' | 'infografia' | 'ficha';

export type Linea = {
  es: string; // frase en español
  ini: number; // segundos
  fin: number;
  arabe?: string | null; // refrán/aleya que sale también en árabe (hikma y pov)
};
export type Plano = {
  clip?: string | null; // clip vertical preparado en public/
  escena?: string | null; // dibujo (historia)
  opts?: string[];
  k?: number; // fotograma clave local (historia)
  texto: string; // tarjeta de texto (frase grande) si no hay clip ni escena
  arabe?: string | null; // en la tarjeta de texto: la frase en árabe encima (recetas en darija)
  ingredientes?: string[]; // tarjeta de ingredientes
  li?: number; // línea del guion con la que empieza el plano
  a: number; // fotograma inicial
  b: number; // fotograma final
};
export type VideoProps = {
  audio: string | null;
  modo: Modo;
  lineas: Linea[];
  planos: Plano[];
  pov: string | null;
  color?: string | null; // hikma: nombre de COLORES o #hex
  elemento?: string | null; // hikma: nombre de ELEMENTOS
  mundo?: string | null; // historia en 3D: nombre de MUNDOS
  tramos?: Tramo[]; // historia en 3D: a qué plano va la cámara y cuándo
  idioma?: 'es' | 'darija';
  cocina?: DatosCocina; // formato cocina: acciones, ingredientes y piezas de la mesa
  infografia?: DatosInfografia; // formato infografía viva (su imagen)
  ficha?: DatosFicha; // formato ficha (infografía generada)
  aviso?: string | null;
  fondo3d?: string | null; // truco/historia: clip de la tarta 3D girando de fondo // "Receta completa en la descripción": sale al principio, en la portada y en el cierre
  firma: string;
  cierre: string;
  finVoz: number;
  duracion: number;
  portada?: boolean;
};

const centrado = (m: Modo) => m === 'hikma' || m === 'pov';

const Velo: React.FC<{modo: Modo}> = ({modo}) => (
  <AbsoluteFill
    style={{
      background:
        modo === 'pov'
          ? 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 25%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.7) 100%)'
          : modo === 'hikma'
            ? 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.03) 22%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.7) 100%)',
    }}
  />
);

const fondoTarjeta = 'radial-gradient(ellipse at 50% 35%, #4a2f22 0%, #24160f 55%, #120b08 100%)';

/** Tarjeta de texto: la frase en español grande (y el árabe encima si la receta va en darija) */
const TarjetaTexto: React.FC<{texto: string; arabe?: string | null; f: number}> = ({texto: t0, arabe, f}) => {
  const texto = t0.replace(/(\d)\s+(°C|°|º|g|gr|kg|ml|l|min|minutos|h|horas)\b/g, '$1\u00a0$2').replace(/(\d)\s+(°C|°|º)/g, '$1\u00a0$2');
  const e = easeOut(prog(f, 0, 18));
  const e2 = easeOut(prog(f, 8, 18));
  return (
    <AbsoluteFill style={{background: fondoTarjeta, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 520, width: 160, height: 2, background: C.oro, opacity: e}} />
      {arabe && (
        <div dir="rtl" style={{position: 'absolute', top: 580, left: 110, right: 110, textAlign: 'center', fontFamily: amiri, fontWeight: 700, fontSize: 70, lineHeight: 1.5, color: C.oro, opacity: e, transform: `translateY(${lerp(16, 0, e)}px)`}}>
          {arabe}
        </div>
      )}
      <div style={{position: 'absolute', top: arabe ? 820 : 620, left: 110, right: 110, textAlign: 'center', fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 82, lineHeight: 1.22, color: C.crema, opacity: arabe ? e2 : e, transform: `translateY(${lerp(20, 0, arabe ? e2 : e)}px)`, textShadow: '0 4px 30px rgba(0,0,0,0.5)'}}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

/** Tarjeta de ingredientes: el título y cada ingrediente entrando uno a uno */
const TarjetaIngredientes: React.FC<{items: string[]; f: number; d: number}> = ({items, f, d}) => {
  const e = easeOut(prog(f, 0, 16));
  const paso = Math.max(4, Math.min(12, (d * 0.4) / Math.max(1, items.length)));
  const tam = items.length > 8 ? 50 : items.length > 6 ? 58 : 66;
  const alto = 230 + items.length * tam * 1.77;
  const top = Math.max(240, Math.round((1920 - alto) / 2) - 60);
  return (
    <AbsoluteFill style={{background: fondoTarjeta}}>
      <div style={{position: 'absolute', top, width: W, textAlign: 'center', opacity: e, transform: `translateY(${lerp(16, 0, e)}px)`}}>
        <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 96, color: C.oro}}>Ingredientes</div>
        <div style={{width: 140, height: 2, background: C.oro, margin: '30px auto 0', opacity: 0.7}} />
      </div>
      <div style={{position: 'absolute', top: top + 230, left: 140, right: 110}}>
        {items.map((it, i) => {
          const ei = easeOut(prog(f, 10 + i * paso, 12));
          const m = it.match(/^([\d½¼¾.,/]+\s*(?:g|gr|kg|ml|l|cl|cdas?|cditas?|cucharadas?|cucharaditas?|tazas?|vasos?|sobres?|pizcas?)?\.?)\s+(.*)$/i);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 26, marginBottom: tam * 0.62, opacity: ei, transform: `translateX(${lerp(-30, 0, ei)}px)`, fontFamily: sans, fontWeight: 700, fontSize: tam, lineHeight: 1.15, color: C.crema}}>
              <span style={{width: 14, height: 14, borderRadius: 7, background: C.oro, flex: 'none', transform: 'translateY(-8px)'}} />
              <span>
                {m ? (
                  <>
                    <span style={{color: C.oro, fontWeight: 800}}>{m[1]}</span> {m[2]}
                  </>
                ) : (
                  it
                )}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Pastilla "Receta completa en la descripción" con flecha hacia abajo */
const Aviso: React.FC<{texto: string; o: number; y: number; pop?: number}> = ({texto, o, y, pop = 1}) => (
  <div style={{position: 'absolute', top: y, width: W, display: 'flex', justifyContent: 'center', opacity: o}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18, background: C.oro, color: '#2a1408', fontFamily: sans, fontWeight: 800, fontSize: 40, padding: '18px 34px', borderRadius: 999, boxShadow: '0 12px 34px rgba(0,0,0,0.4)', transform: `scale(${0.85 + 0.15 * pop})`}}>
      {texto}
      <svg width={34} height={34} viewBox="0 0 34 34">
        <circle cx={17} cy={17} r={16} fill="#2a1408" />
        <path d="M17 9 L17 24 M10 18 L17 25 L24 18" stroke={C.oro} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

const Pov: React.FC<{texto: string; frame: number}> = ({texto, frame}) => {
  const e = easeOut(prog(frame, 0, 14));
  const m = texto.match(/^(POV\s*:?)\s*(.*)$/i);
  return (
    <div style={{position: 'absolute', top: 250, left: 90, right: 90, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 50, lineHeight: 1.25, color: C.crema, opacity: e, textShadow: '0 2px 4px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.5)'}}>
      {m ? (
        <>
          <span style={{fontWeight: 800}}>{m[1].toUpperCase().replace(/\s*:?$/, ':')}</span> {m[2]}
        </>
      ) : (
        texto
      )}
    </div>
  );
};

/** Fondo de la hikma: degradado de color, estrellas de zellige muy suaves y el elemento flotando */
const FondoHikma: React.FC<{color?: string | null; elemento?: string | null; frame: number; ocultar: number}> = ({color, elemento, frame, ocultar}) => {
  const [c1, c2] = color && COLORES[color] ? COLORES[color] : color && color.startsWith('#') ? [color, color] : COLORES.ciruela;
  const el = elemento && ELEMENTOS[elemento] ? ELEMENTOS[elemento] : ELEMENTOS.luna;
  const e = easeOut(prog(frame, 4, 20));
  const flota = Math.sin(frame * 0.04) * 10;
  return (
    <AbsoluteFill style={{background: `linear-gradient(170deg, ${c2} 0%, ${c1} 75%)`}}>
      <Estrella8Fondo frame={frame} />
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="hk-halo">
            <stop offset="0" stopColor="#ffe3a0" stopOpacity={0.45} />
            <stop offset="0.5" stopColor="#ffe3a0" stopOpacity={0.12} />
            <stop offset="1" stopColor="#ffe3a0" stopOpacity={0} />
          </radialGradient>
        </defs>
        <g opacity={e * (1 - ocultar)} transform={`translate(540 ${590 + flota}) scale(${0.75 + 0.25 * e})`}>
          <circle r={260} fill="url(#hk-halo)" />
          {el(frame)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const Video: React.FC<VideoProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const modo: Modo = p.modo ?? (p.pov !== null && p.pov !== undefined ? 'pov' : 'leccion');
  const finVozF = Math.round(p.finVoz * fps);
  let actual = 0;
  p.lineas.forEach((l, i) => {
    if (i === 0 || frame >= Math.round(l.ini * fps) - 4) actual = i;
  });
  const cierre = easeOut(prog(frame, finVozF + 8, 16));
  const l0 = p.lineas[0];
  const la = p.lineas[actual];
  const ultimo = p.planos.length - 1;
  const arabeE = la.arabe ? easeOut(prog(frame, Math.round(la.ini * fps) - 4, 14)) : 0;
  const centro = centrado(modo);
  // En las tarjetas (ingredientes o frase grande) el texto ya está en pantalla: sin subtítulo
  const plAhora = modo === 'leccion' || modo === 'cocina' || modo === 'infografia' || modo === 'ficha' ? p.planos.find((pl, i) => frame >= pl.a && (modo !== 'leccion' ? frame < pl.b : i === p.planos.length - 1 || frame < p.planos[i + 1].a)) : undefined;
  const enTarjeta = !!plAhora && !plAhora.clip && !plAhora.escena && (plAhora.li === undefined || plAhora.li === actual);

  if (p.portada && modo === 'ficha' && p.ficha) return <PortadaFicha d={p.ficha} gancho={l0.es} />;
  return (
    <AbsoluteFill style={{backgroundColor: C.noche, overflow: 'hidden'}}>
      {(modo === 'cocina' && p.cocina) || (modo === 'infografia' && p.infografia) || (modo === 'ficha' && p.ficha) ? (
        <>
          {modo === 'cocina' && p.cocina ? <MundoCocina d={p.cocina} /> : modo === 'ficha' ? <FichaViaje d={p.ficha!} /> : <ViajeInfografia d={p.infografia!} />}
          {p.planos.map((pl, i) => {
            const op = Math.min(prog(frame, pl.a, 10), 1 - prog(frame, pl.b - 10, 10));
            return (
              <Sequence key={i} from={pl.a} durationInFrames={pl.b - pl.a}>
                <Plano pl={pl} d={pl.b - pl.a} opacidad={op} />
              </Sequence>
            );
          })}
        </>
      ) : modo === 'hikma' ? (
        p.fondo3d ? (
          <AbsoluteFill>
            <OffthreadVideo src={staticFile(p.fondo3d)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(30,16,10,0.72) 0%, rgba(30,16,10,0.5) 30%, rgba(30,16,10,0.2) 55%, rgba(30,16,10,0) 70%, rgba(30,16,10,0.35) 100%)'}} />
          </AbsoluteFill>
        ) : (
          <FondoHikma color={p.color} elemento={p.elemento} frame={frame} ocultar={arabeE} />
        )
      ) : modo === 'historia' && p.mundo && MUNDOS[p.mundo] ? (
        <Mundo3D nombre={p.mundo} tramos={p.tramos ?? []} />
      ) : (
        p.planos.map((pl, i) => {
          const a = pl.a, b = i === ultimo ? durationInFrames : pl.b;
          const op = Math.min(i === 0 ? 1 : prog(frame, a, 10), 1 - prog(frame, b - 10, 10));
          return (
            <Sequence key={i} from={a} durationInFrames={b - a}>
              <Plano pl={pl} d={b - a} opacidad={op} />
            </Sequence>
          );
        })
      )}
      {modo !== 'cocina' && modo !== 'infografia' && modo !== 'ficha' && <Velo modo={modo} />}

      {centro && p.pov && <Pov texto={p.pov} frame={frame} />}

      {(centro || modo === 'historia') && la.arabe && !p.portada && frame < finVozF + 6 && (
        <div dir="rtl" style={{position: 'absolute', top: centro ? 540 : 420, left: 80, right: 80, textAlign: 'center', fontFamily: amiri, fontWeight: 700, fontSize: 88, lineHeight: 1.5, color: C.oro, opacity: arabeE, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>
          {la.arabe}
        </div>
      )}

      {!p.portada && frame < finVozF + 6 && !enTarjeta && <Subtitulo es={la.es} ini={la.ini} fin={la.fin} frame={frame} fps={fps} centro={centro} arriba={modo === 'cocina' || modo === 'infografia' || modo === 'ficha'} top={p.fondo3d ? 400 : undefined} />}

      {modo !== 'cocina' && modo !== 'infografia' && modo !== 'ficha' && (
        <div style={{position: 'absolute', top: 150, width: W, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: C.tenue}}>
          {p.firma}
        </div>
      )}

      {p.portada && (
        <div style={{position: 'absolute', top: centro ? 760 : 1060, left: 90, right: 90, height: centro ? 420 : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 84, lineHeight: 1.15, color: C.crema, textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>
          <div>
            {trozosEs(l0.es)
              .flat()
              .map((w, i) => (
                <span key={i} style={{color: w.key ? C.oro : C.crema}}>
                  {w.w}{' '}
                </span>
              ))}
          </div>
        </div>
      )}

      {p.aviso && (p.portada || frame < fps * 4.6) && (
        <Aviso texto={p.aviso} y={1600} o={p.portada ? 1 : Math.min(prog(frame, fps * 0.6, 8), 1 - prog(frame, fps * 4.1, 10))} pop={p.portada ? 1 : back(prog(frame, fps * 0.6, 10))} />
      )}

      {cierre > 0 && (
        <AbsoluteFill style={{background: `rgba(18,11,8,${cierre})`, alignItems: 'center', justifyContent: 'center'}}>
          <div style={{opacity: cierre, transform: `translateY(${lerp(24, 0, cierre)}px)`, textAlign: 'center', padding: '0 120px'}}>
            <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 76, lineHeight: 1.25, color: C.crema}}>{p.cierre}</div>
            <div style={{width: 120, height: 2, background: C.oro, margin: '44px auto'}} />
            <div style={{fontFamily: sans, fontWeight: 800, fontSize: 44, color: C.oro, letterSpacing: 1}}>{p.firma}</div>
          </div>
          {p.aviso && <Aviso texto={p.aviso} y={1380} o={cierre} pop={back(prog(frame, finVozF + 14, 12))} />}
        </AbsoluteFill>
      )}

      {p.audio && !p.portada && <Html5Audio src={staticFile(p.audio)} />}
    </AbsoluteFill>
  );
};

const Plano: React.FC<{pl: Plano; d: number; opacidad: number}> = ({pl, d, opacidad}) => {
  const f = useCurrentFrame();
  if (pl.escena && ESCENAS[pl.escena]) {
    const E = ESCENAS[pl.escena];
    return (
      <AbsoluteFill style={{opacity: opacidad}}>
        <Camara2D f={f} d={d} semilla={[...pl.escena].reduce((a, c) => a + c.charCodeAt(0), 0)} foco={FOCOS[pl.escena]}>
          <E f={f} d={d} k={pl.k ?? Math.round(d * 0.4)} opts={pl.opts ?? []} />
        </Camara2D>
      </AbsoluteFill>
    );
  }
  if (pl.ingredientes?.length) {
    return (
      <AbsoluteFill style={{opacity: opacidad}}>
        <TarjetaIngredientes items={pl.ingredientes} f={f} d={d} />
      </AbsoluteFill>
    );
  }
  if (!pl.clip) {
    return (
      <AbsoluteFill style={{opacity: opacidad}}>
        <TarjetaTexto texto={pl.texto} arabe={pl.arabe} f={f} />
      </AbsoluteFill>
    );
  }
  const zoom = 1.02 + 0.06 * (f / Math.max(1, d));
  return (
    <AbsoluteFill style={{opacity: opacidad, transform: `scale(${zoom})`}}>
      <OffthreadVideo src={staticFile(pl.clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

/** Historia en 3D: un único mundo continuo por el que viaja la cámara */
const Mundo3D: React.FC<{nombre: string; tramos: Tramo[]}> = ({nombre, tramos}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const M = MUNDOS[nombre];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={W} height={1920} gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 44, near: 0.05, far: 600}}>
        <M t={f / fps} T={durationInFrames / fps} tramos={tramos} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
