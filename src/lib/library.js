// Your library: books you add are read on this device, split into passages and kept in
// IndexedDB. Search is BM25 over those passages, so only the relevant bits go to Claude.

const DB = 'bmo2-library', STORE = 'books';
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
    const out = fn(s);
    t.oncomplete = () => res(out?.result ?? out);
    t.onerror = () => rej(t.error);
  });
}

let cache = null; // full books, in memory once loaded
let index = null;
const listeners = new Set();
export const onLibraryChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const changed = () => { index = null; listeners.forEach((l) => l()); };

export async function listBooks() {
  if (!cache) cache = await tx('readonly', (s) => s.getAll());
  return cache.map(({ chunks, ...meta }) => ({ ...meta, passages: chunks.length }));
}
async function allBooks() { if (!cache) await listBooks(); return cache; }

export async function saveBook(book) {
  await tx('readwrite', (s) => s.put(book));
  cache = null; await listBooks(); changed();
}
export async function deleteBook(id) {
  await tx('readwrite', (s) => s.delete(id));
  cache = null; await listBooks(); changed();
}
export async function renameBook(id, patch) {
  const books = await allBooks();
  const b = books.find((x) => x.id === id);
  if (b) await saveBook({ ...b, ...patch });
}

// ---------- reading files ----------
const CHUNK = 1100;
function chunkText(text, ref, out) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return;
  const sentences = clean.split(/(?<=[.!?…”"])\s+/);
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > CHUNK && cur) { out.push({ ref, t: cur.trim() }); cur = ''; }
    cur += ' ' + s;
  }
  if (cur.trim().length > 40 || !out.length) out.push({ ref, t: cur.trim() });
}

async function readPdf(file, onProgress) {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const meta = await doc.getMetadata().catch(() => null);
  const chunks = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    chunkText(tc.items.map((it) => it.str).join(' '), 'p. ' + i, chunks);
    if (i % 10 === 0) onProgress?.(i / doc.numPages);
  }
  return { chunks, title: meta?.info?.Title, author: meta?.info?.Author, pages: doc.numPages, unit: 'page' };
}

async function readEpub(file, onProgress) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const parse = (xml, type = 'application/xml') => new DOMParser().parseFromString(xml, type);
  const container = parse(await zip.file('META-INF/container.xml').async('text'));
  const opfPath = container.querySelector('rootfile').getAttribute('full-path');
  const dir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
  const opf = parse(await zip.file(opfPath).async('text'));
  const title = opf.getElementsByTagName('dc:title')[0]?.textContent;
  const author = opf.getElementsByTagName('dc:creator')[0]?.textContent;
  const manifest = {};
  opf.querySelectorAll('manifest > item').forEach((it) => { manifest[it.getAttribute('id')] = it.getAttribute('href'); });
  const spine = [...opf.querySelectorAll('spine > itemref')].map((it) => manifest[it.getAttribute('idref')]).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < spine.length; i++) {
    const path = decodeURIComponent(dir + spine[i]).replace(/[^/]+\/\.\.\//g, '');
    const f = zip.file(path);
    if (!f) continue;
    const html = parse(await f.async('text'), 'text/html');
    const heading = html.querySelector('h1, h2, h3')?.textContent?.trim();
    chunkText(html.body?.textContent || '', heading ? heading.slice(0, 60) : 'section ' + (i + 1), chunks);
    onProgress?.((i + 1) / spine.length);
  }
  return { chunks, title, author, pages: spine.length, unit: 'section' };
}

async function readText(file) {
  const text = await file.text();
  const chunks = [];
  chunkText(text, 'text', chunks);
  chunks.forEach((c, i) => { c.ref = 'part ' + (i + 1); });
  return { chunks, unit: 'part' };
}

export async function addBookFromFile(file, onProgress) {
  const name = file.name.replace(/\.[^.]+$/, '');
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  let res;
  if (ext === 'pdf' || file.type === 'application/pdf') res = await readPdf(file, onProgress);
  else if (ext === 'epub') res = await readEpub(file, onProgress);
  else if (['txt', 'md', 'markdown'].includes(ext) || file.type.startsWith('text/')) res = await readText(file);
  else throw new Error('Only PDF, EPUB or plain text files can be added.');
  const words = res.chunks.reduce((n, c) => n + c.t.split(' ').length, 0);
  if (words < 200) throw new Error("This file has almost no readable text. If it's a scanned PDF, the pages are images and can't be read.");
  const book = {
    id: Date.now().toString(36), title: (res.title || '').trim() || name, author: (res.author || '').trim(),
    addedAt: new Date().toISOString(), file: file.name, unit: res.unit, pages: res.pages || null, words, chunks: res.chunks,
  };
  await saveBook(book);
  return book;
}

// ---------- search ----------
const STOP = new Set('a an and are as at be but by for from has have he her his i if in into is it its me my no not of on or our she so that the their them then there these they this to was we were what when which who will with you your'.split(' '));
const tokens = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);
function stem(w) { return w.length > 4 ? w.replace(/(ing|edly|ed|ly|es|s)$/, '') : w; }

async function buildIndex() {
  const books = await allBooks();
  const docs = [], df = new Map();
  for (const b of books) b.chunks.forEach((c, i) => {
    const tf = new Map();
    for (const t of tokens(c.t)) tf.set(t, (tf.get(t) || 0) + 1);
    let len = 0; tf.forEach((v) => { len += v; });
    tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1));
    docs.push({ bookId: b.id, i, tf, len });
  });
  const avg = docs.reduce((n, d) => n + d.len, 0) / (docs.length || 1);
  index = { docs, df, avg, n: docs.length };
  return index;
}

export async function searchLibrary(query, { bookId, limit = 8 } = {}) {
  const idx = index || (await buildIndex());
  const books = await allBooks();
  const q = [...new Set(tokens(query))];
  if (!q.length || !idx.n) return [];
  const k1 = 1.4, bb = 0.75;
  const scored = [];
  for (const d of idx.docs) {
    if (bookId && d.bookId !== bookId) continue;
    let s = 0;
    for (const t of q) {
      const f = d.tf.get(t); if (!f) continue;
      const n = idx.df.get(t);
      const idf = Math.log(1 + (idx.n - n + 0.5) / (n + 0.5));
      s += idf * (f * (k1 + 1)) / (f + k1 * (1 - bb + bb * d.len / idx.avg));
    }
    if (s > 0) scored.push([s, d]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.slice(0, limit).map(([score, d]) => {
    const b = books.find((x) => x.id === d.bookId);
    return { bookId: b.id, title: b.title, author: b.author, ref: b.chunks[d.i].ref, text: b.chunks[d.i].t, score: Math.round(score * 10) / 10 };
  });
}

export async function storageEstimate() {
  try {
    const persisted = await navigator.storage?.persisted?.();
    const est = await navigator.storage?.estimate?.();
    return { persisted, usage: est?.usage, quota: est?.quota };
  } catch { return {}; }
}
export async function askPersist() { try { return await navigator.storage?.persist?.(); } catch { return false; } }
