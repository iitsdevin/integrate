// The daily sit: Connect (a somatic practice), Dive (the mantra), Integrate (open awareness).

export const MANTRA = 'Settle for 30 seconds, then your Vedic mantra. Eyes closed, no effort.';
export const OPEN = 'Let the mantra go and keep your eyes closed. Feel your whole body at once. Let in sound, the room and the living world outside. Dedicate the practice to all beings.';
export const REST = 'Let the mantra go and rest with your eyes closed. Stay for 5 to 10 minutes before you get up.';

export const BODY_OPTIONS = [
  { id: 'shake', name: 'Shake, Touch, Settle', who: "after Euphemia Russell's Microdosing Pleasure",
    text: 'Shake for about a minute, small or big. Move your hands from head to feet, asking how to make each part 10% more pleasurable. Rest a hand on your sacrum and land back and down.' },
  { id: 'ground', name: 'Feet, Weight, Earth', who: "after Abigail Rose Clarke's Returning Home to Our Bodies",
    text: 'Sit, stand or lie down. Feel your feet and spread your toes. Give your weight to whatever is under you. With each long out-breath, feel where the ground is holding you.' },
  { id: 'slow', name: 'Slow walking or long exhales', who: 'for days you arrive wired',
    text: 'Walk very slowly around the room, or stay seated and lengthen each out-breath. Nothing to build, only slowing down.' },
  { id: 'tap', name: 'Tapping', who: 'EFT, from the Somatic toolkit',
    text: 'Tap firmly with two fingers through the points: side of hand, top of head, eyebrow, side of eye, under eye, under nose, chin, collarbone, under arm. Breathe as you go.' },
  { id: 'scan', name: 'Quick body scan', who: 'from the Somatic toolkit',
    text: 'Move your attention from the top of the head down to the feet, a breath or two at each place. Notice what is here without fixing it.' },
];
export const bodyOption = (id) => BODY_OPTIONS.find((o) => o.id === id) || BODY_OPTIONS[0];

export function dailySit(bodyId) {
  const b = bodyOption(bodyId);
  return {
    kind: 'daily', label: 'Connect, Dive, Integrate',
    phases: [
      { label: 'Connect', min: 3, name: b.name, text: b.text, body: b.id },
      { label: 'Dive', min: 14, text: MANTRA },
      { label: 'Integrate', min: 3, text: OPEN },
    ],
  };
}
export const badDay = () => ({ kind: 'bad', label: 'Bad day sit', phases: [{ label: 'Bad day', min: 3, text: 'Feel your feet, sit with the mantra for a few rounds, stop. That counts.' }] });
export const secondSit = () => ({ kind: 'second', label: 'Second sit', phases: [{ label: 'Dive', min: 10, text: MANTRA }, { label: 'Rest', min: 2, text: 'Eyes closed. Stay a moment before you get up.' }] });
export const timedPractice = (name, min, text) => ({ kind: 'practice', label: name, phases: [{ label: name, min, text: text || 'Stay with the practice. The bell will tell you when the time is up.' }] });

export function kriyaSit(day) {
  const guru = (min) => ({ label: 'Guru Mantra', min, text: 'Picture a lotus in your heart with padukas resting inside it. Then softly repeat Om hreem shree guru bhyo-namah, with your awareness on the lower heart.' });
  const bindu = { label: 'Bindu', min: 10, text: 'Ocean breath in as the bindu rises from the base of the spine to the crown. Pause. Hiss softly out as it drops. Keep it slow. If you are panting, pause and come back to yourself.' };
  const silence = (min) => ({ label: 'Silence', min, text: 'No mantra and no breath work. If your mind wanders, come back to the present.' });
  const phases = day <= 5 ? [guru(15), silence(15)]
    : day <= 10 ? [guru(10), bindu, silence(10)]
    : [guru(10), bindu, { label: 'Bhramari', min: 3, text: 'Close the small flap of each ear with your fingers, hands resting over your head. Hum out loud and feel the vibration inside, like a singing bowl.' }, silence(10)];
  return { kind: 'kriya', day, label: "Jacqui's Kriya, day " + day, phases };
}

export const FEELS = [['wired', 'Wired'], ['flat', 'Flat'], ['foggy', 'Foggy'], ['okay', 'Okay']];
export const FEEL_TEXT = {
  wired: 'Connect is now slow walking or long exhales. Drop your shoulders and take one breath, then begin. If this is panic, don’t sit through it: use Samurai Breath and RAIN in Regulation.',
  flat: 'Run H.A.L.T. first: are you hungry, angry, lonely or tired? Deal with that, then sit. If the sit feels too big, 3 minutes counts.',
  foggy: 'Try Five Senses first: check in with what you can see, hear, smell, taste and touch. Then begin.',
  okay: "Nothing to change. Begin when you're ready.",
};

// The 8-week plan that started on 5 November 2026. The buddy can replace it.
export const PLAN_START = '2026-11-05';
export const DEFAULT_PLAN = {
  id: 'eight-week', title: '8-week plan', from: '2026-11-05', to: '2026-12-30', weeks: 8,
  summary: 'Connect, Dive, Integrate daily. Walk once. A second sit if you can.',
  items: [
    { label: 'Daily', text: 'Connect, Dive, Integrate — 20 minutes.' },
    { label: 'Second sit', text: '10 minutes of mantra and 2 of rest, mid-afternoon or before dinner, if you can.' },
    { label: 'Weekly', text: "One 20-minute walking meditation outside, Thich Nhat Hanh's style." },
    { label: 'Rules', text: 'No streaks; if you miss days, just come back. Start nothing new until 31 December. Your personal mantra stays in your sit.' },
  ],
  source: 'default',
};

export const WHEN_TO_PAUSE = {
  intro: 'Shorten the practice, open your eyes and move if you get any of these. Tell your psychiatrist or a therapist too.',
  items: ['Panic', 'Feeling unreal or disconnected from your body', 'Insomnia', 'Intrusive memories'],
};
