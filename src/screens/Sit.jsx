import { useEffect, useRef, useState } from 'react';
import { ring, audioUnlocked, unlockAudio } from '../lib/bells.js';
import { setThemeColor } from '../lib/theme.js';
import { Spark } from '../components/bits.jsx';
import { REST } from '../data/daily.js';

const KEY = 'bmo2.active';
export const saveActive = (a) => { try { a ? localStorage.setItem(KEY, JSON.stringify(a)) : localStorage.removeItem(KEY); } catch { /* private mode */ } };
export const loadActive = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const total = (ps) => ps.reduce((a, p) => a + p.min, 0) * 60;
const pad = (n) => String(n).padStart(2, '0');

function locate(active, el) {
  let acc = 0, idx = 0;
  for (; idx < active.phases.length - 1; idx++) {
    if (el < acc + active.phases[idx].min * 60) break;
    acc += active.phases[idx].min * 60;
  }
  return { idx, acc };
}

export default function Sit({ active: initial, bell, onEnd }) {
  const [active, setActive] = useState(initial);
  const [now, setNow] = useState(Date.now());
  const [wake, setWake] = useState({ ok: true, text: '' });
  const [stopArmed, setStopArmed] = useState(false);
  const [needBell, setNeedBell] = useState(!audioUnlocked() && bell !== 'silent');
  const lock = useRef(null), ended = useRef(false), activeRef = useRef(active);
  activeRef.current = active;

  // The sit screen is always dark; match the status bar to it.
  useEffect(() => {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--sit-bg').trim();
    if (bg) setThemeColor(bg);
    return () => window.dispatchEvent(new Event('bmo:theme'));
  }, []);

  // Keep the screen on, or the phone sleeps and the bells never ring.
  useEffect(() => {
    let cancelled = false;
    const request = async () => {
      try {
        if (!navigator.wakeLock) throw new Error('none');
        lock.current = await navigator.wakeLock.request('screen');
        if (!cancelled) setWake({ ok: true, text: 'screen stays on — keep this page open' });
      } catch {
        if (!cancelled) setWake({ ok: false, text: "this phone won't let the page keep its screen on. turn off auto-lock" + (bell === 'silent' ? '.' : " or the bells won't ring.") });
      }
    };
    request();
    const onVis = () => { if (document.visibilityState === 'visible') { request(); setNow(Date.now()); } };
    document.addEventListener('visibilitychange', onVis);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onVis); lock.current?.release().catch(() => {}); };
  }, [bell]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const el = (now - active.start) / 1000;
  const T = total(active.phases);

  // Phase changes ring once: one bell between phases, two for the last stretch, three at the end.
  useEffect(() => {
    if (ended.current) return;
    if (el >= T) { finish(true); return; }
    const { idx } = locate(active, el);
    if (idx !== active.idx) {
      const next = { ...active, idx };
      saveActive(next); setActive(next);
      ring(bell, idx === active.phases.length - 1 ? 2 : 1);
    }
  });

  function finish(completed) {
    if (ended.current) return;
    ended.current = true;
    const a = activeRef.current;
    const secs = Math.min((Date.now() - a.start) / 1000, total(a.phases));
    saveActive(null);
    if (completed) ring(bell, 3);
    onEnd({ completed, secs, active: a });
  }

  function rough() {
    const { idx, acc } = locate(active, el);
    const kept = active.phases.slice(0, idx);
    kept.push({ ...active.phases[idx], min: Math.max(0.02, (el - acc) / 60) });
    kept.push({ label: 'Rest', min: 5, text: REST });
    const next = { ...active, phases: kept, idx: kept.length - 1, rough: true };
    saveActive(next); setActive(next);
  }

  useEffect(() => {
    if (!stopArmed) return;
    const id = setTimeout(() => setStopArmed(false), 3000);
    return () => clearTimeout(id);
  }, [stopArmed]);

  const { idx, acc } = locate(active, Math.min(el, T - 0.001));
  const p = active.phases[idx];
  const left = Math.max(0, Math.ceil(acc + p.min * 60 - el));
  let run = 0;
  const fills = active.phases.map((ph) => { const len = ph.min * 60; const f = Math.max(0, Math.min(1, (el - run) / len)); run += len; return f; });

  return (
    <section className="sit" aria-label="Sit in progress">
      <div className="sit-in">
        <div className="sit-strip" aria-hidden="true">
          {active.phases.map((ph, i) => (
            <div key={i} style={{ flex: `${ph.min} 1 0`, minWidth: 8 }}>
              <div className="fill" style={{ width: fills[i] * 100 + '%' }} />
            </div>
          ))}
        </div>
        <div className="between mono caps">
          <span>{pad(idx + 1)}/{pad(active.phases.length)}</span>
          <span>{active.label}</span>
        </div>
        <div className="sit-mid">
          <div style={{ position: 'relative' }}>
            <h2 className="word sit-name" aria-live="polite">{p.label.toLowerCase()}</h2>
            <Spark size={24} color="var(--sit-accent)" style={{ right: 8, top: -18 }} />
          </div>
          {p.name && <p className="mono caps" style={{ color: 'var(--sit-ink)' }}>{p.name}</p>}
          <p className="sit-text">{p.text}</p>
          <p className="word sit-clock" role="timer" aria-label={`${Math.floor(left / 60)} minutes ${left % 60} seconds left in ${p.label}`}>{Math.floor(left / 60)}:{pad(left % 60)}</p>
        </div>
        <div className="stack">
          <p className={'mono' + (wake.ok ? '' : ' warn')}>{wake.text}</p>
          {needBell && (
            <button type="button" className="btn btn-block" onClick={() => { unlockAudio(); ring(bell, 1); setNeedBell(false); }}>Turn the bells back on</button>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: (!active.rough && /mantra/i.test(p.label)) ? '1fr 1fr' : '1fr', gap: 10 }}>
            {!active.rough && /mantra/i.test(p.label) && <button type="button" className="btn" onClick={rough}>Rough sit? Rest</button>}
            <button type="button" className="btn" onClick={() => { if (stopArmed) finish(false); else setStopArmed(true); }}>
              {stopArmed ? 'Tap again to stop' : 'Stop'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Done({ result, onSave }) {
  const [note, setNote] = useState('');
  const mins = Math.max(1, Math.round(result.secs / 60));
  return (
    <main className="screen" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 40px)' }}>
      <p className="mono caps">{result.completed ? result.active.label + ' · ' + mins + ' min' : 'That counts · ' + mins + ' min'}</p>
      <h1 className="word title-xl" style={{ fontSize: 'clamp(4.5rem, 22vw, 6rem)' }}>sit<br /><span className="deep">logged.</span></h1>
      <label htmlFor="sitnote" className="mono caps">What did you notice?</label>
      <textarea id="sitnote" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional. The time and the sit are saved for you." enterKeyHint="done" />
      <button type="button" className="btn btn-ink btn-shadow btn-block begin" onClick={() => onSave(note.trim())}>
        <span>Done</span><span className="mono">→</span>
      </button>
    </main>
  );
}
