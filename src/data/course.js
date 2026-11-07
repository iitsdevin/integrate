// ACT for ADHD: a self-paced course in the Toolkit, in seven modules.
// Written for this app, in its own words. Structure inspired by Nesh Nikolic's ACT in Depth
// (a module per process of the hexaflex). Ideas adapted from Jodie Wassner, Acceptance and
// Commitment Therapy with Children (2024); classic ACT exercises from Steven Hayes, Kelly Wilson,
// Russ Harris and others, described here in plain language and adapted for adult ADHD.
//
// Lesson kinds: learn · metaphor · exercise (guided, step by step) · worksheet · tool · check

const L = (o) => ({ mins: 4, ...o });

export const NEEDS = [
  ['hooked', 'Hooked by thoughts'],
  ['restless', 'Restless or wired'],
  ['stuck', "Can't get started"],
  ['overwhelmed', 'Overwhelmed'],
  ['impulsive', 'About to act on an urge'],
  ['low', 'Flat or harsh with myself'],
];

export const MODULES = [
  {
    id: 'welcome', no: '00', name: 'Welcome', skill: 'Why ACT, why ADHD',
    intro: 'Start here. What the course is, what ACT is for, and the honest version of what it can and can’t do for an ADHD brain.',
    lessons: [
      L({ id: 'start', title: 'Start here', kind: 'learn', short: 'What this course is and how to use it',
        body: [
          'ACT (acceptance and commitment therapy, said like the word “act”) builds one skill: psychological flexibility. That means noticing what is here, making room for it, and still doing what matters.',
          'With ADHD, a lot of suffering comes in a second layer. First there’s the hard bit: the task won’t start, the time went, you said the thing. Then the story arrives: lazy, too much, always ruining it. ACT works on that second layer and on the next step. It doesn’t try to fix your brain.',
          'The course has seven modules: these foundations, then one module for each of the six ACT skills. Lessons are short. Some explain an idea, some tell a metaphor, and some are guided exercises you do with your eyes half closed. A few have interactive tools.',
          'One lesson at a time is plenty. Nothing breaks if you stop, and coming back counts.',
        ],
        week: 'Once a day, catch one moment where you did the opposite of what you wanted. Just name it: “that was an away move.”',
        reflect: 'What do I most want from this course, in a sentence or two?' }),
      L({ id: 'brain', title: 'Your brain, not your character', kind: 'learn', short: 'Executive function, interest and time',
        body: [
          'Executive functions are the skills that turn intentions into action: starting, planning, holding steps in mind, switching, finishing, noticing time. ADHD affects these. Intelligence is a separate thing, which is why you can be very capable and still not send the email.',
          'An ADHD nervous system tends to run on interest, novelty, challenge and urgency more than on importance. “It matters” often isn’t enough fuel. That isn’t a moral failing. It tells you what kind of fuel to bring.',
          'Time is often felt as two settings: now, and not now. Future consequences don’t feel real until they’re close. Many of the tools later in the course work by putting the future, or the reason, into the present.',
          'Executive function gets worse under stress. Shame is stress. So the harsh story about yourself makes the next step harder, not easier.',
        ],
        reflect: 'Which of these do I recognise most: starting, time, switching, finishing, or the shame that follows?' }),
      L({ id: 'tried', title: 'What have I already tried?', kind: 'worksheet', mins: 6, short: 'Creative hopelessness, gently',
        body: [
          'Most adults with ADHD have tried a lot: planners, apps, systems, willpower, all-nighters, promising to be different on Monday. This worksheet isn’t about blame. It’s about noticing which strategies were really ways of getting rid of a feeling.',
          'If a strategy gave quick relief but cost you something over time, that’s worth knowing. It isn’t that you did it wrong. Some strategies can’t work, because they ask you to never feel bored, anxious or ashamed.',
        ],
        fields: [
          ['tried', 'What have I tried, to get on top of things or to stop feeling bad?', 'List as many as you like'],
          ['short', 'What did they give me in the short term?', 'Relief, a burst of hope, quiet'],
          ['long', 'What did they cost me over time?', 'Money, energy, trust in myself, time'],
          ['open', 'What would I be willing to try differently?', 'Even “I’m curious” is enough'],
        ] }),
      L({ id: 'map', title: 'The six skills', kind: 'tool', tool: 'hexaflex', mins: 3, short: 'A map of the whole course',
        body: [
          'ACT is often drawn as a hexagon of six skills. They all point to the centre: being open, aware and engaged, even when it’s hard. You don’t need to master them in order. Strength in one helps the others.',
          'Tap a skill to see what it’s for and jump to its module.',
        ] }),
      L({ id: 'check-welcome', title: 'Quick check', kind: 'check', mins: 1, short: 'One question',
        quiz: { q: 'In ACT, what’s the aim when a hard feeling shows up before a task?',
          options: ['Get rid of the feeling first, then start', 'Make room for the feeling and take a step anyway', 'Wait until motivation arrives'],
          answer: 1, why: 'ACT doesn’t ask you to feel ready. It asks whether you’re willing to have the feeling while you do something that matters.' } }),
    ],
  },
  {
    id: 'present', no: '01', name: 'Present moment', skill: 'Be here now',
    intro: 'Getting back to now, again and again. For an ADHD brain the win isn’t staying present. It’s noticing sooner that you left.',
    lessons: [
      L({ id: 'notice', title: 'Noticing is the win', kind: 'learn', short: 'Even noticing late counts',
        body: [
          'Impulsive moments happen faster than thought. Trying harder to stop them usually just adds shame. ACT starts somewhere gentler: get better at noticing.',
          'You don’t have to catch it before it happens. Noticing straight after (“oops, that was impulsive”) is the skill being built. With practice, the gap between the impulse and the noticing shrinks.',
          'Your senses are the quickest way back. They’re always here and they don’t argue.',
        ],
        week: 'Each evening, name three moments you noticed late. Count them as wins.',
        reflect: 'When did I notice something late this week, and what happened after I noticed?' }),
      L({ id: 'anchor', title: 'Dropping anchor', kind: 'exercise', mins: 3, short: 'ACE: acknowledge, connect, engage', needs: ['overwhelmed', 'restless', 'hooked'],
        body: ['An anchor doesn’t stop the storm. It stops the boat being swept away. Use this whenever you’re flooded, scattered or spinning.'],
        steps: [
          'Acknowledge what’s here. Silently name it: “Restless. Thoughts racing. Urge to check my phone.”',
          'Connect with your body. Press your feet into the floor.',
          'Straighten your back. Push your palms together and feel the pressure.',
          'Engage with the world. Look around and name five things you can see.',
          'Now three things you can hear.',
          'Acknowledge again: what’s here now? Name it kindly.',
          'Connect again: feet, back, hands.',
          'Engage: what’s one thing you’re going to do next? Do that.',
        ], stepSecs: 20,
        week: 'Drop anchor once a day at a set moment (after brushing your teeth), and once when you’re actually swept up.' }),
      L({ id: 'senses', title: 'Five senses', kind: 'exercise', mins: 2, short: 'A quick way back, anywhere', needs: ['overwhelmed', 'restless'],
        steps: ['Notice five things you can see. Pick ones you hadn’t noticed.', 'Four things you can feel: clothes, chair, air, your feet.', 'Three things you can hear, near and far.', 'Two things you can smell, or the absence of smell.', 'One thing you can taste.', 'Take one slow breath out.'], stepSecs: 15 }),
      L({ id: 'breaths', title: 'Ten breaths', kind: 'exercise', mins: 2, short: 'Counting, losing count, starting again', needs: ['restless'],
        body: ['Losing count isn’t failing. Each time you notice you’ve drifted and start again, that’s one rep of the attention muscle.'],
        steps: ['Breathe out slowly, a little longer than usual.', 'Count each out-breath silently, one to ten.', 'If you lose count, notice where you went, and start at one.', 'Notice the pause at the bottom of each out-breath.', 'Keep counting until the bell.'], stepSecs: 24 }),
      L({ id: 'reps', title: 'Attention reps', kind: 'learn', short: 'Bring it back, without the lecture',
        body: [
          'Attention isn’t something you hold. It’s something you keep bringing back. Every return is a rep.',
          'The tone of the return matters. “Ugh, again” trains frustration. “Ah, there I went. Back to this” trains returning.',
          'With ADHD you may do a hundred reps in ten minutes. That’s not worse meditation. It’s more training.',
        ],
        week: 'Pick one daily task (brushing teeth, making coffee). Do it with full attention, and count how many times you come back.' }),
      L({ id: 'routine', title: 'Mindful routine', kind: 'exercise', mins: 3, short: 'Turn something you already do into practice', needs: ['restless'],
        steps: ['Pick something you’re about to do anyway: washing a cup, walking to the car.', 'Slow it down by about ten percent.', 'Notice temperature, weight, texture, sound.', 'When you drift into planning or replaying, notice where you went.', 'Come back to the next small detail of what your hands are doing.'], stepSecs: 30 }),
      L({ id: 'check-present', title: 'Quick check', kind: 'check', mins: 1, short: 'One question',
        quiz: { q: 'You’ve drifted off for the tenth time in a minute. What counts as success?', options: ['Not drifting', 'Noticing you drifted and coming back', 'Forcing yourself to concentrate harder'], answer: 1, why: 'Every return is a rep. Noticing late still counts.' } }),
    ],
  },
  {
    id: 'defusion', no: '02', name: 'Unhooking', skill: 'Thoughts are thoughts',
    intro: 'Cognitive defusion. Seeing thoughts as words and pictures your mind makes, so the old stories have less pull on what you do.',
    lessons: [
      L({ id: 'thoughts', title: 'Thoughts are thoughts', kind: 'learn', short: 'Why old stories feel like facts',
        body: [
          'Minds have habits. Years of being told you’re disorganised, too much or not trying can leave stories that feel like facts.',
          'A thought that’s been around a long time feels true. That doesn’t make it true. Plenty of true things never get stuck in your head at all.',
          'Unhooking doesn’t mean arguing with a thought or swapping it for a nicer one. It means seeing it as a thought, so it has less pull on what you do next.',
          'The question isn’t “is this thought true?” but “if I let this thought steer, does it take me towards what matters?”',
        ] }),
      L({ id: 'having', title: '“I’m having the thought that…”', kind: 'exercise', mins: 2, short: 'The simplest unhooking move', needs: ['hooked'],
        steps: ['Bring to mind a harsh thought about yourself. Say it silently as your mind says it: “I’m lazy.”', 'Notice how much it grips you, from one to ten.', 'Now say: “I’m having the thought that I’m lazy.”', 'Now: “I notice I’m having the thought that I’m lazy.”', 'Notice any change in the grip, even small.'], stepSecs: 18 }),
      L({ id: 'lab', title: 'Unhooking lab', kind: 'tool', tool: 'defuse', mins: 4, short: 'Try six ways to loosen a thought', needs: ['hooked', 'low'],
        body: ['Type a thought that hooks you. Then try each technique and notice which ones loosen it. Some will feel silly. That’s partly the point.'] }),
      L({ id: 'story', title: 'Name the story', kind: 'worksheet', mins: 4, short: 'Give the pattern a title', needs: ['hooked'],
        body: ['Most of us have a few stories that play on repeat. Naming one (“the lazy story”, “the old report card”) makes it easier to recognise when it starts again.'],
        fields: [['story', 'The story my mind tells most', 'In its own words'], ['name', 'Its name', 'The ___ story'], ['does', 'When it plays, what does it make me do?', 'Give up, overwork, hide, apologise'], ['instead', 'What would I do if I let it play in the background?', '']],
        week: 'When the story shows up, say “Ah, the ___ story again”, and do one small next thing.' }),
      L({ id: 'thanks', title: 'Thank your mind', kind: 'learn', short: 'It’s trying to help',
        body: [
          'Your mind is a problem-solving machine. Worry, criticism and dread are often its clumsy way of keeping you safe or acceptable.',
          'When it starts up, try: “Thanks, mind. I know you’re trying to help.” Said kindly or with a bit of humour, not sarcastically.',
          'You aren’t agreeing with it. You’re just not fighting it.',
        ] }),
      L({ id: 'stream', title: 'Leaves on a stream', kind: 'exercise', mins: 5, short: 'The classic defusion practice', needs: ['hooked', 'restless'],
        body: ['If you get swept away (and you will), that’s part of the exercise. Noticing you were swept and coming back is the practice.'],
        steps: ['Sit comfortably. Let your eyes close or rest on one spot.', 'Picture a gentle stream, with leaves floating past on the surface.', 'Each time a thought arrives, words or pictures, put it on a leaf and let it float by.', 'Pleasant thoughts go on leaves too. So does “this isn’t working.”', 'If the stream stops or you get pulled into a thought, notice that, and put that on a leaf.', 'No need to speed the stream up or slow it down.', 'Keep placing thoughts on leaves until the bell.'], stepSecs: 40 }),
      L({ id: 'bus', title: 'Passengers on the bus', kind: 'metaphor', mins: 3, short: 'You’re still the driver',
        body: [
          'Imagine you’re driving a bus. Along the way, passengers get on: thoughts, memories, feelings. Some are loud and scary. “You’ll mess this up.” “Turn back, this is boring.” “Everyone will see.”',
          'They threaten you. If you keep driving towards where you want to go, they say, they’ll come up to the front.',
          'So you make deals. You turn down side streets to keep them quiet, and slowly the bus stops going anywhere that matters to you.',
          'Here’s the thing: they can shout and come right up beside you, but they can’t grab the wheel. You can keep driving towards what matters with a noisy bus.',
        ],
        reflect: 'Who are the loudest passengers on my bus right now, and where would I drive if I stopped making deals with them?' }),
      L({ id: 'hands', title: 'Hands as thoughts', kind: 'exercise', mins: 2, short: 'Feel the difference between fused and unhooked', needs: ['hooked'],
        steps: ['Hold your hands up in front of your face, palms towards you, like an open book. Imagine they’re your harshest thoughts.', 'Bring them right up close, covering your eyes. Notice how much you can see of the room. This is being hooked.', 'Slowly lower them to rest in your lap. The thoughts are still here.', 'Notice how much more of the room you can see, and how much easier it would be to do something.'], stepSecs: 20 }),
      L({ id: 'check-defusion', title: 'Quick check', kind: 'check', mins: 1, short: 'One question',
        quiz: { q: 'Which is defusion?', options: ['Proving to yourself that “I’m lazy” isn’t true', 'Noticing “I’m having the thought that I’m lazy” and carrying on', 'Replacing it with “I’m amazing”'], answer: 1, why: 'Defusion changes your relationship with the thought, not its content.' } }),
    ],
  },
  {
    id: 'acceptance', no: '03', name: 'Making room', skill: 'Open up',
    intro: 'Acceptance, also called willingness: letting feelings be here so they don’t have to be won before you live. For ADHD, that includes boredom and restlessness.',
    lessons: [
      L({ id: 'switch', title: 'The struggle switch', kind: 'learn', short: 'Struggling with a feeling makes more of it',
        body: [
          'Picture a switch at the back of your mind. When it’s on, any uncomfortable feeling gets fought: anxiety about anxiety, frustration at being frustrated, shame about being bored.',
          'With the switch on, a feeling becomes a feeling plus a fight, which is usually bigger and longer.',
          'Turning the switch off doesn’t make the feeling go away. It just stops adding the second layer.',
        ] }),
      L({ id: 'tug', title: 'Tug of war with a monster', kind: 'metaphor', mins: 2, short: 'You can drop the rope',
        body: [
          'You’re in a tug of war with a monster made of your anxiety, boredom or dread. Between you is a pit. You pull with everything you’ve got. The monster pulls back.',
          'You can’t win. Pulling harder only tires you out, and your hands are too busy for anything else.',
          'The way out isn’t winning. It’s dropping the rope. The monster is still there, maybe pulling faces. But your hands are free.',
        ],
        reflect: 'What am I in a tug of war with at the moment? What would I do with my hands free?' }),
      L({ id: 'expansion', title: 'Expansion', kind: 'exercise', mins: 4, short: 'Observe, breathe, make room, allow', needs: ['overwhelmed', 'low'],
        steps: ['Notice where in your body a difficult feeling is strongest.', 'Observe it like a curious scientist: where does it start and stop? Is it still or moving? Hot or cool?', 'Breathe into and around it, as if making a little space.', 'Let it be there. You don’t have to like it. Just stop pushing it away.', 'Imagine the space around it opening up, a bit more room each breath.', 'Widen your attention to the rest of your body and the room, with the feeling still there.'], stepSecs: 30 }),
      L({ id: 'object', title: 'Give it a shape', kind: 'exercise', mins: 3, short: 'Physicalising a feeling', needs: ['overwhelmed'],
        steps: ['Find the feeling in your body.', 'If it had a size, how big would it be?', 'A shape? A colour? Is it heavy or light?', 'Is the surface smooth, rough, spiky?', 'Imagine holding it in your hands for a moment, looking at it with curiosity.', 'Put it back where you found it, or wherever it wants to go.'], stepSecs: 20 }),
      L({ id: 'boredom', title: 'Boredom up close', kind: 'exercise', mins: 5, short: 'Willingness with the hardest feeling', needs: ['stuck', 'restless'],
        body: ['For many ADHD brains boredom isn’t mild. It can feel worse than anger or anxiety, and a lot of avoidance is really avoidance of boredom. So it’s worth practising with directly.'],
        steps: ['Choose something mildly boring that needs doing: dishes, filing, an inbox.', 'Start the task.', 'When boredom spikes, find it in your body. Where is it? Heavy, buzzy, tight?', 'Breathe around it and say: “boredom is here, and I’m folding this towel.”', 'Keep going until the bell.'], stepSecs: 60 }),
      L({ id: 'surf', title: 'Urge surfing', kind: 'exercise', mins: 4, short: 'Ride the wave instead of acting on it', needs: ['impulsive', 'restless'],
        body: ['Urges rise, peak and fall like waves, usually within a few minutes, if you don’t feed them. This is for the urge to check your phone, interrupt, buy, quit, snack, switch tasks.'],
        steps: ['Name the urge: “there’s an urge to check my phone.”', 'Find it in your body. Hands, chest, jaw, belly?', 'Rate it from one to ten.', 'Breathe and watch it, like a surfer watching a wave come in.', 'Notice it rising. You don’t have to do anything.', 'Notice it peak, then start to change.', 'Rate it again. Then choose what to do.'], stepSecs: 30,
        week: 'Surf one urge a day before acting on it, even for 60 seconds. Act on it afterwards if you still want to.' }),
      L({ id: 'and', title: 'The power of AND', kind: 'learn', short: 'Both things can be true at once',
        body: [
          'Our minds often say: if you feel this, you can’t do that. “I’m anxious, so I can’t make the call.” “I’m bored, so I can’t do the admin.”',
          'Swap “so” or “but” for “and”. “I’m anxious AND I can make the call.” “I’m bored AND I can do five minutes of admin.”',
          'Build it like a muscle. Start with discomfort that just feels weird, like sitting in a different chair, before the hard stuff.',
        ],
        week: 'Write three AND sentences for things you’ve been avoiding, and act on one.' }),
      L({ id: 'kindhand', title: 'Kind hand', kind: 'exercise', mins: 2, short: 'Self-compassion in the body', needs: ['low'],
        steps: ['Place a hand where it hurts most, or on your chest.', 'Feel the warmth of your hand.', 'Imagine the kindness of someone who loves you flowing through it.', 'Say silently: “This is hard. Lots of people with brains like mine feel this. May I be kind to myself.”', 'Stay for a few breaths.'], stepSecs: 20 }),
      L({ id: 'check-acceptance', title: 'Quick check', kind: 'check', mins: 1, short: 'One question',
        quiz: { q: 'Willingness means…', options: ['Wanting the feeling', 'Letting the feeling be here while you do what matters', 'Ignoring the feeling'], answer: 1, why: 'You don’t have to like it. You just stop making its departure the condition for living.' } }),
    ],
  },
  {
    id: 'self', no: '04', name: 'The noticing self', skill: 'Pure awareness',
    intro: 'Self-as-context: the part of you that notices thoughts and feelings without being them. Also, dropping the exhausting job of being “normal”.',
    lessons: [
      L({ id: 'noticer', title: 'Notice who’s noticing', kind: 'exercise', mins: 3, short: 'The observing self', needs: ['overwhelmed'],
        steps: ['Close your eyes. Notice sounds around you.', 'Notice that you’re noticing them.', 'Notice your breath. Notice that there’s a you that can notice it.', 'Notice a thought. Notice that you can see the thought.', 'Thoughts change. Feelings change. The noticing stays.', 'Rest for a moment as the one who notices.'], stepSecs: 25 }),
      L({ id: 'sky', title: 'Sky and weather', kind: 'metaphor', mins: 2, short: 'You can hold any storm',
        body: [
          'Thoughts and feelings are like the weather. Some days are clear, some are storms that seem like they’ll never end.',
          'You’re more like the sky. The sky has room for every kind of weather. Storms pass through it. However wild the weather, the sky isn’t harmed.',
          'Even in the worst storm, if you get high enough, above the clouds, the sky is clear.',
        ] }),
      L({ id: 'torch', title: 'The torch', kind: 'metaphor', mins: 2, short: 'You hold the light',
        body: [
          'Your mind is busy: sounds, sensations, memories, plans, worries, all at once. Attention is like a torch moving around a dark room, lighting up one thing then another.',
          'With ADHD, the torch can swing wildly, pulled by anything bright or loud.',
          'You’re the one holding the torch, not any one thing it lands on. You can notice where it went, and point it back.',
        ] }),
      L({ id: 'chess', title: 'The chessboard', kind: 'metaphor', mins: 2, short: 'You’re the board, not the pieces',
        body: [
          'Imagine a chessboard. The white pieces are thoughts you like: “I’m capable.” The black pieces are thoughts you don’t: “I’m a mess.”',
          'You can spend your life fighting for the white pieces. But each move up brings a counter-move. The game never ends.',
          'What if you’re the board? The board holds all the pieces. It doesn’t need either side to win, and it can still move towards something that matters while the game goes on.',
        ] }),
      L({ id: 'labels', title: 'Stories I tell about me', kind: 'worksheet', mins: 5, short: 'Loosening the labels', needs: ['low'],
        body: ['Labels can be useful (ADHD is one) and can also become cages. Write down the labels you carry, then notice which ones you hold lightly and which hold you.'],
        fields: [['labels', '“I am…” — the labels I use about myself', 'Good and bad'], ['tight', 'Which ones grip me tightest?', ''], ['before', 'Who was I before I believed that one?', ''], ['bigger', 'What’s true about me that the label leaves out?', '']] }),
      L({ id: 'masking', title: 'Strengths and masking', kind: 'worksheet', mins: 5, short: 'A different way of noticing the world',
        body: [
          'Neurodivergence means noticing and responding to the world differently. Not wrongly. Masking means working hard to look neurotypical, and it’s exhausting.',
          'When you understand and accept how your brain works, there’s more energy left for flexibility. And your strengths become something to use on purpose.',
        ],
        fields: [['strengths', 'Three strengths of how my brain works', 'Curiosity, quick connections, energy in a crisis, deep focus on what lights me up'], ['mask', 'Where do I mask the most?', ''], ['less', 'What would masking a little less there look like?', '']] }),
      L({ id: 'check-self', title: 'Quick check', kind: 'check', mins: 1, short: 'One question',
        quiz: { q: 'In the sky metaphor, what are you?', options: ['The storm', 'The sun', 'The sky that holds all the weather'], answer: 2, why: 'The noticing self has room for every thought and feeling and isn’t damaged by any of them.' } }),
    ],
  },
  {
    id: 'values', no: '05', name: 'What matters', skill: 'Know what matters',
    intro: 'Values: the directions you want to keep walking in. For an interest-based brain, values are a way to turn dull tasks into meaningful ones.',
    lessons: [
      L({ id: 'vg', title: 'Values aren’t goals', kind: 'learn', short: 'A compass, not a destination',
        body: [
          'A goal can be ticked off: send the report, run 5km. A value is a direction you keep walking in: being reliable, being creative, caring for people. You never finish kindness.',
          'Values are like a compass. If you head west, you never arrive at “west”, but you always know which way to go.',
          'Goals are still useful. They’re the stepping stones you put down in a valued direction.',
        ] }),
      L({ id: 'cards', title: 'Values card sort', kind: 'tool', tool: 'cards', mins: 6, short: 'Find your top values',
        body: ['Sort each card by how much it matters to you right now. Go with your gut. There are no right answers, and they can change.'] }),
      L({ id: 'speeches', title: 'Two speeches', kind: 'worksheet', mins: 6, short: 'What you’d hope people say',
        fields: [['friend', 'A friend gives a speech at my birthday in ten years. What would I hope they say about how I treated people?', ''], ['work', 'A colleague speaks at my farewell. What would I hope they say about how I worked?', ''], ['words', 'Which words matter most in what I wrote?', '']] }),
      L({ id: 'bullseye', title: 'The bull’s-eye', kind: 'tool', tool: 'bullseye', mins: 6, short: 'How close am I living to my values?',
        body: ['For each area of life, write what matters to you, then mark how close your life is to it right now. This isn’t a score. It shows where a small step might count most.'] }),
      L({ id: 'sweet', title: 'Sweet spot', kind: 'exercise', mins: 4, short: 'Remember a moment that mattered', needs: ['low', 'stuck'],
        steps: ['Remember a moment, big or small, when you felt really alive or really yourself.', 'Where were you? Who was there?', 'What could you see, hear, feel?', 'What were you doing that made it matter?', 'What does this moment say about what you care about?', 'Notice what’s here in your body as you remember it.'], stepSecs: 30 }),
      L({ id: 'dull', title: 'Values in dull tasks', kind: 'learn', short: 'The why, plus a now-reward',
        body: [
          'Values can feel far away when the task in front of you is tedious. Link them anyway: the tax return serves “looking after my family”; the dishes serve “a home that feels calm”.',
          'Because ADHD runs on now, pair the long-term why with a short-term reward: good music, a nice drink, a walk after, a body double.',
          'The value says why. The now-reward gets you moving.',
        ],
        week: 'Pick one task you keep avoiding. Each day, name the value it serves and give it a small now-reward.',
        reflect: 'Which dull task do I avoid most, and which value does it actually serve?' }),
      L({ id: 'check-values', title: 'Quick check', kind: 'check', mins: 1, short: 'One question',
        quiz: { q: 'Which one is a value?', options: ['Finish my thesis proposal', 'Being curious', 'Lose 5kg'], answer: 1, why: 'A value is an ongoing direction. The other two are goals you could tick off.' } }),
    ],
  },
  {
    id: 'action', no: '06', name: 'Committed action', skill: 'Do what matters',
    intro: 'Taking steps in a valued direction, sized to the day you’re actually having, with scaffolding outside your head.',
    lessons: [
      L({ id: 'choice', title: 'Towards and away', kind: 'worksheet', mins: 6, short: 'The choice point', needs: ['stuck', 'impulsive'],
        body: [
          'Picture a line. At one end is what matters to you. At the other is getting away from discomfort. Hooks show up all day — thoughts, feelings, urges — and pull you one way or the other.',
          'Away moves work in the short term. Each one also makes the next towards move a little harder. No move is good or bad in itself; the question is where it takes you, right now.',
        ],
        fields: [['situation', 'A situation that keeps going sideways', ''], ['hooks', 'What hooks me (thoughts, feelings, urges)', ''], ['away', 'My usual away move, and what it gives me', ''], ['towards', 'A towards move I could make, even with the hooks', ''], ['skill', 'Which skill would help me unhook here?', 'Dropping anchor, naming the story, making room…']] }),
      L({ id: 'step', title: 'The tiny first step', kind: 'tool', tool: 'stepdown', mins: 6, short: 'Step a goal down to the next 24 hours', needs: ['stuck', 'overwhelmed'],
        body: [
          'People often take on too much too soon, and a failed big step costs confidence. A small step that actually happens builds momentum.',
          'Step a goal down from a year to three months, a month, a week and the next 24 hours. Commit only to the last one. Then write a low-day version too, because capacity changes from day to day.',
        ] }),
      L({ id: 'whenthen', title: 'When–then plans', kind: 'worksheet', mins: 4, short: 'Decide in advance', needs: ['stuck'],
        body: ['Deciding in the moment is where ADHD struggles most. A when–then plan makes the decision earlier, so the moment only has to recognise its cue.'],
        fields: [['when1', 'When…', 'I put the kettle on'], ['then1', 'then I will…', 'open the doc and write one line'], ['when2', 'When…', 'the hook “this is boring” shows up'], ['then2', 'then I will…', 'say “boredom is here” and do two more minutes']] }),
      L({ id: 'scaffold', title: 'Scaffolds outside your head', kind: 'learn', short: 'Not cheating: engineering',
        body: [
          'If something depends on remembering, it’s fragile. Put it outside your head: a timer, a note on the door, the item left where you’ll trip over it, a calendar alert with the first step written in it.',
          'Body doubling (working alongside someone, in person or online) helps many ADHD brains start and keep going.',
          'Make the first step start-able in under two minutes. “Open the document and write the heading” beats “work on report”.',
        ],
        week: 'Add one scaffold to the thing you most often forget or avoid.' }),
      L({ id: 'zone', title: 'The challenge zone', kind: 'learn', short: 'Not too easy, not chaos',
        body: [
          'Picture three circles. The comfort zone in the middle: safe, but nothing grows. The challenge zone around it: uncomfortable but doable. The chaos zone outside: so much that you shut down.',
          'Growth happens in the challenge zone. Steps that land in chaos don’t teach courage, they teach “I can’t”.',
          'On low days the challenge zone shrinks. That’s normal. Pick a step for today’s zone, not your best day’s.',
        ] }),
      L({ id: 'fear', title: 'When it goes sideways', kind: 'worksheet', mins: 5, short: 'Troubleshoot the step, not yourself', needs: ['low'],
        body: ['It will go sideways. Ask what got in the way. Was the step too big? Step it down. Did you forget? Add a scaffold. Was the story loud? Name it. Did it lose meaning? Go back to the value. Was a feeling too big? Make room.'],
        fields: [['what', 'What happened?', 'Just the facts'], ['barrier', 'What got in the way?', 'Too big, forgot, story, lost the why, a big feeling'], ['adjust', 'What will I change?', ''], ['kind', 'What would I say to a friend with my brain?', '']] }),
      L({ id: 'keep', title: 'Keep one thing', kind: 'learn', short: 'Bringing it together',
        body: [
          'Flexibility in under a minute: notice what’s here, name the hook, make a bit of room, take one small step towards what matters.',
          'You don’t need every exercise in this course. Pick the one that helped most and keep it for a month. The practice library has them all when you need a different one.',
        ],
        reflect: 'Which practice do I want to keep, and what will remind me to do it?' }),
      L({ id: 'check-action', title: 'Quick check', kind: 'check', mins: 1, short: 'One question',
        quiz: { q: 'Your step didn’t happen. Best next move?', options: ['Try harder tomorrow with the same step', 'Make it smaller or add a scaffold', 'Give up on the goal'], answer: 1, why: 'Troubleshoot the step, not yourself. Smaller and more supported usually wins.' } }),
    ],
  },
];

