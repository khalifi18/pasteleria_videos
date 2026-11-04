// Tarta en 3D con luz simulada (materiales PBR, sombras suaves, texturas procedurales).
// En vez de dibujar cada detalle, se modela la tarta y la luz hace el resto.
import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Tarta} from './datos';

const azar = (semilla: number) => {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** Textura de miga de bizcocho: alveolos oscuros y granos claros sobre el color base */
const texturaMiga = (color: string, semilla = 1) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  const r = azar(semilla);
  const base = new THREE.Color(color);
  for (let i = 0; i < 2600; i++) {
    const x = r() * 512, y = r() * 512, s = 1.2 + Math.pow(r(), 2.2) * 9;
    const k = r();
    const col = base.clone().multiplyScalar(k < 0.55 ? 0.55 + r() * 0.2 : 1.12 + r() * 0.18);
    g.fillStyle = `#${col.getHexString()}`;
    g.beginPath();
    g.ellipse(x, y, s, s * (0.6 + r() * 0.6), r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Relieve (bump) a juego con la miga */
const relieveMiga = (semilla = 2) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 512, 512);
  const r = azar(semilla);
  for (let i = 0; i < 2600; i++) {
    const x = r() * 512, y = r() * 512, s = 1.2 + Math.pow(r(), 2.2) * 9;
    const v = r() < 0.6 ? 40 + r() * 40 : 170 + r() * 60;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.beginPath();
    g.arc(x, y, s, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

/** Frosting: blanco cremoso con marcas suaves de espátula */
const texturaCrema = (color: string, semilla = 3) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  const r = azar(semilla);
  const base = new THREE.Color(color);
  for (let i = 0; i < 70; i++) {
    const y = r() * 512, ancho = 10 + r() * 40;
    const grad = g.createLinearGradient(0, y - ancho, 0, y + ancho);
    const osc = base.clone().multiplyScalar(0.94 + r() * 0.04);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, `#${osc.getHexString()}`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 0.1;
    g.fillStyle = grad;
    g.fillRect(0, y - ancho, 512, ancho * 2);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const texturaMadera = () => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext('2d')!;
  g.fillStyle = '#c9965f';
  g.fillRect(0, 0, 1024, 1024);
  const r = azar(9);
  for (let i = 0; i < 260; i++) {
    const x = r() * 1024;
    g.strokeStyle = r() < 0.5 ? 'rgba(120,70,30,0.18)' : 'rgba(240,200,150,0.18)';
    g.lineWidth = 1 + r() * 4;
    g.beginPath();
    for (let y = 0; y <= 1024; y += 32) g.lineTo(x + Math.sin((y + i * 40) / 140) * 8, y);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** Cara de corte (rectángulo vertical) de una capa, del centro al borde */
const Corte: React.FC<{ang: number; y0: number; y1: number; r: number; mat: THREE.Material}> = ({ang, y0, y1, r, mat}) => {
  const h = y1 - y0;
  return (
    <mesh position={[(Math.sin(ang) * r) / 2, y0 + h / 2, (Math.cos(ang) * r) / 2]} rotation={[0, ang - Math.PI / 2, 0]} material={mat} castShadow receiveShadow>
      <planeGeometry args={[r, h]} />
    </mesh>
  );
};

const Escena: React.FC<{tarta: Tarta; t: number}> = ({tarta, t}) => {
  const R = 1;
  const capas = tarta.capas ?? 1;
  const hTop = 0.09, hFr = 0.07, hBiz = 0.3;
  const hueco = 0.95; // radianes de la porción quitada
  const inicio = hueco / 2; // el hueco (entre inicio-hueco e inicio) mira a la cámara (+z)

  const m = useMemo(() => {
    const miga = texturaMiga(tarta.base, 1);
    const bump = relieveMiga(2);
    const crema = texturaCrema(tarta.relleno, 3);
    // repetición proporcional al tamaño real de cada cara (si no, la miga se estira)
    const lateral = miga.clone();
    lateral.repeat.set(12, 0.6);
    lateral.needsUpdate = true;
    const bumpLat = bump.clone();
    bumpLat.repeat.set(12, 0.6);
    bumpLat.needsUpdate = true;
    const corte = miga.clone();
    corte.repeat.set(2, 0.6);
    corte.needsUpdate = true;
    const bumpCorte = bump.clone();
    bumpCorte.repeat.set(2, 0.6);
    bumpCorte.needsUpdate = true;
    return {
      bizLado: new THREE.MeshStandardMaterial({map: lateral, bumpMap: bumpLat, bumpScale: 0.05, roughness: 0.95}),
      bizCorte: new THREE.MeshStandardMaterial({map: corte, bumpMap: bumpCorte, bumpScale: 0.06, roughness: 0.97, side: THREE.DoubleSide}),
      crema: new THREE.MeshPhysicalMaterial({map: crema, color: '#ffffff', roughness: 0.42, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#fffaf0'), emissive: new THREE.Color('#fbf3e6'), emissiveIntensity: 0.12, side: THREE.DoubleSide}),
      plato: new THREE.MeshPhysicalMaterial({color: '#f6f3ee', roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.12}),
      miga: new THREE.MeshStandardMaterial({map: miga, bumpMap: bump, bumpScale: 0.02, roughness: 0.95}),
      mesa: new THREE.MeshStandardMaterial({map: texturaMadera(), roughness: 0.7}),
    };
  }, [tarta]);

  // capas de abajo arriba
  const capasY: {y0: number; y1: number; tipo: 'biz' | 'crema'}[] = [];
  let y = 0;
  for (let i = 0; i < capas; i++) {
    capasY.push({y0: y, y1: y + hBiz, tipo: 'biz'});
    y += hBiz;
    if (i < capas - 1) {
      capasY.push({y0: y, y1: y + hFr, tipo: 'crema'});
      y += hFr;
    }
  }
  capasY.push({y0: y, y1: y + hTop, tipo: 'crema'});
  const H = y + hTop;

  // migas encima: muchas, pequeñas, irregulares, con variación de color (una sola malla instanciada)
  const migas = useMemo(() => {
    const r = azar(5);
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) { const j = 0.78 + r() * 0.4; pos.setXYZ(k, pos.getX(k) * j, pos.getY(k) * j * 0.7, pos.getZ(k) * j); }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({roughness: 1, metalness: 0, map: texturaMiga(tarta.decor, 11), bumpMap: relieveMiga(7), bumpScale: 0.04});
    const N = 1600;
    const im = new THREE.InstancedMesh(geo, mat, N);
    const o = new THREE.Object3D();
    const base = new THREE.Color(tarta.decor);
    let n = 0;
    for (let i = 0; i < N * 3 && n < N; i++) {
      const a = r() * Math.PI * 2;
      const rel = (((inicio - a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); // 0..hueco = dentro del hueco
      if (rel < hueco + 0.03) continue;
      const d = Math.pow(r(), 0.6) * (R - 0.04);
      const grande = r() < 0.12;
      const sz = grande ? 0.022 + r() * 0.02 : 0.006 + r() * 0.012;
      o.position.set(Math.sin(a) * d, H + sz * 0.5 + r() * 0.01, Math.cos(a) * d);
      o.rotation.set(r() * 6, r() * 6, r() * 6);
      o.scale.setScalar(sz);
      o.updateMatrix();
      im.setMatrixAt(n, o.matrix);
      im.setColorAt(n, new THREE.Color(1, 1, 1).multiplyScalar(0.62 + r() * 0.38));
      n++;
    }
    im.count = n;
    im.castShadow = true;
    im.receiveShadow = true;
    return im;
  }, [H, inicio, tarta.decor]);

  const giro = -0.35 + t * 0.06;
  return (
    <>
      <color attach="background" args={['#f2e6d6']} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#fff3e0', '#7a5236', 0.55]} />
      <directionalLight position={[-3, 5, 2.5]} intensity={2.6} color="#fff1dc" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-radius={8} shadow-bias={-0.0004} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <directionalLight position={[3, 2.5, -3]} intensity={0.9} color="#ffd9b0" />
      <pointLight position={[1.2, 1.4, 3.2]} intensity={2.2} distance={9} decay={1.2} color="#fff6ea" />
      <spotLight position={[0.2, 2.2, 4]} angle={0.5} penumbra={1} intensity={1.4} color="#ffffff" target-position={[0, 0.4, 0]} />
      <group rotation={[0, giro, 0]}>
        {/* plato */}
        <mesh position={[0, -0.03, 0]} material={m.plato} receiveShadow castShadow>
          <cylinderGeometry args={[1.5, 1.38, 0.06, 96]} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.plato} receiveShadow>
          <torusGeometry args={[1.42, 0.035, 16, 120]} />
        </mesh>
        {/* capas con la porción quitada */}
        {capasY.map((c, i) => (
          <group key={i}>
            <mesh position={[0, (c.y0 + c.y1) / 2, 0]} material={c.tipo === 'biz' ? m.bizLado : m.crema} castShadow receiveShadow>
              <cylinderGeometry args={[c.tipo === 'crema' && i === capasY.length - 1 ? R + 0.01 : R, c.tipo === 'crema' && i === capasY.length - 1 ? R + 0.01 : R, c.y1 - c.y0, 128, 1, false, inicio, Math.PI * 2 - hueco]} />
            </mesh>
            <Corte ang={inicio} y0={c.y0} y1={c.y1} r={R} mat={c.tipo === 'biz' ? m.bizCorte : m.crema} />
            <Corte ang={inicio + Math.PI * 2 - hueco} y0={c.y0} y1={c.y1} r={R} mat={c.tipo === 'biz' ? m.bizCorte : m.crema} />
          </group>
        ))}
        {/* migas encima */}
        <primitive object={migas} />
      </group>
      {/* mesa */}
      <mesh position={[0, -0.061, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.mesa} receiveShadow>
        <planeGeometry args={[14, 14]} />
      </mesh>
    </>
  );
};

/** La tarta en 3D a pantalla completa; la cámara gira despacio a su alrededor */
export const Tarta3D: React.FC<{tarta: Tarta; ancho?: number; alto?: number}> = ({tarta, ancho = 1080, alto = 1080}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <ThreeCanvas
      width={ancho}
      height={alto}
      shadows
      gl={{antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping}}
      camera={{fov: 28, position: [0.4, 3.0, 4.6], near: 0.1, far: 50}}
      onCreated={({camera, gl}) => {
        camera.lookAt(0, 0.35, 0);
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <Escena tarta={tarta} t={frame / fps} />
    </ThreeCanvas>
  );
};
