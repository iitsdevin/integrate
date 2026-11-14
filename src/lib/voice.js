// Spoken cues for the sit, using the phone's own voice (nothing is downloaded or sent).
//
// Phones are strict about speech. What this file works around, mostly for iPhone:
//  - the first thing spoken must start inside a tap, and it must be real words
//    (a silent or empty phrase does not count), so the first cue of a sit is spoken
//    from the Begin tap itself with speakNow();
//  - cancel() followed straight away by speak() drops the new phrase, so we only
//    cancel when something is actually playing, and then wait a moment;
//  - a phrase with no matching voice installed can be silently skipped, so we pick
//    an installed English voice explicitly;
//  - the phrase object must be kept alive or it can be cut off mid-sentence.
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let timer = null, current = null, voice = null;

export const voiceSupported = () => !!synth && typeof SpeechSynthesisUtterance === 'function';

function pickVoice() {
  if (!voiceSupported()) return null;
  const all = synth.getVoices() || [];
  const want = (document.documentElement.lang || 'en-AU').toLowerCase();
  const norm = (v) => (v.lang || '').toLowerCase().replace('_', '-');
  return all.find((v) => norm(v) === want && v.localService) || all.find((v) => norm(v) === want)
    || all.find((v) => norm(v).startsWith('en') && v.default) || all.find((v) => norm(v).startsWith('en')) || null;
}
if (voiceSupported()) {
  voice = pickVoice();
  // The list of voices often arrives a moment after the page loads.
  try { synth.addEventListener('voiceschanged', () => { voice = pickVoice(); }); } catch { /* older browsers */ }
}

function say(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    voice = voice || pickVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-AU';
    u.rate = 0.9; u.pitch = 1; u.volume = 1;
    u.onend = u.onerror = () => { if (current === u) current = null; };
    current = u; // keep a reference so it is not discarded mid-sentence
    synth.resume(); // a paused engine stays silent forever otherwise
    synth.speak(u);
  } catch { /* not available */ }
}

// Speak straight away. Call this directly from a tap for the first phrase of a session.
export function speakNow(text) {
  if (!voiceSupported() || !text) return;
  clearTimeout(timer);
  if (synth.speaking || synth.pending) { try { synth.cancel(); } catch { /* ignore */ } timer = setTimeout(() => say(text), 150); }
  else say(text);
}

// Speak after `delay` ms (so a bell is heard first). A new cue replaces a waiting one.
export function speak(text, delay = 0) {
  if (!voiceSupported() || !text) return;
  clearTimeout(timer);
  timer = setTimeout(() => speakNow(text), delay);
}

export function hush() {
  clearTimeout(timer);
  current = null;
  try { if (synth && (synth.speaking || synth.pending)) synth.cancel(); } catch { /* not available */ }
}

export const cueFor = (phase) => [phase.label, phase.name, phase.text].filter(Boolean).join('. ');
