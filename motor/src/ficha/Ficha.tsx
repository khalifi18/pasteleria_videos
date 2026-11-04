// Ficha: la infografía de la receta (portada, ingredientes, pasos, porción) y la cámara que la recorre.
// Cuando la cámara llega a un bloque, ese bloque cobra vida: los ingredientes se marcan uno a uno,
// la ilustración del paso se anima y al acabar el paso aparece un ✓ que se queda.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Defs} from '../cocina/piezas';
import {Caja, DatosFicha, FW, FILA_INGR, camara, io, maqueta, tartaDe, visita} from './datos';
import {Icono, Ilustracion, Porcion, TartaHero} from './dibujos';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sans = 'Montserrat', serif = 'Playfair Display';
const TINTA = '#3a2414', ACENTO = '#8f2f3a', PAPEL = '#f7efe3';

const ROTULOS: Record<string, string> = {
  base: 'Para la base', crema: 'Para la crema', cobertura: 'Para la cobertura', decorar: 'Para decorar', masa: 'Para la masa',
  relleno: 'Para el relleno', frosting: 'Para el frosting', bizcocho: 'Para el bizcocho', almibar: 'Para el almíbar', glaseado: 'Para el glaseado',
  mousse: 'Para la mousse', inserto: 'Para el inserto', laminado: 'Para el laminado', pintar: 'Para pintar',
};
const rotulo = (g: string) => (ROTULOS[g.toLowerCase()] ?? (/^para /i.test(g) ? g : `Para ${g}`)).toUpperCase();

const cajaStyle = (c: Caja): React.CSSProperties => ({position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h});

/** Cantidad en negrita delante: "250 g de galletas" → [250 g] de galletas */
const partir = (s: string) => {
  const m = s.match(/^([\d½¼¾.,/–-]+\s*(?:g|gr|kg|ml|l|cl|cdas?\.?|cditas?\.?|cdtas?\.?|cucharadas?|cucharaditas?|tazas?|vasos?|sobres?|pizcas?|unidades?)?)\s+(.*)$/i);
  return m ? [m[1], m[2]] : ['', s];
};

