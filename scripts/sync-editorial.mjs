import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = resolve(root, 'data', 'editorial-cases.json');
const jsPath = resolve(root, 'data', 'editorial-cases.js');
const checkOnly = process.argv.includes('--check');
const allowedTypes = new Set(['Misterio', 'Terror', 'Supervivencia', 'Crimen', 'Desaparición', 'Catástrofe', 'Perturbador']);
const allowedStatuses = new Set(['investigado', 'listo_para_guion', 'guion_borrador', 'publicado']);

const cases = JSON.parse(await readFile(jsonPath, 'utf8'));
if (!Array.isArray(cases)) throw new Error('data/editorial-cases.json debe contener un array.');

const ids = new Set();
for (const [index, story] of cases.entries()) validateStory(story, index);

const output = `// Generado desde data/editorial-cases.json. No editar a mano.\nwindow.HORRORTALES_EDITORIAL = ${JSON.stringify(cases, null, 2)};\n`;

if (checkOnly) {
  const current = await readFile(jsPath, 'utf8');
  if (current !== output) throw new Error('data/editorial-cases.js está desactualizado. Ejecuta npm run editorial:sync.');
  console.log(`OK: ${cases.length} casos editoriales válidos y sincronizados.`);
} else {
  await writeFile(jsPath, output, 'utf8');
  console.log(`Dashboard sincronizado: ${cases.length} casos editoriales.`);
}

function validateStory(story, index) {
  const label = `caso ${index + 1}`;
  if (!story || typeof story !== 'object') throw new Error(`${label}: debe ser un objeto.`);
  if (typeof story.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.id)) {
    throw new Error(`${label}: id debe ser un slug estable en minúsculas.`);
  }
  if (ids.has(story.id)) throw new Error(`${label}: id duplicado ${story.id}.`);
  ids.add(story.id);
  for (const field of ['title', 'short', 'place', 'trendSignals']) {
    if (typeof story[field] !== 'string' || !story[field].trim()) throw new Error(`${story.id}: falta ${field}.`);
  }
  if (!allowedTypes.has(story.type)) throw new Error(`${story.id}: type no permitido.`);
  if (!allowedStatuses.has(story.status)) throw new Error(`${story.id}: status no publicable.`);
  for (const field of ['score', 'footage', 'virality', 'fit']) {
    if (!Number.isInteger(story[field]) || story[field] < 0 || story[field] > 100) {
      throw new Error(`${story.id}: ${field} debe ser un entero de 0 a 100.`);
    }
  }
  if (story.score < 75 || story.footage < 70) throw new Error(`${story.id}: no alcanza el mínimo editorial.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(story.discoveredAt)) throw new Error(`${story.id}: discoveredAt debe usar AAAA-MM-DD.`);
  if (!Array.isArray(story.sources) || story.sources.length < 2) throw new Error(`${story.id}: necesita al menos dos fuentes.`);
  for (const source of story.sources) {
    if (!Array.isArray(source) || source.length !== 3 || !source.every((value) => typeof value === 'string' && value.trim())) {
      throw new Error(`${story.id}: cada fuente debe contener nombre, URL y descripción.`);
    }
    try {
      const url = new URL(source[1]);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      throw new Error(`${story.id}: URL de fuente no válida: ${source[1]}`);
    }
  }
}

