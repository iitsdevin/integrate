import { useEffect, useLayoutEffect, useRef, useState, useId } from 'react';
import { createPortal } from 'react-dom';

// A bottom sheet you can drag down to dismiss by its top bar.
// Open/close use a CSS transition, which retargets from wherever the sheet is,
// so a release mid-drag carries on from the finger's position.
const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

export default function Sheet({ open, onClose, title, kicker, children, footer, tall = false, label }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef(null), scrim = useRef(null), drag = useRef(null), lastFocus = useRef(null);
  const titleId = useId();

  useEffect(() => { if (open) setMounted(true); else setShown(false); }, [open]);

  useLayoutEffect(() => {
    if (!mounted || !open) return;
    lastFocus.current = document.activeElement;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, [mounted, open]);

  // Unmount after the close transition; fall back to a timer if transitionend never fires.
  useEffect(() => {
    if (shown || !mounted || open) return;
    const el = panel.current;
    const done = () => { setMounted(false); lastFocus.current?.focus?.({ preventScroll: true }); };
    const t = setTimeout(done, 360);
    const onEnd = (e) => { if (e.target === el) { clearTimeout(t); done(); } };
    el?.addEventListener('transitionend', onEnd);
    return () => { clearTimeout(t); el?.removeEventListener('transitionend', onEnd); };
  }, [shown, mounted, open]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mounted]);

  useEffect(() => {
    if (shown) panel.current?.focus({ preventScroll: true });
  }, [shown]);

  // Escape still closes when focus has fallen out of the sheet (e.g. the focused button was removed).
  useEffect(() => {
    if (!shown) return;
    const onKey = (e) => { if (e.key === 'Escape' && !panel.current?.contains(document.activeElement)) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shown, onClose]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const f = panel.current.querySelectorAll('button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const onPointerDown = (e) => {
    if (drag.current || e.button > 0) return; // ignore a second finger mid-drag
    if (e.target.closest('button, a, input, textarea')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, y0: e.clientY, h: panel.current.offsetHeight, hist: [[e.timeStamp, e.clientY]], dy: 0 };
    panel.current.style.transition = 'none';
    scrim.current.style.transition = 'none';
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const raw = e.clientY - d.y0;
    d.dy = raw >= 0 ? raw : rubberband(raw, d.h); // resist past the top, never a hard stop
    d.hist.push([e.timeStamp, e.clientY]);
    if (d.hist.length > 6) d.hist.shift();
    panel.current.style.transform = `translateY(${d.dy}px)`;
    scrim.current.style.opacity = String(Math.max(0, 1 - Math.max(0, d.dy) / d.h));
  };
  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    const [t0, y0] = d.hist[0], [t1, y1] = d.hist[d.hist.length - 1];
    const v = (y1 - y0) / Math.max(1, t1 - t0); // px per ms, + is downward
    panel.current.style.transition = '';
    scrim.current.style.transition = '';
    panel.current.style.transform = '';
    scrim.current.style.opacity = '';
    if ((d.dy > d.h * 0.28 && v > -0.05) || v > 0.11) onClose();
  };

  if (!mounted) return null;
  return createPortal(
    <>
      <div ref={scrim} className="scrim" data-open={shown} onClick={onClose} aria-hidden="true" />
      <div
        ref={panel} className={'sheet' + (tall ? ' tall' : '')} data-open={shown}
        role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : label}
        tabIndex={-1} onKeyDown={onKeyDown}
      >
        <div className="sheet-grab" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <div className="between">
            <div style={{ minWidth: 0 }}>
              {kicker && <p className="mono caps mute" style={{ marginBottom: 4 }}>{kicker}</p>}
              {title && <h2 id={titleId}>{title}</h2>}
            </div>
            <button type="button" className="btn icon-btn" onClick={onClose} aria-label="Close">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M5 5 L19 19 M19 5 L5 19" /></svg>
            </button>
          </div>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </>,
    document.body,
  );
}
