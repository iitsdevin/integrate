import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, findCategory, allPractices, allReadings } from '../data/content.js';
import { useStore, setCheck, localDate } from '../lib/store.js';
import { kriyaSit } from '../data/daily.js';
import PracticeSheet from '../components/PracticeSheet.jsx';
import { listBooks, onLibraryChange } from '../lib/library.js';
import { Spark, Icon, PracticeBody, PageBar } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';
import Course from './Course.jsx';
import { COURSE } from '../data/course.js';
import Workbook from './Workbook.jsx';
import { WORKBOOK } from '../data/workbook.js';
import { usePacks, packsLoaded } from '../lib/packs.js';

// A category opens out of its tile, and closes back into it: the tile's name and the
// page's big title are treated as one element that moves and grows between the two
// places (the browser's View Transitions). Where that is unsupported, or motion is
// reduced, the page simply slides as before.
let lastCat = null; // the tile to return into
function morph(change) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof document.startViewTransition !== 'function' || still) { change(); return; }
  const root = document.documentElement;
  root.dataset.vt = '1';
  const t = document.startViewTransition(() => new Promise((done) => {
    const settle = () => requestAnimationFrame(() => requestAnimationFrame(done));
    window.addEventListener('hashchange', settle, { once: true });
    setTimeout(done, 400); // never leave the page frozen if nothing changed
    change();
  }));
  t.finished.finally(() => { delete root.dataset.vt; });
}

export default function Toolkit({ view, onView, onBegin, onAskBook }) {
  if (view === 'library') return null; // rendered by Library.jsx
  if (view === COURSE.id) return <Course onBack={() => onView(null)} onBegin={onBegin} />;
  if (view === WORKBOOK.id) return <Workbook onBack={() => onView(null)} />;
  if (view?.startsWith('pack-')) return <PackView view={view} onView={onView} />;
  const cat = view && findCategory(view);
  if (cat) return <Category cat={cat} onBack={() => { lastCat = cat.id; morph(() => onView(null)); }} onBegin={onBegin} onAskBook={onAskBook} />;
  return <Grid onView={onView} onBegin={onBegin} />;
}

function PackView({ view, onView }) {
  const packs = usePacks();
  const book = packs.find((b) => b.view === view);
  if (book) return <Workbook key={book.id + book.updatedAt} book={book} onBack={() => onView(null)} />;
  return (
    <main className="screen">
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => onView(null)}><Icon.back /> Toolkit</button>
      <p className="notice">{packsLoaded() ? "That pack isn't on this phone. Import it from Settings, under Private packs." : 'Opening…'}</p>
    </main>
  );
}

// Everything searchable in one flat list: practices, readings, course and workbook lessons.
function useSearch(q, packs) {
  return useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    const hit = (...parts) => { const hay = parts.filter(Boolean).join(' ').toLowerCase(); return words.every((w) => hay.includes(w)); };
    const out = [];
    for (const x of allPractices()) if (hit(x.name, x.summary, x.who, x.category, x.group, x.when)) out.push({ key: 'p-' + x.id, kind: 'practice', title: x.name, meta: x.mins || '', sub: `${x.category} · ${x.summary || x.who || ''}`, item: x });
    for (const x of allReadings()) if (hit(x.title, x.author, x.seed, x.category)) out.push({ key: 'r-' + x.id, kind: 'reading', title: x.title, meta: 'READING', sub: `${x.category} · ${x.author}`, view: x.categoryId });
    for (const l of COURSE.lessons) if (hit(l.title, l.short, l.moduleName)) out.push({ key: 'c-' + l.id, kind: 'lesson', title: l.title, meta: 'COURSE', sub: `ACT for ADHD · ${l.moduleName}`, view: COURSE.id });
    for (const l of WORKBOOK.lessons) if (hit(l.title, l.short, l.moduleName)) out.push({ key: 'w-' + l.id, kind: 'lesson', title: l.title, meta: 'WORKBOOK', sub: `Neurodivergence skills · ${l.moduleName}`, view: WORKBOOK.id });
    for (const b of packs) for (const l of b.lessons) if (hit(l.title, l.short, b.title)) out.push({ key: 'k-' + b.id + l.id, kind: 'lesson', title: l.title, meta: 'PRIVATE', sub: b.title, view: b.view });
    return out.slice(0, 40);
  }, [q, packs]);
}