export const ALL_LESSONS = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleName: m.name, moduleNo: m.no })));
export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id);

export const HEXAFLEX = [
  { id: 'present', name: 'Present moment', line: 'Come back to now, with curiosity.' },
  { id: 'defusion', name: 'Unhooking', line: 'See thoughts as thoughts.' },
  { id: 'acceptance', name: 'Making room', line: 'Let feelings be here without a fight.' },
  { id: 'self', name: 'Noticing self', line: 'The part of you that notices, and holds it all.' },
  { id: 'values', name: 'What matters', line: 'Know your directions.' },
  { id: 'action', name: 'Committed action', line: 'Take steps that fit the day.' },
];

export const VALUES = [
  'Acceptance', 'Adventure', 'Authenticity', 'Beauty', 'Calm', 'Caring', 'Challenge', 'Compassion', 'Connection', 'Contribution',
  'Courage', 'Creativity', 'Curiosity', 'Fairness', 'Freedom', 'Fun', 'Generosity', 'Gratitude', 'Health', 'Honesty',
  'Humour', 'Independence', 'Intimacy', 'Justice', 'Kindness', 'Learning', 'Love', 'Nature', 'Openness', 'Order',
  'Patience', 'Persistence', 'Play', 'Presence', 'Reliability', 'Respect', 'Rest', 'Self-care', 'Spirituality', 'Trust',
];

