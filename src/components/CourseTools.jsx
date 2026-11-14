// Interactive pieces of the ACT for ADHD course.
import { useEffect, useRef, useState } from 'react';
import { HEXAFLEX, VALUES, DOMAINS } from '../data/course.js';
import { getState, setState, addEntry } from '../lib/store.js';
import { ring, unlockAudio } from '../lib/bells.js';
import { setThemeColor } from '../lib/theme.js';
import { toast } from './bits.jsx';

export const courseState = (s = getState()) => ({ done: {}, stepdown: {}, values: {}, bullseye: {}, sheets: {}, practiced: {}, quiz: {}, ...(s.course || {}) });
export const setCourse = (fn) => setState((s) => ({ ...s, course: fn(courseState(s)) }));
export const setSheet = (lessonId, key, val) => setCourse((c) => ({ ...c, sheets: { ...c.sheets, [lessonId]: { ...(c.sheets[lessonId] || {}), [key]: val } } }));

// ---------- worksheet ----------
export function Worksheet({ lesson, course }) {
  const vals = course.sheets[lesson.id] || {};
  const filled = lesson.fields.filter(([k]) => vals[k]?.trim());
  return (
    <section className="card stack" style={{ gap: 14 }} aria-label="Worksheet">
      <p className="mono-s caps">Worksheet · saves as you type</p>
      {lesson.fields.map(([k, label, hint]) => (
        <div key={k} className="stack" style={{ gap: 4 }}>
          <label htmlFor={`ws-${lesson.id}-${k}`} style={{ fontWeight: 700, lineHeight: 1.3 }}>{label}</label>
          <textarea id={`ws-${lesson.id}-${k}`} className="field" style={{ minHeight: 76 }} value={vals[k] || ''} placeholder={hint} onChange={(e) => setSheet(lesson.id, k, e.target.value)} />
        </div>
      ))}
      <button type="button" className="btn btn-ink" disabled={!filled.length} onClick={() => {
        addEntry({ kind: 'course', lessonId: lesson.id, text: `ACT for ADHD · ${lesson.title}\n\n${filled.map(([k, label]) => `${label}\n${vals[k].trim()}`).join('\n\n')}` });
        toast('Saved to your journal');
      }}>Save a copy to my journal</button>
    </section>
  );
}

// ---------- quick check ----------
export function Check({ lesson, course }) {
  const picked = course.quiz[lesson.id];
  const q = lesson.quiz;
  return (
    <section className="stack" aria-label="Quick check">
      <p style={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.3 }}>{q.q}</p>
      <div className="stack" role="radiogroup">
        {q.options.map((o, i) => {
          const state = picked === undefined ? '' : i === q.answer ? 'right' : i === picked ? 'wrong' : '';
          return (
            <button key={i} type="button" role="radio" aria-checked={picked === i} className="btn btn-block"
              style={{ justifyContent: 'flex-start', textAlign: 'left', minHeight: 52, background: state === 'right' ? 'var(--block2)' : state === 'wrong' ? 'var(--raised)' : undefined, color: state === 'right' ? 'var(--tab-ink)' : undefined, borderStyle: state === 'wrong' ? 'dashed' : 'solid' }}
              onClick={() => setCourse((c) => ({ ...c, quiz: { ...c.quiz, [lesson.id]: i }, done: { ...c.done, [lesson.id]: c.done[lesson.id] || new Date().toISOString() } }))}>
              <span className="mono" style={{ marginRight: 8 }}>{state === 'right' ? '✓' : state === 'wrong' ? '×' : String.fromCharCode(65 + i)}</span>{o}
            </button>
          );
        })}
      </div>
      {picked !== undefined && <p className="notice" role="status"><b>{picked === q.answer ? 'Yes. ' : 'Not quite. '}</b>{q.why}</p>}
    </section>
  );
}

