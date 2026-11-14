import { useEffect, useRef, useState } from 'react';
import { ring, audioUnlocked, unlockAudio } from '../lib/bells.js';
import { setThemeColor } from '../lib/theme.js';
import { Spark, Mala } from '../components/bits.jsx';
import { useStore } from '../lib/store.js';
import { speak, hush, cueFor } from '../lib/voice.js';
import { REST } from '../data/daily.js';
import { total, locate, restPlan } from '../lib/sit.js';
import { useBackLayer } from '../lib/history.js';

const KEY = 'bmo2.active';
export const saveActive = (a) => { try { a ? localStorage.setItem(KEY, JSON.stringify(a)) : localStorage.removeItem(KEY); } catch { /* private mode */ } };
export const loadActive = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const pad = (n) => String(n).padStart(2, '0');

export default function Sit({ active: initial, bell, voice = false, onEnd }) {
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

  // Spoken cues: each phase is read aloud a moment after its bell.
  useEffect(() => {
    if (!voice) return undefined;
    speak(cueFor(active.phases[active.idx]), 2600);
    return hush;
  }, [voice, active.idx, active.rough]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const next = restPlan(active, el, REST);
    saveActive(next); setActive(next);
  }

  // The phone's Back button never ends a sit by accident: the first press arms Stop,
  // a second press while it is armed stops, exactly like tapping the button twice.
  const [backKey, setBackKey] = useState(0);
  const armedRef = useRef(false);
  armedRef.current = stopArmed;
  useBackLayer(true, () => {
    if (armedRef.current) { finish(false); return; }
    setStopArmed(true);
    setBackKey((k) => k + 1); // re-open the layer so the next Back comes here too
  }, backKey);

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
            <h2 className="word sit-name" aria-live="polite" style={{ '--fit': (1.1 / (0.41 * Math.max(4, p.label.length))).toFixed(3) }}>{p.label.toLowerCase()}</h2>
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
          <div style={{ display: 'grid', gridTemplateColumns: (!active.rough && /mantra|dive/i.test(p.label)) ? '1fr 1fr' : '1fr', gap: 10 }}>
            {!active.rough && /mantra|dive/i.test(p.label) && <button type="button" className="btn" onClick={rough}>Rough sit? Rest</button>}
            <button type="button" className="btn" onClick={() => { if (stopArmed) finish(false); else setStopArmed(true); }}>
              {stopArmed ? 'Tap again to stop' : 'Stop'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// After the sit. The last bell is still ringing, so this arrives quietly: first the
// bead landing on the mala, then, a moment later, the place to write. A tap skips the wait.
export function Done({ result, onSave }) {
  const count = useStore((s) => s.sits.length);
  const [note, setNote] = useState('');
  const [dedication, setDedication] = useState('');
  const [beads, setBeads] = useState(Math.max(0, count - 1)); // one render without the new bead, so it can arrive
  const [ready, setReady] = useState(false);
  const mins = Math.max(1, Math.round(result.secs / 60));
  const round = count > 0 && count % 108 === 0 ? count / 108 : 0; // this sit completed a round of the mala

  useEffect(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const a = setTimeout(() => setBeads(count), still ? 0 : 500);
    const b = setTimeout(() => setReady(true), still ? 0 : 2200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [count]);

  const save = () => onSave(note.trim(), round && dedication.trim() ? `Round ${round} of the mala, 108 sits. Dedicated to ${dedication.trim()}` : '');

  return (
    <main className={'screen done' + (round ? ' done-round' : '')} style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 40px)' }} onPointerDown={() => { setBeads(count); setReady(true); }}>
      <p className="mono caps">{round ? `Round ${round} complete · 108 sits` : result.completed ? result.active.label + ' · ' + mins + ' min' : 'That counts · ' + mins + ' min'}</p>
      {round
        ? <h1 className="word title-xl" style={{ fontSize: 'clamp(4.5rem, 22vw, 6rem)' }}>one<br /><span className="deep">hundred</span><br />& eight.</h1>
        : <h1 className="word title-xl" style={{ fontSize: 'clamp(4.5rem, 22vw, 6rem)' }}>sit<br /><span className="deep">logged.</span></h1>}
      <Mala count={round ? count : beads} full={!!round && beads === count} />
      <div className="done-rest stack" data-ready={ready || undefined} style={{ gap: 20 }}>
        {round > 0 && (
          <div className="card card-lav stack">
            <p style={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.3 }}>Every bead on the mala is lit. Before the next round begins, who or what is this one for?</p>
            <label htmlFor="dedicate" className="mono caps">Dedicate this round</label>
            <input id="dedicate" className="field" value={dedication} onChange={(e) => setDedication(e.target.value)} placeholder="Optional. Kept in your journal." enterKeyHint="next" />
          </div>
        )}
        <div className="stack" style={{ gap: 8 }}>
          <label htmlFor="sitnote" className="mono caps">What did you notice?</label>
          <textarea id="sitnote" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional. The time and the sit are saved for you." enterKeyHint="done" />
        </div>
        <button type="button" className="btn btn-ink btn-shadow btn-block begin" onClick={save}>
          <span>Done</span><span className="mono">→</span>
        </button>
      </div>
    </main>
  );
}
