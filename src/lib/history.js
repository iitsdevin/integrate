// Back-button layers. A sheet, the sit screen or a pushed page registers a layer
// while it is open; the phone's Back button (or a browser Back) then closes the
// top layer instead of changing the tab underneath.
//
// Each layer owns one history entry tagged with its depth. Everything is decided
// by comparing the depth stored on the current entry with how many layers are
// open, so it stays correct when a layer closes and another opens in the same tick.
import { useEffect, useRef } from 'react';

const stack = []; // [{ token, onBack }]
let seq = 0;
const depthOf = (state) => (state && typeof state.layer === 'number' ? state.layer : 0);

function onPop(e) {
  const d = depthOf(e.state);
  // Back: close every layer above the entry we landed on.
  while (stack.length > d) {
    const top = stack.pop();
    try { top.onBack(); } catch { /* a closing layer must not break navigation */ }
  }
  // Landed on an entry left behind by a layer that has already closed: skip it.
  if (d > stack.length) history.back();
}
if (typeof window !== 'undefined') window.addEventListener('popstate', onPop);

export function pushLayer(onBack) {
  const token = ++seq;
  stack.push({ token, onBack });
  const depth = stack.length;
  try {
    // Reuse a stale entry at this depth if one is on top, otherwise add one.
    if (depthOf(history.state) >= depth) history.replaceState({ layer: depth }, '');
    else history.pushState({ layer: depth }, '');
  } catch { /* history unavailable: the layer still works, just without Back */ }
  return token;
}

// Called when a layer closes by its own controls (not by Back).
export function closeLayer(token) {
  const i = stack.findIndex((l) => l.token === token);
  if (i === -1) return; // already closed by Back
  stack.splice(i, 1);
  // Remove its history entry, unless something else has already replaced it
  // (a new layer, or a navigation to another page).
  setTimeout(() => { if (depthOf(history.state) > stack.length) history.back(); }, 0);
}

// Keep a Back layer open for as long as `active` is true. Change `key` to re-open it
// after Back has consumed it (for layers that stay up, like the sit).
export function useBackLayer(active, onBack, key = 0) {
  const ref = useRef(onBack);
  ref.current = onBack;
  useEffect(() => {
    if (!active) return undefined;
    const token = pushLayer(() => ref.current());
    return () => closeLayer(token);
  }, [active, key]);
}

export const layerCount = () => stack.length;
