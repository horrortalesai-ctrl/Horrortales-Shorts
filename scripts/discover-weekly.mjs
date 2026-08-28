import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(root, 'config', 'discovery.json');
const jsonPath = resolve(root, 'data', 'weekly-cases.json');
const jsPath = resolve(root, 'data', 'weekly-cases.js');
const checkOnly = process.argv.includes('--check');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const userAgent = 'HorrorTalesBot/0.2 (+https://github.com/; weekly editorial discovery)';

const visualTerms = [
  'video','vídeo','footage','cctv','bodycam','camera','cámara','recording','grabación',
  'livestream','live tv','broadcast','caught on camera','images','imágenes','photos','fotos'
];
const viralTerms = [
  'missing','desaparecid','mystery','misterio','unexplained','sin explicación','rescue','rescate',
  'surviv','trapped','atrapad','shocking','extraño','strange','disturbing','perturbador','vanished',
  'disaster','desastre','found alive','hallado con vida','cult','secta','hoax','secuestro'
];
const sensitiveTerms = ['graphic video','gore','uncensored death','suicide video','vídeo del suicidio'];

if (checkOnly) {
  const stored = JSON.parse(await readFile(jsonPath, 'utf8'));
  if (!Array.isArray(stored)) throw new Error('data/weekly-cases.json debe contener un array.');
  for (const item of stored) validateStory(item);
  console.log(`OK: ${stored.length} casos semanales válidos.`);
  process.exit(0);
}

const results = await Promise.allSettled([
  ...config.googleNewsQueries.map(fetchGoogleNews),
  ...config.gdeltQueries.map(fetchGdelt),
  ...config.redditCommunities.map(fetchReddit),
  ...(process.env.YOUTUBE_API_KEY ? config.youtubeQueries.map(fetchYouTube) : [])
]);

const raw = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
const failures = results.filter((result) => result.status === 'rejected');
for (const failure of failures) console.warn(`Proveedor omitido: ${failure.reason?.message || failure.reason}`);

const fresh = raw
  .filter(hasEditorialSignal)
  .map(enrichCandidate)
  .filter((item) => item.score >= config.minimumScore && item.footage >= config.minimumFootageScore)
  .sort((a, b) => b.score - a.score || b.footage - a.footage);

const grouped = deduplicate(fresh).slice(0, config.maximumNewCases);
const previous = await readJsonSafe(jsonPath, []);
const cutoff = Date.now() - (56 * 24 * 60 * 60 * 1000);
const currentIds = new Set(grouped.map((item) => item.id));
const archive = previous.filter((item) => !currentIds.has(item.id) && Date.parse(item.discoveredAt) >= cutoff);
const output = [...grouped, ...archive]
  .sort((a, b) => Date.parse(b.discoveredAt) - Date.parse(a.discoveredAt) || b.score - a.score)
  .slice(0, config.maximumArchiveCases);

