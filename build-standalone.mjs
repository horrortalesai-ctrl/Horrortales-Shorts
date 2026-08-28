import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [html, css, editorial, weekly, app] = await Promise.all([
  readFile(resolve(root, 'index.html'), 'utf8'),
  readFile(resolve(root, 'styles.css'), 'utf8'),
  readFile(resolve(root, 'data', 'editorial-cases.js'), 'utf8'),
  readFile(resolve(root, 'data', 'weekly-cases.js'), 'utf8'),
  readFile(resolve(root, 'app.js'), 'utf8')
]);

const standalone = html
  .replace('<link rel="stylesheet" href="styles.css" />', `<style>\n${css}\n</style>`)
  .replace('<script src="data/editorial-cases.js"></script>', `<script>\n${editorial}\n</script>`)
  .replace('<script src="data/weekly-cases.js"></script>', `<script>\n${weekly}\n</script>`)
  .replace('<script src="app.js"></script>', `<script>\n${app}\n</script>`);

const projectOutput = resolve(root, 'horrortales.html');
const deliverableOutput = resolve(root, 'outputs', 'horrortales-abrir-directamente.html');
await mkdir(dirname(deliverableOutput), { recursive: true });
await Promise.all([
  writeFile(projectOutput, standalone, 'utf8'),
  writeFile(deliverableOutput, standalone, 'utf8')
]);

console.log('Versión independiente creada: horrortales.html');
