import { useEffect, useRef, useState } from 'react';
import Sheet from '../components/Sheet.jsx';
import { Icon, toast } from '../components/bits.jsx';
import { buddyTurn, BuddyError } from '../lib/buddy.js';
import { getApiKey, setApiKey, getState, setState, setPlan, uid, localDate } from '../lib/store.js';

const addDays = (date, n) => { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + n); return localDate(d); };

function saveSession(sess) {
  setState((s) => {
    const others = s.buddy.sessions.filter((x) => x.id !== sess.id);
    return { ...s, buddy: { sessions: [sess, ...others].slice(0, 20) } };
  });
}

export default function Buddy({ open, onClose, starter, onSettings }) {
  const [hasKey, setHasKey] = useState(!!getApiKey());
  const [keyInput, setKeyInput] = useState('');
  const [sess, setSess] = useState(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(false);
  const endRef = useRef(null), taRef = useRef(null), started = useRef(null);

  useEffect(() => { if (open) setHasKey(!!getApiKey()); }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }, [sess, busy]);

  // A starter from the Reflect screen begins a fresh conversation.
  useEffect(() => {
    if (!open) { started.current = null; return; }
    if (starter && hasKey && started.current !== starter) {
      started.current = starter;
      const fresh = { id: uid(), at: new Date().toISOString(), title: starter, display: [], api: [] };
      setSess(fresh);
      send(starter, fresh);
    }
  }, [open, starter, hasKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(text, base = sess) {
    const t = text.trim();
    if (!t || busy) return;
    let cur = base || { id: uid(), at: new Date().toISOString(), title: t.slice(0, 60), display: [], api: [] };
    cur = { ...cur, display: [...cur.display, { role: 'user', text: t }], api: [...cur.api, { role: 'user', content: t }] };
    setSess(cur); setInput(''); setBusy(true);
    try {
      const api = await buddyTurn(cur.api, (ev) => { cur = { ...cur, display: [...cur.display, ev] }; setSess(cur); });
      cur = { ...cur, api };
      setSess(cur); saveSession(cur);
    } catch (e) {
      cur = { ...cur, display: [...cur.display, { role: 'error', text: e instanceof BuddyError ? e.message : 'Something went wrong. Try again.' }], api: cur.api.slice(0, -1) };
      setSess(cur);
    } finally { setBusy(false); }
  }

  function acceptPlan(ev, i) {
    const p = ev.plan, from = localDate();
    setPlan({ id: p.id, title: p.title, summary: p.summary, items: p.items, weeks: p.weeks, from, to: addDays(from, (p.weeks || 2) * 7 - 1), source: 'buddy' });
    const display = sess.display.map((d, j) => (j === i ? { ...d, used: true } : d));
    const next = { ...sess, display }; setSess(next); saveSession(next);
    toast('Plan saved. It shows on Reflect.');
  }

  const sessions = getState().buddy.sessions;

  return (
    <Sheet open={open} onClose={onClose} tall title="buddy" kicker="Can see: your sits · notes · toolkit · library"
      footer={hasKey && !history ? (
        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <label className="sr" htmlFor="buddyIn">Message your buddy</label>
          <textarea id="buddyIn" ref={taRef} rows={1} value={input} placeholder="Say what's here…" enterKeyHint="send"
            onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px'; }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); send(input); } }} />
          <button type="submit" className="btn btn-lime icon-btn" style={{ width: 48, height: 48 }} disabled={busy || !input.trim()} aria-label="Send"><Icon.arrow /></button>
        </form>
      ) : null}>
      {!hasKey ? (
        <div className="stack">
          <p>The buddy talks to Claude using your own Anthropic API key. The key is saved only on this phone, and replies come straight from Anthropic. Each conversation costs a few cents on your key.</p>
          <p className="soft">Get a key at console.anthropic.com → API keys.</p>
          <label className="sr" htmlFor="keyIn">API key</label>
          <input id="keyIn" className="field" type="password" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="sk-ant-…" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
          <button type="button" className="btn btn-ink btn-block" disabled={!keyInput.trim().startsWith('sk-')} onClick={() => { setApiKey(keyInput.trim()); setKeyInput(''); setHasKey(true); started.current = null; }}>Save key and start</button>
          <button type="button" className="link-btn" onClick={onSettings}>More in Settings</button>
        </div>
      ) : history ? (
        <div className="stack">
          <div className="between"><p className="mono caps">Past conversations</p><button type="button" className="btn btn-mono" onClick={() => setHistory(false)}>Back</button></div>
          {!sessions.length && <p className="soft">None yet.</p>}
          <div className="list">
            {sessions.map((x) => (
              <button key={x.id} type="button" className="entry" onClick={() => { setSess(x); setHistory(false); }}>
                <p className="mono-s mute">{new Date(x.at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</p>
                <p>{x.title}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat">
          <div className="between">
            <button type="button" className="btn btn-mono" onClick={() => setHistory(true)}>History</button>
            {sess?.display.length > 0 && <button type="button" className="btn btn-mono" onClick={() => { setSess(null); started.current = null; taRef.current?.focus(); }}>New</button>}
          </div>
          {!sess?.display.length && !busy && <p className="soft">Say what you’re sitting with, ask about a book, or ask for a plan. It will look at your history before answering.</p>}
          {sess?.display.map((d, i) => {
            if (d.role === 'user') return <p key={i} className="msg-user">{d.text}</p>;
            if (d.role === 'assistant') return <p key={i} className="msg-bot">{d.text}</p>;
            if (d.role === 'tool') return <p key={i} className="msg-tool">↳ {d.text}</p>;
            if (d.role === 'error') return <p key={i} className="notice" role="alert">{d.text}</p>;
            if (d.role === 'plan') return (
              <div key={i} className="plan-card">
                <p className="mono-s caps">Draft — {d.plan.title} · {d.plan.weeks} week{d.plan.weeks === 1 ? '' : 's'}</p>
                <p style={{ fontWeight: 700 }}>{d.plan.summary}</p>
                {d.plan.items?.map((it, j) => <p key={j} style={{ fontSize: '0.9375rem' }}><b>{it.label}</b> · {it.text}</p>)}
                {d.used ? <p className="mono caps" style={{ marginTop: 6 }}>✓ This is your plan now</p> : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                    <button type="button" className="btn btn-ink" onClick={() => acceptPlan(d, i)}>Use this plan</button>
                    <button type="button" className="btn" onClick={() => { setInput('Can we change '); taRef.current?.focus(); }}>Change it</button>
                  </div>
                )}
              </div>
            );
            return null;
          })}
          {busy && <span className="thinking" aria-label="Thinking"><i /><i /><i /></span>}
          <div ref={endRef} />
        </div>
      )}
    </Sheet>
  );
}