await mkdir(dirname(jsonPath), { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
await writeFile(jsPath, `// Generated automatically every Friday. Do not edit by hand.\nwindow.HORRORTALES_WEEKLY = ${JSON.stringify(output, null, 2)};\n`, 'utf8');
console.log(`Descubrimiento terminado: ${raw.length} señales, ${grouped.length} casos nuevos, ${output.length} visibles.`);

async function fetchGoogleNews(query) {
  const params = new URLSearchParams({ q: `${query} when:${config.lookbackDays}d`, hl: 'es', gl: 'ES', ceid: 'ES:es' });
  const xml = await fetchText(`https://news.google.com/rss/search?${params}`);
  return parseRss(xml).map((item) => ({
    ...item,
    provider: 'Google News',
    engagement: 0
  }));
}

async function fetchGdelt(query) {
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    maxrecords: '50',
    format: 'json',
    timespan: `${config.lookbackDays}d`,
    sort: 'hybridrel'
  });
  const response = await fetchJson(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`);
  return (response.articles || []).map((item) => ({
    title: item.title,
    url: item.url,
    summary: `Artículo detectado en ${item.domain || 'una fuente informativa'} con señales visuales y potencial narrativo.`,
    publishedAt: parseGdeltDate(item.seendate),
    provider: `GDELT · ${item.domain || 'prensa'}`,
    engagement: 0
  }));
}

async function fetchReddit(community) {
  const url = `https://www.reddit.com/r/${encodeURIComponent(community)}/top.json?t=week&limit=35&raw_json=1`;
  const response = await fetchJson(url);
  return (response.data?.children || []).map(({ data }) => ({
    title: data.title,
    url: data.url_overridden_by_dest || `https://www.reddit.com${data.permalink}`,
    discussionUrl: `https://www.reddit.com${data.permalink}`,
    summary: cleanText(data.selftext || `Conversación destacada en r/${community}.`),
    publishedAt: new Date(data.created_utc * 1000).toISOString(),
    provider: `Reddit · r/${community}`,
    engagement: Number(data.ups || 0) + Number(data.num_comments || 0) * 2,
    isVideo: Boolean(data.is_video) || /youtu|vimeo|tiktok|instagram/i.test(data.url || '')
  }));
}

async function fetchYouTube(query) {
  const after = new Date(Date.now() - config.lookbackDays * 86400000).toISOString();
  const params = new URLSearchParams({
    part: 'snippet', type: 'video', maxResults: '25', order: 'viewCount', q: query,
    publishedAfter: after, key: process.env.YOUTUBE_API_KEY
  });
  const response = await fetchJson(`https://www.googleapis.com/youtube/v3/search?${params}`);
  return (response.items || []).map((item) => ({
    title: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    summary: cleanText(item.snippet.description),
    publishedAt: item.snippet.publishedAt,
    provider: `YouTube · ${item.snippet.channelTitle}`,
    engagement: 0,
    isVideo: true
  }));
}

function enrichCandidate(candidate) {
  const title = cleanTitle(candidate.title);
  const text = `${title} ${candidate.summary || ''}`.toLowerCase();
  const visualMatches = countMatches(text, visualTerms);
  const viralMatches = countMatches(text, viralTerms);
  const ageDays = Math.max(0, (Date.now() - Date.parse(candidate.publishedAt || new Date())) / 86400000);
  const recencyBoost = Math.max(0, 12 - ageDays * 1.5);
  const socialBoost = Math.min(18, Math.log10(Math.max(1, candidate.engagement || 0)) * 6);
  const footage = clamp(48 + visualMatches * 9 + (candidate.isVideo ? 28 : 0) + (/reddit|youtube/i.test(candidate.provider) ? 5 : 0));
  const virality = clamp(46 + viralMatches * 6 + recencyBoost + socialBoost);
  const fit = clamp(65 + Math.min(18, viralMatches * 4) + (title.length < 110 ? 8 : 0));
  const penalty = sensitiveTerms.some((term) => text.includes(term)) ? 14 : 0;
  const score = clamp(Math.round(virality * .4 + footage * .4 + fit * .2 - penalty));
  const type = classify(text);
  const discoveredAt = new Date().toISOString().slice(0, 10);
  const id = 100000000 + parseInt(createHash('sha1').update(normalize(title)).digest('hex').slice(0, 7), 16);
  const summary = truncate(cleanText(candidate.summary || ''), 210) || 'Caso reciente detectado por sus señales narrativas y la posible disponibilidad de material audiovisual.';
  const sourceMeta = `${candidate.provider} · publicado ${formatDate(candidate.publishedAt)}`;
  const sources = [[candidate.provider, candidate.url, sourceMeta]];
  if (candidate.discussionUrl && candidate.discussionUrl !== candidate.url) {
    sources.push(['Conversación y señales sociales', candidate.discussionUrl, 'Reddit · comentarios y contexto']);
  }
  return {
    id, type, title, short: summary,
    place: `Tendencia · ${discoveredAt}`,
    score, footage, virality, fit,
    recent: 1000 + Math.round(recencyBoost),
    weekly: true,
    discoveredAt,
    trendSignals: `${candidate.provider}; ${visualMatches} señales visuales; interés ${Math.round(virality)}/100`,
    sources
  };
}

function deduplicate(items) {
  const output = [];
  for (const item of items) {
    const match = output.find((saved) => similarity(saved.title, item.title) >= .68);
    if (!match) {
      output.push(item);
      continue;
    }
    for (const source of item.sources) {
      if (!match.sources.some((existing) => canonicalUrl(existing[1]) === canonicalUrl(source[1]))) match.sources.push(source);
    }
    match.score = clamp(match.score + 3);
    match.virality = clamp(match.virality + 4);
    match.trendSignals = `${match.trendSignals}; ${match.sources.length} fuentes independientes`;
  }
  return output;
}

function hasEditorialSignal(item) {
  if (!item?.title || !item?.url) return false;
  const text = `${item.title} ${item.summary || ''}`.toLowerCase();
  return viralTerms.some((term) => text.includes(term)) && visualTerms.some((term) => text.includes(term) || item.isVideo);
}

function classify(text) {
  if (/missing|desaparecid|vanished|sin rastro/.test(text)) return 'Desaparición';
  if (/surviv|rescue|rescate|trapped|atrapad|found alive/.test(text)) return 'Supervivencia';
  if (/murder|asesin|crime|crimen|kidnap|secuestro/.test(text)) return 'Crimen';
  if (/mystery|misterio|unexplained|sin explicación|strange/.test(text)) return 'Misterio';
  return 'Perturbador';
}

function parseRss(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const body = match[1];
    return {
      title: decodeXml(tag(body, 'title')),
      url: decodeXml(tag(body, 'link')),
      summary: cleanText(decodeXml(tag(body, 'description'))),
      publishedAt: new Date(tag(body, 'pubDate')).toISOString()
    };
  }).filter((item) => item.title && item.url);
}

