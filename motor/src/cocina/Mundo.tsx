// Formato cocina: el mundo completo con la cámara viajando por él.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, sans} from '../tema';
import {back} from '../util';
import {
  Accion, BOL, DatosCocina, INGR, MOLDE, Estado,
  aPantalla, avance, camara, cantidad, clamp, colorMasa, estado, etiquetas, hueco, io, lerp, oscurece, salida, suave, textoDe, aclara,
} from './estado';
import {Batidor, Bizcocho, Bol, Cascada, Chorro, Cuchillo, Defs, Encimera, Espatula, Horno, Ingrediente, Molde, Pared, Trozos, Vertedor, bocaVertedor} from './piezas';

const activa = (d: DatosCocina, t: number, verbo: string | string[]) => {
  const vs = Array.isArray(verbo) ? verbo : [verbo];
  return d.acciones.filter((a) => vs.includes(a.verbo) && t >= a.ini && t <= a.ini + 0.3 + Math.max(1.4, a.fin - a.ini - 0.1) + 0.05);
};

/** Huevos: cada uno va al borde del bol, se rompe y cae la yema */
const fasesHuevo = (a: Accion, t: number, n: number) => {
  const p = avance(a, t);
  const seg = 0.8 / n;
  return Array.from({length: n}).map((_, j) => clamp((p - 0.08 - j * seg) / seg));
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`;

const pantallaHorno = (d: DatosCocina, t: number, e: Estado) => {
  let temp = '';
  let txt = '--:--';
  for (const a of d.acciones) {
    if (t < a.ini) break;
    const n = a.opts.find((o) => /^\d+$/.test(o));
    if (a.verbo === 'hornear') {
      if (n) temp = n;
      txt = temp ? `${temp}°` : 'ON';
    } else if (a.verbo === 'esperar') {
      const min = n ? parseInt(n, 10) : 30;
      txt = fmt(min * 60 * (1 - avance(a, t)));
    } else if (a.verbo === 'sacar') txt = Math.floor(t * 2) % 2 ? '0:00' : '  ';
  }
  return e.hornoEncendido > 0.02 || txt === '0:00' || txt === '  ' ? txt : '--:--';
};

export const MundoCocina: React.FC<{d: DatosCocina}> = ({d}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const e = estado(d, t);
  const color = colorMasa(e);
  const cam = camara(d, t);
  const nHuevos = cantidad(textoDe(d, 'huevos') || '', 3);

  // --- qué se está moviendo ahora ---
  const echar = activa(d, t, 'echar')[0];
  const batir = activa(d, t, ['batir', 'mezclar'])[0];
  const verter = activa(d, t, 'verter')[0];
  const hornear = d.acciones.find((a) => a.verbo === 'hornear' || a.verbo === 'esperar');
  const sacar = d.acciones.find((a) => a.verbo === 'sacar' || a.verbo === 'corte' || a.verbo === 'cortar' || a.verbo === 'decorar');
  const corte = activa(d, t, ['corte', 'cortar'])[0];
  const decorar = activa(d, t, 'decorar')[0];

  // huevos ya rotos (de todas las acciones [echar huevos])
  let huevosCaidos = 0;
  let huevosFuera = 0;
  d.acciones.filter((a) => a.verbo === 'echar' && a.obj === 'huevos' && t >= a.ini).forEach((a) => {
    fasesHuevo(a, t, nHuevos).forEach((u) => {
      huevosCaidos += clamp((u - 0.45) / 0.25);
      if (u > 0.02) huevosFuera++;
    });
  });

  // posición del bol (se acerca al molde al verter)
  let bolX = BOL.x, bolY = BOL.y, bolInc = 0;
  let chorroMasa: React.ReactNode = null;
  if (verter) {
    const p = avance(verter, t);
    const ida = io(clamp(p / 0.22)), vuelta = io(clamp((p - 0.82) / 0.18));
    const k = ida * (1 - vuelta);
    bolY = lerp(BOL.y, MOLDE.y - 470, k);
    bolInc = k;
    const o = clamp((p - 0.2) / 0.06) * (1 - clamp((p - 0.78) / 0.06));
    if (o > 0) chorroMasa = <Chorro x0={bolX} y0={bolY + 250} x1={MOLDE.x + 10} y1={MOLDE.y - 20} color={color} frame={frame} o={o} ancho={44} espeso />;
  }

  // molde: se va al horno al empezar a hornear
  let moldeO = 1;
  if (hornear && t >= hornear.ini) moldeO = 1 - clamp((t - hornear.ini - 0.2) / 0.5);
  if (e.fuera > 0) moldeO = 0;
  const tFuera = sacar ? Math.max(0, t - sacar.ini) : 0;

  // ingrediente en movimiento: se levanta, va al borde del bol (sin taparlo), se inclina y vierte, y vuelve
  let enMovimiento: string | null = null;
  let mov: React.ReactNode = null;
  if (echar && echar.obj && INGR[echar.obj] && echar.obj !== 'huevos') {
    const k = echar.obj;
    const ing = INGR[k];
    const h = hueco(d, k);
    const p = avance(echar, t);
    const dx = BOL.x - h.x, dy = BOL.y - h.y, dl = Math.hypot(dx, dy) || 1;
    const ux = dx / dl, uy = dy / dl; // del ingrediente hacia el bol
    const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
    const boca = bocaVertedor(k);
    // centro del recipiente: con la boca justo encima del borde del bol
    const llega = {x: BOL.x - ux * (BOL.r - 40 + boca), y: BOL.y - uy * (BOL.r - 40 + boca)};
    const ida = io(clamp(p / 0.24)), vuelta = io(clamp((p - 0.8) / 0.2));
    const m = ida * (1 - vuelta);
    const x = lerp(h.x, llega.x, m), y = lerp(h.y, llega.y, m);
    const sube = salida(clamp(p / 0.12)) * (1 - salida(clamp((p - 0.9) / 0.1)));
    const inc = suave(clamp((p - 0.22) / 0.1)) * (1 - suave(clamp((p - 0.74) / 0.08)));
    const o = clamp((p - 0.3) / 0.05) * (1 - clamp((p - 0.74) / 0.05));
    const cambio = clamp(p / 0.1) * (1 - clamp((p - 0.9) / 0.1)); // del dibujo en reposo al recipiente levantado
    const lleno = 1 - 0.65 * clamp((p - 0.3) / 0.45);
    const bx = x + ux * boca * (1 - 0.32 * inc), by = y + uy * boca * (1 - 0.32 * inc);
    const cae = {x: BOL.x - ux * 70 + 10, y: BOL.y - uy * 70 + 12};
    enMovimiento = k;
    mov = (
      <>
        {/* sombra en la encimera: se separa al levantarlo */}
        <ellipse cx={x + 40 + 70 * sube} cy={y + 50 + 90 * sube} rx={ing.r * 1.05} ry={ing.r * 0.8} fill="url(#c-sombra)" opacity={1 - 0.45 * sube} />
        {cambio < 1 && (
          <g transform={`translate(${x} ${y})`} opacity={1 - cambio}>
            <Ingrediente k={k} lleno={lleno} />
          </g>
        )}
        <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${1 + 0.12 * sube})`} opacity={cambio}>
          <Vertedor k={k} inc={inc} lleno={lleno} ang={ang} />
        </g>
        {o > 0 &&
          (ing.tipo === 'liquido' ? (
            <Chorro x0={bx} y0={by} x1={cae.x} y1={cae.y} color={k === 'aceite' ? '#e8b42e' : '#fffcf6'} frame={frame} o={o} ancho={k === 'aceite' ? 13 : k === 'yogur' ? 30 : 20} espeso={k === 'yogur'} />
          ) : ing.tipo === 'polvo' ? (
            <Cascada x0={bx} y0={by} x1={cae.x} y1={cae.y} color={k === 'cacao' ? '#6b3d27' : k === 'azucar' ? '#ffffff' : '#f7f1e4'} frame={frame} o={o} />
          ) : (
            <Trozos x0={bx} y0={by} x1={cae.x} y1={cae.y} k={k} frame={frame} o={o} />
          ))}
      </>
    );
  }

  // huevos en movimiento
  const huevosMov: React.ReactNode[] = [];
  const eh = activa(d, t, 'echar').find((a) => a.obj === 'huevos');
  if (eh) {
    const h = hueco(d, 'huevos');
    const dx = h.x - BOL.x, dy = h.y - BOL.y, dl = Math.hypot(dx, dy) || 1;
    const ux = dx / dl, uy = dy / dl;
    fasesHuevo(eh, t, nHuevos).forEach((u, j) => {
      if (u <= 0.02 || u >= 0.95) return;
      const a = (j / Math.max(1, nHuevos)) * Math.PI * 2 - 0.6;
      const ox = h.x + Math.cos(a) * 52, oy = h.y + Math.sin(a) * 52;
      const bx = BOL.x + ux * (BOL.r - 20), by = BOL.y + uy * (BOL.r - 20);
      const m = io(clamp(u / 0.42));
      const x = lerp(ox, bx, m), y = lerp(oy, by, m);
      const abre = suave(clamp((u - 0.42) / 0.2));
      const o = 1 - clamp((u - 0.7) / 0.2);
      const giro = (Math.atan2(-uy, -ux) * 180) / Math.PI;
      huevosMov.push(
        <g key={j} transform={`translate(${x} ${y}) rotate(${giro + 90}) scale(${1 + 0.15 * m * (1 - abre)})`} opacity={o}>
          <ellipse cx={10} cy={14} rx={48} ry={60} fill="#2a1408" opacity={0.18 * (1 - abre)} />
          <g transform={`translate(${-abre * 40} ${-abre * 10}) rotate(${-abre * 30})`}>
            <path d="M-44,0 C-44,-34 -24,-56 0,-56 C24,-56 44,-34 44,0 L28,8 L14,-4 L0,10 L-14,-4 L-28,8 Z" fill="url(#c-huevo)" />
          </g>
          <g transform={`translate(${abre * 40} ${abre * 10}) rotate(${abre * 30})`}>
            <path d="M-44,0 C-44,34 -24,56 0,56 C24,56 44,34 44,0 L28,8 L14,-4 L0,10 L-14,-4 L-28,8 Z" fill="url(#c-huevo)" />
          </g>
        </g>,
      );
    });
  }

  // utensilio dentro del bol
  let utensilio: React.ReactNode = null;
  let girando = 0;
  if (batir) {
    const p = avance(batir, t);
    const entra = io(clamp(p / 0.12)), sale = io(clamp((p - 0.88) / 0.12));
    const fuera = 1 - entra * (1 - sale);
    girando = entra * (1 - sale);
    const w = frame * 0.28;
    const esBatir = batir.verbo === 'batir';
    const cx = BOL.x + 10 + (esBatir ? Math.cos(w) * 80 : Math.sin(frame * 0.12) * 100) + fuera * 520;
    const cy = BOL.y + 12 + (esBatir ? Math.sin(w) * 66 : Math.cos(frame * 0.12) * 30) + fuera * 420;
    utensilio = (
      <g transform={`translate(${cx} ${cy})`} opacity={1 - fuera * 0.6}>
        {esBatir ? <Batidor ang={38 + Math.sin(frame * 0.2) * 7} /> : <Espatula ang={34 + Math.sin(frame * 0.12) * 22} />}
      </g>
    );
  }
  // tras batir queda girando suave un momento
  const ultimaMezcla = [...d.acciones].reverse().find((a) => (a.verbo === 'batir' || a.verbo === 'mezclar') && t > a.ini);
  if (!batir && ultimaMezcla) girando = 0.25 * (1 - clamp(t - (ultimaMezcla.ini + 0.3 + Math.max(1.4, ultimaMezcla.fin - ultimaMezcla.ini - 0.1)), 0, 1));

  // cuchillo del corte
  let cuchillo: React.ReactNode = null;
  if (corte) {
    const p = avance(corte, t);
    const o = clamp(p / 0.08) * (1 - clamp((p - 0.42) / 0.1));
    if (o > 0) {
      const a1 = 25;
      const sierra = Math.sin(frame * 0.6) * 18 * (p < 0.4 ? 1 : 0);
      cuchillo = (
        <g transform={`translate(${MOLDE.x} ${MOLDE.y}) rotate(${a1}) translate(${-30 + sierra} ${-30 - (1 - clamp(p / 0.2)) * 60})`} opacity={o}>
          <Cuchillo />
        </g>
      );
    }
  }

  // azúcar glas cayendo del colador
  let tamiz: React.ReactNode = null;
  if (decorar && (decorar.obj || 'azucar') !== 'chocolate') {
    const p = avance(decorar, t);
    const o = clamp(p / 0.1) * (1 - clamp((p - 0.85) / 0.1));
    tamiz = (
      <g opacity={o}>
        {Array.from({length: 70}).map((_, i) => {
          const u = (frame * 0.05 + i / 70) % 1;
          const a = ((i * 137.5) % 360) * (Math.PI / 180);
          const r = Math.sqrt((i % 70) / 70) * 210;
          return <circle key={i} cx={MOLDE.x + Math.cos(a) * r} cy={MOLDE.y + Math.sin(a) * r - (1 - u) * 160} r={lerp(7, 3, u)} fill="#fff" opacity={0.8 * (1 - u * 0.4)} />;
        })}
        <g transform={`translate(${MOLDE.x - 20} ${MOLDE.y - 210})`}>
          <circle r={150} fill="none" stroke="#c9cdd2" strokeWidth={12} />
          <circle r={140} fill="#fff" opacity={0.08} />
          {Array.from({length: 9}).map((_, i) => (
            <line key={i} x1={-140 + i * 35} y1={-140} x2={-140 + i * 35} y2={140} stroke="#c9cdd2" strokeWidth={2} opacity={0.6} />
          ))}
          <rect x={140} y={-14} width={230} height={28} rx={14} fill="#3a2414" />
        </g>
      </g>
    );
  }

  // dónde cae cada ingrediente dentro del bol: del lado por el que se echa
  const dirs: Record<string, number> = {};
  d.mesa.forEach((k) => {
    const h = hueco(d, k);
    dirs[k] = Math.atan2(h.y - BOL.y, h.x - BOL.x);
  });
  const ets = etiquetas(d);
  const vista = `translate(540 960) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`;

  return (
    <AbsoluteFill style={{backgroundColor: '#2a1a12', overflow: 'hidden'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <Defs />
        <g transform={vista}>
          <Pared />
          <Horno e={e} frame={frame} pantalla={pantallaHorno(d, t, e)} colorMasa={color} />
          <Encimera />
          {/* piezas en sus huecos */}
          {d.mesa.map((k) => {
            if (k === enMovimiento) return null;
            const h = hueco(d, k);
            const usado = e.usados[k] || 0;
            return (
              <g key={k} transform={`translate(${h.x} ${h.y})`}>
                <Ingrediente k={k} n={Math.max(0, nHuevos - huevosFuera)} lleno={1 - 0.6 * usado} />
              </g>
            );
          })}
          {moldeO > 0.01 && (
            <g transform={`translate(${MOLDE.x} ${MOLDE.y}) scale(${1 + 0.08 * (1 - moldeO)})`} opacity={moldeO}>
              <Molde lleno={e.molde} color={color} frame={frame} />
            </g>
          )}
          {e.fuera > 0 && (
            <g transform={`translate(${MOLDE.x} ${MOLDE.y})`}>
              <Bizcocho e={e} miga={aclara(oscurece(color, 0.02), 0.08)} frame={frame} tFuera={tFuera} />
            </g>
          )}
          <g transform={`translate(${bolX} ${bolY}) scale(${1 + 0.04 * bolInc} ${1 - 0.08 * bolInc})`}>
            <Bol e={e} color={color} frame={frame} girando={girando} nHuevos={nHuevos} huevosCaidos={huevosCaidos} dirs={dirs} />
          </g>
          {chorroMasa}
          {utensilio}
          {huevosMov}
          {mov}
          {cuchillo}
          {tamiz}
        </g>
        {/* luz cálida y viñeta, fijas en pantalla */}
        <defs>
          <radialGradient id="c-vineta" cx="0.5" cy="0.55" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#1a0c05" stopOpacity={0.5} />
          </radialGradient>
          <linearGradient id="c-arriba" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a0c05" stopOpacity={0.55} />
            <stop offset="1" stopColor="#1a0c05" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#c-vineta)" />
        <rect width={1080} height={560} fill="url(#c-arriba)" />
      </svg>
      {/* etiquetas pegadas a los objetos */}
      {ets.map((et, i) => {
        if (t < et.desde - 0.05 || t > et.hasta + 0.35) return null;
        const pop = back(clamp((t - et.desde) / 0.32));
        const o = Math.min(clamp((t - et.desde) / 0.15), 1 - clamp((t - et.hasta) / 0.3));
        const s = aPantalla(cam, et.x, et.y + (et.dy ?? -60));
        if (s.y < 380 || s.y > 1860 || s.x < -100 || s.x > 1180) return null;
        // la pastilla nunca se sale de la pantalla (ancho aproximado según el texto)
        const ancho = et.texto.length * 22 + 100;
        const cx = Math.min(1080 - 36 - ancho / 2, Math.max(36 + ancho / 2, s.x));
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, transform: `translate(${cx}px, ${s.y}px) translate(-50%, -100%) scale(${0.6 + 0.4 * pop})`, transformOrigin: '50% 100%', opacity: o}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fffaf2', color: '#3a2414', fontFamily: sans, fontWeight: 800, fontSize: 38, padding: '14px 28px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(42,20,8,0.35)'}}>
              <span style={{width: 14, height: 14, borderRadius: 7, background: C.oro, boxShadow: `0 0 0 5px ${C.oro}44`}} />
              {et.texto}
            </div>
            <div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '16px solid #fffaf2'}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

