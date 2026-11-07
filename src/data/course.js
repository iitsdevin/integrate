// ACT for ADHD: a short, self-paced course in the Toolkit.
// Written for this app. Ideas adapted (not quoted) from Jodie Wassner, Acceptance and Commitment
// Therapy with Children (2024), chapters 5–8 and 10; Russ Harris's choice point and ACE; and
// Nesh Nikolic's step-down method for the first step of committed action (ACT in Depth).

export const COURSE = {
  id: 'act-adhd',
  title: 'ACT for ADHD',
  tagline: 'Room to move',
  blurb: 'Nine short lessons on noticing what shows up, unhooking from the old stories, and taking a step that fits the day you’re actually having.',
  how: [
    'One lesson a week is plenty. Go in any order once you’ve read Start here.',
    'Each lesson has one idea, one thing to try now, one small practice for the week and a question to write about. Your answers go into your journal, where your buddy can see them.',
    'Nothing here is graded and nothing breaks if you stop. Coming back counts.',
  ],
  lessons: [
    {
      id: 'start', no: '00', title: 'Start here', short: 'What ACT is, and why it suits an ADHD brain',
      idea: [
        'ACT (acceptance and commitment therapy) builds one skill: psychological flexibility. That means noticing what is here, making room for it, and still doing what matters.',
        'With ADHD, a lot of suffering comes from a second layer. First there is the hard bit: the task won’t start, the time went, you said the thing. Then the story arrives: lazy, too much, always ruining it. ACT works on that second layer and on the next step, not on fixing your brain.',
        'Executive function is not intelligence. Planning, starting, sequencing and finishing are a separate set of skills from being clever, and they get worse under stress. Needing scaffolding says nothing about your worth.',
        'The evidence is promising but early. A 2021 scoping review found six small studies, mostly with children and teenagers, with encouraging results for quality of life, mood and procrastination. An online ACT-plus-psychoeducation programme for adults found people came away more accepting of their ADHD, and also that it could be too much at once. So this course keeps every lesson small.',
        'This adds to your ADHD care. It doesn’t replace medication, your psychiatrist, or practical supports.',
      ],
      try: { title: 'Notice one moment', steps: ['Think of a moment from the last day or two when you did the opposite of what you wanted to do.', 'Don’t analyse it. Just name it: “that was an away move.”', 'Notice what it feels like to name it without telling yourself off.'] },
      week: 'Once a day, catch one away move and name it, even hours later. Noticing late still counts.',
      reflect: 'What do I most want from this course? Keep it to a sentence or two.',
    },
    {
      id: 'notice', no: '01', title: 'Noticing is the win', short: 'Present moment, and naming impulsive moments',
      idea: [
        'Impulsive moments happen faster than thought. Trying harder to stop them usually just adds shame. ACT starts somewhere gentler: get better at noticing.',
        'You don’t have to catch it before it happens. Noticing straight after (“oops, that was impulsive”) is the skill being built. The gap between the impulse and the noticing shrinks with practice.',
        'Your senses are the fastest way back to the present. They are always here, and they don’t argue.',
      ],
      try: { title: 'Drop anchor (ACE)', timer: 2, steps: ['Acknowledge: silently name what’s here. “Restless. Thoughts racing. Urge to check my phone.”', 'Connect with your body: press your feet into the floor, straighten your back, push your palms together.', 'Engage: look around and name five things you can see and three you can hear.', 'Run through it two or three times, slowly. Then carry on with what you were doing.'] },
      week: 'Drop anchor once a day, at a moment you choose in advance (after brushing your teeth, before opening your laptop). Then try it once when you’re actually swept up.',
      reflect: 'When did I notice something late this week? What did I notice, and what happened after I noticed?',
    },
    {
      id: 'towards', no: '02', title: 'Towards and away', short: 'The choice point',
      idea: [
        'Picture a line. At one end is what matters to you. At the other is getting away from discomfort. Through the day, hooks show up — thoughts, feelings, urges, memories — and pull you one way or the other.',
        'Away moves work in the short term. You put the hard email off and the dread drops straight away. But each away move makes the next towards move a little harder, and the thing you avoided grows.',
        'Towards moves often feel worse first. That isn’t a sign you’re doing it wrong; it’s the price of doing something that matters.',
        'No move is good or bad in itself. Scrolling can be an away move at 11pm and a towards move when it’s how you rest. The question is: does this take me towards the life I want, right now?',
      ],
      try: { title: 'Map one situation', steps: ['Pick one situation that keeps going sideways (starting admin, replying to messages, getting to bed).', 'Write what hooks you: the thoughts, feelings and urges that show up.', 'Write your usual away move, and what it gives you in the short term.', 'Write one small towards move you could make instead, even with the hooks still there.'] },
      week: 'Each evening, name one towards move and one away move from the day. No scoring.',
      reflect: 'What hooks me most often, and what does my usual away move give me?',
    },
    {
      id: 'values', no: '03', title: 'What matters', short: 'Values as fuel for an interest-based brain',
      idea: [
        'ADHD attention runs on interest, novelty, challenge and urgency more than on importance. “It matters” often isn’t enough to start. Values can help, because they turn a dull task into a way of being who you want to be.',
        'Values aren’t goals. A goal can be finished (send the report). A value is a direction you keep walking (being reliable, being creative, caring for people). You never “complete” kindness.',
        'Long-term values can feel far away in the moment. Pair them with something short-term: the value says why, the short-term reward gets you moving.',
      ],
      try: { title: 'Two speeches', steps: ['Imagine a friend giving a short speech about you at a birthday ten years from now. What would you hope they say about how you treated people and lived your days?', 'Now a colleague at your farewell. What would you hope they say about how you worked?', 'Circle the words that matter most. Turn them into three to five values, like “curious”, “steady”, “kind to myself as well”.'] },
      week: 'Pick one task you keep avoiding. Each day, say which value it serves and give it a small short-term reward (good tea, a song, a walk after).',
      reflect: 'What are my three to five values right now, in my own words?',
    },
    {
      id: 'unhook', no: '04', title: 'Unhooking from the story', short: 'Defusion: thoughts are thoughts',
      idea: [
        'Minds have worry habits. Years of being told you’re disorganised, too much or not trying can leave stories that feel like facts.',
        'A thought that has been around a long time feels true. That doesn’t make it true. Plenty of true things never get stuck in your head at all.',
        'Unhooking doesn’t mean arguing with the thought or replacing it with a nicer one. It means seeing it as words your mind is producing, so it has less pull on what you do next.',
      ],
      try: { title: 'Name the story', steps: ['Write down one harsh thought you have about yourself, exactly as your mind says it. “I’m lazy.”', 'Add “I’m having the thought that…” in front. Say it slowly.', 'Add “I notice I’m having the thought that…” in front of that. Notice any change, even a small one.', 'Give the whole pattern a name, like “the lazy story” or “the old report card”. Next time: “Ah, the lazy story again.”'] },
      week: 'When your story shows up, name it and say “thanks, mind”, then do one small next thing.',
      reflect: 'What’s my most familiar story about myself? Where did it come from, and what does it make me do?',
    },
    {
      id: 'room', no: '05', title: 'Making room', short: 'Willingness, boredom and the power of AND',
      idea: [
        'For many ADHD brains boredom is not a mild feeling. It can feel worse than anger or anxiety. That’s worth knowing: much avoidance is avoidance of boredom.',
        'Willingness means letting a feeling be here while you do what matters. You don’t have to like it or want it.',
        'The word AND helps. “I feel bored AND I can fold the washing for five minutes.” “I feel restless AND I can sit for three more breaths.” Both things are true at once.',
        'Build flexibility like a muscle: start with discomfort that just feels weird, not with the hardest thing.',
      ],
      try: { title: 'Boredom, up close', timer: 5, steps: ['Choose something mildly boring that needs doing: dishes, filing, an inbox.', 'Set the timer. Do the task.', 'Every time boredom spikes, find it in your body. Where is it? Is it heavy, buzzy, tight?', 'Breathe around it, as if making a bit of space, and keep going until the bell.'] },
      week: 'Write three AND sentences for things you’ve been avoiding, and act on one of them.',
      reflect: 'Which feeling do I avoid the most? What would I do differently if I were willing to have it?',
    },
    {
      id: 'step', no: '06', title: 'The tiny first step', short: 'Committed action that fits today',
      tool: 'stepdown',
      idea: [
        'People often take on too much too soon, and a failed big step costs confidence. A small step that actually happens builds momentum.',
        'Step a goal down. Start with where you’d like to be in a year. Then ask what’s realistic in three months, one month, this week, and in the next 24 hours. Commit only to the last one.',
        'With ADHD, make the step something you could start in under two minutes, and put a cue outside your head: a timer, a note on the door, a body double, the item left where you’ll trip over it.',
        'Capacity changes from day to day. Have a low-day version of the step as well as a good-day one. Doing the low-day version is a win, not a downgrade.',
      ],
      try: { title: 'Step it down', steps: ['Use the step-down below for one goal you care about.', 'Write a good-day and a low-day version of the 24-hour step.', 'Pick the cue that will remind you.'] },
      week: 'Do the 24-hour step. Then set the next one. Use the low-day version whenever you need it.',
      reflect: 'What got in the way of my step, if anything? What would make the next one easier to start?',
    },
    {
      id: 'sky', no: '07', title: 'The one who notices', short: 'Self-as-context and neurodiversity',
      idea: [
        'Your attention is like a torch moving around a busy mind: sounds, sensations, memories, plans, worries. You are the one holding the torch, not any single thing it lands on.',
        'You can watch thoughts and feelings come and go the way the sky holds weather. Storms pass through. The sky isn’t harmed by them.',
        'Seeing your ADHD as a different way of noticing the world, rather than a failure to be normal, lets you drop the tiring work of masking. Then there is energy left for flexibility.',
      ],
      try: { title: 'Notice who’s noticing', timer: 3, steps: ['Close your eyes. Notice sounds. Notice that you are noticing them.', 'Notice your breath. Notice that you are noticing.', 'Notice a thought. Notice that there is a you that can see the thought.', 'Rest for a moment as the one who notices.'] },
      week: 'Write down three strengths of how your brain works (curiosity, quick connections, energy in a crisis, deep focus on what lights you up), and use one on purpose.',
      reflect: 'Where do I mask most, and what would it be like to mask a little less there?',
    },
    {
      id: 'together', no: '08', title: 'When it goes sideways', short: 'Bringing it together',
      idea: [
        'It will go sideways. That is part of the practice, not the end of it.',
        'Flexibility in under a minute: notice what’s here, name the hook, make a bit of room, and take one small step towards what matters.',
        'If the step didn’t happen, troubleshoot it rather than yourself. Was it too big? Step it down. Did you forget? Put the cue outside your head. Was the story loud? Name it. Did it lose meaning? Go back to the value.',
        'Be as kind to yourself as you would be to a friend with your brain. Self-compassion makes trying again possible.',
      ],
      try: { title: 'Plan for the next wobble', steps: ['Name the situation most likely to throw you off in the next month.', 'Write the hook you expect, your likely away move, and the smallest towards move you could make.', 'Write one kind sentence you’ll say to yourself when it happens.'] },
      week: 'Pick the one practice from this course that helped most and keep it for a month. Let the rest go.',
      reflect: 'Which practice do I want to keep? What will remind me to do it?',
    },
  ],
  readings: [
    { id: 'wassner', title: 'Acceptance and Commitment Therapy with Children', author: 'Jodie Wassner (2024)', seed: 'Written for children’s therapists, with a neuro-affirming chapter on autism and ADHD. The source for several ideas here: noticing as the first win, boredom as a hard feeling, the power of AND, the flexibility muscle, mind hooks and the torch metaphor.' },
    { id: 'happiness-trap', title: 'The Happiness Trap', author: 'Russ Harris', seed: 'The plainest adult introduction to ACT, including the choice point and dropping anchor.' },
    { id: 'act-in-depth', title: 'ACT in Depth', author: 'Nesh Nikolic', seed: 'A self-paced ACT course for clinicians. Its committed action module is the source of the step-down method in lesson 06.', url: 'https://neshnikolic.com/first-step-of-committed-action' },
    { id: 'munawar', title: 'ACT for ADHD: a scoping review', author: 'Munawar et al., Heliyon (2021)', seed: 'Six small studies, mostly with children and teenagers. Promising results, limited evidence so far.' },
    { id: 'umaap', title: 'The Understanding and Managing Adult ADHD Programme', author: 'Seery et al., Journal of Contextual Behavioral Science (2023)', seed: 'Adults who did an online ACT-plus-psychoeducation programme described more self-acceptance, and also that it could feel like too much at once.' },
  ],
};

export const lessonById = (id) => COURSE.lessons.find((l) => l.id === id);