function tag(xml, name) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return match ? match[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : '';
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': userAgent, accept: 'application/xml,text/xml,*/*' }, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${response.status} al consultar ${new URL(url).hostname}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': userAgent, accept: 'application/json' }, signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${response.status} al consultar ${new URL(url).hostname}`);
  return response.json();
}

async function readJsonSafe(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; }
}

function cleanTitle(value = '') {
  return decodeXml(value).replace(/\s+[|–—-]\s+[^|–—-]{2,45}$/u, '').replace(/\s+/g, ' ').trim();
}

function cleanText(value = '') {
  return decodeXml(value).replace(/<[^>]*>/g, ' ').replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
}

function decodeXml(value = '') {
  const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&([a-z]+);/gi, (all, name) => entities[name.toLowerCase()] ?? all);
}

function normalize(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\b(the|a|an|el|la|los|las|de|del|en|un|una|and|y)\b/g, ' ').replace(/\s+/g, ' ').trim();
}

function similarity(a, b) {
  const left = new Set(normalize(a).split(' ').filter(Boolean));
  const right = new Set(normalize(b).split(' ').filter(Boolean));
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
}

function canonicalUrl(value) {
  try { const url = new URL(value); url.search = ''; url.hash = ''; return url.toString(); } catch { return value; }
}

function countMatches(text, terms) { return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0); }
function clamp(number) { return Math.max(0, Math.min(100, Math.round(number))); }
function truncate(value, length) { return value.length > length ? `${value.slice(0, length - 1).trim()}…` : value; }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? 'fecha reciente' : date.toISOString().slice(0, 10); }
function parseGdeltDate(value = '') { return /^\d{8}T\d{6}Z$/.test(value) ? `${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}T${value.slice(9,11)}:${value.slice(11,13)}:${value.slice(13,15)}Z` : new Date().toISOString(); }

function validateStory(item) {
  const required = ['id','type','title','short','score','footage','virality','fit','sources'];
  for (const key of required) if (item[key] === undefined) throw new Error(`Caso semanal sin ${key}.`);
  if (!Array.isArray(item.sources) || !item.sources.length) throw new Error(`Caso ${item.title} sin fuentes.`);
  if (item.score < 0 || item.score > 100 || item.footage < 0 || item.footage > 100) throw new Error(`Score inválido en ${item.title}.`);
}
