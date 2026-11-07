// Everything in the Toolkit tab. The daily sit lives in daily.js.
import { GUIDES, BOOKS } from './arrival.js';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const firstNumber = (s) => { const m = /\d+/.exec(s || ''); return m ? Number(m[0]) : null; };

// A practice carried over from Arrival, with optional overrides.
function g(name, extra = {}) {
  const src = GUIDES[name];
  if (!src) throw new Error('Missing guide: ' + name);
  return {
    id: slug(name), name, mins: src.duration, timer: firstNumber(src.duration),
    summary: src.description, intro: src.instructions, when: src.whenToUse, ...extra,
  };
}
function p(obj) { return { id: slug(obj.name), ...obj }; }
function b(id, extra = {}) {
  const src = BOOKS.find((x) => x.id === id);
  if (!src) throw new Error('Missing book: ' + id);
  return { ...src, ...extra };
}
function r(obj) { return { id: slug(obj.title), ...obj }; }

const SUBSTACK = 'https://themembership.substack.com/p/';
const SOUNDCLOUD = 'https://soundcloud.com/user-968364630/';

export const CATEGORIES = [
  {
    id: 'regulation', no: '01', name: 'Regulation', tag: 'In the moment', tile: 'lime',
    blurb: 'Use these during the day, not instead of your sit.',
    hint: 'samurai breath, RAIN, H.A.L.T., three tiers',
    groups: [
      {
        title: 'Which one am I in?', kind: 'states',
        items: [
          p({ name: 'Red', summary: 'Rushing, urgency, frantic energy, harsh self-talk', intro: "Slow your body down. Drop your shoulders. Take one breath. Look at what's in front of you. Then keep going." }),
          p({ name: 'Panic', summary: "Tight throat, can't breathe properly, flooded", intro: "Use Samurai Breath and RAIN below. Don't try to meditate through it." }),
          p({ name: 'Blue', summary: 'Exhausted, flat, no motivation, understimulated', intro: "This is usually the crash after time in the red. Run H.A.L.T., then do the smallest kind thing. Don't try to catch up on everything." }),
          p({ name: 'Limbo', summary: 'Body on the couch, mind on the chore', intro: "Pick a lane: bring your mind to where your body is, or take your body to the task. Either one is a win. Don't bargain with tomorrow." }),
          p({ name: 'Avoiding', summary: 'Circling a task, shame, procrastinating', intro: "Notice what you're avoiding and why. Regulate. Take one small step. Notice the progress, even if it's just logging in." }),
          p({ name: 'False urgency', summary: 'Every thought feels like it must happen now', intro: 'Stay where you are. Notice where you feel the pull. Sort the task using the three tiers.' }),
          p({ name: 'Demand pushback', summary: 'Even your own plans feel like orders, including your sit', intro: "Pause, feel your feet and ask what your regulated self wants to do. There's no wrong answer." }),
        ],
      },
      {
        title: 'In-the-moment tools',
        items: [
          p({ name: 'The four basics', who: 'Jenna Free', summary: 'Slow down, shoulders, breath, what is in front of you.', steps: ['Physically slow down.', 'Relax your shoulders.', 'Take a breath.', "Look at what's in front of you."], after: "Repetition matters more than doing it perfectly. If you speed up again a minute later, you've still interrupted the pattern. Her simplest reminder: “One thing at a time.”" }),
          p({ name: 'Samurai Breath', who: 'Jacqui', summary: 'For anxiety and panic. A long, slow out-breath.', intro: "Don't take a big breath in. Put your attention on the out-breath and slow it down.", steps: ['Breathe in for a count of 3.', 'Breathe out for a count of 5 or 6.', 'Keep going until your body starts to settle.'], timer: 3 }),
          p({ name: 'RAIN', who: 'Tara Brach, as Jacqui teaches it', summary: 'Recognise, Allow, Investigate, Nurture.', steps: ["Recognise: name each sensation or feeling out loud, and after each one remind yourself that you're still here and still okay.", 'Allow: stop fighting it. Jacqui pictures a smooth river stone resting on the bottom while the storm passes overhead.', 'Investigate: look gently at what fed it, such as sleep, caffeine, dehydration or overwork.', 'Nurture: offer yourself some care, and put one support in place.'] }),
          p({ name: 'H.A.L.T.', who: 'Jacqui', summary: 'Hungry, angry, lonely or tired?', intro: 'Am I Hungry, Angry, Lonely or Tired? If any answer is yes, pause, hold off on decisions, and deal with that first.' }),
          p({ name: 'Five Senses', who: 'Jacqui', summary: 'A quick way back to the present that works anywhere.', intro: "Check in with what you can see, hear, smell, taste and touch. It's a quick way back to the present, and it works anywhere." }),
          g('SNOELL Check-In', { who: 'Nkem Ndefo' }),
          g('EFT Tapping'),
          p({ name: 'One step on the path', who: 'Jenna Free', summary: 'When the day looks like a brick wall.', intro: 'If the day looks like a full Tetris board or a brick wall, picture a dotted line or a path instead. Breathe, then take one step.' }),
        ],
      },
      {
        title: 'When everything feels urgent',
        items: [
          p({ name: 'Top tier', summary: 'Real consequences if forgotten', intro: "Do it now. That's a choice, not the urgency cycle." }),
          p({ name: 'Mid tier', summary: "Matters, but it won't vanish", intro: 'Put a note in a free calendar spot, or let it go.' }),
          p({ name: 'Bottom tier', summary: "You'd never notice if it disappeared", intro: 'Close the tab. Delete the screenshot.' }),
        ],
      },
    ],
    checks: {
      title: 'Set up your week so you need this less',
      note: "From Jenna Free's external regulation. Pick one to try at a time.",
      items: [
        ['set-gaps', "Leave gaps between appointments so you're not rushing."],
        ['set-spread', 'Spread appointments across the week instead of stacking them.'],
        ['set-lunch', 'Take a real lunch break. It may feel uncomfortable at first.'],
        ['set-nights', 'Leave one or two nights free for errands and surprises.'],
        ['set-social', 'Limit yourself to one social event per weekend if you keep overbooking.'],
        ['set-power', "Try Jacqui's Power Down Hour: no tech in the hour before bed, and none in bed."],
      ],
    },
    readings: [
      r({ title: 'Neuroemergent Time', author: 'Marta Rose', seed: 'Judge progress over weeks and months rather than hours and days. Coming back to something you dropped counts as part of the spiral, not as failing.' }),
      b('thrive-adhd'), b('year-met-brain'), b('mind-your-body'),
    ],
  },

  {
    id: 'somatic', no: '02', name: 'Somatic', tag: 'Body first', tile: 'plain',
    blurb: 'For when you want to land. The first three are written out, so you need no recording.',
    hint: 'grounding, swaying, heel drops',
    groups: [
      {
        title: 'Grounding',
        items: [
          p({ name: 'Feet on the ground', who: 'Abigail Rose Clarke · standing', mins: '3 min', timer: 3, summary: 'Barefoot, arms at your sides, soften the knees.', steps: ['Stand barefoot if you can, with your arms at your sides. Try not to do anything in particular.', 'Without looking, feel your feet. Spread and wiggle your toes.', "Move your feet until your stance feels most supported. There's no correct position.", 'Let your knees soften a little, and stay there.'] }),
          p({ name: 'Held by the ground', who: 'Abigail Rose Clarke · lying down', mins: '5 min', timer: 5, summary: 'Let your weight go where you touch the surface.', steps: ['Lie on your back with your feet on the floor, a bit wider than your hips, and your knees bent and resting together. Add a pillow or blanket if you like.', 'Let each out-breath go all the way, without forcing it.', 'Rest your attention where you touch the surface: your soles, hips and shoulders.', 'Let your weight go there. Even upstairs, the building is carrying you down to the earth.'], after: 'You can do this sitting or standing too, wherever your body meets something solid.' }),
          p({ name: 'Lean and soften', who: 'Abigail Rose Clarke · any time', mins: '2 min', timer: 2, summary: 'Lean on something solid and let the out-breath go.', steps: ['Lean on something solid that can take your full weight, such as a wall, a chair or a tree.', 'Loosen anything tight, and let your eyes and tongue soften.', 'Notice your breathing without changing it.', 'When the out-breath comes, just let go. It needs no force.'] }),
          g('Shaking Practice'),
          g('Threshold Ritual'),
          g('Body Scan'),
        ],
      },
      {
        title: 'Recordings on your computer',
        note: 'The app can’t play these. Where they are is at the bottom of each one.',
        items: [
          p({ name: 'Grounding Into Yourself And The Land', who: 'Euphemia Russell', mins: '10 min', summary: 'Shake things through, then settle into your sacrum and feel rooted down into the earth.', where: 'Your Downloads folder.' }),
          p({ name: 'Grounded Swaying', who: 'Victoria Albina', mins: '5 min', summary: 'Sway slowly from foot to foot with soft knees. For when stillness feels like too much.', where: 'Self Development/Somatic Studio, Module 10, Audio folder.' }),
          p({ name: 'Heel Drops', who: 'Victoria Albina', mins: '5 min', summary: 'Rise onto your toes and let your heels drop with gravity. For feeling floaty or up in your head.', where: 'Self Development/Somatic Studio, Module 7, Audio folder.', note: "Skip it if it doesn't suit your knees, hips, ankles or back." }),
          p({ name: 'Playful movement when feeling stuck', who: 'Euphemia Russell', mins: '4 min', summary: 'For feeling flat, stuck or too serious.', where: 'Your Downloads folder.' }),
          p({ name: 'Micromovements and microadjustments', who: 'Euphemia Russell', mins: '5 min', summary: "For low energy, or when you're out and about.", where: 'Your Downloads folder.' }),
          p({ name: 'Pendulating between pain and ease', who: 'Euphemia Russell', mins: '6 min', summary: 'For pain, tension or numbness.', where: 'Your Downloads folder.' }),
          p({ name: 'Windshield Wipers', who: 'Victoria Albina', mins: '6 min', summary: 'For lying down with a tight lower back.', where: 'Self Development/Somatic Studio, Module 3, Audio folder.' }),
          p({ name: 'Anxiety to ease', who: 'Jonathan Mead', mins: '10 min', summary: 'For feeling anxious and buzzy.', where: 'Microdose Practices Self Care School-01.mp4, in Self Development/Misc/Misc.' }),
        ],
      },
    ],
    readings: [b('returning-home-bodies'), b('what-it-takes-to-heal'), b('somatic-workbook'), b('wisdom-of-your-body')],
  },

  {
    id: 'zen', no: '03', name: 'Zen', tag: 'Just this', tile: 'plain',
    blurb: 'Ten thousand returns, each one complete.',
    hint: 'zazen, walking, Joko Beck',
    groups: [
      {
        title: 'Practices',
        items: [
          g('Zazen'),
          g('Walking Meditation', { after: "Thich Nhat Hanh's style: 20 minutes outside once a week. Add Om Mani Padme Hum softly if you'd like." }),
          g('Breath Counting'),
          g('Sky-Like Mind'),
          p({ name: 'Sit with others', who: 'Ocean Mind Sangha', mins: '7:30pm', summary: 'Daily zazen online, weekdays 6:30–7:30am EST, which is 7:30–8:30pm in Perth.', intro: 'Register first, then come for any part of it.', link: { label: 'Ocean Mind Sangha Daily Zazen', url: 'https://oceanmindsangha.org/daily-zazen' } }),
          p({ name: 'The Way app', who: 'Henry Shukman', summary: 'If you would rather have someone else lead: a single guided Zen path.', link: { label: 'Open in the App Store', url: 'https://apps.apple.com/au/app/id6459996442' } }),
        ],
      },
    ],
    readings: [b('nothing-special'), b('everyday-zen'), b('ordinary-wonder'), b('original-love'), b('being-busyness'), b('waking-dark'), b('mind-illuminated'), b('attention-revolution')],
  },

  {
    id: 'kundalini', no: '04', name: 'Kundalini', tag: 'Desirée', tile: 'ink',
    blurb: "Desirée Pais's kriyas, from her Membership posts. Optional, and kept out of your daily sit.",
    hint: 'swan kriya, sat kriya, sa ta na ma',
    groups: [
      {
        title: 'Month by month',
        note: 'A suggested order set to Perth seasons, because her months follow the northern year. It isn’t her program. If you want to follow her live month instead, swap the whole month rather than mixing.',
        kind: 'months',
        items: [
          ['2026-11', 'Late spring', 'Arrive', 'Swan Kriya', 'october-practice-swan-kriya-meditation', 'Yoni Kriya Meditation', '11 min', 'november-practice-sat-kriya-yoni'],
          ['2026-12', 'Summer', 'Steady', 'Cat Cow', 'march-the-practice', 'Sa Ta Na Ma', '11 min', 'february-the-practice'],
          ['2027-01', 'Summer', 'Rebuild', 'Sufi grinds and breath', 'january-the-practice', 'Meditation to Rebuild Yourself', '11 min', 'january-the-practice'],
          ['2027-02', 'Summer', 'Clear', 'Swan Kriya', 'october-practice-swan-kriya-meditation', 'Gyan Chakra Kriya', '11 min', 'august-practice-gyan-chakra-kriya'],
          ['2027-03', 'Autumn', 'Listen', 'Cat Cow', 'march-the-practice', 'Self-Blessing Guided by Intuition', '9 min', 'october-the-practice'],
          ['2027-04', 'Autumn', 'Radiate', 'Swan Kriya', 'october-practice-swan-kriya-meditation', 'Brighten Your Radiance', '11 min', 'october-practice-swan-kriya-meditation'],
          ['2027-05', 'Late autumn', 'Embody', 'Sat Kriya', 'sat-kriya-everything-kriya', 'Kriya to See the Inner Beauty', '11–15 min', 'july-practice-kriya-to-see-the-inner'],
          ['2027-06', 'Winter', 'Go inward', 'Cat Cow', 'march-the-practice', null, null, null],
          ['2027-07', 'Winter', 'Intuition', 'Sufi grinds and breath', 'january-the-practice', 'Kriya for Becoming Intuitive', '15 min', 'instructions-for-decembers-practice'],
          ['2027-08', 'Winter', 'Expand', 'Swan Kriya', 'october-practice-swan-kriya-meditation', 'Meditation to Expand the Arcline', 'check the post for length', 'june-practice-swan-kriya-meditation'],
          ['2027-09', 'Spring', 'Energise', 'Sat Kriya', 'sat-kriya-everything-kriya', 'The Magdalene Meditation', 'check the post for length', 'july-practice-kriya-to-see-the-inner'],
          ['2027-10', 'Spring', 'Your pick', 'Your favourite', null, 'Your favourite', 'then look back over the year', null],
        ].map(([month, season, theme, shortName, shortSlug, longName, longMins, longSlug]) => ({
          id: month, month, season, theme,
          short: { name: shortName, url: shortSlug ? SUBSTACK + shortSlug : null },
          long: longName ? { name: longName, mins: longMins, url: longSlug ? SUBSTACK + longSlug : null } : null,
          junenote: month === '2027-06' ? "Jacqui's Kriya has its 15 days this month (see The Broad Place), so keep these out of that block." : null,
        })),
      },
    ],
    notes: [
      { title: 'Safety', items: [
        'Sat Kriya: the tradition reportedly avoids it in pregnancy and on heavy menstrual days. Check with your doctor first if you have high blood pressure, a heart condition, epilepsy, a hernia, or recent abdominal or pelvic surgery. This guidance comes from a teacher’s blog rather than clinical research.',
        'Breath holds and locks: if you take stimulant medication, mention these practices to your psychiatrist.',
        'No good trials of these specific kriyas in ADHD turned up. The post descriptions are the tradition’s own claims, not research findings.',
        'Kundalini Yoga as her practices name it traces to Yogi Bhajan, so it’s worth staying discerning about the teachings that come with it.',
        'Keep intense kriyas away from bedtime. If the links don’t open, your Membership may have lapsed.',
      ] },
    ],
    readings: [],
  },

  {
    id: 'broad-place', no: '05', name: 'The Broad Place', tag: 'Jacqui', tile: 'lavender',
    blurb: 'Your training with Jacqui. All optional; the daily sit stays the same.',
    hint: 'her kriya, rounding, mantras',
    kriya: true,
    groups: [
      {
        title: "Jacqui's Kriya — a 15-day block",
        note: "From her teacher Sri M. Jacqui says clearly this isn't what has been branded Kundalini Yoga. About 30 minutes a sit, twice a day if you can, and for those days it replaces your usual sit. Follow the sequence exactly and don't jump ahead. Planned for June 2027.",
        items: [
          p({ name: 'Guru Mantra with lotus and padukas', summary: 'Days 1–15. A lotus in the heart, padukas resting inside it.', intro: 'Sit upright with your eyes closed, spine stable, jaw soft. Picture a lotus blossoming in your heart, with a pair of padukas, the wooden sandals that stand for the path, resting inside it. Then repeat the mantra gently and softly, with your awareness on the lower heart.', mantra: { text: 'Om hreem shree guru bhyo-namah', say: 'auumm hreeeem shree gooroo bee-yeh na-mah-hah' }, after: 'This is separate from your personal Vedic mantra.' }),
          p({ name: 'Bindu Breathing', summary: 'Days 6–15. A radiant dot travelling the spine.', intro: 'Picture the spine as one straight channel from the very base of your seat to the top of the head. A tiny radiant dot, the bindu, travels along it.', steps: ['Rest your tongue lightly behind your teeth, with your mouth closed.', 'Breathe in through the nose with a gentle ocean breath as the bindu rises to the crown.', 'Pause briefly.', 'Breathe out with a soft, subtle hiss as the bindu drops back to the base.'], after: 'Keep it as slow and soothing as you can. Bindu Breathing can bring heat and sometimes agitation: if you are panting or straining, stop and rest before you start again.' }),
          p({ name: 'Bhramari', summary: 'Days 11–15. Bumblebee breath, as Sri M taught Jacqui.', steps: ['Close off each ear by pressing its small flap with your fingers.', 'Rest your hands over your head, with your elbows out.', 'Hum out loud and feel the vibration inside your head, like a singing bowl.'], after: 'Do this for 2 to 4 minutes, or 5 if you want to push it. Her hand position is clearest in Technique Three - Bhramari Breathing.mp4, in Week 5 of your MTT folder.' }),
          p({ name: 'Silence', summary: 'Every day. No mantra, no breath work.', intro: 'When your mind wanders, come back to the present, not to the mantra. Jacqui compares this to the rest at the end of yoga: it’s when everything integrates.' }),
        ],
      },
      {
        title: 'What her handbook says about your sit',
        kind: 'list',
        items: [
          'Ideal practice: 20 minutes twice a day, on rising and mid-afternoon. If evening, before dinner is best.',
          'Short on time: two 10-minute sits rather than one 20-minute sit.',
          'Start: settle for about 30 seconds before bringing in the mantra.',
          'Finish: always take 2 minutes with eyes closed after letting the mantra go.',
          "Rough sit: if you can't continue, let the mantra go and rest for 5 to 10 minutes. Don't just open your eyes and leave.",
          'Busy mind: thoughts are a normal part of stress leaving the body, so smile and come back gently.',
          'Personal mantra: it stays in your sit, not for stress or falling asleep.',
          'Extra sit: an occasional additional 10 to 20 minutes is fine in a very stressful period, but not as a regular habit.',
          'Advanced mantra: offered after 12 months of consistent practice. Ask The Broad Place if that interests you.',
        ],
      },
      {
        title: 'Guided meditations',
        note: 'These open in SoundCloud.',
        items: [
          ['To land', 'Grounding', 'grounding-meditation/s-bYsBBG0UUxQ'],
          ['To shake off tension', 'Releasing Stress and Tension', 'releasing-stress-and-tension-meditation/s-avhMIM1WmsX'],
          ['To shift between work and home', 'Transitioning', 'meditation-transitioning-1/s-YQzBuMsRR0d'],
          ['To get unstuck', 'Getting Out Of A Rut', 'getting-out-of-a-rut-meditation/s-6AW9sCqEBYl'],
          ['To rest deeply', 'Deep Relaxation', 'deep-relaxation-meditation/s-G7idMPMU9gF'],
          ['To feel bigger and connected', 'Expansion', 'expansion-meditation/s-RrDQPNJ6KmQ'],
          ['To open the heart', 'Loving Kindness', 'meditation-loving-kindness-1/s-rBNRtK1eJBQ'],
          ['To think clearly', 'Enhance Clarity', 'enhance-clarity-meditation/s-5JGuEEYc38u'],
        ].map(([need, name, path]) => p({ name, summary: need, link: { label: 'Open in SoundCloud', url: SOUNDCLOUD + path } })),
      },
      {
        title: 'Mantras from your training',
        note: 'Separate from your personal Vedic mantra and from the Guru Mantra.',
        items: [
          p({ name: 'Om Mani Padme Hum', summary: 'Emptying out, then filling with love; connection to all beings.', intro: 'For your weekly walk, frustrating moments or a sit. Jacqui repeats it softly in frustrating moments, such as at the airport. It’s also your bridge to the Vajrayana path later on.' }),
          p({ name: 'Sat Chit Ananda', summary: 'Truth, consciousness, bliss.', intro: 'For when you want to reconnect with your own truth.' }),
          p({ name: 'Aham Brahmasmi', summary: "Remembering you're more than your problems.", intro: "For when you're drawn to the mystic side." }),
          p({ name: 'Aum Dum Durga Yei Namaha', summary: 'Protection, strength, fire and love.', intro: 'Use it sparingly. She calls it very powerful and says to let it go if you start straining.' }),
        ],
      },
      {
        title: 'Longer practices',
        items: [
          p({ name: 'Full Round', mins: 'about an hour', summary: 'Once a month. Her full version of body, breath, mantra, rest.', steps: ['Rounding postures, 15–20 min, including a 2-minute rest', 'Slow alternate-nostril breathing, 3–5 min', 'Meditation, 20 min', 'Lying rest, 10 min'], after: "Use The-Broad-Place-Rounding-Sheets-v2-1.pdf. The sheet is only a reminder and says the postures need personal instruction, including shoulder stand and plough. Skip any you weren't taught. Never do more than two Rounds in a day." }),
          p({ name: 'Candle Meditation', mins: '15–25 min', timer: 20, summary: 'One week, when you want a change.', intro: 'A single sit each day for a week, watching a flame at about coffee-table height. Jacqui warns it can be challenging as well as calming. It gives restless eyes something to do.' }),
          p({ name: 'At Home Weekend Retreat', mins: 'three days', summary: 'Once a year.', intro: 'Pick any three clear days and go as tech-free as you can. Use The_Broad_Place_At_Home_Weekend_Retreat_E-Book.pdf. A good fit for the Perth winter.' }),
          p({ name: '7 Day Mind Cleanse', mins: 'one week', summary: 'Digital boundaries and mental clutter.', intro: 'In Mind_Cleanse_E-book_Desktop.pdf. Useful if your phone starts eating your practice.' }),
          p({ name: 'High Vibrational Challenge', mins: '14 days', summary: 'Twice-daily meditation, gratitude, movement, a Power Down Hour.', intro: "It's a lot at once, so save it for when you want a push." }),
          p({ name: 'Becoming the teacher', summary: 'Shape how you would teach each practice in your own words.', intro: 'When you’re ready, try guiding one friend through a short breath sit. Teaching-Mantra-Meditation-1.pdf and Week-Two-Exercise-1.pdf have reflection questions to work from.' }),
        ],
      },
    ],
    checks: {
      title: 'Before June',
      items: [
        ['todo-reread', 'Reread WHAT-YOU-WERE-TAUGHT-Kriya-Practice-Guidelines-1.pdf and TRANSCRIPTIONS-Teaching-Kriya-1.pdf in your Broad Place folder.'],
        ['todo-videos', 'Rewatch the three Technique videos in Week 5 of your MTT folder.'],
      ],
    },
    readings: [
      r({ title: 'Tao Te Ching', author: 'Stephen Mitchell (translator)', seed: 'One verse a day. Small and repeatable.' }),
      r({ title: 'A Year with Rumi', author: 'Coleman Barks', seed: 'One poem a day.' }),
      r({ title: 'Awareness', author: 'Anthony de Mello', seed: "Listen, don't read. Jacqui's most loved recommendation." }),
      r({ title: 'Paths to God', author: 'Ram Dass', seed: 'Already in your folder.' }),
      r({ title: 'I Am That', author: 'Nisargadatta Maharaj', seed: 'Already in your folder.' }),
    ],
  },

  {
    id: 'imaginal', no: '06', name: 'Imaginal', tag: 'Soulmaking', tile: 'plain',
    blurb: "Rob Burbea's Soulmaking Dharma: images, eros and the ways we look.",
    hint: 'Rob Burbea, soulmaking',
    groups: [
      {
        title: 'Practices',
        items: [
          p({ name: 'Start with the talks', who: 'Rob Burbea', summary: 'His Soulmaking Dharma retreats, recorded and free.', intro: 'The talks are hosted by the Hermes Amāra Foundation and on Dharma Seed. Your plan puts them around months 5–6, after the Open phase has deepened.', link: { label: 'Hermes Amāra Foundation', url: 'https://hermesamara.org' } }),
          p({ name: 'Ways of looking', who: 'Rob Burbea', summary: 'How we look shapes what appears.', intro: 'Pick something that is here today, such as a mood or a tension. Look at it one way, as a problem to solve, and notice what that does. Then look at it as an image, as something with its own life. Notice what changes in you as the way of looking changes.' }),
          p({ name: 'Dwell with an image', mins: '10 min', timer: 10, summary: 'Let an image come from a feeling, and stay with it.', intro: 'Settle in the body first. Find a feeling with some charge. Let an image arise from it without choosing one. Stay with the image rather than interpreting it, and let it change if it wants to. End by noticing how the body feels now.' }),
          p({ name: 'Your Imaginal app', summary: 'Your own companion for working through the teachings.', intro: 'Keep the deep work there. This tab is a doorway, not a second home for it.' }),
        ],
      },
    ],
    readings: [
      r({ title: 'Seeing That Frees', author: 'Rob Burbea', seed: 'Insight as a matter of how we look. The ground the later imaginal teachings stand on.' }),
      r({ title: 'The Emerald (podcast)', author: 'Josh Schrei', seed: 'Myth, animism and the imagination as a normal way of knowing.' }),
      b('courting-wild-twin'),
    ],
  },

  {
    id: 'vajrayana', no: '07', name: 'Vajrayana', tag: 'Later on', tile: 'plain',
    blurb: 'Where the path is heading after week 8. Begin with what is already yours.',
    hint: 'Om Mani Padme Hum, the wakeful body',
    groups: [
      {
        title: 'Practices',
        items: [
          p({ name: 'Om Mani Padme Hum, eyes open', who: 'Jacqui', summary: 'Out in the world, in frustrating moments.', intro: 'Repeat it softly, under your breath, while you carry on. Use this one out in the world. Your personal Vedic mantra stays in your sit.' }),
          g('Tonglen'),
          g('Metta / Lovingkindness'),
          g('Seven Homecomings', { who: 'Lama Rod Owens' }),
          p({ name: 'Find a teacher', summary: 'The next step, one at a time.', steps: ["Months 3–4: deepen the Open phase with Blackstone's The Fullness of the Ground or Lama Willa's The Wakeful Body.", "Months 5–6: start Rob Burbea's imaginal talks.", 'After that: find a Vajrayana teacher, and ask them about deity practice.'] }),
        ],
      },
    ],
    readings: [
      b('wakeful-body'),
      r({ title: 'The Fullness of the Ground', author: 'Judith Blackstone', seed: 'Realization as a felt, embodied openness. For deepening the Open phase.' }),
      b('new-saints'),
    ],
  },

  {
    id: 'earth', no: '08', name: 'Earth & kin', tag: 'Land, ancestors, heart', tile: 'plain',
    blurb: 'Nature, lineage and the wider heart.',
    hint: 'nature notes, ancestors',
    groups: [
      { title: 'Land', items: [g('Sit With a Tree'), g('Walk Without Input'), g('Sensory Grounding'), g('Four Elements Meditation'), g('Healing with Nature'), g('Deep Time Walk'), g('Nature Altar')] },
      { title: 'Ancestors', items: [g('Ancestral Evocation'), g('Grief Offering'), g('Lineage Altar')] },
      { title: 'Heart', items: [g('Fierce Compassion'), g('RAIN Practice', { name: 'RAIN, longer form' })] },
    ],
    readings: BOOKS.filter((x) => ['ecology', 'ancestors', 'liberation'].includes(x.root) && x.id !== 'new-saints' && x.id !== 'courting-wild-twin').map((x) => ({ ...x })),
  },
];

export const findCategory = (id) => CATEGORIES.find((c) => c.id === id);

// Flat index used by search and the reflection buddy.
export function allPractices() {
  const out = [];
  for (const c of CATEGORIES) for (const grp of c.groups) for (const it of grp.items) {
    if (grp.kind === 'list' || grp.kind === 'months' || typeof it === 'string') continue;
    out.push({ ...it, category: c.name, categoryId: c.id, group: grp.title });
  }
  return out;
}
export function allReadings() {
  return CATEGORIES.flatMap((c) => c.readings.map((rd) => ({ ...rd, category: c.name, categoryId: c.id })));
}
