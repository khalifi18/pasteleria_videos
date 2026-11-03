import React from 'react';
import {AbsoluteFill, Composition, useCurrentFrame} from 'remotion';
import {FPS, H, W} from './tema';
import {Video, VideoProps} from './Video';
import {ESCENAS} from './dibujos';
import {FichaImagen} from './ficha/Ficha';
import {FW, maqueta} from './ficha/datos';
import type {DatosFicha} from './ficha/datos';

const ejemplo: VideoProps = {
  audio: null,
  modo: 'leccion',
  firma: '@tu_cuenta',
  cierre: 'Guárdala para hacerla este finde',
  finVoz: 5,
  duracion: 8,
  pov: null,
  lineas: [{es: 'Con la dificultad *viene la facilidad*', ini: 0.3, fin: 4.8}],
  planos: [{clip: null, texto: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', a: 0, b: 240}],
};

/** Vista de una escena suelta (para revisar dibujos): props {escena, opts, k, d} */
const VistaEscena: React.FC<{escena: string; opts: string[]; k: number; d: number}> = ({escena, opts, k, d}) => {
  const f = useCurrentFrame();
  const E = ESCENAS[escena];
  return <AbsoluteFill style={{background: '#000'}}>{E ? <E f={f} d={d} k={k} opts={opts} /> : null}</AbsoluteFill>;
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Video"
      component={Video}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={FPS * 8}
      defaultProps={ejemplo}
      calculateMetadata={({props}) => ({durationInFrames: Math.ceil(props.duracion * FPS)})}
    />
    <Composition
      id="FichaImagen"
      component={FichaImagen}
      width={FW}
      height={2000}
      fps={FPS}
      durationInFrames={1}
      defaultProps={{d: {titulo: ['', ''], lema: '', datos: [], grupos: [], pasos: [], tramos: [], fin: 0} as DatosFicha}}
      calculateMetadata={({props}) => ({height: Math.ceil(maqueta(props.d).alto / 2) * 2})}
    />
    <Composition id="Escena" component={VistaEscena} width={W} height={H} fps={FPS} durationInFrames={150} defaultProps={{escena: 'puerta', opts: [] as string[], k: 30, d: 150}} />
  </>
);
