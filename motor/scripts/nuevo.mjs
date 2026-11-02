// Crea un vídeo nuevo:  node motor/scripts/nuevo.mjs videos/<slug>
// Deja guion.txt de plantilla y la carpeta mis-clips/ para sus vídeos.
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.log('Uso: node motor/scripts/nuevo.mjs videos/<slug>');
  process.exit(1);
}
fs.mkdirSync(path.join(dir, 'out'), {recursive: true});
fs.mkdirSync(path.join(dir, 'mis-clips'), {recursive: true});
const g = path.join(dir, 'guion.txt');
if (!fs.existsSync(g)) {
  fs.writeFileSync(
    g,
    `# receta: …
# formato: receta
# idioma: es
# ingredientes: 3 huevos; 150 g de azúcar; 200 g de harina
# Una línea = un plano. [mio] = su siguiente vídeo de mis-clips/ · [búsqueda en inglés] = clip gratis · [ingredientes] · [texto] · [=]
[mio] Frase del gancho con *palabra clave*
[ingredientes] Solo necesitas esto.
`,
  );
}
console.log(`OK · ${g}`);
