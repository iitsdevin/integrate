// Dev-only switch between demo (your real local data) and stress-test datasets.
import { DEV_DATA } from '../lib/store.js';

const OPTS = [['', 'Demo'], ['worst', 'Worst case'], ['empty', 'Empty'], ['one', 'One']];

export default function DevDataToggle() {
  const cur = DEV_DATA || '';
  const go = (v) => { const u = new URL(location.href); v ? u.searchParams.set('data', v) : u.searchParams.delete('data'); location.href = u.toString(); };
  return (
    <div style={{ position: 'fixed', left: '50%', bottom: 'calc(var(--tabbar) + 10px)', transform: 'translateX(-50%)', zIndex: 80, display: 'flex', gap: 2, padding: 3, borderRadius: 999, background: '#d4d4d4', font: '12px system-ui', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>
      {OPTS.map(([v, l]) => (
        <button key={l} type="button" onClick={() => go(v)} style={{ padding: '6px 10px', borderRadius: 999, background: cur === v ? '#fff' : 'transparent', color: '#111', fontWeight: cur === v ? 600 : 400 }}>{l}</button>
      ))}
    </div>
  );
}