function Grid({ onView, onBegin }) {
  const packs = usePacks();
  const [q, setQ] = useState('');
  const [practice, setPractice] = useState(null);
  const results = useSearch(q, packs);
  const wbAll = useStore((s) => s.wb?.done) || {};
  const [books, setBooks] = useState([]);
  const done = useStore((s) => s.course?.done) || {};
  const doneCount = COURSE.lessons.filter((l) => done[l.id]).length;
  const wbDone = useStore((s) => s.wb?.done) || {};
  const wbCount = WORKBOOK.lessons.filter((l) => wbDone[l.id]).length;
  useEffect(() => { const load = () => listBooks().then(setBooks).catch(() => {}); load(); return onLibraryChange(load); }, []);
  const left = [CATEGORIES[0], CATEGORIES[2], CATEGORIES[4], CATEGORIES[6]];
  const right = [CATEGORIES[1], CATEGORIES[3], CATEGORIES[5], CATEGORIES[7]];
  const tile = (c, i, col) => {
    const tall = (col === 0 ? i % 2 === 0 : i % 2 === 1);
    return (
      <button key={c.id} type="button" className={`tile ${c.tile}${tall ? ' tall' : ''}`}
        onClick={(e) => { const b = e.currentTarget.querySelector('b'); if (b) b.style.viewTransitionName = 'cat-title'; lastCat = c.id; morph(() => onView(c.id)); }}>
        <span className="mono-s caps">{c.no}{c.tag ? ' — ' + c.tag : ''}</span>
        <span><b style={lastCat === c.id ? { viewTransitionName: 'cat-title' } : undefined}>{c.name}</b><span className="h mono-s">{c.hint}</span></span>
      </button>
    );
  };
  return (
    <main className="screen">
      <header style={{ position: 'relative' }}>
        <p className="mono caps">Everything beyond the daily sit</p>
        <h1 className="word title-xl" style={{ marginTop: 6 }}>toolkit</h1>
        <Spark size={18} style={{ right: 8, top: 28 }} />
      </header>
      <div className="search">
        <Icon.search />
        <label className="sr" htmlFor="tkq">Search the toolkit</label>
        <input id="tkq" type="search" className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search practices, readings, lessons" enterKeyHint="search" autoCapitalize="none" autoCorrect="off" />
      </div>
      <PracticeSheet item={practice} onClose={() => setPractice(null)} onBegin={onBegin} />
      {results && (
        <section aria-label="Search results">
          <p className="group-note" role="status">{results.length ? `${results.length}${results.length === 40 ? '+' : ''} found` : 'Nothing matches that. Try a single word, like “breath” or “walking”.'}</p>
          <div className="list">
            {results.map((r) => (
              <button key={r.key} type="button" className="item" onClick={() => (r.kind === 'practice' ? setPractice(r.item) : onView(r.view))}>
                <span className="n">{r.kind === 'practice' ? '●' : '→'}</span>
                <span className="t">{r.title}</span>
                <span className="m">{r.meta}</span>
                <span className="d">{r.sub}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      {!results && <>
      <nav className="tiles" aria-label="Toolkit categories">
        <div className="col">{left.map((c, i) => tile(c, i, 0))}</div>
        <div className="col">{right.map((c, i) => tile(c, i, 1))}</div>
      </nav>
      <button type="button" className="tile lime" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center' }} onClick={() => onView(COURSE.id)}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="mono-s caps">09 — course · {doneCount ? `${doneCount} of ${COURSE.lessons.length} done` : `7 modules · ${COURSE.lessons.length} short lessons`}</span>
          <b style={{ marginTop: 4 }}>ACT for ADHD</b>
          <span className="h mono-s">guided exercises, metaphors, worksheets and tools for the six ACT skills</span>
        </span>
        <Icon.arrow />
      </button>
      <button type="button" className="tile lavender" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center' }} onClick={() => onView(WORKBOOK.id)}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="mono-s caps">10 — workbook · {wbCount ? `${wbCount} of ${WORKBOOK.lessons.length} done` : `10 modules · ${WORKBOOK.lessons.length} lessons`}</span>
          <b style={{ marginTop: 4 }}>Neurodivergence skills</b>
          <span className="h mono-s">kemp and mitchelson's workbook for autism and adhd, every exercise interactive</span>
        </span>
        <Icon.arrow />
      </button>
      {packs.map((b, i) => {
        const n = b.lessons.filter((l) => wbAll[l.id]).length;
        return (
          <button key={b.id} type="button" className="tile lime" style={{ minHeight: 0, flexDirection: 'row', alignItems: 'center' }} onClick={() => onView(b.view)}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="mono-s caps">{11 + i} — private · {n ? `${n} of ${b.lessons.length} done` : `${b.modules.length} module${b.modules.length > 1 ? 's' : ''} · ${b.lessons.length} lessons`}</span>
              <b style={{ marginTop: 4, overflowWrap: 'anywhere' }}>{b.title}</b>
              {(b.sub || b.source?.title) && <span className="h mono-s">{(b.sub || b.source.title).toLowerCase()}</span>}
            </span>
            <Icon.arrow />
          </button>
        );
      })}
      <button type="button" className="tile lib" onClick={() => onView('library')}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="mono-s caps">{11 + packs.length} — ask your books</span>
          <b style={{ marginTop: 4 }}>Your library</b>
          <span className="h mono-s">{books.length ? `${books.length} book${books.length > 1 ? 's' : ''} on this phone` : 'add PDFs or EPUBs you own, then ask them questions'}</span>
        </span>
        <Icon.arrow />
      </button>
      </>}
    </main>
  );
}

function Category({ cat, onBack, onBegin, onAskBook }) {
  const checks = useStore((s) => s.checks);
  const sits = useStore((s) => s.sits);
  const [tab, setTab] = useState('practices');
  const [open, setOpen] = useState(null); // { type, item }
  const [books, setBooks] = useState([]);
  useEffect(() => { listBooks().then(setBooks).catch(() => {}); }, []);
  const count = cat.groups.reduce((n, g) => n + (g.kind === 'list' ? 0 : g.items.length), 0);
  const thisMonth = localDate().slice(0, 7);
  const kriyaDone = useMemo(() => sits.filter((x) => x.kind === 'kriya' && x.done).length, [sits]);
  const bookFor = (rd) => books.find((b) => b.title.toLowerCase().includes(rd.title.toLowerCase().slice(0, 18)));

  useEffect(() => { window.scrollTo(0, 0); }, [cat.id]);

  return (
    <main className="screen">
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={onBack}><Icon.back /> Toolkit</button>
      <PageBar title={cat.name.toLowerCase()} onBack={onBack} />
      <header style={{ position: 'relative', minHeight: 100 }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: 64, top: 28, width: 'min(190px, 55%)', height: 64, background: cat.tile === 'lavender' ? 'var(--block1)' : 'var(--block3)' }} />
        <h1 className="word" style={{ position: 'relative', fontSize: cat.name.length > 10 ? '4.2rem' : '6.4rem', overflowWrap: 'anywhere', viewTransitionName: 'cat-title', width: 'fit-content', maxWidth: '100%' }}>{cat.name.toLowerCase()}</h1>
        <p className="mono-s caps" style={{ position: 'relative', marginTop: 8 }}>{cat.no} — {cat.blurb}</p>
      </header>

      {cat.readings.length > 0 && (
        <div className="seg" role="tablist" aria-label={cat.name}>
          <button type="button" role="tab" aria-selected={tab === 'practices'} onClick={() => setTab('practices')}>Practices · {count}</button>
          <button type="button" role="tab" aria-selected={tab === 'readings'} onClick={() => setTab('readings')}>Readings · {cat.readings.length}</button>
        </div>
      )}

      {tab === 'practices' && (
        <div role="tabpanel">
          {cat.kriya && (
            <div className="card card-lav" style={{ marginBottom: 8 }}>
              <p className="mono-s caps">Jacqui's kriya · {kriyaDone >= 15 ? 'block complete' : `${kriyaDone} of 15 days`}</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '4px 0 10px' }}>{kriyaDone >= 15 ? 'All 15 days done.' : `Day ${kriyaDone + 1}: about 30 minutes. It moves on only when you finish a day.`}</p>
              {kriyaDone < 15 && <button type="button" className="btn btn-ink btn-block" onClick={() => onBegin(kriyaSit(kriyaDone + 1))}>Begin day {kriyaDone + 1}</button>}
            </div>
          )}
          {cat.groups.map((g) => (
            <section key={g.title} aria-label={g.title}>
              <div className="group-title"><h2>{g.title}</h2></div>
              {g.note && <p className="group-note">{g.note}</p>}
              {g.kind === 'list' ? (
                <ul className="prose" style={{ padding: '10px 0 0 20px' }}>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
              ) : g.kind === 'months' ? (
                <div className="list">
                  {g.items.map((m) => {
                    const [y, mo] = m.month.split('-').map(Number);
                    const now = m.month === thisMonth;
                    return (
                      <div key={m.id} className="entry" style={now ? { background: 'var(--raised)', margin: '0 -8px', padding: '12px 8px' } : undefined}>
                        <p className="mono-s caps">{new Date(y, mo - 1, 1).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })} · {m.theme} · {m.season}{now ? ' · this month' : ''}</p>
                        {m.junenote && <p className="soft">{m.junenote}</p>}
                        <p>Short: {m.short.url ? <a href={m.short.url} target="_blank" rel="noopener">{m.short.name}</a> : m.short.name}</p>
                        {m.long && <p>Longer: {m.long.url ? <a href={m.long.url} target="_blank" rel="noopener">{m.long.name}</a> : m.long.name} <span className="mono-s">({m.long.mins})</span></p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="list">
                  {g.items.map((it, i) => (
                    <button key={it.id} type="button" className="item" onClick={() => setOpen({ type: 'practice', item: it })}>
                      <span className="n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="t">{it.name}</span>
                      <span className="m">{it.mins || ''}</span>
                      {(it.summary || it.who) && <span className="d">{it.summary || it.who}</span>}
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}
          {cat.notes?.map((n) => (
            <section key={n.title}>
              <div className="group-title"><h2>{n.title}</h2></div>
              <ul className="prose" style={{ padding: '10px 0 0 20px' }}>{n.items.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          ))}
          {cat.checks && (
            <section>
              <div className="group-title"><h2>{cat.checks.title}</h2></div>
              {cat.checks.note && <p className="group-note">{cat.checks.note}</p>}
              {cat.checks.items.map(([id, text]) => (
                <label key={id} className="check"><input type="checkbox" checked={!!checks[id]} onChange={(e) => setCheck(id, e.target.checked)} /><span>{text}</span></label>
              ))}
            </section>
          )}
        </div>
      )}

      {tab === 'readings' && (
        <div role="tabpanel" className="list">
          {cat.readings.map((rd, i) => {
            const book = bookFor(rd);
            return (
              <button key={rd.id} type="button" className="item" onClick={() => setOpen({ type: 'reading', item: rd })}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="t">{rd.title}</span>
                <span className="m">{book ? 'IN LIBRARY' : ''}</span>
                <span className="d">{rd.author}</span>
              </button>
            );
          })}
        </div>
      )}

      <PracticeSheet item={open?.type === 'practice' ? open.item : null} kicker={cat.name} onClose={() => setOpen(null)} onBegin={onBegin} />
      <Sheet open={open?.type === 'reading'} onClose={() => setOpen(null)} title={open?.type === 'reading' ? open.item.title : ''} kicker={cat.name}>
        {open?.type === 'reading' && (
          <>
            <div className="prose">
              <p className="mono caps mute">{open.item.author}</p>
              {open.item.seed && <p>{open.item.seed}</p>}
              {open.item.practice && <div className="card card-lav"><p className="mono-s caps">Try this week</p><p style={{ marginTop: 4 }}>{open.item.practice}</p></div>}
            </div>
            <div className="stack" style={{ marginTop: 18 }}>
              {bookFor(open.item)
                ? <button type="button" className="btn btn-ink btn-block" onClick={() => { const bk = bookFor(open.item); setOpen(null); onAskBook(bk.id); }}>Ask this book a question</button>
                : <p className="hint">Add this book to Your library to ask it questions.</p>}
            </div>
          </>
        )}
      </Sheet>
    </main>
  );
}
