// Bells: a struck bowl rendered once as audio. An <audio> element plays through the
// iPhone silent switch; Web Audio is the fallback if the element is refused.
const SR = 22050;
export const SOUNDS = {
  bowl: { name: 'Bowl', gap: 2.8, tail: 6, parts: [[432, 1, 1.9], [435, 0.5, 1.7], [1120, 0.42, 1.1], [1980, 0.2, 0.6], [2790, 0.1, 0.4]] },
  chime: { name: 'Chime', gap: 2.2, tail: 4, parts: [[1046, 1, 1.1], [1051, 0.5, 0.9], [2637, 0.22, 0.5], [3951, 0.08, 0.25]] },
  wood: { name: 'Wood block', gap: 1.4, tail: 1, parts: [[340, 1, 0.05], [690, 0.5, 0.035], [1320, 0.2, 0.02]] },
};

const samples = {}, uris = {};
let actx = null, unlocked = false;
const player = typeof Audio === 'function' ? new Audio() : null;

function render(sound, strikes) {
  const { gap, tail, parts } = SOUNDS[sound];
  const n = Math.floor((gap * (strikes - 1) + tail) * SR), out = new Float32Array(n);
  for (let s = 0; s < strikes; s++) {
    const off = Math.floor(s * gap * SR);
    for (let i = off; i < n; i++) {
      const t = (i - off) / SR, att = Math.min(1, t / 0.004);
      let v = 0;
      for (const [f, a, dcy] of parts) v += a * Math.exp(-t / dcy) * Math.sin(2 * Math.PI * f * t);
      out[i] += v * att;
    }
  }
  let peak = 0; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
  for (let i = 0; i < n; i++) out[i] *= 0.85 / peak;
  return out;
}
function toWav(f) {
  const buf = new ArrayBuffer(44 + f.length * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + f.length * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, SR, true); v.setUint32(28, SR * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, f.length * 2, true);
  for (let i = 0; i < f.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, f[i])) * 32767, true);
  const bytes = new Uint8Array(buf); let bin = '';
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return 'data:audio/wav;base64,' + btoa(bin);
}
const soundId = (bell) => (SOUNDS[bell] ? bell : 'bowl');
function bellUri(bell, n) {
  const k = soundId(bell) + n;
  if (!samples[k]) { samples[k] = render(soundId(bell), n); uris[k] = toWav(samples[k]); }
  return uris[k];
}
export function preloadBells(bell) {
  if (bell === 'silent') return;
  setTimeout(() => [1, 2, 3].forEach((n) => bellUri(bell, n)), 400);
}
export function unlockAudio() {
  unlocked = true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !actx) actx = new AC();
    actx?.resume();
  } catch { /* no audio */ }
}
export const audioUnlocked = () => unlocked;

function webRing(bell, n) {
  if (!actx) return;
  const f = samples[soundId(bell) + n], b = actx.createBuffer(1, f.length, SR);
  b.copyToChannel(f, 0);
  const src = actx.createBufferSource(); src.buffer = b; src.connect(actx.destination); src.start();
}

// Silent mode: the screen glows instead. Android also vibrates.
function glow(n) {
  const g = document.getElementById('glow');
  if (!g) return;
  g.getAnimations().forEach((a) => a.cancel());
  g.hidden = false;
  let left = n;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pulse = () => {
    g.animate([{ opacity: 0 }, { opacity: reduce ? 0.35 : 0.55 }, { opacity: 0 }], { duration: 2400, easing: 'ease-in-out' }).onfinish = () => {
      if (--left > 0) pulse(); else g.hidden = true;
    };
  };
  pulse();
}

export function ring(bell, n) {
  if (bell === 'silent') {
    glow(n);
    try { navigator.vibrate?.(Array.from({ length: n * 2 - 1 }, (_, i) => (i % 2 ? 400 : 300))); } catch { /* not supported */ }
    return;
  }
  if (!player) return;
  player.src = bellUri(bell, n);
  const p = player.play();
  if (p) p.catch(() => webRing(bell, n));
}