// ---------- hexaflex ----------
export function Hexaflex({ onModule }) {
  const [sel, setSel] = useState(null);
  const pts = HEXAFLEX.map((h, i) => { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; return { ...h, x: 50 + 36 * Math.cos(a), y: 50 + 36 * Math.sin(a) }; });
  return (
    <section className="stack" aria-label="The six skills">
      <div style={{ position: 'relative', width: '100%', maxWidth: 340, aspectRatio: '1', margin: '0 auto' }}>
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
          <polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="var(--block1)" stroke="var(--ink)" strokeWidth="0.8" />
          {pts.map((p) => <line key={p.id} x1="50" y1="50" x2={p.x} y2={p.y} stroke="var(--ink)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />)}
        </svg>
        <p className="mono-s caps" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '30%', padding: 4, background: 'var(--ground)', border: '2px solid var(--ink)' }}>flexibility</p>
        {pts.map((p) => (
          <button key={p.id} type="button" aria-pressed={sel === p.id} onClick={() => setSel(p.id)}
            className="btn btn-mono" style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)', minHeight: 40, padding: '0 8px', background: sel === p.id ? 'var(--ink)' : 'var(--ground)', color: sel === p.id ? 'var(--ground)' : 'var(--ink)', whiteSpace: 'nowrap', textTransform: 'none', fontSize: '0.6875rem' }}>
            {p.name}
          </button>
        ))}
      </div>
      {sel && (() => { const h = HEXAFLEX.find((x) => x.id === sel); return (
        <div className="card stack" role="status">
          <p style={{ fontWeight: 700 }}>{h.name}</p><p>{h.line}</p>
          <button type="button" className="btn btn-ink" onClick={() => onModule(h.id)}>Go to this module</button>
        </div>
      ); })()}
    </section>
  );
}

// ---------- values card sort ----------
const PILES = [['very', 'Very'], ['some', 'Somewhat'], ['not', 'Not now']];
export function CardSort({ course }) {
  const v = course.values || {};
  const left = VALUES.filter((w) => !v[w]);
  const top = VALUES.filter((w) => v[w] === 'very');
  const current = left[0];
  const sort = (w, pile) => setCourse((c) => ({ ...c, values: { ...c.values, [w]: pile } }));
  return (
    <section className="stack" aria-label="Values card sort">
      <p className="mono caps">{VALUES.length - left.length} of {VALUES.length} sorted</p>
      {current ? (
        <div className="card stack" style={{ alignItems: 'center', padding: '28px 14px', boxShadow: '5px 5px 0 var(--block1)' }}>
          <p className="word" style={{ fontSize: 'clamp(2.6rem, 13vw, 3.4rem)', textAlign: 'center' }} aria-live="polite">{current.toLowerCase()}</p>
          <p className="mono-s mute">how much does this matter to me right now?</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, width: '100%' }}>
            {PILES.map(([id, label]) => <button key={id} type="button" className={'btn' + (id === 'very' ? ' btn-ink' : '')} style={{ padding: '0 4px' }} onClick={() => sort(current, id)}>{label}</button>)}
          </div>
        </div>
      ) : <p className="notice">All sorted. Your “very” pile is below. Change any card by tapping it.</p>}
      {top.length > 0 && (
        <div className="stack">
          <p className="mono caps">Matters most · {top.length}</p>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {top.map((w) => <button key={w} type="button" className="btn btn-mono" style={{ textTransform: 'none', background: 'var(--block2)', color: 'var(--tab-ink)', minHeight: 40 }} onClick={() => sort(w, 'some')} aria-label={`${w}, tap to move to somewhat`}>{w} ×</button>)}
          </div>
          {top.length > 6 && <p className="mono-s soft">Lots in the top pile. If you can, keep the five that feel most like you.</p>}
        </div>
      )}
      <div className="between">
        <button type="button" className="link-btn" onClick={() => setCourse((c) => ({ ...c, values: {} }))}>Start over</button>
        {top.length > 0 && <button type="button" className="link-btn" onClick={() => { addEntry({ kind: 'course', lessonId: 'cards', text: `ACT for ADHD · My values\n\n${top.join(', ')}` }); toast('Saved to your journal'); }}>Save to journal</button>}
      </div>
    </section>
  );
}

