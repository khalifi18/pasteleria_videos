import {loadFont} from '@remotion/fonts';
// Fuentes dentro del proyecto (paquetes @fontsource): no dependen de Google Fonts ni de la red.
import mont700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2';
import mont700x from '@fontsource/montserrat/files/montserrat-latin-ext-700-normal.woff2';
import mont800 from '@fontsource/montserrat/files/montserrat-latin-800-normal.woff2';
import mont800x from '@fontsource/montserrat/files/montserrat-latin-ext-800-normal.woff2';
import play700i from '@fontsource/playfair-display/files/playfair-display-latin-700-italic.woff2';
import play700ix from '@fontsource/playfair-display/files/playfair-display-latin-ext-700-italic.woff2';
import amiri700 from '@fontsource/amiri/files/amiri-arabic-700-normal.woff2';

// Letras: Montserrat para subtítulos, Playfair para portada, tarjetas y cierre, Amiri para el árabe.
export const sans = 'Montserrat';
export const serif = 'Playfair Display';
export const amiri = 'Amiri';
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
for (const [family, url, weight, style, unicodeRange] of [
  [sans, mont700, '700', 'normal', LATIN],
  [sans, mont700x, '700', 'normal', EXT],
  [sans, mont800, '800', 'normal', LATIN],
  [sans, mont800x, '800', 'normal', EXT],
  [serif, play700i, '700', 'italic', LATIN],
  [serif, play700ix, '700', 'italic', EXT],
  [amiri, amiri700, '700', 'normal', undefined],
] as const) {
  loadFont({family, url, weight, style, unicodeRange});
}

// Paleta del texto. Cambia aquí y cambia todo.
export const C = {
  noche: '#0d0a12',
  crema: '#fbf3e6',
  oro: '#f2c165',
  tenue: 'rgba(251,243,230,0.55)',
};

// Paleta de los dibujos (historia y elementos de hikma): noche cálida marroquí
export const P = {
  cieloNoche: ['#0f1530', '#2a2350', '#5a3a62'],
  cieloAtardecer: ['#2b2350', '#8a4a6a', '#f08a5d', '#ffd08a'],
  cieloAmanecer: ['#1d2a4f', '#5f6fa3', '#f4a988', '#ffe2a8'],
  cieloDia: ['#5aa0d8', '#9cc9ea', '#e8f3fb'],
  interior: ['#2a1a22', '#4a2a2e', '#6a3a32'],
  oro: '#f2c165',
  oroClaro: '#ffe3a0',
  luz: '#fff2cf',
  crema: '#f6e8d2',
  arena: '#d9b68a',
  terracota: '#c8623e',
  terracotaOsc: '#8a3b26',
  cal: '#efe3cf', // pared encalada
  turquesa: '#2f8f8a',
  turquesaOsc: '#1d5e5b',
  verde: '#5f9a57',
  verdeOsc: '#2f5e38',
  madera: '#7a4b33',
  maderaOsc: '#4a2c1e',
  rosa: '#e79a8f',
  azul: '#3b5a8f',
  silueta: '#1a1424',
};

export const W = 1080;
export const H = 1920;
export const FPS = 30;
// Centro vertical de los subtítulos (zona segura de TikTok/Instagram)
export const SUB_Y = 1300;