export const DOMAINS = [['work', 'Work and study'], ['love', 'Relationships'], ['growth', 'Health and growth'], ['play', 'Rest and play']];

export const COURSE = {
  id: 'act-adhd', title: 'ACT for ADHD', tagline: 'Room to move',
  blurb: 'Seven modules on the six ACT skills, adapted for an ADHD brain: guided exercises, metaphors, worksheets and tools, in small pieces.',
  lessons: ALL_LESSONS,
  readings: [
    { id: 'wassner', title: 'Acceptance and Commitment Therapy with Children', author: 'Jodie Wassner (2024)', seed: 'Written for children’s therapists, with a neuro-affirming chapter on autism and ADHD. The source for several ideas here: noticing as the first win, boredom as a hard feeling, the power of AND, the flexibility muscle, mind hooks and the torch.' },
    { id: 'act-in-depth', title: 'ACT in Depth', author: 'Nesh Nikolic', seed: 'A self-paced course for clinicians with a module per ACT process. The model for this course’s shape, and the source of the step-down method.', url: 'https://neshnikolic.com/first-step-of-committed-action' },
    { id: 'happiness-trap', title: 'The Happiness Trap', author: 'Russ Harris', seed: 'The plainest adult introduction to ACT: dropping anchor, the struggle switch, the choice point, hands as thoughts.' },
    { id: 'hayes', title: 'Get Out of Your Mind and Into Your Life', author: 'Steven Hayes', seed: 'An ACT workbook by one of its founders. Home of passengers on the bus, tug of war and the chessboard.' },
    { id: 'munawar', title: 'ACT for ADHD: a scoping review', author: 'Munawar et al., Heliyon (2021)', seed: 'Six small studies, mostly with children and teenagers. Promising results; limited evidence so far.' },
    { id: 'umaap', title: 'Understanding and Managing Adult ADHD Programme', author: 'Seery et al., Journal of Contextual Behavioral Science (2023)', seed: 'Adults in an online ACT-plus-psychoeducation programme described more self-acceptance, and also that it could feel like too much at once.' },
  ],
};
