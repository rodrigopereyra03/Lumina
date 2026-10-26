#!/usr/bin/env node
// Motor de variedad: elige una combinación coherente de opciones y evita repetir las recientes.
// Uso: node roll.cjs [--aspect landscape|vertical] [--save] [--history ruta.json] [--seed N]
//                   [--format id] [--allow-untested] [--avoid 3] [--preview 5]
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const val = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };

const pools = JSON.parse(fs.readFileSync(path.join(__dirname, 'pools.json'), 'utf8'));
const aspect = val('aspect', 'landscape');
const histPath = path.resolve(val('history', 'motion-history.json'));
const AVOID = parseInt(val('avoid', '3'), 10);
const PREVIEW = parseInt(val('preview', '0'), 10);
const allowUntested = flag('allow-untested');
const forcedFormat = val('format', null);

let history = [];
try { history = JSON.parse(fs.readFileSync(histPath, 'utf8')); } catch (_) { history = []; }

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(parseInt(val('seed', String(Date.now() % 2147483647)), 10));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
function pickN(arr, n) { const a = arr.slice(), out = []; while (a.length && out.length < n) out.push(a.splice(Math.floor(rand() * a.length), 1)[0]); return out; }

function candidate(extraHistory) {
  const formatIds = Object.keys(pools.formats).filter((f) => allowUntested || pools.formats[f].status === 'tested');
  const format = forcedFormat || pick(formatIds);
  const F = pools.formats[format];
  if (!F) throw new Error('formato desconocido: ' + format);

  let paletteIds = Object.keys(pools.palettes);
  if (format === 'flythrough-3d') paletteIds = paletteIds.filter((p) => pools.palettes[p].lightness === 'dark');
  const palette = pick(paletteIds);
  const P = pools.palettes[palette], G = pools.groups[P.group];

  const typeIds = Object.keys(pools.typePairs).filter((t) => G.type.includes(pools.typePairs[t].group));
  const typePair = pick(typeIds.length ? typeIds : Object.keys(pools.typePairs));
  const motion = pick(G.motion);
  const textures = pickN(G.texture.filter((t) => t !== 'none'), 2);
  const camera = pick(F.cameras);
  const opening = pick(F.openings);
  const closing = pick(F.closings);
  const core = pickN(F.core, 3);
  let bgs = F.backgrounds.slice();
  if (P.lightness === 'light') bgs = bgs.filter((b) => b !== 'three-fog-dust' && b !== 'bokeh-circles');
  const background = pick(bgs.length ? bgs : F.backgrounds);
  const transition = format === 'flythrough-3d' ? 'camera-fly' : pick(pools.transitions);
  return { format, palette, typePair, motion, textures, camera, opening, closing, core, background, transition, aspect };
}

function penalty(c, recent) {
  let p = 0, hardFail = false;
  recent.forEach((past, idx) => {
    const w = 1 / (idx + 1);
    const same = pools.keyDims.filter((d) => past[d] === c[d]).length;
    p += same * w;
    if (idx === 0 && same > pools.keyDims.length - 4) hardFail = true;     // vs. la última: al menos 4 de 7 dimensiones clave distintas
    if (c.palette === past.palette || c.typePair === past.typePair) hardFail = true;
    if (idx < 2 && c.format === past.format && Object.keys(pools.formats).length > 2 && !forcedFormat) hardFail = true;
  });
  return hardFail ? p + 100 : p;
}

function roll(extra) {
  const recent = (extra.concat(history)).slice(-AVOID).reverse().map((h) => h.brief || h);
  let best = null, bestP = Infinity;
  for (let i = 0; i < 600; i++) {
    const c = candidate();
    const p = penalty(c, recent);
    if (p < bestP) { best = c; bestP = p; }
    if (p < 100 && i > 30) break;
  }
  return { brief: best, penalty: bestP };
}

function describe(b) {
  const P = pools.palettes[b.palette], T = pools.typePairs[b.typePair], F = pools.formats[b.format];
  const lines = [
    `# Brief de variedad (${b.aspect})`,
    '',
    `- **Formato:** ${b.format} [${F.status}] — ejemplo: examples/${F.example}`,
    `- **Paleta:** #${b.palette} ${P.name} → references/palettes.md (sección ${b.palette}.)`,
    `- **Tipografía:** #${b.typePair} ${T.name} → references/typography.md (par ${b.typePair}.)`,
    `- **Personalidad de movimiento:** ${b.motion} — ${pools.motionPersonalities[b.motion]}`,
    `- **Texturas:** ${b.textures.join(' + ')} → references/effects-techniques.md`,
    `- **Cámara:** ${b.camera} → references/camera-techniques.md`,
    `- **Apertura:** ${b.opening} · **Cierre:** ${b.closing} → references/shot-types.md`,
    `- **Tomas núcleo (usar las 3):** ${b.core.join(', ')} → references/shot-types.md`,
    `- **Fondo vivo:** ${b.background} → references/backgrounds.md`,
    `- **Transición entre beats:** ${b.transition}`,
    '',
    `Necesita: ${F.needs}`,
  ];
  if (F.status !== 'tested') lines.push('', '⚠ Formato NO probado: avisar al usuario y validar con snapshots antes de renderizar.');
  return lines.join('\n');
}

if (PREVIEW > 0) {
  const sim = [];
  for (let i = 0; i < PREVIEW; i++) { const r = roll(sim); sim.push(r.brief); console.log(`#${i + 1} ${r.brief.format} | pal ${r.brief.palette} | tipo ${r.brief.typePair} | ${r.brief.motion} | ${r.brief.camera} | ${r.brief.opening} → ${r.brief.closing} | core: ${r.brief.core.join(',')} | bg ${r.brief.background}`); }
  process.exit(0);
}

const result = roll([]);
console.log(describe(result.brief));
console.log('\n```json\n' + JSON.stringify(result.brief) + '\n```');
if (flag('save')) {
  history.push({ date: new Date().toISOString(), brief: result.brief });
  fs.writeFileSync(histPath, JSON.stringify(history, null, 2));
  console.error(`(guardado en ${histPath}; historial: ${history.length} tiradas)`);
}
