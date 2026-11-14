// A quiet sound under the sit, made on the phone (nothing is downloaded): a drone,
// rain, or soft room tone. It is a short loop rendered once and played by an <audio>
// element, which keeps playing through the iPhone silent switch like the bells do.
// While it plays, the phone's lock screen can show the sit (see setNowPlaying).
const SR = 22050, LEN = 12; // a 12-second loop

export const AMBIENT = { off: 'Off', drone: 'Drone', rain: 'Rain', room: 'Room tone' };

// A small seeded random generator, so each sound is the same every time.
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 - 0.5; }; }

// Join the end of a loop to its start so the repeat has no click.
function seamless(buf, fade = SR) {
  const n = buf.length - fade, out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = buf[i];
  for (let i = 0; i < fade; i++) { const t = i / fade; out[i] = buf[i] * t + buf[n + i] * (1 - t); }
  return out;
}

export function renderAmbient(kind) {
  const n = SR * LEN;
  if (kind === 'drone') {
    // Every partial completes a whole number of cycles in the loop, so it repeats cleanly.
    // Pairs a quarter-hertz apart beat slowly, which is what makes it feel alive.
    const parts = [[144, 1], [144.25, 0.8], [216, 0.5], [288 + 1 / 6, 0.35], [432, 0.14], [576.25, 0.06]];
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i / SR; let v = 0; for (const [f, a] of parts) v += a * Math.sin(2 * Math.PI * f * t); out[i] = v; }
    return level(out, 0.16);
  }
  const r = rng(kind === 'rain' ? 7 : 11), raw = new Float32Array(n + SR);
  if (kind === 'rain') {
    // Hiss with the lows taken out, plus scattered soft drops.
    let lp = 0, hp = 0, prev = 0;
    for (let i = 0; i < raw.length; i++) { const w = r(); lp += 0.55 * (w - lp); hp = 0.93 * (hp + lp - prev); prev = lp; raw[i] = hp; }
    const d = rng(3);
    for (let k = 0; k < 260; k++) {
      const at = Math.floor((d() + 0.5) * (raw.length - 900)), f = 900 + (d() + 0.5) * 2600, amp = 0.25 + (d() + 0.5) * 0.5;
      for (let i = 0; i < 800; i++) raw[at + i] += amp * Math.exp(-i / 110) * Math.sin((2 * Math.PI * f * i) / SR) * 0.35;
    }
    return level(seamless(raw), 0.11);
  }
  // Room tone: deep, soft noise, like air in a quiet building.
  let b = 0, s = 0;
  for (let i = 0; i < raw.length; i++) { b = 0.995 * b + r() * 0.1; s += 0.08 * (b - s); raw[i] = s; }
  return level(seamless(raw), 0.2);
}
function level(buf, peakTo) {
  let peak = 0; for (let i = 0; i < buf.length; i++) peak = Math.max(peak, Math.abs(buf[i]));
  for (let i = 0; i < buf.length; i++) buf[i] *= peakTo / (peak || 1);
  return buf;
}

function wavBlob(f) {
  const buf = new ArrayBuffer(44 + f.length * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + f.length * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, SR, true); v.setUint32(28, SR * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, f.length * 2, true);
  for (let i = 0; i < f.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, f[i])) * 32767, true);
  return new Blob([buf], { type: 'audio/wav' });
}

const urls = {};
const el = typeof Audio === 'function' ? new Audio() : null;
let fadeTimer = null, playing = null;
if (el) { el.loop = true; el.preload = 'auto'; }

const urlFor = (kind) => (urls[kind] ||= URL.createObjectURL(wavBlob(renderAmbient(kind))));
export function preloadAmbient(kind) { if (el && kind && kind !== 'off' && AMBIENT[kind]) setTimeout(() => urlFor(kind), 600); }

// Start from a tap (phones refuse sound that a tap did not start).
export function startAmbient(kind) {
  if (!el || !kind || kind === 'off' || !AMBIENT[kind]) return;
  clearInterval(fadeTimer);
  if (playing !== kind) { el.src = urlFor(kind); playing = kind; }
  el.volume = 0; // fades in where the phone allows volume control; iPhones start at the set level
  const p = el.play();
  if (p) p.catch(() => { playing = null; });
  ramp(1, 2500);
}
function ramp(to, ms, then) {
  clearInterval(fadeTimer);
  const from = el.volume, t0 = Date.now();
  fadeTimer = setInterval(() => {
    const k = Math.min(1, (Date.now() - t0) / ms);
    try { el.volume = from + (to - from) * k; } catch { /* fixed volume */ }
    if (k === 1) { clearInterval(fadeTimer); then?.(); }
  }, 80);
}
export function stopAmbient(fadeMs = 0) {
  if (!el || !playing) return;
  const end = () => { el.pause(); playing = null; clearNowPlaying(); };
  if (fadeMs > 0) ramp(0, fadeMs, end); else { clearInterval(fadeTimer); end(); }
}
export const ambientPlaying = () => !!playing;

// ---------- lock screen ----------
// With sound playing, the phone shows it on the lock screen. We label it with the
// phase and how long the sit has left, so a glance at the locked phone is enough.
const ms = typeof navigator !== 'undefined' ? navigator.mediaSession : null;
export function setNowPlaying({ phase, label, elapsed, total }) {
  if (!ms || typeof MediaMetadata !== 'function') return;
  try {
    if (ms.metadata?.title !== phase) {
      ms.metadata = new MediaMetadata({ title: phase, artist: label, album: 'Integrate', artwork: [{ src: new URL('icons/icon-512.png', document.baseURI).href, sizes: '512x512', type: 'image/png' }] });
    }
    ms.playbackState = 'playing';
    ms.setPositionState?.({ duration: Math.max(1, total), position: Math.max(0, Math.min(total, elapsed)), playbackRate: 1 });
    // The sit is not something to scrub or skip: leave only pause and play, which
    // quieten and resume the sound without touching the timer.
    ms.setActionHandler('pause', () => { el?.pause(); ms.playbackState = 'paused'; });
    ms.setActionHandler('play', () => { el?.play()?.catch(() => {}); ms.playbackState = 'playing'; });
    for (const a of ['seekto', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack']) { try { ms.setActionHandler(a, null); } catch { /* unsupported action */ } }
  } catch { /* no lock screen display on this phone */ }
}
export function clearNowPlaying() {
  if (!ms) return;
  try { ms.metadata = null; ms.playbackState = 'none'; } catch { /* ignore */ }
}
