#!/usr/bin/env node
// Check a private pack before it is imported.   node scripts/check-pack.mjs <pack.json>
// Applies the rules in docs/packs.md and the checks the app makes on import, and
// reports every problem with the lesson and item it is in. Exit code 1 if any error.
import { readFile } from 'node:fs/promises';

const KEYLESS = new Set(['note', 'head', 'prefix', 'show']);
const arr = Array.isArray;
const str = (x) => typeof x === 'string' && x.trim().length > 0;
const pairs = (x, n = 2) => arr(x) && x.length > 0 && x.every((r) => arr(r) && r.length >= n);
// For each item type: a function returning a problem string, or nothing if it is fine.
const TYPES = {
  note: (b) => !str(b.text) && 'needs "text"',
  head: (b) => !str(b.text) && 'needs "text"',
  text: (b) => !str(b.label) && 'needs "label"',
  list: (b) => !str(b.label) && 'needs "label"',
  blanks: (b) => (!str(b.label) && 'needs "label"') || (!(b.n > 0) && 'needs "n" (how many blanks)'),
  chips: (b) => (!str(b.label) && 'needs "label"') || (!arr(b.options) && !arr(b.groups) && 'needs "options" or "groups"') || (b.groups && !b.groups.every((g) => arr(g) && arr(g[1])) && '"groups" must be [[name, [words], note?]]'),
  one: (b) => (!str(b.label) && 'needs "label"') || (!(arr(b.options) && b.options.length > 1) && 'needs at least two "options"'),
  freq: (b) => !str(b.label) && 'needs "label"',
  scale: (b) => (!str(b.label) && 'needs "label"') || ((!str(b.left) || !str(b.right)) && 'needs "left" and "right" end labels'),
  scales: (b) => (!str(b.label) && 'needs "label"') || (!(arr(b.rows) && b.rows.length) && 'needs "rows"') || ((!str(b.left) || !str(b.right)) && 'needs "left" and "right" end labels'),
  check: (b) => (!str(b.label) && 'needs "label"') || (!arr(b.groups) && !arr(b.items) && 'needs "groups" or a flat "items" list'),
  rank: (b) => (!str(b.label) && 'needs "label"') || (!(arr(b.options) && b.options.length > 1) && 'needs "options"'),
  table: (b) => (!str(b.label) && 'needs "label"') || (!pairs(b.rows) && '"rows" must be [[key, label, example?]]'),
  rows: (b) => (!str(b.label) && 'needs "label"') || (!pairs(b.cols) && '"cols" must be [[key, label, hint?]]'),
  pick: (b) => (!str(b.label) && 'needs "label"') || (!(arr(b.rows) && b.rows.length) && 'needs "rows"') || (!(arr(b.options) && b.options.length > 1) && 'needs "options"'),
  pair: (b) => (!str(b.label) && 'needs "label"') || (!pairs(b.rows) && '"rows" must be [[a, b]]'),
  strike: (b) => !str(b.from) && 'needs "from" (a list key in this lesson)',
  prefix: (b) => (!str(b.from) && 'needs "from" (a list key in this lesson)') || (!pairs(b.steps) && '"steps" must be [[title, prefix]]'),
  show: (b) => (!str(b.from) && 'needs "from" (a lesson id)') || (!pairs(b.keys) && '"keys" must be [[k, label]]'),
  rewrite: (b) => (!str(b.label) && 'needs "label"') || (!pairs(b.rows, 1) && '"rows" must be [[before, suggestion]]'),
  plan: () => false,
  radial: (b) => (!str(b.label) && 'needs "label"') || (!(b.levels > 1) && 'needs "levels"') || (!pairs(b.axes) && '"axes" must be [[name, shortLabel, [levelLabels]?]]'),
  sensemap: (b) => (!str(b.label) && 'needs "label"') || (!(arr(b.rows) && b.rows.length) && 'needs "rows"') || (!(arr(b.zones) && b.zones.length === 3) && '"zones" must be [left, middle, right]'),
  window: (b) => (!str(b.label) && 'needs "label"') || (!pairs(b.bands, 3) && '"bands" must be [[min, title, text]]'),
  feelwheel: (b) => (!str(b.label) && 'needs "label"') || (!(arr(b.groups) && b.groups.every((g) => arr(g) && arr(g[1]))) && '"groups" must be [[name, [words]]]'),
  circles: (b) => (!str(b.label) && 'needs "label"') || (!str(b.from) && 'needs "from" (a list key in this lesson)') || (!(arr(b.rings) && b.rings.length === 3) && '"rings" must be [inner, middle, outer]'),
  spoonday: (b) => !str(b.label) && 'needs "label"',
  pins: (b) => (!str(b.label) && 'needs "label"') || (!(b.image === 'body' || (typeof b.image === 'string' && b.image.startsWith('data:image/'))) && '"image" must be "body" or a data:image/ URL'),
};
const BODY = new Set(['h', 'list', 'ol', 'quote', 'note']);

