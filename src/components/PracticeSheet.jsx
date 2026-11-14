// One practice, wherever it is opened from: Toolkit lists, Toolkit search, or a pin on Today.
import Sheet from './Sheet.jsx';
import { PracticeBody, toast } from './bits.jsx';
import { useStore, togglePin } from '../lib/store.js';
import { timedPractice } from '../data/daily.js';

export default function PracticeSheet({ item, kicker, onClose, onBegin }) {
  const pinned = useStore((s) => !!item && (s.pins || []).includes(item.id));
  return (
    <Sheet open={!!item} onClose={onClose} title={item?.name} kicker={kicker || item?.category}>
      {item && (
        <>
          <PracticeBody item={item} />
          <div className="stack" style={{ marginTop: 18 }}>
            {item.timer && onBegin && (
              <button type="button" className="btn btn-ink btn-block" onClick={() => { onClose(); onBegin(timedPractice(item.name, item.timer, item.summary)); }}>
                Time it · {item.timer} min
              </button>
            )}
            {item.link && <a className="btn btn-block" href={item.link.url} target="_blank" rel="noopener">{item.link.label} ↗</a>}
            <button type="button" className="btn btn-block" aria-pressed={pinned}
              onClick={() => { const on = togglePin(item.id); toast(on ? 'Pinned to Today.' : 'Unpinned.'); }}>
              {pinned ? '● Pinned to Today — unpin' : 'Pin to Today'}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
