import { useEffect, useState } from 'react';
import { WORKBOOK, MODULES, ALL_LESSONS, NEEDS, HELP } from '../data/workbook.js';
import { useStore, addEntry, shortDate } from '../lib/store.js';
import { Icon, Spark, toast } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';
import { useBackLayer } from '../lib/history.js';
import { Player } from '../components/CourseTools.jsx';
import { wbState, setWb, markDone, WorkbookItems, answersText, hasAnswers } from '../components/WorkbookTools.jsx';
import { Progress } from './Course.jsx';
import { Figure } from '../components/WorkbookFigures.jsx';

const KIND = { learn: 'Read', practice: 'Guided', exercise: 'Exercise' };
const TILE = ['plain', 'lavender', 'plain', 'lime', 'lavender', 'plain', 'ink', 'lavender', 'plain', 'lime'];

// The built-in workbook. Private packs (lib/packs.js) arrive in the same shape.
export const BUILTIN = {
  id: WORKBOOK.id, title: WORKBOOK.title, builtin: true,
  eyebrow: '10 — workbook · kemp & mitchelson', big: 'skills', sub: 'for autism & adhd', blurb: WORKBOOK.blurb,
  modules: MODULES, lessons: ALL_LESSONS, needs: NEEDS, help: HELP, pageLabel: 'p.', backLabel: 'The workbook',
};

const pages = (book, pg) => (pg && book.pageLabel ? `${book.pageLabel} ${pg}` : '');

