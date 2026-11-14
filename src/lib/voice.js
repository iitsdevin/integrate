// Spoken cues for the sit, using the phone's own voice (nothing is downloaded or sent).
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let timer = null;

export const voiceSupported = () => !!synth && typeof SpeechSynthesisUtterance === 'function';

// iPhones only allow speech that starts from a tap. Call this in the tap that begins a sit.
export function unlockVoice() {
  if (!voiceSupported()) return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch { /* not available */ }
}

// Speak after `delay` ms (so the bell is heard first). A new cue replaces the old one.
export function speak(text, delay = 0) {
  if (!voiceSupported() || !text) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88; u.pitch = 1; u.lang = document.documentElement.lang || 'en-AU';
      synth.speak(u);
    } catch { /* not available */ }
  }, delay);
}

export function hush() {
  clearTimeout(timer);
  try { synth?.cancel(); } catch { /* not available */ }
}

export const cueFor = (phase) => [phase.label, phase.name, phase.text].filter(Boolean).join('. ');
