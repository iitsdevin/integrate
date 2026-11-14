#!/usr/bin/env node
// Turn a book into plain text with page or section markers, ready to be read when
// building a private pack.   node scripts/book-text.mjs <book.pdf|.epub|.txt|.md> [out.txt]
// Markers look like  ===== p. 12 =====  (PDF) or  ===== section 3: Title =====  (EPUB),
// so a pack's lessons can carry page references back to the source.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, extname, basename } from 'node:path';

const [, , input, outArg] = process.argv;
if (!input) { console.error('usage: node scripts/book-text.mjs <book.pdf|.epub|.txt|.md> [out.txt]'); process.exit(2); }
const ext = extname(input).toLowerCase();
const out = outArg || `packs/${basename(input, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}/book.txt`;

const untag = (html) => html
  .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
  .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/[ \t]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

async function pdf(buf) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true, verbosity: 0 }).promise;
  const parts = [];
  let empty = 0;
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const tc = await page.getTextContent();
    let text = '', lastY = null;
    for (const it of tc.items) {
      if (!('str' in it)) continue;
      const y = it.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) text += '\n'; else if (text && !text.endsWith(' ') && !text.endsWith('\n')) text += ' ';
      text += it.str; lastY = y;
    }
    text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (!text) empty++;
    parts.push(`===== p. ${n} =====\n${text}`);
  }
  return { text: parts.join('\n\n'), units: doc.numPages, unit: 'pages', empty };
}

async function epub(buf) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buf);
  const container = await zip.file('META-INF/container.xml')?.async('string');
  const opfPath = /full-path="([^"]+)"/.exec(container || '')?.[1];
  if (!opfPath) throw new Error('Not a readable EPUB (no container.xml).');
  const opf = await zip.file(opfPath).async('string');
  const base = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
  const manifest = {};
  for (const m of opf.matchAll(/<item\b[^>]*>/g)) { const id = /\bid="([^"]+)"/.exec(m[0])?.[1], href = /\bhref="([^"]+)"/.exec(m[0])?.[1]; if (id && href) manifest[id] = decodeURIComponent(href); }
  const spine = [...opf.matchAll(/<itemref\b[^>]*idref="([^"]+)"/g)].map((m) => manifest[m[1]]).filter(Boolean);
  const parts = [];
  let n = 0, empty = 0;
  for (const href of spine) {
    const f = zip.file(base + href);
    if (!f) continue;
    const html = await f.async('string');
    const title = untag(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i.exec(html)?.[1] || /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '').split('\n')[0].slice(0, 80);
    const text = untag(/<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] || html);
    if (!text) { empty++; continue; }
    parts.push(`===== section ${++n}${title ? ': ' + title : ''} =====\n${text}`);
  }
  return { text: parts.join('\n\n'), units: n, unit: 'sections', empty };
}

const buf = await readFile(input);
let r;
if (ext === '.pdf') r = await pdf(buf);
else if (ext === '.epub') r = await epub(buf);
else if (['.txt', '.md', '.markdown'].includes(ext)) r = { text: buf.toString('utf8'), units: 1, unit: 'file', empty: 0 };
else { console.error(`Can't read ${ext || 'this'} files. Use a PDF, EPUB, .txt or .md.`); process.exit(2); }

await mkdir(dirname(out), { recursive: true });
await writeFile(out, r.text + '\n');
const words = r.text.split(/\s+/).filter(Boolean).length;
console.log(`${out}: ${r.units} ${r.unit}, about ${words.toLocaleString('en-AU')} words.`);
if (r.unit === 'pages' && r.empty > r.units * 0.5) console.log(`Warning: ${r.empty} of ${r.units} pages had no text. This looks like a scan (page images); it needs OCR before it can be used.`);