// ---------- bull's-eye ----------
export function Bullseye({ course }) {
  const b = course.bullseye || {};
  const set = (d, patch) => setCourse((c) => ({ ...c, bullseye: { ...c.bullseye, [d]: { ...(c.bullseye[d] || {}), ...patch } } }));
  const R = [46, 34, 22, 10];
  const angle = { work: -135, love: -45, growth: 135, play: 45 };
  return (
    <section className="stack" style={{ gap: 16 }} aria-label="Bull's-eye">
      <svg viewBox="0 0 100 100" style={{ width: '100%', maxWidth: 300, margin: '0 auto' }} role="img" aria-label="Bull's-eye showing how close each area is to your values">
        {R.map((r, i) => <circle key={r} cx="50" cy="50" r={r} fill={i % 2 ? 'var(--ground)' : 'var(--block1)'} stroke="var(--ink)" strokeWidth="0.6" />)}
        <line x1="2" y1="50" x2="98" y2="50" stroke="var(--ink)" strokeWidth="0.5" /><line x1="50" y1="2" x2="50" y2="98" stroke="var(--ink)" strokeWidth="0.5" />
        {DOMAINS.map(([d, name]) => {
          const score = b[d]?.score ?? null; if (score === null) return null;
          const dist = 46 - (score / 10) * 42, a = (angle[d] * Math.PI) / 180;
          return <g key={d}><circle cx={50 + dist * Math.cos(a)} cy={50 + dist * Math.sin(a)} r="3.4" fill="var(--deep)" stroke="var(--ground)" strokeWidth="0.8" /></g>;
        })}
        {DOMAINS.map(([d, name]) => { const a = (angle[d] * Math.PI) / 180; return <text key={d} x={50 + 40 * Math.cos(a)} y={50 + 40 * Math.sin(a) + 1.5} fontSize="3.6" textAnchor="middle" fill="var(--ink)" fontFamily="var(--mono)">{name.split(' ')[0].toUpperCase()}</text>; })}
      </svg>
      {DOMAINS.map(([d, name]) => (
        <div key={d} className="stack" style={{ gap: 6, paddingTop: 10, borderTop: '2px solid var(--ink)' }}>
          <label htmlFor={'be-' + d} style={{ fontWeight: 700 }}>{name}: what matters to me here</label>
          <input id={'be-' + d} className="field" value={b[d]?.text || ''} onChange={(e) => set(d, { text: e.target.value })} placeholder="e.g. doing work I’m proud of, at a pace I can keep" />
          <label className="slider"><span>How close am I living to that right now?</span>
            <input type="range" min="0" max="10" value={b[d]?.score ?? 5} onChange={(e) => set(d, { score: Number(e.target.value) })} />
            <output>{b[d]?.score ?? '–'}</output>
          </label>
        </div>
      ))}
    </section>
  );
}

// ---------- unhooking lab ----------
const MODES = [
  ['having', 'I’m having the thought…', (t) => `I’m having the thought that ${lower(t)}.`],
  ['notice', 'I notice I’m having…', (t) => `I notice I’m having the thought that ${lower(t)}.`],
  ['story', 'Name the story', (t, n) => `Ah, here’s the ${n || '___'} story again.`],
  ['thanks', 'Thank your mind', (t) => `Thanks, mind. I know you’re trying to help. (“${t}”)`],
  ['sing', 'Sing it', (t) => `♪ ${t} ♪ — to the tune of Happy Birthday, slowly, twice.`],
  ['voice', 'Cartoon voice', (t) => t.split('').map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join('')],
  ['repeat', 'Say it fast', (t) => ''],
];
const lower = (t) => t.trim().replace(/[.!?]+$/, '').replace(/^I /, 'I ').replace(/^([A-Z])(?=[a-z])/, (m) => m.toLowerCase());

