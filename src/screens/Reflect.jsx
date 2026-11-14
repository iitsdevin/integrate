import { useMemo, useState } from 'react';
import { useStore, getState, addEntry, updateEntry, removeEntry, removeSit, setCheckin, setPlan, updateSettings, DEFAULT_SETTINGS, shortDate, timeOf } from '../lib/store.js';
import { DEFAULT_PLAN } from '../data/daily.js';
import { planWeek, checkinKey, checkinWeek } from '../lib/backup.js';
import Patterns from '../components/Patterns.jsx';
import { observe } from '../lib/notice.js';
import { Spark, Icon, toast } from '../components/bits.jsx';
import Sheet from '../components/Sheet.jsx';

const OPENERS = ['what came up in the sit', "a pattern i'm noticing", 'plan my next weeks'];

export default function Reflect({ onBuddy }) {
  const s = useStore();
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [checkin, setCheckinOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [limit, setLimit] = useState(30);
  const plan = s.plan || DEFAULT_PLAN;
  const [patterns, setPatterns] = useState(false);
  const [noticed, setNoticed] = useState(null); // a line shown after a check-in
  const [q, setQ] = useState('');
  const wk = planWeek(plan);
  const wkKey = wk ? checkinKey(plan, wk) : null;
  const thisCheckin = wkKey ? s.checkins[wkKey] : null;

  // One timeline: notes, sit notes, sits without notes, check-ins.
  const timeline = useMemo(() => {
    const noted = new Set(s.journal.filter((j) => j.sitId).map((j) => j.sitId));
    const sitById = Object.fromEntries(s.sits.map((x) => [x.id, x]));
    const rows = s.journal.map((j) => ({ type: 'entry', at: j.at, entry: j, sit: j.sitId ? sitById[j.sitId] : null }));
    s.sits.filter((x) => !noted.has(x.id)).forEach((x) => rows.push({ type: 'sit', at: x.at, sit: x }));
    Object.entries(s.checkins).forEach(([k, c]) => c.at && rows.push({ type: 'checkin', at: c.at, week: k, c }));
    return rows.sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [s.journal, s.sits, s.checkins]);

  // Search looks through note text and the sit's label and feel.
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = !words.length ? timeline : timeline.filter((row) => {
    const hay = [row.entry?.text, row.sit?.label, row.sit?.feel, row.sit?.rough ? 'rough' : '', row.type === 'checkin' ? 'check-in' : ''].join(' ').toLowerCase();
    return words.every((w) => hay.includes(w));
  });

  const sitMeta = (x) => [shortDate(x.at), timeOf(x.at).toUpperCase(), (x.label || 'Sit').toUpperCase(), x.minutes ? x.minutes + '′' : null, x.feel || x.feelAfter ? `${(x.feel || '–').toUpperCase()}${x.feelAfter ? ' → ' + x.feelAfter.toUpperCase() : ''}` : null, x.rough ? 'ROUGH' : null].filter(Boolean).join(' · ');

  return (
    <main className="screen">
      <header>
        <p className="mono caps">Journal — buddy — plan</p>
        <h1 className="word title-xl" style={{ marginTop: 6 }}>reflect</h1>
      </header>

      <section className="card card-ink stack" aria-labelledby="buddyH">
        <div className="between">
          <h2 id="buddyH" className="word" style={{ fontSize: '1.9rem' }}>Talk it through</h2>
          <Spark size={18} color="var(--block2)" style={{ position: 'static' }} />
        </div>
        <p style={{ fontSize: '0.9375rem', opacity: 0.85 }}>Your reflection buddy can see your sits, your notes, your toolkit and the books in your library.</p>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {OPENERS.map((o, i) => (
            <button key={o} type="button" className={'btn btn-mono' + (i === 2 ? ' btn-lime' : '')} style={{ textTransform: 'none', minHeight: 40 }} onClick={() => onBuddy(o)}>{o}</button>
          ))}
        </div>
        <button type="button" className="link-btn" style={{ color: 'inherit', alignSelf: 'flex-start' }} onClick={() => onBuddy(null)}>Open conversation <Icon.arrow /></button>
      </section>

      {noticed && (
        <section className="card stack" style={{ boxShadow: '4px 4px 0 var(--block1)' }} aria-labelledby="noticeH" role="status">
          <h2 id="noticeH" className="mono-s caps" style={{ fontWeight: 400 }}>Noticed, from your week</h2>
          <p style={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.3 }}>{noticed}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <button type="button" className="btn btn-ink" onClick={() => { const n = noticed; setNoticed(null); onBuddy(`I just did my weekly check-in and the app noticed this: "${n}" Can we talk it through?`); }}>Talk it through</button>
            <button type="button" className="btn" onClick={() => setNoticed(null)}>Not now</button>
          </div>
        </section>
      )}

      <button type="button" className="card card-lime" style={{ textAlign: 'left', border: '2px solid var(--ink)' }} onClick={() => setPlanOpen(true)}>
        <span className="between mono-s caps"><span>Your plan · {plan.title}</span><span>{wk && plan.weeks ? `WK ${String(wk).padStart(2, '0')}/${String(plan.weeks).padStart(2, '0')}` : ''}</span></span>
        <span style={{ display: 'block', fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.25, margin: '6px 0 4px' }}>{plan.summary}</span>
        <span className="mono">{plan.source === 'default' ? 'start nothing new until 31 dec' : `${plan.from} → ${plan.to}`}</span>
      </button>

      {wkKey && !thisCheckin && (
        <button type="button" className="card between" style={{ textAlign: 'left' }} onClick={() => setCheckinOpen(true)}>
          <span><span className="mono-s caps">Week {wk} check-in</span><span style={{ display: 'block', fontWeight: 700, marginTop: 2 }}>One minute, however the week went.</span></span>
          <Icon.arrow />
        </button>
      )}

      {s.sits.length > 0 && (
        <button type="button" className="card between" style={{ textAlign: 'left' }} onClick={() => setPatterns(true)}>
          <span><span className="mono-s caps">Patterns</span><span style={{ display: 'block', fontWeight: 700, marginTop: 2 }}>What your weeks have looked like.</span></span>
          <Icon.arrow />
        </button>
      )}

      <section aria-labelledby="journalH">
        <div className="group-title">
          <h2 id="journalH">Journal</h2>
          <button type="button" className="btn btn-mono" onClick={() => { setDraft(''); setWriting(true); }}><Icon.plus /> New entry</button>
        </div>
        {!timeline.length && <p className="group-note">Your sits, notes and check-ins will gather here.</p>}
        {timeline.length > 6 && (
          <div className="search" style={{ marginTop: 12 }}>
            <Icon.search />
            <label className="sr" htmlFor="jq">Search your journal</label>
            <input id="jq" type="search" className="field" value={q} onChange={(e) => { setQ(e.target.value); setLimit(30); }} placeholder="Search notes and sits" enterKeyHint="search" autoCapitalize="none" />
          </div>
        )}
        {words.length > 0 && <p className="group-note" role="status">{shown.length ? `${shown.length} match${shown.length === 1 ? '' : 'es'}` : 'Nothing matches that.'}</p>}
        {shown.slice(0, limit).map((row) => {
          if (row.type === 'checkin') return (
            <div key={'c' + row.week} className="entry">
              <p className="mono-s mute">{shortDate(row.at)} · WEEK {checkinWeek(row.week)} CHECK-IN</p>
              <p>{[row.c.back ? 'Came back to it' : 'Didn’t come back much', row.c.settled != null ? `settled ${row.c.settled}/10` : null, row.c.connected != null ? `connected ${row.c.connected}/10` : null].filter(Boolean).join(' · ')}</p>
            </div>
          );
          if (row.type === 'sit') return (
            <button key={row.sit.id} type="button" className="entry" onClick={() => setEditing({ sit: row.sit, entry: null, text: '' })}>
              <p className="mono-s mute">{sitMeta(row.sit)}</p>
              <p className="mute">No note. Tap to add one.</p>
            </button>
          );
          return (
            <button key={row.entry.id} type="button" className="entry" onClick={() => setEditing({ sit: row.sit, entry: row.entry, text: row.entry.text })}>
              <p className="mono-s mute">{row.sit ? sitMeta(row.sit) : shortDate(row.at) + ' · ' + timeOf(row.at).toUpperCase() + (row.entry.kind === 'round' ? ' · ROUND COMPLETE' : ' · NOTE')}</p>
              <p className="clamp">{row.entry.text}</p>
            </button>
          );
        })}
        {shown.length > limit && <button type="button" className="btn btn-block" style={{ marginTop: 14 }} onClick={() => setLimit(limit + 30)}>Show older</button>}
      </section>

      <Sheet open={writing} onClose={() => setWriting(false)} title="new entry" kicker={shortDate(new Date().toISOString())}>
        <div className="stack">
          <label className="sr" htmlFor="newEntry">Entry</label>
          <textarea id="newEntry" className="field" style={{ minHeight: 200 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What's here?" />
          <button type="button" className="btn btn-ink btn-block" disabled={!draft.trim()} onClick={() => { addEntry({ text: draft.trim() }); setWriting(false); toast('Saved'); }}>Save</button>
        </div>
      </Sheet>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.sit ? 'sit note' : 'note'} kicker={editing?.sit ? sitMeta(editing.sit) : editing?.entry ? shortDate(editing.entry.at) : ''}>
        {editing && <EditEntry editing={editing} setEditing={setEditing} />}
      </Sheet>

      <Sheet open={checkin} onClose={() => setCheckinOpen(false)} title={`week ${wk}`} kicker="Check-in · one minute">
        {checkin && <Checkin week={wkKey} initial={thisCheckin} onDone={() => { setCheckinOpen(false); const n = observe(getState()); setNoticed(n); if (n) window.scrollTo({ top: 0 }); else toast('Check-in saved'); }} />}
      </Sheet>

      <Sheet open={patterns} onClose={() => setPatterns(false)} title="patterns" kicker="No streaks. Just the shape of it.">
        {patterns && <Patterns sits={s.sits} checkins={s.checkins} />}
      </Sheet>

      <Sheet open={planOpen} onClose={() => setPlanOpen(false)} title={plan.title.toLowerCase()} kicker="Your plan">
        <div className="stack">
          <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>{plan.summary}</p>
          <div className="list">
            {plan.items.map((it, i) => (
              <div key={i} className="entry"><p className="mono-s caps">{it.label}</p><p>{it.text}</p></div>
            ))}
          </div>
          <p className="mono soft">{plan.from} → {plan.to}{plan.source === 'buddy' ? ' · drafted with your buddy' : ''}</p>
          <button type="button" className="btn btn-ink btn-block" onClick={() => { setPlanOpen(false); onBuddy('plan my next weeks'); }}>Rework it with my buddy</button>
          {s.plan && <button type="button" className="btn btn-block" onClick={() => { setPlan(null); updateSettings({ sit: { ...DEFAULT_SETTINGS.sit } }); setPlanOpen(false); toast('Back to the 8-week plan'); }}>Go back to the 8-week plan</button>}
        </div>
      </Sheet>
    </main>
  );
}

function EditEntry({ editing, setEditing }) {
  const { sit, entry } = editing;
  return (
    <div className="stack">
      <label className="sr" htmlFor="editEntry">Note</label>
      <textarea id="editEntry" className="field" style={{ minHeight: 180 }} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} placeholder="What did you notice?" />
      <button type="button" className="btn btn-ink btn-block" onClick={() => {
        const text = editing.text.trim();
        if (entry) { text ? updateEntry(entry.id, { text }) : removeEntry(entry.id); }
        else if (text) addEntry({ text, kind: 'sit', sitId: sit.id, at: sit.at });
        setEditing(null);
      }}>Save</button>
      {/* One tap, with Undo: quicker than a confirmation and nothing is lost by a slip. */}
      <button type="button" className="btn btn-block" onClick={() => {
        const undo = sit ? removeSit(sit.id) : entry ? removeEntry(entry.id) : null;
        setEditing(null);
        if (undo) toast(sit ? (entry ? 'Sit and its note removed.' : 'Sit removed.') : 'Note removed.', { action: 'Undo', onAction: undo });
      }}>{sit ? 'Remove this sit' : 'Remove this note'}</button>
    </div>
  );
}

function Checkin({ week, initial, onDone }) {
  // Scores start unset rather than at 5, so the saved number is one you chose.
  const [c, setC] = useState({ back: false, settled: null, connected: null, ...(initial || {}) });
  return (
    <div className="stack" style={{ gap: 16 }}>
      <label className="check"><input type="checkbox" checked={!!c.back} onChange={(e) => setC({ ...c, back: e.target.checked })} /><span>I came back to it</span></label>
      {[['settled', 'How settled do I feel, from 0 to 10?'], ['connected', 'How connected do I feel, from 0 to 10?']].map(([k, q]) => (
        <label key={k} className="slider"><span>{q}</span>
          <input type="range" min="0" max="10" step="1" value={c[k] ?? 5} data-unset={c[k] == null || undefined}
            aria-valuetext={c[k] == null ? 'not set' : `${c[k]} out of 10`}
            onChange={(e) => setC({ ...c, [k]: Number(e.target.value) })} onPointerDown={() => { if (c[k] == null) setC({ ...c, [k]: 5 }); }} />
          <output>{c[k] ?? '–'}</output>
        </label>
      ))}
      <button type="button" className="btn btn-ink btn-block" onClick={() => { setCheckin(week, { back: c.back, ...(c.settled != null ? { settled: c.settled } : {}), ...(c.connected != null ? { connected: c.connected } : {}) }); onDone(); }}>Save check-in</button>
    </div>
  );
}
