import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, findCategory } from '../data/content.js';
import { useStore, setCheck, localDate } from '../lib/store.js';
import { kriyaSit, timedPractice } from '../data/daily.js';
import { listBooks, onLibraryChange } from '../lib/library.js';
import { Spark, Icon, PracticeBody } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';
import Course from './Course.jsx';
import { COURSE } from '../data/course.js';

export default function Toolkit({ view, onView, onBegin, onAskBook }) {
  if (view === 'library') return null; // rendered by Library.jsx
  if (view === COURSE.id) return <Course onBack={() => onView(null)} onBegin={onBegin} />;
  const cat = view && findCategory(view);
  if (cat) return <Category cat={cat} onBack={() => onView(null)} onBegin={onBegin} onAskBook={onAskBook} />;
  return <Grid onView={onView} />;
}

function Grid({ onView }) {
  const [books, setBooks] = useState([]);
  const done = useStore((s) => s.course?.done) || {};
  const doneCount = COURSE.lessons.filter((l) => done[l.id]).length;
  useEffect(() => { const load = () => listBooks().then(setBooks).catch(() => {}); load(); return onLibraryChange(load); }, []);
  const left = [CATEGORIES[0], CATEGORIES[2], CATEGORIES[4], CATEGORIES[6]];
  const right = [CATEGORIES[1], CATEGORIES[3], CATEGORIES[5], CATEGORIES[7]];
  const tile = (c, i, col) => {
    const tall = (col === 0 ? i % 2 === 0 : i % 2 === 1);
    return (
      <button key={c.id} type="button" className={`tile ${c.tile}${tall ? ' tall' : ''}`} onClick={() => onView(c.id)}>
        <span className="mono-s caps">{c.no}{c.tag ? ' — ' + c.tag : ''}</span>
        <span><b>{c.name}</b><span className="h mono-s">{c.hint}</span></span>
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
      <button type="button" className="tile lib" onClick={() => onView('library')}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="mono-s caps">10 — ask your books</span>
          <b style={{ marginTop: 4 }}>Your library</b>
          <span className="h mono-s">{books.length ? `${books.length} book${books.length > 1 ? 's' : ''} on this phone` : 'add PDFs or EPUBs you own, then ask them questions'}</span>
        </span>
        <Icon.arrow />
      </button>
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
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start', marginTop: -8 }} onClick={onBack}><Icon.back /> Toolkit</button>
      <header style={{ position: 'relative', minHeight: 100 }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: 64, top: 28, width: 'min(190px, 55%)', height: 64, background: cat.tile === 'lavender' ? 'var(--block1)' : 'var(--block3)' }} />
        <h1 className="word" style={{ position: 'relative', fontSize: cat.name.length > 10 ? '4.2rem' : '6.4rem', overflowWrap: 'anywhere' }}>{cat.name.toLowerCase()}</h1>
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

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.type === 'reading' ? open?.item.title : open?.item.name} kicker={cat.name}>
        {open?.type === 'practice' && (
          <>
            <PracticeBody item={open.item} />
            <div className="stack" style={{ marginTop: 18 }}>
              {open.item.timer && (
                <button type="button" className="btn btn-ink btn-block" onClick={() => { const it = open.item; setOpen(null); onBegin(timedPractice(it.name, it.timer, it.summary)); }}>
                  Time it · {it_min(open.item.timer)}
                </button>
              )}
              {open.item.link && <a className="btn btn-block" href={open.item.link.url} target="_blank" rel="noopener">{open.item.link.label} ↗</a>}
            </div>
          </>
        )}
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
                : <p className="mono soft">Add this book to Your library to ask it questions.</p>}
            </div>
          </>
        )}
      </Sheet>
    </main>
  );
}
const it_min = (m) => `${m} min`;