export function DefuseLab() {
  const [t, setT] = useState('');
  const [mode, setMode] = useState('having');
  const [name, setName] = useState('');
  const [grip, setGrip] = useState({ before: 7, after: 7 });
  const [run, setRun] = useState(0);
  useEffect(() => { if (!run) return; const id = setInterval(() => setRun((r) => (r > 1 ? r - 1 : 0)), 1000); return () => clearInterval(id); }, [run > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const word = t.trim().split(/\s+/).pop()?.replace(/[^\p{L}'-]/gu, '') || 'word';
  const m = MODES.find((x) => x[0] === mode);
  return (
    <section className="stack" style={{ gap: 14 }} aria-label="Unhooking lab">
      <label htmlFor="labT" style={{ fontWeight: 700 }}>A thought that hooks me</label>
      <input id="labT" className="field" value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. I always ruin things" autoCapitalize="sentences" />
      <label className="slider"><span>How much does it grip me now?</span><input type="range" min="0" max="10" value={grip.before} onChange={(e) => setGrip({ ...grip, before: +e.target.value })} /><output>{grip.before}</output></label>
      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
        {MODES.map(([id, label]) => <button key={id} type="button" className="btn btn-mono" aria-pressed={mode === id} style={{ textTransform: 'none', minHeight: 40, background: mode === id ? 'var(--ink)' : undefined, color: mode === id ? 'var(--ground)' : undefined }} onClick={() => setMode(id)}>{label}</button>)}
      </div>
      {mode === 'story' && <input className="field" aria-label="Name for the story" value={name} onChange={(e) => setName(e.target.value)} placeholder="Give it a name: lazy, too much, report card…" />}
      <div className="card card-lav" style={{ minHeight: 96, display: 'flex', alignItems: 'center' }} aria-live="polite">
        {!t.trim() ? <p className="soft">Type a thought above.</p>
          : mode === 'repeat' ? (
            <div className="stack" style={{ width: '100%' }}>
              <p>Say “{word}” out loud, fast, over and over, for 30 seconds. Notice what happens to the meaning.</p>
              {run ? <p className="word" style={{ fontSize: '2.4rem' }}>{word} {word} {word} · {run}s</p>
                : <button type="button" className="btn btn-ink" onClick={() => setRun(30)}>Start 30 seconds</button>}
            </div>
          ) : <p style={{ fontWeight: 700, fontSize: mode === 'voice' ? '1.4rem' : '1.15rem', lineHeight: 1.35, overflowWrap: 'anywhere' }}>{m[2](t, name)}</p>}
      </div>
      <label className="slider"><span>And now?</span><input type="range" min="0" max="10" value={grip.after} onChange={(e) => setGrip({ ...grip, after: +e.target.value })} /><output>{grip.after}</output></label>
      {t.trim() && <p className="hint">{grip.after < grip.before ? `It loosened by ${grip.before - grip.after}. Try the same move next time it shows up.` : 'No change is fine. Try another technique, or come back to it later.'}</p>}
    </section>
  );
}

// ---------- step-down ----------
const STEPS = [
  ['goal', 'A year from now, I’d like…', 'No commitment yet'],
  ['m3', 'In three months, realistically…', 'Still no commitment'],
  ['m1', 'In one month…', 'Still no commitment'],
  ['w1', 'This week, I could…', 'Still no commitment'],
  ['d1', 'In the next 24 hours, on a good day, I will…', 'This is the one you commit to'],
  ['low', 'On a low day, the smallest version is…', 'Still counts'],
  ['cue', 'What will remind me (outside my head)…', 'A timer, a note, a person, the thing left out'],
];
export function StepDown({ course }) {
  const sd = course.stepdown || {};
  const set = (k, v) => setCourse((c) => ({ ...c, stepdown: { ...c.stepdown, [k]: v } }));
  const ready = sd.goal?.trim() && sd.d1?.trim();
  return (
    <section className="card stack" aria-label="Step it down" style={{ gap: 12 }}>
      <p className="mono-s caps">Step it down</p>
      {STEPS.map(([k, label, hint], i) => (
        <div key={k} className="stack" style={{ gap: 4, marginLeft: Math.min(i, 4) * 6, paddingLeft: i === 4 ? 8 : 0, borderLeft: i === 4 ? '4px solid var(--deep)' : 'none' }}>
          <label htmlFor={'sd-' + k} style={{ fontWeight: 700 }}>{label}</label>
          <input id={'sd-' + k} className="field" value={sd[k] || ''} onChange={(e) => set(k, e.target.value)} />
          <span className="mono-s mute">{hint}</span>
        </div>
      ))}
      <button type="button" className="btn btn-ink" disabled={!ready} onClick={() => {
        const lines = STEPS.filter(([k]) => sd[k]?.trim()).map(([k, label]) => `${label} ${sd[k].trim()}`);
        addEntry({ kind: 'course', lessonId: 'step', text: `ACT for ADHD · Step-down\n\n${lines.join('\n')}` });
        toast('Step saved to your journal');
      }}>Save my step to the journal</button>
    </section>
  );
}

// ---------- guided exercise player ----------
export function Player({ lesson, bell, onClose, onFinish }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [left, setLeft] = useState(lesson.stepSecs || 20);
  const steps = lesson.steps, last = i === steps.length - 1;
  const ref = useRef(null);
  useEffect(() => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--sit-bg').trim();
    if (bg) setThemeColor(bg);
    ref.current?.focus();
    return () => window.dispatchEvent(new Event('bmo:theme'));
  }, []);
  useEffect(() => { setLeft(lesson.stepSecs || 20); }, [i, lesson.stepSecs]);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [auto]);
  useEffect(() => {
    if (!auto || left > 0) return;
    if (last) { setAuto(false); ring(bell, 3); }
    else { ring(bell, 1); setI((x) => x + 1); }
  }, [auto, left, last, bell]);
  return (
    <section className="sit" role="dialog" aria-modal="true" aria-label={lesson.title} tabIndex={-1} ref={ref} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="sit-in">
        <div className="sit-strip" aria-hidden="true">{steps.map((_, k) => <div key={k} style={{ flex: '1 1 0' }}><div className="fill" style={{ width: k < i ? '100%' : k === i ? (auto ? `${100 - (left / (lesson.stepSecs || 20)) * 100}%` : '0%') : '0%', transition: 'width 1s linear' }} /></div>)}</div>
        <div className="between mono caps"><span>{String(i + 1).padStart(2, '0')}/{String(steps.length).padStart(2, '0')}</span><span>{lesson.title}</span></div>
        <div className="sit-mid" style={{ justifyContent: 'center' }}>
          <p key={i} aria-live="polite" style={{ fontSize: 'clamp(1.5rem, 6.4vw, 2rem)', fontWeight: 700, lineHeight: 1.25, color: 'var(--sit-ink)', animation: 'fade-in 260ms var(--ease-out) both' }}>{steps[i]}</p>
          {auto && <p className="mono">{left}s</p>}
        </div>
        <div className="stack">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button type="button" className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
            {last ? <button type="button" className="btn" style={{ background: 'var(--sit-word)', color: 'var(--sit-bg)', borderColor: 'var(--sit-word)' }} onClick={onFinish}>Finish</button>
              : <button type="button" className="btn" style={{ background: 'var(--sit-word)', color: 'var(--sit-bg)', borderColor: 'var(--sit-word)' }} onClick={() => setI(i + 1)}>Next</button>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button type="button" className="btn" aria-pressed={auto} onClick={() => { unlockAudio(); setAuto(!auto); }}>{auto ? 'Pause' : `Guide me · ${lesson.stepSecs || 20}s a step`}</button>
            <button type="button" className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </section>
  );
}