export default function Workbook({ onBack, book = BUILTIN }) {
  const wb = wbState(useStore((s) => s));
  const bell = useStore((s) => s.settings.bell);
  const [mod, setMod] = useState(null);
  const [tab, setTab] = useState('modules');
  const [need, setNeed] = useState(null);
  const [open, setOpen] = useState(null);
  const [playing, setPlaying] = useState(null);
  const { modules: MODS, lessons: LESSONS } = book;
  const done = wb.done;
  const count = LESSONS.filter((l) => done[l.id]).length;
  const next = LESSONS.find((l) => !done[l.id]);
  const lesson = open && LESSONS.find((l) => l.id === open);
  const module = mod && MODS.find((m) => m.id === mod);
  const practices = LESSONS.filter((l) => l.steps);

  useEffect(() => { window.scrollTo(0, 0); }, [mod]);
  // Back steps out of a module or a guided practice before it leaves this page.
  useBackLayer(!!mod, () => setMod(null));
  useBackLayer(!!playing, () => setPlaying(null));

  const finish = (l) => {
    setPlaying(null);
    setWb((w) => ({ ...w, practiced: { ...w.practiced, [l.id]: [...(w.practiced[l.id] || []), new Date().toISOString()].slice(-50) }, done: { ...w.done, [l.id]: w.done[l.id] || new Date().toISOString() } }));
    toast('Practice done. Well looked after.');
    if (l.items?.length) setTimeout(() => setOpen(l.id), 60);
  };

  if (playing) return <Player lesson={playing} bell={bell} onClose={() => setPlaying(null)} onFinish={() => finish(playing)} />;

  const sheet = (
    <Sheet open={!!lesson} onClose={() => setOpen(null)} tall title={lesson?.title.toLowerCase()} kicker={lesson ? [`${lesson.moduleNo} ${lesson.moduleName}`, pages(book, lesson.pg)].filter(Boolean).join(' · ') : ''}>
      {lesson && <Lesson lesson={lesson} wb={wb} book={book}
        onPlay={() => { setOpen(null); setTimeout(() => setPlaying(lesson), 50); }}
        onNext={() => { const i = LESSONS.findIndex((l) => l.id === lesson.id); const n = LESSONS[i + 1]; if (n) { setOpen(n.id); if (mod && n.moduleId !== mod) setMod(n.moduleId); } else setOpen(null); }} />}
    </Sheet>
  );

  if (module) {
    const mDone = module.lessons.filter((l) => done[l.id]).length;
    const i = MODS.indexOf(module), n = MODS[i + 1];
    return (
      <main className="screen">
        <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setMod(null)}><Icon.back /> {book.backLabel}</button>
        <header className="stack" style={{ gap: 8 }}>
          <p className="mono caps">Module {module.no}{module.pages ? ` · ${book.builtin ? 'book pages' : 'pages'} ${module.pages}` : ''}</p>
          <h1 className="word" style={{ fontSize: 'clamp(3.2rem, 16vw, 4.4rem)', overflowWrap: 'anywhere' }}>{module.name.toLowerCase()}</h1>
          {module.skill && <p className="mono caps soft">{module.skill}</p>}
          {module.intro && <p style={{ fontSize: '1.0625rem', lineHeight: 1.45 }}>{module.intro}</p>}
        </header>
        <Progress items={module.lessons} done={done} label={`${mDone} of ${module.lessons.length} done`} />
        <div className="list">
          {module.lessons.map((l, k) => (
            <button key={l.id} type="button" className="item" onClick={() => setOpen(l.id)}>
              <span className="n">{done[l.id] ? '●' : String(k + 1).padStart(2, '0')}</span>
              <span className="t">{l.title}</span>
              <span className="m">{KIND[l.kind].toUpperCase()}</span>
              <span className="d">{[l.short, l.mins && `${l.mins} min`, pages(book, l.pg), wb.practiced[l.id]?.length && `practised ${wb.practiced[l.id].length}×`].filter(Boolean).join(' · ')}</span>
            </button>
          ))}
        </div>
        {n && <button type="button" className="btn btn-block" onClick={() => setMod(n.id)}>Next module · {n.name} <Icon.arrow /></button>}
        {sheet}
      </main>
    );
  }

  return (
    <main className="screen">
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={onBack}><Icon.back /> Toolkit</button>
      <header style={{ position: 'relative' }}>
        <p className="mono caps">{book.eyebrow}</p>
        <div style={{ position: 'relative', marginTop: 6 }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '1.3em', top: '0.38em', width: '2.2em', height: '0.5em', background: book.builtin ? 'var(--block1)' : 'var(--block2)', fontSize: 'clamp(4.6rem, 25vw, 6.4rem)' }} />
          <h1 className="word" style={{ position: 'relative', fontSize: book.big.length > 7 ? 'clamp(3.2rem, 17vw, 4.6rem)' : 'clamp(4.6rem, 25vw, 6.4rem)', overflowWrap: 'anywhere' }}>{book.big}</h1>
          {book.sub && <p className="word" style={{ position: 'relative', fontSize: 'clamp(1.7rem, 8.4vw, 2.3rem)', marginTop: 4 }}>{book.sub}</p>}
        </div>
        <Spark size={18} style={{ right: 6, top: 36 }} />
      </header>
      {book.blurb && <p style={{ fontSize: '1.0625rem', lineHeight: 1.45 }}>{book.blurb}</p>}
      {book.private && <p className="mono-s mute">Private pack · stored only on this phone</p>}

      <Progress items={LESSONS} done={done} label={`${count} of ${LESSONS.length} lessons`} />
      {next && (
        <button type="button" className="btn btn-ink btn-shadow btn-block begin" onClick={() => setOpen(next.id)}>
          <span style={{ textAlign: 'left', minWidth: 0 }}>{count ? 'Continue' : 'Start here'}<span className="mono" style={{ display: 'block', fontSize: '0.6875rem', opacity: 0.8, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{next.moduleNo} · {next.title}</span></span>
          <Icon.arrow />
        </button>
      )}

      {book.needs?.length > 0 && (
        <section className="stack" aria-labelledby="wbNeedH">
          <h2 id="wbNeedH" className="mono caps" style={{ fontWeight: 400 }}>What do I need right now?</h2>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {book.needs.map(([nid, label]) => <button key={nid} type="button" className="chip" style={{ padding: '0 10px', fontSize: '0.875rem' }} aria-pressed={need === nid} onClick={() => setNeed(need === nid ? null : nid)}>{label}</button>)}
          </div>
          {need && (
            <div className="list" aria-live="polite">
              {LESSONS.filter((l) => l.needs?.includes(need)).sort((x, y) => (y.id === 'wb-safety') - (x.id === 'wb-safety')).map((l) => (
                <button key={l.id} type="button" className="item" onClick={() => (l.steps && !l.items?.length ? setPlaying(l) : setOpen(l.id))}>
                  <span className="n">{l.steps ? '▶' : '→'}</span><span className="t">{l.title}</span><span className="m">{l.mins} MIN</span><span className="d">{l.short}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {practices.length > 0 && (
        <div className="seg" role="tablist" aria-label={book.title}>
          <button type="button" role="tab" aria-selected={tab === 'modules'} onClick={() => setTab('modules')}>Modules · {MODS.length}</button>
          <button type="button" role="tab" aria-selected={tab === 'practices'} onClick={() => setTab('practices')}>Practices · {practices.length}</button>
        </div>
      )}

      {(tab === 'modules' || !practices.length) && (
        <div role="tabpanel" className="stack" style={{ gap: 10 }}>
          {MODS.map((m, k) => {
            const d = m.lessons.filter((l) => done[l.id]).length;
            return (
              <button key={m.id} type="button" className={`tile ${TILE[k % TILE.length]}`} style={{ minHeight: 0 }} onClick={() => setMod(m.id)}>
                <span className="between mono-s caps"><span>{m.no}{m.pages ? ` · ${pages(book, m.pages)}` : ''}</span><span>{d}/{m.lessons.length}</span></span>
                <b>{m.name}</b>
                {m.skill && <span className="mono-s" style={{ display: 'block', marginTop: 2 }}>{m.skill}</span>}
                <span aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(m.lessons.length, 24)}, minmax(0, 1fr))`, gap: 3, marginTop: 8 }}>
                  {m.lessons.slice(0, 24).map((l) => <i key={l.id} style={{ height: 6, border: '1.5px solid currentColor', background: done[l.id] ? 'currentColor' : 'transparent' }} />)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'practices' && practices.length > 0 && (
        <div role="tabpanel" className="list">
          <p className="group-note" style={{ paddingBottom: 6 }}>Every guided practice here, ready whenever you need one.</p>
          {practices.map((l) => (
            <button key={l.id} type="button" className="item" onClick={() => setPlaying(l)}>
              <span className="n">▶</span><span className="t">{l.title}</span><span className="m">{l.mins} MIN</span>
              <span className="d">{l.moduleName}{l.short ? ` · ${l.short}` : ''}{wb.practiced[l.id]?.length ? ` · ${wb.practiced[l.id].length}×` : ''}</span>
            </button>
          ))}
        </div>
      )}

      {book.builtin ? (
        <section aria-labelledby="wbSrcH">
          <div className="group-title"><h2 id="wbSrcH">The book</h2></div>
          <div className="prose" style={{ paddingTop: 10, fontSize: '0.9375rem' }}>
            <p><b>{WORKBOOK.book}</b> by {WORKBOOK.authors} ({WORKBOOK.publisher}). The structure and exercises follow the book. The wording here is written for this app, so read the book for the authors' own voice, their stories and the research behind each idea.</p>
            <p className="soft">This is self-help, not therapy. If something here brings up more than you can hold, an affirming psychologist can work through it with you.</p>
          </div>
        </section>
      ) : book.source && (
        <section aria-labelledby="wbSrcH">
          <div className="group-title"><h2 id="wbSrcH">Source</h2></div>
          <div className="prose" style={{ paddingTop: 10, fontSize: '0.9375rem' }}>
            <p><b>{book.source.title}</b>{book.source.authors ? ` by ${book.source.authors}` : ''}{book.source.publisher ? ` (${book.source.publisher})` : ''}.</p>
            {book.source.note && <p className="soft">{book.source.note}</p>}
            <p className="soft">This pack is for your personal use. It lives only on this phone and isn't part of the app or your backups.</p>
          </div>
        </section>
      )}

      {sheet}
    </main>
  );
}

function HelpCard({ help = HELP }) {
  return (
    <section className="card stack" style={{ gap: 4 }} aria-label={help.title}>
      <p className="mono-s caps">{help.title}</p>
      {help.lines.map((l) => <p key={l} style={{ fontWeight: 600 }}>{l}</p>)}
      {help.note && <p className="mono-s mute">{help.note}</p>}
    </section>
  );
}

// Body paragraphs: plain strings, or { t: 'h' | 'list' | 'ol' | 'quote' | 'note' } blocks for packs that keep the original layout.
function Body({ body }) {
  return (
    <div className="prose">
      {body.map((p, i) => {
        if (typeof p === 'string') return <p key={i}>{p}</p>;
        if (p.t === 'h') return <h3 key={i} className="wb-head" style={{ marginTop: 6 }}>{p.text}</h3>;
        if (p.t === 'list' || p.t === 'ol') { const L = p.t === 'ol' ? 'ol' : 'ul'; return <L key={i} style={{ paddingLeft: 20, margin: 0 }}>{p.items.map((x, j) => <li key={j}>{x}</li>)}</L>; }
        if (p.t === 'quote') return <blockquote key={i} style={{ margin: 0, paddingLeft: 12, borderLeft: '3px solid var(--block1)', fontStyle: 'italic' }}>{p.text}</blockquote>;
        if (p.t === 'note') return <p key={i} className="notice">{p.text}</p>;
        return null;
      })}
    </div>
  );
}

function Lesson({ lesson, wb, book, onPlay, onNext }) {
  const done = !!wb.done[lesson.id];
  const ans = wb.ans[lesson.id] || {};
  const isLast = book.lessons[book.lessons.length - 1].id === lesson.id;
  const some = lesson.items && hasAnswers(lesson, ans);
  const saved = (wb.saved || {})[lesson.id];
  const txt = () => `${book.title} · ${lesson.title}\n\n${answersText(lesson, ans)}`;

  return (
    <div className="stack" style={{ gap: 20 }} data-lesson={lesson.id}>
      {lesson.body && <Body body={lesson.body} />}
      {lesson.images?.map((im, i) => (
        <figure key={i} className="fig">
          <img src={im.src} alt={im.alt || ''} style={{ width: '100%', height: 'auto', display: 'block' }} />
          {im.caption && <figcaption>{im.caption}</figcaption>}
        </figure>
      ))}
      {lesson.fig && !lesson.figAfter && <Figure id={lesson.fig} ans={wb.ans} />}
      {lesson.help && <HelpCard help={book.help || HELP} />}

      {lesson.steps && (
        <section className="card card-lav stack" aria-label="Guided practice">
          <p className="mono-s caps">Guided · {lesson.steps.length} steps · about {lesson.mins} min</p>
          <ol className="prose" style={{ paddingLeft: 20, margin: 0 }}>{lesson.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <button type="button" className="btn btn-ink" onClick={onPlay}>Start guided ▶</button>
          {wb.practiced[lesson.id]?.length > 0 && <p className="mono-s">Practised {wb.practiced[lesson.id].length}× · last {shortDate(wb.practiced[lesson.id].slice(-1)[0])}</p>}
        </section>
      )}

      {lesson.items && (
        <section className="stack" style={{ gap: 14 }} aria-label="Your answers">
          <p className="mono-s caps mute">{lesson.kind === 'learn' ? 'Your notes' : 'Exercise'} · saves as you go</p>
          <WorkbookItems lesson={lesson} wb={wb} />
        </section>
      )}
      {lesson.fig && lesson.figAfter && <Figure id={lesson.fig} ans={wb.ans} />}

      {some && (
        <div style={{ display: 'grid', gridTemplateColumns: lesson.share ? '1fr 1fr' : '1fr', gap: 10 }}>
          <button type="button" className="btn" onClick={() => {
            addEntry({ kind: 'workbook', lessonId: lesson.id, text: txt() });
            setWb((w) => ({ ...w, saved: { ...(w.saved || {}), [lesson.id]: new Date().toISOString() } }));
            toast('A copy is in your journal');
          }}>Copy to my journal</button>
          {lesson.share && <button type="button" className="btn" onClick={async () => {
            const t = txt();
            try { if (navigator.share) { await navigator.share({ title: lesson.title, text: t }); return; } } catch (e) { if (e?.name === 'AbortError') return; }
            try { await navigator.clipboard.writeText(t); toast('Copied'); } catch { toast("Couldn't share from here"); }
          }}>Share</button>}
        </div>
      )}
      {saved && <p className="mono-s mute" style={{ marginTop: -10 }}>Last copied to your journal {shortDate(saved)}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button type="button" className={'btn' + (done ? '' : ' btn-ink')} onClick={() => {
          setWb((w) => { const d = { ...w.done }; if (done) delete d[lesson.id]; else d[lesson.id] = new Date().toISOString(); return { ...w, done: d }; });
          if (!done) toast('Lesson done');
        }}>{done ? 'Mark not done' : 'Mark done'}</button>
        <button type="button" className="btn" onClick={() => { markDone(lesson.id); onNext(); }}>{isLast ? 'Finish' : 'Done, next →'}</button>
      </div>
    </div>
  );
}