export function checkPack(raw, bytes = 0) {
  const errors = [], warnings = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
  if (raw?.format !== 'integrate-pack') err('pack', '"format" must be "integrate-pack"');
  if (!/^[a-z0-9-]{2,40}$/.test(raw?.id || '')) err('pack', '"id" must be 2-40 characters of a-z, 0-9 and hyphens');
  if (!str(raw?.title)) err('pack', 'needs a "title"');
  if (!str(raw?.blurb)) warn('pack', 'no "blurb" (the one or two sentences under the title)');
  if (!raw?.source?.title) warn('pack', 'no "source.title" (what this was made from)');
  if (bytes > 40 * 1024 * 1024) err('pack', 'is over 40 MB, the most a phone will import');
  if (!arr(raw?.modules) || !raw.modules.length) { err('pack', 'needs at least one module'); return { errors, warnings, lessons: 0, modules: 0 }; }
  const needIds = new Set((raw.needs || []).map((n) => n[0]));
  const lessonIds = new Set(), all = [];
  raw.modules.forEach((m, mi) => {
    const mw = `module ${mi + 1}${m.name ? ` "${m.name}"` : ''}`;
    if (!str(m.name)) err(mw, 'needs a "name"');
    if (!arr(m.lessons) || !m.lessons.length) { err(mw, 'has no lessons'); return; }
    m.lessons.forEach((l, li) => {
      const lw = `${mw} › lesson ${li + 1}${l.title ? ` "${l.title}"` : ''}`;
      all.push([lw, l]);
      if (!str(l.id)) err(lw, 'needs an "id"'); else if (lessonIds.has(l.id)) err(lw, `id "${l.id}" is used by another lesson`); else lessonIds.add(l.id);
      if (!str(l.title)) err(lw, 'needs a "title"');
      if (!str(l.short)) warn(lw, 'no "short" (the line shown in lists and searched by the Toolkit)');
      if (!l.body?.length && !l.items?.length && !l.steps?.length) err(lw, 'is empty: give it "body", "items" or "steps"');
      (l.needs || []).forEach((n) => { if (!needIds.has(n)) err(lw, `needs "${n}" is not in the pack's "needs" list`); });
      (l.body || []).forEach((b, bi) => {
        if (typeof b === 'string') { if (b.length > 1200) warn(lw, `body paragraph ${bi + 1} is very long (${b.length} characters); split it`); return; }
        if (!BODY.has(b?.t)) err(lw, `body block ${bi + 1} has unknown type "${b?.t}"`);
        else if ((b.t === 'list' || b.t === 'ol') ? !arr(b.items) : !str(b.text)) err(lw, `body block ${bi + 1} (${b.t}) is missing its ${b.t === 'list' || b.t === 'ol' ? '"items"' : '"text"'}`);
      });
      (l.images || []).forEach((im, ii) => { if (!(typeof im?.src === 'string' && im.src.startsWith('data:image/'))) err(lw, `image ${ii + 1} must have a data:image/ "src" (links are dropped on import)`); else if (!str(im.alt)) warn(lw, `image ${ii + 1} has no "alt" text`); });
      if (l.steps && !(arr(l.steps) && l.steps.every(str))) err(lw, '"steps" must be a list of sentences');
      const keys = new Map();
      (l.items || []).forEach((b, bi) => {
        const iw = `${lw} › item ${bi + 1} (${b?.t})`;
        const rule = TYPES[b?.t];
        if (!rule) { err(iw, `unknown item type "${b?.t}"`); return; }
        const bad = rule(b);
        if (bad) err(iw, bad);
        if (!KEYLESS.has(b.t)) {
          if (!str(b.k)) err(iw, 'needs a "k" key (answers are saved under it)');
          else if (keys.has(b.k)) err(iw, `key "${b.k}" is already used in this lesson`);
          else keys.set(b.k, b.t);
        }
      });
      (l.items || []).forEach((b, bi) => {
        const iw = `${lw} › item ${bi + 1} (${b?.t})`;
        if (['strike', 'prefix', 'circles'].includes(b?.t) && str(b.from) && keys.get(b.from) !== 'list') err(iw, `"from": "${b.from}" must be the key of a list item in the same lesson`);
      });
    });
  });
  for (const [lw, l] of all) for (const b of l.items || []) {
    if (b?.t === 'show' && str(b.from) && !lessonIds.has(b.from)) err(lw, `a show item points at lesson "${b.from}", which does not exist`);
    if (b?.suggest?.lesson && !lessonIds.has(b.suggest.lesson)) err(lw, `a blanks item suggests from lesson "${b.suggest.lesson}", which does not exist`);
  }
  return { errors, warnings, lessons: all.length, modules: raw.modules.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node scripts/check-pack.mjs <pack.json>'); process.exit(2); }
  const text = await readFile(file, 'utf8');
  let raw;
  try { raw = JSON.parse(text); } catch (e) { console.error(`${file} is not valid JSON: ${e.message}`); process.exit(1); }
  const r = checkPack(raw, Buffer.byteLength(text));
  for (const w of r.warnings) console.log('warning  ' + w);
  for (const e of r.errors) console.log('ERROR    ' + e);
  console.log(`${r.errors.length ? 'Not ready' : 'Ready to import'}: ${r.modules} module${r.modules === 1 ? '' : 's'}, ${r.lessons} lesson${r.lessons === 1 ? '' : 's'}, ${r.errors.length} error${r.errors.length === 1 ? '' : 's'}, ${r.warnings.length} warning${r.warnings.length === 1 ? '' : 's'}.`);
  process.exit(r.errors.length ? 1 : 0);
}
