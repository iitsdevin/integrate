// Private packs: workbooks you import from a file. They live only in this browser's IndexedDB,
// never in the app's code or on the website, and they're left out of backups (like your books).
// Your answers to them are saved with the rest of your workbook answers, so they are backed up.
// Format: see docs/packs.md.
import { useSyncExternalStore } from 'react';

const DB = 'integrate-packs', STORE = 'packs';
let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(STORE, mode), s = t.objectStore(STORE);
    const req = fn(s);
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
  });
}

// ---------- in-memory list, shared with React ----------
let books = null; // normalised packs, ready to render
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const EMPTY = [];

async function load() {
  try { const raw = (await tx('readonly', (s) => s.getAll())) || []; books = raw.map(normalise).filter(Boolean).sort((a, b) => (a.importedAt < b.importedAt ? -1 : 1)); }
  catch { books = []; }
  emit();
}
if (typeof indexedDB !== 'undefined') load();

export function usePacks() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => books || EMPTY);
}
export const packsLoaded = () => books !== null;
export const getPacks = () => books || [];
export const packView = (id) => `pack-${id}`;

// ---------- import and remove ----------
const MAX = 40 * 1024 * 1024;
export async function importPackText(text) {
  if (text.length > MAX) throw new Error('That pack is too big for this phone (over 40 MB).');
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error("That file isn't a pack. Packs are .json files made for Integrate."); }
  if (raw?.format !== 'integrate-pack') throw new Error("That file isn't an Integrate pack.");
  if (!/^[a-z0-9-]{2,40}$/.test(raw.id || '')) throw new Error('This pack is missing a valid id.');
  if (!raw.title || !Array.isArray(raw.modules) || !raw.modules.length) throw new Error('This pack has no modules.');
  const book = normalise({ ...raw, importedAt: new Date().toISOString() });
  if (!book.lessons.length) throw new Error('This pack has no lessons.');
  const had = getPacks().some((b) => b.id === raw.id);
  await tx('readwrite', (s) => s.put({ ...raw, importedAt: had ? getPacks().find((b) => b.id === raw.id).importedAt : new Date().toISOString(), updatedAt: new Date().toISOString() }));
  try { await navigator.storage?.persist?.(); } catch { /* fine */ }
  await load();
  return { title: book.title, lessons: book.lessons.length, modules: book.modules.length, replaced: had };
}

export async function removePack(id) {
  await tx('readwrite', (s) => s.delete(id));
  await load();
}

// ---------- shape a raw pack like the built-in workbook ----------
const kindOf = (l) => l.kind || (l.steps ? 'practice' : l.items?.length ? 'exercise' : 'learn');
function normalise(raw) {
  try {
    const ns = `pk-${raw.id}:`;
    const ids = new Set(raw.modules.flatMap((m) => (m.lessons || []).map((l) => l.id)));
    const fix = (x) => (x && ids.has(x) ? ns + x : x);
    const item = (b) => {
      const o = { ...b };
      if (o.t === 'check') {
        const g = o.groups || o.items || [];
        o.groups = typeof g[0] === 'string' ? [[null, g]] : g;
        if (o.own === undefined) o.own = true;
      }
      if ((o.t === 'chips' || o.t === 'feelwheel') && o.own === undefined) o.own = true;
      if (o.t === 'chips' && !o.options) o.options = [];
      if (o.from) o.from = o.t === 'show' ? fix(o.from) : o.from;
      if (o.suggest?.lesson) o.suggest = { ...o.suggest, lesson: fix(o.suggest.lesson) };
      return o;
    };
    const modules = raw.modules.map((m, mi) => {
      const no = m.no || String(mi + 1).padStart(2, '0');
      return {
        id: m.id || `m${mi + 1}`, no, name: m.name || `Part ${mi + 1}`, skill: m.skill || '', pages: m.pages || '', intro: m.intro || '',
        lessons: (m.lessons || []).map((l, li) => ({
          mins: 4, ...l, id: ns + (l.id || `${mi}-${li}`), kind: kindOf(l),
          body: l.body || null, items: l.items?.length ? l.items.map(item) : null, steps: l.steps?.length ? l.steps : null,
          images: (l.images || []).filter((im) => typeof im?.src === 'string' && im.src.startsWith('data:image/')),
          moduleId: m.id || `m${mi + 1}`, moduleName: m.name || `Part ${mi + 1}`, moduleNo: no,
        })),
      };
    });
    const lessons = modules.flatMap((m) => m.lessons);
    return {
      id: raw.id, private: true, view: packView(raw.id), title: raw.title,
      eyebrow: raw.eyebrow || 'private pack', big: raw.big || raw.title.split(/\s+/)[0].toLowerCase(), sub: raw.sub || raw.tagline || '',
      blurb: raw.blurb || '', modules, lessons, needs: raw.needs || [], help: raw.help || null,
      source: raw.source || null, pageLabel: raw.pageLabel ?? 'p.', backLabel: raw.backLabel || raw.title,
      importedAt: raw.importedAt, updatedAt: raw.updatedAt,
    };
  } catch { return null; }
}