const Banda: React.FC<{texto: string; c: Caja}> = ({texto, c}) => (
  <div style={{...cajaStyle(c), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{position: 'relative', padding: '18px 70px', background: ACENTO, borderRadius: '14px 40px 18px 34px', transform: 'rotate(-1.5deg)', boxShadow: '0 10px 24px rgba(58,36,20,0.25)'}}>
      <span style={{fontFamily: sans, fontWeight: 800, fontSize: 60, letterSpacing: 6, color: '#fff'}}>{texto}</span>
    </div>
  </div>
);

export const FichaMundo: React.FC<{d: DatosFicha; t: number; frame: number; estatica?: boolean}> = ({d, t, frame, estatica}) => {
  const m = maqueta(d);
  const tarta = tartaDe(d);
  const T = estatica ? 1e6 : t;
  const vivoEn = (zona: string) => {
    const v = visita(d, zona);
    if (!v || estatica) return {vivo: false, a: 1, hecho: !!estatica || (v ? T > v.fin : false), activo: false};
    const dur = Math.max(1.2, v.fin - v.ini);
    const a = clamp((T - v.ini - 0.4) / dur);
    return {vivo: T >= v.ini - 0.3 && T <= v.fin + 0.3, a, hecho: T > v.fin, activo: T >= v.ini - 0.3 && T <= v.fin + 0.3};
  };
  const portadaV = vivoEn('portada');
  const ingrTodo = vivoEn('ingredientes');
  const final = vivoEn('porcion');
  const [t1, t2] = d.titulo;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: FW, height: m.alto, background: PAPEL, overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <Defs />
      </svg>
      {/* papel: luz cálida y puntitos */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 900px 700px at 20% 8%, rgba(255,250,240,0.9), rgba(255,250,240,0) 70%), radial-gradient(ellipse 1000px 900px at 85% 55%, rgba(232,206,170,0.35), rgba(232,206,170,0) 70%)'}} />
      <svg width={FW} height={m.alto} style={{position: 'absolute', inset: 0, opacity: 0.35}}>
        {Array.from({length: Math.floor(m.alto / 60)}).map((_, r) =>
          Array.from({length: 27}).map((__, c) => <circle key={`${r}-${c}`} cx={c * 60 + (r % 2) * 30} cy={r * 60} r={2} fill="#d9c3a3" />),
        )}
      </svg>

      {/* ---------- Portada ---------- */}
      <div style={cajaStyle(m.portada)}>
        <div style={{position: 'absolute', left: 90, top: 70, fontFamily: sans, fontWeight: 800, fontSize: 92, letterSpacing: 2, color: TINTA}}>{t1.toUpperCase()}</div>
        <div style={{position: 'absolute', left: 70, top: 120, fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 290, lineHeight: 1.05, color: '#b0602a', textShadow: '0 8px 0 rgba(58,36,20,0.12)', whiteSpace: 'nowrap'}}>{t2}</div>
        <div style={{position: 'absolute', left: 80, top: 470, padding: '16px 40px', background: TINTA, borderRadius: '10px 30px 12px 26px', transform: 'rotate(-2deg)'}}>
          <span style={{fontFamily: sans, fontWeight: 800, fontSize: 40, letterSpacing: 2, color: '#fbf3e6'}}>{d.lema.toUpperCase()}</span>
        </div>
        <div style={{position: 'absolute', left: 90, top: 640, display: 'flex', flexDirection: 'column', gap: 22}}>
          {d.datos.map((x, i) => {
            const e = estatica ? 1 : io(clamp((T - 0.8 - i * 0.35) / 0.4));
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: e, transform: `translateX(${(1 - e) * -30}px)`}}>
                <span style={{width: 18, height: 18, borderRadius: 9, background: '#b0602a', boxShadow: '0 0 0 6px rgba(176,96,42,0.2)'}} />
                <span style={{fontFamily: sans, fontWeight: 800, fontSize: 40, color: TINTA}}>{x}</span>
              </div>
            );
          })}
        </div>
        {d.t3d ? (
          <div style={{position: 'absolute', left: 820, top: 600, width: 720, height: 720, borderRadius: 40, overflow: 'hidden', boxShadow: '0 30px 60px rgba(58,36,20,0.35)'}}>
            {estatica || frame >= d.t3d.frames - 1 ? (
              <Img src={staticFile(estatica ? d.t3d.portadaFin : d.t3d.portadaFin)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <Sequence from={0} durationInFrames={d.t3d.frames} layout="none">
                <OffthreadVideo src={staticFile(d.t3d.portada)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              </Sequence>
            )}
          </div>
        ) : d.foto ? (
          <div style={{position: 'absolute', left: 780, top: 90, width: 760, height: 900, borderRadius: 40, overflow: 'hidden', boxShadow: '0 30px 60px rgba(58,36,20,0.35)'}}>
            <Img src={staticFile(d.foto)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        ) : (
          <svg width={900} height={760} viewBox="-450 -330 900 760" style={{position: 'absolute', left: 700, top: 470, overflow: 'visible'}}>
            <TartaHero tarta={tarta} frame={frame} aparece={estatica ? 1 : clamp(T / 0.8)} />
          </svg>
        )}
        {portadaV.activo && null}
      </div>

      {/* ---------- Ingredientes ---------- */}
      <Banda texto="INGREDIENTES" c={m.cabIngr} />
      {d.grupos.map((g, gi) => {
        const c = m.ingr[gi];
        const v = vivoEn(`ingredientes ${g.nombre}`);
        const activo = v.activo || ingrTodo.activo;
        const a = v.activo ? v.a : ingrTodo.activo ? ingrTodo.a : 0;
        return (
          <div key={gi} style={{...cajaStyle(c), background: '#fffdf9', borderRadius: 30, boxShadow: activo ? '0 0 0 5px #f2c165, 0 24px 50px rgba(58,36,20,0.22)' : '0 18px 40px rgba(58,36,20,0.14)', transform: `scale(${activo ? 1.015 : 1})`}}>
            <div style={{position: 'absolute', left: 44, top: 36, fontFamily: sans, fontWeight: 800, fontSize: 42, letterSpacing: 2, color: ACENTO}}>{rotulo(g.nombre)}</div>
            {g.items.map((it, i) => {
              const [cant, resto] = partir(it);
              const marca = activo && a * g.items.length > i ? clamp(a * g.items.length - i) : 0;
              return (
                <div key={i} style={{position: 'absolute', left: 28, right: 28, top: 112 + i * FILA_INGR, height: FILA_INGR - 8, display: 'flex', alignItems: 'center', gap: 22, padding: '0 16px', borderRadius: 20, background: `rgba(242,193,101,${0.22 * marca})`}}>
                  <div style={{width: 92, height: 92, borderRadius: 46, background: 'radial-gradient(circle at 40% 35%, #fbf1e1, #ecdcc2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
                    <Icono texto={it} tam={78} />
                  </div>
                  <div style={{fontFamily: sans, fontSize: 36, lineHeight: 1.15, color: TINTA}}>
                    {cant && <b style={{fontWeight: 800, color: '#b0602a'}}>{cant} </b>}
                    <span style={{fontWeight: 600}}>{resto}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* ---------- Paso a paso ---------- */}
      <Banda texto="PASO A PASO" c={m.cabPasos} />
      {d.pasos.map((p, i) => {
        const c = m.pasos[i];
        const v = vivoEn(`paso ${p.n}`);
        const check = estatica ? 0 : v.hecho ? io(clamp((T - (visita(d, `paso ${p.n}`)?.fin ?? 0)) / 0.35)) : 0;
        return (
          <div key={i} style={{...cajaStyle(c), background: '#fffdf9', borderRadius: 34, boxShadow: v.activo ? '0 0 0 5px #f2c165, 0 26px 54px rgba(58,36,20,0.24)' : '0 18px 40px rgba(58,36,20,0.14)', transform: `scale(${v.activo ? 1.015 : 1})`}}>
            <div style={{position: 'absolute', left: 26, top: 26, width: c.w - 52, height: 420, borderRadius: 26, background: 'radial-gradient(ellipse at 40% 35%, #fbf3e6 0%, #efe0c8 100%)', overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: (c.w - 52 - 600) / 2, top: 10}}>
                <Ilustracion op={p.escena} a={v.a} vivo={v.vivo} frame={frame} tarta={tarta} />
              </div>
            </div>
            <div style={{position: 'absolute', left: 6, top: 6, width: 92, height: 92, borderRadius: 46, background: ACENTO, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(143,47,58,0.35)', transform: `scale(${v.activo ? 1 + 0.06 * Math.sin(frame * 0.2) : 1})`}}>
              <span style={{fontFamily: sans, fontWeight: 800, fontSize: 52, color: '#fff'}}>{p.n}</span>
            </div>
            {check > 0 && (
              <div style={{position: 'absolute', right: 20, top: 20, width: 96, height: 96, borderRadius: 48, background: '#3f7d4a', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.4 + 0.6 * check}) rotate(${(1 - check) * -40}deg)`, opacity: check, boxShadow: '0 8px 18px rgba(0,0,0,0.25)'}}>
                <svg width={52} height={52} viewBox="0 0 52 52">
                  <path d="M10 27 L22 39 L43 14" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div style={{position: 'absolute', left: 46, right: 40, top: 474, fontFamily: sans, fontWeight: 800, fontSize: 46, letterSpacing: 1, color: ACENTO}}>{p.titulo.toUpperCase()}</div>
            <div style={{position: 'absolute', left: 46, right: 40, top: 540, fontFamily: sans, fontWeight: 600, fontSize: 33, lineHeight: 1.36, color: '#4a3426'}}>{p.texto}</div>
          </div>
        );
      })}

      {/* ---------- Porción final ---------- */}
      <div style={cajaStyle(m.porcion)}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 120, color: '#b0602a'}}>¡A disfrutar!</div>
        {d.t3d ? (
          <div style={{position: 'absolute', left: 150, top: 200, width: 1000, height: 680, borderRadius: 40, overflow: 'hidden', boxShadow: '0 30px 60px rgba(58,36,20,0.35)'}}>
            {(() => {
              const fps = 30;
              const ini = Math.max(0, Math.round(((visita(d, 'porcion')?.ini ?? 1e6) - 0.6) * fps));
              if (estatica) return <Img src={staticFile(d.t3d.cercaFin)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
              if (frame < ini) return <Img src={staticFile(d.t3d.cercaIni)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
              if (frame >= ini + d.t3d.frames - 1) return <Img src={staticFile(d.t3d.cercaFin)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />;
              return (
                <Sequence from={ini} durationInFrames={d.t3d.frames} layout="none">
                  <OffthreadVideo src={staticFile(d.t3d.cerca)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </Sequence>
              );
            })()}
          </div>
        ) : d.foto ? (
          <div style={{position: 'absolute', left: 150, top: 220, width: 1000, height: 640, borderRadius: 40, overflow: 'hidden', boxShadow: '0 30px 60px rgba(58,36,20,0.35)'}}>
            <Img src={staticFile(d.foto)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        ) : (
          <svg width={1100} height={700} viewBox="-550 -350 1100 700" style={{position: 'absolute', left: 100, top: 200, overflow: 'visible'}}>
            <Porcion tarta={tarta} frame={frame} aparece={estatica ? 1 : final.vivo || final.hecho ? clamp((T - (visita(d, 'porcion')?.ini ?? 0)) / 0.8) : 1} />
          </svg>
        )}
        {d.aviso && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 930, display: 'flex', justifyContent: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, background: '#f2c165', color: TINTA, fontFamily: sans, fontWeight: 800, fontSize: 46, padding: '22px 44px', borderRadius: 999, boxShadow: '0 14px 30px rgba(58,36,20,0.25)'}}>
              {d.aviso}
              <svg width={40} height={40} viewBox="0 0 34 34">
                <circle cx={17} cy={17} r={16} fill={TINTA} />
                <path d="M17 9 L17 24 M10 18 L17 25 L24 18" stroke="#f2c165" strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** En el vídeo: el mundo de la ficha con la cámara viajando */
export const FichaViaje: React.FC<{d: DatosFicha}> = ({d}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const m = maqueta(d);
  const c = camara(d, m, t);
  return (
    <AbsoluteFill style={{backgroundColor: PAPEL, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`}}>
        <FichaMundo d={d} t={t} frame={frame} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 500, background: 'linear-gradient(180deg, rgba(42,26,18,0.94) 0%, rgba(42,26,18,0.9) 52%, rgba(42,26,18,0) 100%)'}} />
    </AbsoluteFill>
  );
};

/** La infografía entera como imagen (para publicarla también como post) */
export const FichaImagen: React.FC<{d: DatosFicha}> = ({d}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: PAPEL}}>
      <FichaMundo d={d} t={1e6} frame={frame} estatica />
    </AbsoluteFill>
  );
};

/** Portada del post (la imagen que se ve en el perfil): la tarta grande, el título y el gancho */
export const PortadaFicha: React.FC<{d: DatosFicha; gancho: string}> = ({d, gancho}) => {
  const tarta = tartaDe(d);
  const img = d.t3d ? d.t3d.portadaFin : d.foto;
  const frame = useCurrentFrame();
  const partes = gancho.split('*');
  const [t1, t2] = d.titulo;
  return (
    <AbsoluteFill style={{background: PAPEL}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 900px 700px at 30% 20%, rgba(255,250,240,0.95), rgba(255,250,240,0) 70%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 64, letterSpacing: 6, color: TINTA}}>{t1.toUpperCase()}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: t2.length > 9 ? 190 : 230, lineHeight: 1.05, color: '#b0602a', textShadow: '0 8px 0 rgba(58,36,20,0.12)', whiteSpace: 'nowrap'}}>{t2}</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 520, height: 820, borderRadius: 44, overflow: 'hidden', boxShadow: '0 34px 70px rgba(58,36,20,0.38)', background: '#e9dccb'}}>
        {img ? (
          <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <svg width={980} height={820} viewBox="-490 -380 980 820" style={{overflow: 'visible'}}>
            <TartaHero tarta={tarta} frame={frame} aparece={1} />
          </svg>
        )}
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1385, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 60, lineHeight: 1.18, color: TINTA}}>
        {partes.map((p, i) => (
          <span key={i} style={{color: i % 2 ? '#b0602a' : TINTA}}>
            {p}
          </span>
        ))}
      </div>
      {d.aviso && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1665, display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, background: '#f2c165', color: TINTA, fontFamily: sans, fontWeight: 800, fontSize: 42, padding: '20px 40px', borderRadius: 999, boxShadow: '0 14px 30px rgba(58,36,20,0.25)'}}>
            {d.aviso}
            <svg width={38} height={38} viewBox="0 0 34 34">
              <circle cx={17} cy={17} r={16} fill={TINTA} />
              <path d="M17 9 L17 24 M10 18 L17 25 L24 18" stroke="#f2c165" strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
