import { useEffect, useLayoutEffect, useRef, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { useBackLayer } from '../lib/history.js';

// A bottom sheet, built on the browser's own <dialog> opened as a modal. The browser
// supplies what a hand-made overlay has to imitate: the page behind is made inert (not
// reachable by keyboard, pointer or screen reader), focus stays inside and returns to
// where it was, the sheet sits in the top layer above everything, and Escape (and, where
// supported, the phone's back gesture) asks it to close.
//
// The <dialog> itself is a transparent, full-screen layer. Inside it are our own scrim
// and panel, so the drag, the release curve and the open/close transitions are ours.
//
// You can drag the panel down to dismiss, by its top bar or by its body when
// the body is scrolled to the top. Open/close use a CSS transition, which retargets
// from wherever the sheet is, so a release mid-drag carries on from the finger's
// position — and at the finger's speed: the release curve starts at the gesture's
// velocity (see settle()).
let behind = 0; // how many sheets are open
const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

export default function Sheet({ open, onClose, title, kicker, children, footer, tall = false, label }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const layer = useRef(null), panel = useRef(null), scrim = useRef(null), drag = useRef(null);
  const openRef = useRef(open), closeRef = useRef(onClose);
  openRef.current = open; closeRef.current = onClose;
  const titleId = useId();

  useEffect(() => { if (open) setMounted(true); else setShown(false); }, [open]);

  // The phone's Back button closes the sheet.
  useBackLayer(open, onClose);

  // Open as a modal as soon as the element exists. Closing is requested, never abrupt:
  // Escape or a back gesture fires `cancel`, which we turn into our animated close.
  useLayoutEffect(() => {
    const d = layer.current;
    if (!mounted || !d) return undefined;
    if (!d.open) { try { d.showModal(); } catch { /* already open, or not attached yet */ } }
    const onCancel = (e) => { e.preventDefault(); closeRef.current(); };
    // If the browser closes it anyway (a second Escape can), keep our state in step.
    const onNativeClose = () => { if (openRef.current) closeRef.current(); setShown(false); setMounted(false); };
    d.addEventListener('cancel', onCancel);
    d.addEventListener('close', onNativeClose);
    return () => { d.removeEventListener('cancel', onCancel); d.removeEventListener('close', onNativeClose); };
  }, [mounted]);

  useLayoutEffect(() => {
    if (!mounted || !open) return;
    if (panel.current) panel.current.style.transition = ''; // drop any release curve from a previous drag
    if (scrim.current) scrim.current.style.transition = '';
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, [mounted, open]);

  // Unmount after the close transition; fall back to a timer if transitionend never fires.
  useEffect(() => {
    if (shown || !mounted || open) return;
    const el = panel.current;
    // close() hands focus back to whatever opened the sheet; the browser does that itself.
    const done = () => { const d = layer.current; if (d?.open) { openRef.current = false; d.close(); } setMounted(false); };
    const t = setTimeout(done, 380);
    const onEnd = (e) => { if (e.target === el) { clearTimeout(t); done(); } };
    el?.addEventListener('transitionend', onEnd);
    return () => { clearTimeout(t); el?.removeEventListener('transitionend', onEnd); };
  }, [shown, mounted, open]);

  // Depth: while a sheet is up, the page behind steps back a little, scaling about
  // the middle of what is on screen. It returns as the sheet leaves.
  useEffect(() => {
    if (!shown) return undefined;
    const root = document.documentElement;
    root.style.setProperty('--behind-y', `${window.scrollY + window.innerHeight / 2}px`);
    behind += 1; root.dataset.sheet = String(behind);
    return () => { behind -= 1; if (behind <= 0) { behind = 0; delete root.dataset.sheet; } else root.dataset.sheet = String(behind); };
  }, [shown]);

  // ---- drag ----
  const dragStart = (y, t) => {
    drag.current = { y0: y, h: panel.current.offsetHeight, hist: [[t, y]], dy: 0 };
    panel.current.style.transition = 'none';
    scrim.current.style.transition = 'none';
  };
  const dragMove = (y, t) => {
    const d = drag.current;
    const raw = y - d.y0;
    d.dy = raw >= 0 ? raw : rubberband(raw, d.h); // resist past the top, never a hard stop
    d.hist.push([t, y]);
    if (d.hist.length > 6) d.hist.shift();
    panel.current.style.transform = `translateY(${d.dy}px)`;
    scrim.current.style.opacity = String(Math.max(0, 1 - Math.max(0, d.dy) / d.h));
  };
  // Hand the finger's velocity to the transition: a cubic-bezier's opening slope is
  // y1/x1, so choosing it to equal (velocity × duration ÷ distance) makes the sheet
  // leave the finger at the speed it was travelling, with no seam.
  const settle = (closing, v, dy, h) => {
    const dist = Math.max(1, closing ? h - dy : Math.abs(dy));
    const speed = Math.max(0, closing ? v : -Math.sign(dy) * v); // px/ms toward the target
    const dur = Math.round(Math.min(closing ? 320 : 420, Math.max(160, speed > 0.05 ? (3 * dist) / speed : 9999)));
    const slope = Math.min(4, (speed * dur) / dist);
    const curve = `cubic-bezier(0.25, ${(slope * 0.25).toFixed(3)}, 0.3, 1)`;
    panel.current.style.transition = `transform ${dur}ms ${curve}`;
    scrim.current.style.transition = `opacity ${dur}ms ease-out`;
    panel.current.style.transform = '';
    scrim.current.style.opacity = '';
    const el = panel.current, sc = scrim.current;
    const clear = () => { if (el) el.style.transition = ''; if (sc) sc.style.transition = ''; };
    if (closing) onClose(); else setTimeout(clear, dur + 40);
  };
  const dragEnd = () => {
    const d = drag.current;
    drag.current = null;
    const [t0, y0] = d.hist[0], [t1, y1] = d.hist[d.hist.length - 1];
    const v = (y1 - y0) / Math.max(1, t1 - t0); // px per ms, + is downward
    // Decide by where the gesture is going, not only where it is.
    const closing = (d.dy > d.h * 0.28 && v > -0.05) || v > 0.11;
    settle(closing, v, d.dy, d.h);
  };

  // The top bar: pointer events, captured so the drag survives leaving the bar.
  const onPointerDown = (e) => {
    if (drag.current || e.button > 0) return; // ignore a second finger mid-drag
    if (e.target.closest('button, a, input, textarea')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart(e.clientY, e.timeStamp);
    drag.current.id = e.pointerId;
  };
  const onPointerMove = (e) => {
    if (!drag.current || e.pointerId !== drag.current.id) return;
    dragMove(e.clientY, e.timeStamp);
  };
  const onPointerUp = (e) => {
    if (!drag.current || e.pointerId !== drag.current.id) return;
    dragEnd();
  };

  // The body: a downward pull that starts with the content scrolled to the top drags
  // the sheet instead of over-scrolling. Touch events, because the browser would
  // otherwise claim the gesture for scrolling and cancel pointer events.
  const body = useRef(null);
  useEffect(() => {
    const el = body.current;
    if (!mounted || !el) return undefined;
    let cand = null; // { id, y } a touch that began at scroll-top
    const find = (e, id) => [...e.changedTouches].find((t) => t.identifier === id);
    const start = (e) => {
      if (drag.current || e.touches.length > 1 || el.scrollTop > 0) { cand = null; return; }
      if (e.target.closest('input, textarea, select, [data-nodrag]')) { cand = null; return; }
      const t = e.changedTouches[0];
      cand = { id: t.identifier, y: t.clientY, x: t.clientX, on: false };
    };
    const move = (e) => {
      if (!cand) return;
      const t = find(e, cand.id);
      if (!t) return;
      if (!cand.on) {
        const dy = t.clientY - cand.y, dx = t.clientX - cand.x;
        if (dy < -6 || Math.abs(dx) > Math.abs(dy) + 4 || el.scrollTop > 0) { cand = null; return; } // scrolling, not dragging
        // A downward pull from the top has nothing to scroll. Claim it from the first
        // movement: once a browser starts scrolling for a gesture it cannot be stopped,
        // and what it would scroll is the page behind.
        if (dy > 0 && e.cancelable) e.preventDefault();
        if (dy < 10) return; // hysteresis before committing
        cand.on = true;
        dragStart(t.clientY, e.timeStamp);
        drag.current.touch = cand.id;
      }
      e.preventDefault();
      dragMove(t.clientY, e.timeStamp);
    };
    const end = (e) => {
      if (!cand) return;
      const on = cand.on && find(e, cand.id);
      if (on || e.type === 'touchcancel') { const was = cand.on; cand = null; if (was && drag.current) dragEnd(); }
      else if (!cand.on) cand = null;
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
    return () => {
      el.removeEventListener('touchstart', start); el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end); el.removeEventListener('touchcancel', end);
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Nothing behind the sheet may scroll. The browser's own containment covers areas
  // that can scroll; Safari does not yet contain areas that cannot, so a touch or wheel
  // there would move the page behind. This guard holds every movement that has nowhere
  // to go inside the sheet, from the first one (a scroll that has started cannot be
  // stopped). Form controls keep their own gestures.
  useEffect(() => {
    const d = layer.current;
    if (!mounted || !d) return undefined;
    const starts = new Map(); // touch id -> starting y
    const hold = (e) => { if (e.cancelable) e.preventDefault(); };
    // The scrollable area a movement would act on, or null if there is none.
    const scroller = (target) => {
      if (target.closest?.('input[type="range"], select')) return 'control';
      const fits = (el) => !el || el.scrollHeight <= el.clientHeight + 1;
      const ta = target.closest?.('textarea');
      if (!fits(ta)) return ta; // a long note scrolls inside its own box
      const body = target.closest?.('.sheet-body');
      return fits(body) ? null : body;
    };
    const touchstart = (e) => { for (const t of e.changedTouches) starts.set(t.identifier, t.clientY); };
    const touchend = (e) => { for (const t of e.changedTouches) starts.delete(t.identifier); };
    const touchmove = (e) => {
      if (e.touches.length > 1) return; // leave pinch-zoom alone
      const box = scroller(e.target);
      if (box === 'control') return;
      if (!box) { hold(e); return; }
      const t = e.changedTouches[0], y0 = starts.get(t.identifier);
      if (y0 === undefined) return;
      const down = t.clientY > y0; // finger moving down = content scrolling up
      const atTop = box.scrollTop <= 0, atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 1;
      if ((down && atTop) || (!down && atEnd)) hold(e); // already at that edge: nowhere to go
    };
    const wheel = (e) => {
      const box = scroller(e.target);
      if (box === 'control') return;
      if (!box) { hold(e); return; }
      const atTop = box.scrollTop <= 0, atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 1;
      if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atEnd)) hold(e);
    };
    d.addEventListener('touchstart', touchstart, { passive: true });
    d.addEventListener('touchmove', touchmove, { passive: false });
    d.addEventListener('touchend', touchend); d.addEventListener('touchcancel', touchend);
    d.addEventListener('wheel', wheel, { passive: false });
    return () => {
      d.removeEventListener('touchstart', touchstart); d.removeEventListener('touchmove', touchmove);
      d.removeEventListener('touchend', touchend); d.removeEventListener('touchcancel', touchend);
      d.removeEventListener('wheel', wheel);
    };
  }, [mounted]);

  if (!mounted) return null;
  return createPortal(
    <dialog ref={layer} className="sheet-layer" aria-labelledby={title ? titleId : undefined} aria-label={title ? undefined : label}>
      <div ref={scrim} className="scrim" data-open={shown} onClick={onClose} aria-hidden="true" />
      <div ref={panel} className={'sheet' + (tall ? ' tall' : '')} data-open={shown}>
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
        <div ref={body} className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </dialog>,
    document.body,
  );
}
