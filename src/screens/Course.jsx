import { useEffect, useState } from 'react';
import { COURSE, MODULES, ALL_LESSONS, NEEDS } from '../data/course.js';
import { useStore, addEntry, shortDate } from '../lib/store.js';
import { Icon, Spark, toast } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';
import { useBackLayer } from '../lib/history.js';
import { courseState, setCourse, Worksheet, Check, Hexaflex, CardSort, Bullseye, DefuseLab, StepDown, Player } from '../components/CourseTools.jsx';

const KIND = { learn: 'Read', metaphor: 'Metaphor', exercise: 'Guided', worksheet: 'Worksheet', tool: 'Tool', check: 'Check' };
const TILE = ['lime', 'plain', 'lavender', 'plain', 'ink', 'plain', 'lavender'];

export default function Course({ onBack }) {
  const course = courseState(useStore((s) => s));
  const bell = useStore((s) => s.settings.bell);
  const journal = useStore((s) => s.journal);
  const [mod, setMod] = useState(null);
  const [tab, setTab] = useState('modules');
  const [need, setNeed] = useState(null);
  const [open, setOpen] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [reading, setReading] = useState(null);
  const done = course.done;
  const count = ALL_LESSONS.filter((l) => done[l.id]).length;
  const next = ALL_LESSONS.find((l) => !done[l.id]);
  const lesson = open && ALL_LESSONS.find((l) => l.id === open);
  const module = mod && MODULES.find((m) => m.id === mod);
  const practices = ALL_LESSONS.filter((l) => l.kind === 'exercise' || l.tool === 'defuse');

  useEffect(() => { window.scrollTo(0, 0); }, [mod]);
  // Back steps out of a module or a guided practice before it leaves this page.
  useBackLayer(!!mod, () => setMod(null));
  useBackLayer(!!playing, () => setPlaying(null));

  const openLesson = (id) => setOpen(id);
  const finishExercise = (l) => {
    setPlaying(null);
    setCourse((c) => ({ ...c, practiced: { ...c.practiced, [l.id]: [...(c.practiced[l.id] || []), new Date().toISOString()].slice(-50) }, done: { ...c.done, [l.id]: c.done[l.id] || new Date().toISOString() } }));
    toast('Practice done. Nice.');
  };

  if (playing) return <Player lesson={playing} bell={bell} onClose={() => setPlaying(null)} onFinish={() => finishExercise(playing)} />;

  const lessonSheet = (
    <Sheet open={!!lesson} onClose={() => setOpen(null)} tall title={lesson?.title.toLowerCase()} kicker={lesson ? `${lesson.moduleNo} ${lesson.moduleName} · ${KIND[lesson.kind]} · ${lesson.mins} min` : ''}>
      {lesson && <Lesson lesson={lesson} course={course} journal={journal}
        onPlay={() => { setOpen(null); setTimeout(() => setPlaying(lesson), 50); }}
        onModule={(id) => { setOpen(null); setMod(id); }}
        onNext={() => { const i = ALL_LESSONS.findIndex((l) => l.id === lesson.id); const n = ALL_LESSONS[i + 1]; if (n) { setOpen(n.id); if (n.moduleId !== mod && mod) setMod(n.moduleId); } else setOpen(null); }} />}
    </Sheet>
  );

  if (module) {
    const mDone = module.lessons.filter((l) => done[l.id]).length;
    return (
      <main className="screen">
        <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setMod(null)}><Icon.back /> ACT for ADHD</button>
        <header className="stack" style={{ gap: 8 }}>
          <p className="mono caps">Module {module.no} · {module.skill}</p>
          <h1 className="word" style={{ fontSize: 'clamp(3.4rem, 17vw, 4.6rem)', overflowWrap: 'anywhere' }}>{module.name.toLowerCase()}</h1>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.45 }}>{module.intro}</p>
        </header>
        <Progress items={module.lessons} done={done} label={`${mDone} of ${module.lessons.length} done`} />
        <div className="list">
          {module.lessons.map((l, i) => (
            <button key={l.id} type="button" className="item" onClick={() => openLesson(l.id)}>
              <span className="n">{done[l.id] ? '●' : String(i + 1).padStart(2, '0')}</span>
              <span className="t">{l.title}</span>
              <span className="m">{KIND[l.kind].toUpperCase()}</span>
              <span className="d">{l.short} · {l.mins} min{course.practiced[l.id]?.length ? ` · practised ${course.practiced[l.id].length}×` : ''}</span>
            </button>
          ))}
        </div>
        {(() => { const i = MODULES.indexOf(module); const n = MODULES[i + 1]; return n ? <button type="button" className="btn btn-block" onClick={() => setMod(n.id)}>Next module · {n.name} <Icon.arrow /></button> : null; })()}
        {lessonSheet}
      </main>
    );
  }

  return (
    <main className="screen">
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={onBack}><Icon.back /> Toolkit</button>
      <header style={{ position: 'relative' }}>
        <p className="mono caps">09 — course · {COURSE.tagline.toLowerCase()}</p>
        <div style={{ position: 'relative', marginTop: 6 }}>
          <div aria-hidden="true" style={{ position: 'absolute', left: '0.9em', top: '0.42em', width: '1.6em', height: '0.5em', background: 'var(--block3)', fontSize: 'clamp(5.5rem, 30vw, 7.4rem)' }} />
          <h1 className="word" style={{ position: 'relative', fontSize: 'clamp(5.5rem, 30vw, 7.4rem)' }}>act</h1>
          <p className="word" style={{ position: 'relative', fontSize: 'clamp(2rem, 10vw, 2.6rem)', marginTop: 4 }}>for adhd</p>
        </div>
        <Spark size={18} style={{ right: 6, top: 40 }} />
      </header>
      <p style={{ fontSize: '1.0625rem', lineHeight: 1.45 }}>{COURSE.blurb}</p>

      <Progress items={ALL_LESSONS} done={done} label={`${count} of ${ALL_LESSONS.length} lessons`} />
      {next && (
        <button type="button" className="btn btn-ink btn-shadow btn-block begin" onClick={() => openLesson(next.id)}>
          <span style={{ textAlign: 'left', minWidth: 0 }}>{count ? 'Continue' : 'Start here'}<span className="mono" style={{ display: 'block', fontSize: '0.6875rem', opacity: 0.8, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{next.moduleNo} · {next.title}</span></span>
          <Icon.arrow />
        </button>
      )}

      <section className="stack" aria-labelledby="needH">
        <h2 id="needH" className="mono caps" style={{ fontWeight: 400 }}>What do I need right now?</h2>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {NEEDS.map(([id, label]) => <button key={id} type="button" className="chip" style={{ padding: '0 10px', fontSize: '0.875rem' }} aria-pressed={need === id} onClick={() => setNeed(need === id ? null : id)}>{label}</button>)}
        </div>
        {need && (
          <div className="list" aria-live="polite">
            {practices.filter((l) => l.needs?.includes(need)).map((l) => (
              <button key={l.id} type="button" className="item" onClick={() => (l.steps ? setPlaying(l) : openLesson(l.id))}>
                <span className="n">▶</span><span className="t">{l.title}</span><span className="m">{l.mins} MIN</span><span className="d">{l.short}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="seg" role="tablist" aria-label="Course">
        <button type="button" role="tab" aria-selected={tab === 'modules'} onClick={() => setTab('modules')}>Modules · {MODULES.length}</button>
        <button type="button" role="tab" aria-selected={tab === 'practices'} onClick={() => setTab('practices')}>Practices · {practices.length}</button>
      </div>

      {tab === 'modules' && (
        <div role="tabpanel" className="stack" style={{ gap: 10 }}>
          {MODULES.map((m, i) => {
            const d = m.lessons.filter((l) => done[l.id]).length;
            return (
              <button key={m.id} type="button" className={`tile ${TILE[i]}`} style={{ minHeight: 0 }} onClick={() => setMod(m.id)}>
                <span className="between mono-s caps"><span>Module {m.no} · {m.skill}</span><span>{d}/{m.lessons.length}</span></span>
                <b>{m.name}</b>
                <span aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: `repeat(${m.lessons.length}, minmax(0, 1fr))`, gap: 3 }}>
                  {m.lessons.map((l) => <i key={l.id} style={{ height: 6, border: '1.5px solid currentColor', background: done[l.id] ? 'currentColor' : 'transparent' }} />)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {tab === 'practices' && (
        <div role="tabpanel" className="list">
          <p className="group-note" style={{ paddingBottom: 6 }}>Every guided exercise in the course, ready to use any time.</p>
          {practices.map((l) => (
            <button key={l.id} type="button" className="item" onClick={() => (l.steps ? setPlaying(l) : openLesson(l.id))}>
              <span className="n">▶</span><span className="t">{l.title}</span><span className="m">{l.mins} MIN</span>
              <span className="d">{l.moduleName} · {l.short}{course.practiced[l.id]?.length ? ` · ${course.practiced[l.id].length}×` : ''}</span>
            </button>
          ))}
        </div>
      )}

      <section aria-labelledby="sourcesH">
        <div className="group-title"><h2 id="sourcesH">Sources and reading</h2></div>
        <div className="list">
          {COURSE.readings.map((r, i) => (
            <button key={r.id} type="button" className="item" onClick={() => setReading(r)}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span><span className="t">{r.title}</span><span className="m" /><span className="d">{r.author}</span>
            </button>
          ))}
        </div>
        <p className="group-note">The evidence for ACT with ADHD is promising but early. This course adds to your ADHD care; it doesn’t replace medication, your psychiatrist or practical supports.</p>
      </section>

      {lessonSheet}
      <Sheet open={!!reading} onClose={() => setReading(null)} title={reading?.title} kicker="Source">
        {reading && (
          <div className="prose">
            <p className="mono caps mute">{reading.author}</p>
            <p>{reading.seed}</p>
            {reading.url && <a className="btn btn-block" href={reading.url} target="_blank" rel="noopener">Open ↗</a>}
          </div>
        )}
      </Sheet>
    </main>
  );
}

export function Progress({ items, done, label }) {
  return (
    <section className="stack" style={{ gap: 6 }} aria-label="Progress">
      <p className="mono caps">{label}</p>
      {items.length > 12 ? (
        <div aria-hidden="true" style={{ height: 12, border: '2px solid var(--ink)' }}>
          <div style={{ height: '100%', width: `${(items.filter((l) => done[l.id]).length / items.length) * 100}%`, background: 'var(--deep)' }} />
        </div>
      ) : (
        <div aria-hidden="true" style={{ display: 'flex', gap: 3, height: 10 }}>
          {items.map((l) => <i key={l.id} style={{ flex: '1 1 0', border: '1.5px solid var(--ink)', background: done[l.id] ? 'var(--deep)' : 'transparent' }} />)}
        </div>
      )}
    </section>
  );
}

function Lesson({ lesson, course, journal, onPlay, onModule, onNext }) {
  const [text, setText] = useState('');
  const done = !!course.done[lesson.id];
  const mine = journal.filter((j) => j.kind === 'course' && j.lessonId === lesson.id && j.reflect).sort((a, b) => (a.at < b.at ? 1 : -1));
  useEffect(() => { setText(''); }, [lesson.id]);
  const isLast = ALL_LESSONS[ALL_LESSONS.length - 1].id === lesson.id;

  return (
    <div className="stack" style={{ gap: 18 }}>
      {lesson.body && (
        <div className="prose" style={lesson.kind === 'metaphor' ? { fontSize: '1.125rem', lineHeight: 1.55 } : undefined}>
          {lesson.kind === 'metaphor' && <p className="mono-s caps mute">A metaphor</p>}
          {lesson.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}

      {lesson.kind === 'exercise' && (
        <section className="card card-lav stack" aria-label="Guided exercise">
          <p className="mono-s caps">Guided · {lesson.steps.length} steps · about {lesson.mins} min</p>
          <ol className="prose" style={{ paddingLeft: 20, margin: 0 }}>{lesson.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <button type="button" className="btn btn-ink" onClick={onPlay}>Start guided ▶</button>
          {course.practiced[lesson.id]?.length > 0 && <p className="mono-s">Practised {course.practiced[lesson.id].length}× · last {shortDate(course.practiced[lesson.id].slice(-1)[0])}</p>}
        </section>
      )}

      {lesson.kind === 'worksheet' && <Worksheet lesson={lesson} course={course} />}
      {lesson.kind === 'check' && <Check lesson={lesson} course={course} />}
      {lesson.tool === 'hexaflex' && <Hexaflex onModule={onModule} />}
      {lesson.tool === 'cards' && <CardSort course={course} />}
      {lesson.tool === 'bullseye' && <Bullseye course={course} />}
      {lesson.tool === 'defuse' && <DefuseLab />}
      {lesson.tool === 'stepdown' && <StepDown course={course} />}

      {lesson.week && (
        <section className="card card-lime" aria-label="This week">
          <p className="mono-s caps">This week</p>
          <p style={{ marginTop: 4, fontWeight: 600, lineHeight: 1.4 }}>{lesson.week}</p>
        </section>
      )}

      {lesson.reflect && (
        <section className="stack" aria-labelledby={'rf-' + lesson.id}>
          <label id={'rf-' + lesson.id} htmlFor={'rt-' + lesson.id} style={{ fontWeight: 700 }}>{lesson.reflect}</label>
          <textarea id={'rt-' + lesson.id} className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Goes into your journal." />
          <button type="button" className="btn" disabled={!text.trim()} onClick={() => {
            addEntry({ kind: 'course', lessonId: lesson.id, reflect: true, text: `ACT for ADHD · ${lesson.title}\n${lesson.reflect}\n\n${text.trim()}` });
            setText(''); toast('Saved to your journal');
          }}>Save to journal</button>
          {mine.slice(0, 2).map((j) => (
            <div key={j.id} className="entry"><p className="mono-s mute">{shortDate(j.at)}</p><p className="clamp">{j.text.split('\n\n').slice(1).join('\n\n')}</p></div>
          ))}
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button type="button" className={'btn' + (done ? '' : ' btn-ink')} onClick={() => {
          setCourse((c) => { const d = { ...c.done }; if (done) delete d[lesson.id]; else d[lesson.id] = new Date().toISOString(); return { ...c, done: d }; });
          if (!done) toast('Lesson done');
        }}>{done ? 'Mark not done' : 'Mark done'}</button>
        <button type="button" className="btn" onClick={() => { if (!done) setCourse((c) => ({ ...c, done: { ...c.done, [lesson.id]: new Date().toISOString() } })); onNext(); }}>{isLast ? 'Finish' : 'Done, next →'}</button>
      </div>
    </div>
  );
}
