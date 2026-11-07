import { useState } from 'react';
import { useStore, setToday, updateSettings, localDate, timeOf, addSit } from '../lib/store.js';
import { BODY_OPTIONS, bodyOption, dailySit, badDay, secondSit, FEELS, FEEL_TEXT, WHEN_TO_PAUSE, DEFAULT_PLAN } from '../data/daily.js';
import { planWeek } from '../lib/backup.js';
import { Mala, Spark, Icon, toast } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';

export default function Today({ onBegin, onSettings }) {
  const s = useStore();
  const today = localDate();
  const t = s.today?.date === today ? s.today : {};
  const feel = t.feel || null;
  const bodyId = feel === 'wired' ? 'slow' : (t.body || s.settings.body);
  const body = bodyOption(bodyId);
  const [picker, setPicker] = useState(false);
  const [pause, setPause] = useState(false);
  const todays = s.sits.filter((x) => localDate(new Date(x.at)) === today);
  const plan = s.plan || DEFAULT_PLAN;
  const wk = planWeek();
  const inDefault = !s.plan && wk && wk <= 8;
  const d = new Date();

  const eyebrowR = inDefault ? `WK ${String(wk).padStart(2, '0')}/08` : (plan.title || '').toUpperCase();

  return (
    <main className="screen">
      <header className="between">
        <p className="mono caps" style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={plan.title}>{d.toLocaleDateString('en-AU', { weekday: 'short' })} {String(d.getDate()).padStart(2, '0')}.{String(d.getMonth() + 1).padStart(2, '0')}.{String(d.getFullYear()).slice(2)} — {eyebrowR}</p>
        <button type="button" className="btn icon-btn" onClick={onSettings} aria-label="Settings"><Icon.gear /></button>
      </header>

      {!todays.length && (
        <section className="stack" style={{ gap: 8 }} aria-labelledby="feelH">
          <h2 id="feelH" className="mono caps" style={{ fontWeight: 400 }}>How are you — right now?</h2>
          <div className="chips">
            {FEELS.map(([id, name]) => (
              <button key={id} type="button" className="chip" aria-pressed={feel === id} onClick={() => setToday({ feel: feel === id ? null : id })}>{name}</button>
            ))}
          </div>
          {feel && <p className="notice" role="status">{FEEL_TEXT[feel]}</p>}
        </section>
      )}

      <section className="hero" aria-label={`Today's sit: Body, ${body.name}, 3 minutes. Mantra, 14 minutes. Open, 3 minutes.`}>
        <div className="blk" aria-hidden="true" style={{ left: 92, top: 92, width: 'min(258px, calc(100% - 92px))', height: 84, background: 'var(--block1)' }} />
        <div className="blk" aria-hidden="true" style={{ left: 0, top: 200, width: 132, height: 74, background: 'var(--block3)' }} />
        <button type="button" className="w word" style={{ left: 0, top: 0 }} onClick={() => setPicker(true)} aria-label={`Body: ${body.name}. Change the body practice`}>body</button>
        <p className="note mono-s" style={{ left: 'min(226px, 60%)', top: 8, width: 'min(132px, calc(100% - min(226px, 60%)))' }} aria-hidden="true">03 MIN — SOMATIC<br />{body.name.toLowerCase()}<br /><span style={{ textDecoration: 'underline' }}>tap body to change</span></p>
        <p className="w word deep" style={{ left: 70, top: 92 }} aria-hidden="true">mantra</p>
        <p className="note mono-s" style={{ left: 0, top: 116, width: 64 }} aria-hidden="true">14 MIN<br />your<br />vedic<br />mantra</p>
        <p className="w word" style={{ left: 22, top: 186 }} aria-hidden="true">open</p>
        <p className="note mono-s" style={{ left: 'min(228px, 62%)', top: 214, width: 'min(120px, calc(100% - min(228px, 62%)))' }} aria-hidden="true">03 MIN<br />whole body,<br />sound, the room,<br />the living world</p>
        <Spark size={22} style={{ left: 196, top: 196 }} />
        <Spark size={14} style={{ right: 6, top: 70 }} />
      </section>

      <div className="stack" style={{ gap: 12 }}>
        <button type="button" className="btn btn-ink btn-shadow btn-block begin" onClick={() => onBegin(dailySit(bodyId))}>
          <span>{todays.length ? 'Sit again' : 'Begin'}</span><span className="mono">20:00</span>
        </button>
        {todays.length > 0 && <p className="mono" role="status">You sat today at {timeOf(todays[todays.length - 1].at)}. That's the day's sit done.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button type="button" className="btn btn-tight" onClick={() => onBegin(badDay())}>Bad day · 3′</button>
          <button type="button" className="btn btn-tight" onClick={() => onBegin(secondSit())}>Second sit · 12′</button>
        </div>
      </div>

      <Mala count={s.sits.length} />
      <div className="between" style={{ marginTop: -8 }}>
        <button type="button" className="link-btn" onClick={() => { addSit({ at: new Date().toISOString(), kind: 'manual', label: 'Sat without the timer', minutes: 0, done: true, feel }); toast('Bead added. Nice.'); }}>
          <Icon.plus /> I sat without the timer
        </button>
        <button type="button" className="link-btn" onClick={() => setPause(true)}>When to pause</button>
      </div>

      <Sheet open={picker} onClose={() => setPicker(false)} title="body" kicker="Today's somatic practice · 3 min">
        <div className="list">
          {BODY_OPTIONS.map((o, i) => (
            <button key={o.id} type="button" className="item" aria-pressed={bodyId === o.id}
              onClick={() => { setToday({ body: o.id, feel: feel === 'wired' && o.id !== 'slow' ? null : feel }); setPicker(false); }}>
              <span className="n">{bodyId === o.id ? '●' : String(i + 1).padStart(2, '0')}</span>
              <span className="t">{o.name}</span>
              <span className="m">{s.settings.body === o.id ? 'USUAL' : ''}</span>
              <span className="d">{o.who}. {o.text}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-block" style={{ marginTop: 16 }} disabled={s.settings.body === bodyId}
          onClick={() => { updateSettings({ body: bodyId }); toast(body.name + ' is now your usual.'); }}>
          Make {body.name} my usual
        </button>
        <p className="mono soft" style={{ marginTop: 12 }}>More somatic practices live in Toolkit › Somatic.</p>
      </Sheet>

      <Sheet open={pause} onClose={() => setPause(false)} title="when to pause">
        <div className="prose">
          <p>{WHEN_TO_PAUSE.intro}</p>
          <ul>{WHEN_TO_PAUSE.items.map((x) => <li key={x}>{x}</li>)}</ul>
          <p>For panic in the moment, use Samurai Breath and RAIN in Toolkit › Regulation.</p>
          <p className="soft">This sequence adds to your care rather than replacing it.</p>
        </div>
      </Sheet>
    </main>
  );
}
