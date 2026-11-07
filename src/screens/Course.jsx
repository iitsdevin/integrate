import { useEffect, useState } from 'react';
import { COURSE } from '../data/course.js';
import { timedPractice } from '../data/daily.js';
import { useStore, setState, addEntry, shortDate } from '../lib/store.js';
import { Icon, Spark, toast } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';

const setCourse = (patch) => setState((s) => ({ ...s, course: { done: {}, stepdown: {}, ...(s.course || {}), ...patch } }));

export default function Course({ onBack, onBegin }) {
  const course = useStore((s) => s.course) || { done: {}, stepdown: {} };
  const journal = useStore((s) => s.journal);
  const [open, setOpen] = useState(null);
  const [reading, setReading] = useState(null);
  const done = course.done || {};
  const count = COURSE.lessons.filter((l) => done[l.id]).length;
  const next = COURSE.lessons.find((l) => !done[l.id]);
  const lesson = open && COURSE.lessons.find((l) => l.id === open);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="screen">
      <button type="button" className="link-btn" style={{ alignSelf: 'flex-start', marginTop: -8 }} onClick={onBack}><Icon.back /> Toolkit</button>
      <header style={{ position: 'relative', minHeight: 120 }}>
        <div aria-hidden="true" style={{ position: 'absolute', left: 54, top: 34, width: 'min(200px, 56%)', height: 62, background: 'var(--block2)' }} />
        <h1 className="word" style={{ position: 'relative', fontSize: 'clamp(5.5rem, 30vw, 7.4rem)' }}>act</h1>
        <p className="mono caps" style={{ position: 'absolute', left: 'min(200px, 54%)', top: 10, width: 120 }}>09 — course<br />for ADHD<br />{COURSE.tagline.toLowerCase()}</p>
        <Spark size={18} style={{ right: 6, top: 74 }} />
      </header>
      <p style={{ fontSize: '1.0625rem', lineHeight: 1.45 }}>{COURSE.blurb}</p>

      <section className="stack" aria-label="Progress">
        <div className="between mono caps"><span>{count} of {COURSE.lessons.length} lessons done</span>{next && <span>next · {next.no}</span>}</div>
        <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: `repeat(${COURSE.lessons.length}, minmax(0, 1fr))`, gap: 4 }}>
          {COURSE.lessons.map((l) => <div key={l.id} style={{ height: 10, border: '1.5px solid var(--ink)', background: done[l.id] ? 'var(--deep)' : 'transparent' }} />)}
        </div>
        {next && <button type="button" className="btn btn-ink btn-shadow btn-block begin" onClick={() => setOpen(next.id)}><span>{count ? 'Continue' : 'Start here'}</span><span className="mono">{next.no}</span></button>}
      </section>

      <details className="card">
        <summary className="mono caps" style={{ minHeight: 44, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>How it works</summary>
        <ul className="prose" style={{ paddingLeft: 20, marginTop: 4 }}>{COURSE.how.map((h) => <li key={h}>{h}</li>)}</ul>
      </details>

      <section aria-labelledby="lessonsH">
        <div className="group-title"><h2 id="lessonsH">Lessons</h2></div>
        <div className="list">
          {COURSE.lessons.map((l) => (
            <button key={l.id} type="button" className="item" onClick={() => setOpen(l.id)}>
              <span className="n">{done[l.id] ? '●' : l.no}</span>
              <span className="t">{l.title}</span>
              <span className="m">{done[l.id] ? 'DONE' : ''}</span>
              <span className="d">{l.short}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="sourcesH">
        <div className="group-title"><h2 id="sourcesH">Sources and reading</h2></div>
        <div className="list">
          {COURSE.readings.map((r, i) => (
            <button key={r.id} type="button" className="item" onClick={() => setReading(r)}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span>
              <span className="t">{r.title}</span>
              <span className="m" />
              <span className="d">{r.author}</span>
            </button>
          ))}
        </div>
      </section>

      <Sheet open={!!lesson} onClose={() => setOpen(null)} tall title={lesson?.title.toLowerCase()} kicker={lesson ? `${COURSE.title} · ${lesson.no}` : ''}>
        {lesson && <Lesson lesson={lesson} done={!!done[lesson.id]} course={course} journal={journal}
          onBegin={(p) => { setOpen(null); onBegin(p); }}
          onNext={() => { const i = COURSE.lessons.indexOf(lesson); const n = COURSE.lessons[i + 1]; setOpen(n ? n.id : null); }} />}
      </Sheet>

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

function Lesson({ lesson, done, course, journal, onBegin, onNext }) {
  const [text, setText] = useState('');
  const mine = journal.filter((j) => j.kind === 'course' && j.lessonId === lesson.id).sort((a, b) => (a.at < b.at ? 1 : -1));
  useEffect(() => { setText(''); }, [lesson.id]);

  function save() {
    const t = text.trim();
    if (!t) return;
    addEntry({ kind: 'course', lessonId: lesson.id, text: `ACT for ADHD · ${lesson.no} ${lesson.title}\n${lesson.reflect}\n\n${t}` });
    setText(''); toast('Saved to your journal');
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="prose">{lesson.idea.map((p, i) => <p key={i}>{p}</p>)}</div>

      <section className="card card-lav stack" aria-label="Try this now">
        <p className="mono-s caps">Try this now · {lesson.try.title}</p>
        <ol className="prose" style={{ paddingLeft: 20, margin: 0 }}>{lesson.try.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        {lesson.try.timer && (
          <button type="button" className="btn btn-ink" onClick={() => onBegin(timedPractice(lesson.try.title, lesson.try.timer, lesson.try.steps.join(' ')))}>Time it · {lesson.try.timer} min</button>
        )}
      </section>

      {lesson.tool === 'stepdown' && <StepDown course={course} />}

      <section className="card card-lime" aria-label="This week">
        <p className="mono-s caps">This week</p>
        <p style={{ marginTop: 4, fontWeight: 600, lineHeight: 1.4 }}>{lesson.week}</p>
      </section>

      <section className="stack" aria-labelledby={'rf-' + lesson.id}>
        <label id={'rf-' + lesson.id} htmlFor={'rt-' + lesson.id} className="mono caps">Write · {lesson.reflect}</label>
        <textarea id={'rt-' + lesson.id} className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Goes into your journal." />
        <button type="button" className="btn" disabled={!text.trim()} onClick={save}>Save to journal</button>
        {mine.length > 0 && (
          <div className="list">
            {mine.slice(0, 3).map((j) => (
              <div key={j.id} className="entry">
                <p className="mono-s mute">{shortDate(j.at)}</p>
                <p className="clamp">{j.text.split('\n\n').slice(1).join('\n\n')}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button type="button" className={'btn' + (done ? '' : ' btn-ink')} onClick={() => {
          setState((s) => { const c = { done: {}, stepdown: {}, ...(s.course || {}) }; const d = { ...c.done }; if (done) delete d[lesson.id]; else d[lesson.id] = new Date().toISOString(); return { ...s, course: { ...c, done: d } }; });
          if (!done) toast('Lesson marked done');
        }}>{done ? 'Mark not done' : 'Mark done'}</button>
        <button type="button" className="btn" onClick={onNext}>{lesson.id === 'together' ? 'Close' : 'Next lesson'}</button>
      </div>
    </div>
  );
}

const STEPS = [
  ['goal', 'A year from now, I’d like…', 'No commitment yet'],
  ['m3', 'In three months, realistically…', 'Still no commitment'],
  ['m1', 'In one month…', 'Still no commitment'],
  ['w1', 'This week, I could…', 'Still no commitment'],
  ['d1', 'In the next 24 hours, on a good day, I will…', 'This is the one you commit to'],
  ['low', 'On a low day, the smallest version is…', 'Still counts'],
  ['cue', 'What will remind me (outside my head)…', 'A timer, a note, a person, the thing left out'],
];

function StepDown({ course }) {
  const sd = course.stepdown || {};
  const set = (k, v) => setCourse({ stepdown: { ...sd, [k]: v } });
  const ready = sd.goal?.trim() && sd.d1?.trim();
  return (
    <section className="card stack" aria-labelledby="sdH" style={{ gap: 12 }}>
      <h3 id="sdH" className="word" style={{ fontSize: '1.6rem' }}>Step it down</h3>
      {STEPS.map(([k, label, hint], i) => (
        <div key={k} className="stack" style={{ gap: 4, paddingLeft: Math.min(i, 4) * 8, borderLeft: i === 4 ? '4px solid var(--deep)' : 'none' }}>
          <label htmlFor={'sd-' + k} style={{ fontWeight: 700, paddingLeft: i === 4 ? 8 : 0 }}>{label}</label>
          <input id={'sd-' + k} className="field" value={sd[k] || ''} onChange={(e) => set(k, e.target.value)} />
          <span className="mono-s mute" style={{ paddingLeft: i === 4 ? 8 : 0 }}>{hint}</span>
        </div>
      ))}
      <button type="button" className="btn btn-ink" disabled={!ready} onClick={() => {
        const lines = STEPS.filter(([k]) => sd[k]?.trim()).map(([k, label]) => `${label} ${sd[k].trim()}`);
        addEntry({ kind: 'course', lessonId: 'step', text: `ACT for ADHD · 06 Step-down\n\n${lines.join('\n')}` });
        toast('Step-down saved to your journal');
      }}>Save my step to the journal</button>
    </section>
  );
}
