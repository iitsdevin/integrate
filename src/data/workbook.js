// The Neurodivergence Skills Workbook, as an interactive section of the Toolkit.
// Follows the structure of The Neurodivergence Skills Workbook for Autism and ADHD by
// Jennifer Kemp and Monique Mitchelson (New Harbinger, 2024). Every exercise is rebuilt
// as something to tap or type into. All text here is written for this app in its own
// words; page numbers point back to the book for the authors' full telling.
//
// Lesson kinds: learn · practice (guided, step by step, may also have items) · exercise
// Item types are rendered by components/WorkbookTools.jsx.

const L = (o) => ({ mins: 4, kind: o.steps ? 'practice' : o.items ? 'exercise' : 'learn', ...o });

// ---------- item helpers ----------
const note = (text) => ({ t: 'note', text });
const head = (text) => ({ t: 'head', text });
const text = (k, label, hint, short) => ({ t: 'text', k, label, hint, short });
const line = (k, label, hint) => text(k, label, hint, true);
const list = (k, label, n, hint) => ({ t: 'list', k, label, n, hint });
const blanks = (k, label, n = 3, suggest) => ({ t: 'blanks', k, label, n, suggest });
const chips = (k, label, options, o = {}) => ({ t: 'chips', k, label, options, own: true, ...o });
const one = (k, label, options) => ({ t: 'one', k, label, options });
const freq = (k, label) => ({ t: 'freq', k, label });
const scale = (k, label, left, right) => ({ t: 'scale', k, label, left, right });
const scales = (k, label, left, right, rows) => ({ t: 'scales', k, label, left, right, rows });
const check = (k, label, groups, o = {}) => ({ t: 'check', k, label, groups: typeof groups[0] === 'string' ? [[null, groups]] : groups, own: true, ...o });
const rank = (k, label, options, n = 3) => ({ t: 'rank', k, label, options, n });
const table = (k, label, rows, o = {}) => ({ t: 'table', k, label, rows, ...o });
const rows = (k, label, cols, o = {}) => ({ t: 'rows', k, label, cols, min: 2, ...o });
const pick = (k, label, rws, options) => ({ t: 'pick', k, label, rows: rws, options });
const pair = (k, label, rws) => ({ t: 'pair', k, label, rows: rws });
const strike = (k, from, label) => ({ t: 'strike', k, from, label });
const prefix = (from, steps) => ({ t: 'prefix', from, steps });
const show = (from, keys, label) => ({ t: 'show', from, keys, label });
const rewrite = (k, label, rws) => ({ t: 'rewrite', k, label, rows: rws });
const plan = (k) => ({ t: 'plan', k });
const radial = (k, label, o) => ({ t: 'radial', k, label, ...o });
const sensemap = (k, label, rws) => ({ t: 'sensemap', k, label, rows: rws });
const windowMap = (k, label) => ({ t: 'window', k, label });
const circles = (k, label, from) => ({ t: 'circles', k, label, from });
const spoonday = (k, label) => ({ t: 'spoonday', k, label });

export const FREQ = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often', 'Always'];
const SENSES = (ex) => [['sight', 'Sight', ex[0]], ['sound', 'Hearing', ex[1]], ['touch', 'Touch', ex[2]], ['smell', 'Smell', ex[3]], ['taste', 'Taste', ex[4]]];
const SENSATIONS = ['Activated', 'Agitated', 'Blank', 'Breathless', 'Buzzing', 'Calm', 'Choked up', 'Churning', 'Clammy', 'Clenched', 'Dizzy', 'Drained', 'Empty', 'Energetic', 'Exhausted', 'Foggy', 'Frozen', 'Heavy', 'Hollow', 'Hot', 'Jumpy', 'Light', 'Nauseous', 'Numb', 'Peaceful', 'Pounding', 'Prickly', 'Restless', 'Shaky', 'Sinking', 'Sluggish', 'Soft', 'Sparkly', 'Sweaty', 'Teary', 'Tense', 'Tight', 'Tingly', 'Trembly', 'Twitchy', 'Warm', 'Weary'];
export const DOMAINS = ['Connecting with others', 'Parenting', 'Time alone', 'Helping others and advocacy', 'Work and achievement', 'Learning', 'Creativity', 'Physical and mental wellbeing', 'Community', 'Home', 'Spirituality and faith', 'Personal growth'];
export const QUALITIES = ['Accepting', 'Adventurous', 'Approachable', 'Assertive', 'Attentive', 'Authentic', 'Bold', 'Calm', 'Caring', 'Compassionate', 'Consistent', 'Courageous', 'Creative', 'Curious', 'Determined', 'Encouraging', 'Energetic', 'Enthusiastic', 'Fair', 'Focused', 'Forgiving', 'Free', 'Friendly', 'Fun', 'Funny', 'Generous', 'Gentle', 'Grateful', 'Helpful', 'Honest', 'Imaginative', 'Independent', 'Intuitive', 'Joyful', 'Kind', 'Knowledgeable', 'Loving', 'Loyal', 'Nonjudgemental', 'Nurturing', 'Open', 'Organised', 'Passionate', 'Patient', 'Peaceful', 'Persistent', 'Playful', 'Practical', 'Present', 'Reliable', 'Respectful', 'Responsible', 'Spontaneous', 'Steady', 'Strong', 'Supportive', 'Thorough', 'Thoughtful', 'Trusting', 'Understanding', 'Warm', 'Welcoming', 'Wise', 'Witty'];
const Q = { lesson: 'wb-qualities', k: 'q' };

export const HELP = {
  title: 'If you need someone now',
  lines: ['Lifeline: call 13 11 14, or text 0477 13 11 14', 'Beyond Blue: 1300 22 4636', 'Emergency: 000'],
  note: 'These are Australian numbers. Elsewhere, call your local emergency number.',
};

export const NEEDS = [
  ['overwhelmed', 'Close to a meltdown'],
  ['burnt', 'Running on empty'],
  ['low', 'Harsh with myself'],
  ['stuck', "Can't get started"],
  ['convo', 'Before a hard conversation'],
  ['joy', 'I want some joy'],
];

export const MODULES = [
  // ================================================================ 00
  {
    id: 'begin', no: '00', name: 'Start here', skill: 'How this works', pages: '1-7',
    intro: "What this workbook is, the two therapies it draws on, and how to work through it without making it another thing to get perfect.",
    lessons: [
      L({ id: 'wb-start', title: 'What this is', short: 'The book, the idea, the approach', pg: '1-6',
        body: [
          "This section follows The Neurodivergence Skills Workbook for Autism and ADHD by Jennifer Kemp and Monique Mitchelson. They're both psychologists, and they both found out as adults that they're Autistic. The modules here follow the book's chapters, and every exercise is something you can tap or type into. Page numbers point back to the book if you want the authors' full telling, with their stories and the research.",
          "The main idea is simple to say and slow to learn. Many of us have spent years being corrected. Do it properly, try harder, stop being so sensitive. Over time those corrections become the voice in our own heads. The work is to swap that voice for a kinder one, and to build a life shaped around how you actually work.",
          "The book draws on two therapies. Compassion-focused therapy (CFT) helps you meet your own pain with warmth instead of attack. Acceptance and commitment therapy (ACT) helps you make room for hard feelings and still move toward what matters. If you've done the ACT course in the Toolkit, some of this will feel familiar.",
          "Autism and ADHD overlap a lot, in their genetics and in daily life. The book mostly leaves it to you to decide what applies. Take what fits and leave the rest. You don't need a formal diagnosis to belong here.",
        ] }),
      L({ id: 'wb-how', title: 'How to work through it', short: 'Your pace, your way', pg: '6-7', mins: 3,
        body: [
          "The authors suggest doing chapters 1 to 3 first. They're the foundation, and chapter 3 is about burnout, which makes everything else harder. After that, go wherever you're drawn.",
          "Plan to come back more than once. Each time through you'll see something new. There's no prize for doing it properly, and if an exercise is bogging you down, skip it and come back later.",
          "Answer in whatever way suits your brain. One word is fine. Dot points are fine. Everything saves on this phone as you type.",
        ],
        items: [
          chips('ways', 'How I like to work through things', ['Writing it out', 'Dot points', 'A few words', 'Voice notes first', 'Drawing or mind maps', 'Talking it through', 'Moving while I think']),
          one('pace', 'A pace that feels doable', ['A lesson a day', 'A few a week', 'One a week', 'Whenever I feel like it']),
          line('who', 'Someone who might do this with me, or hear about it', 'A friend, partner, therapist, or nobody for now'),
          text('hope', "What I'm hoping for from this", 'A sentence is plenty'),
        ] }),
      L({ id: 'wb-care', title: 'If it gets heavy', short: 'Looking after yourself as you go', pg: '7', mins: 2, help: true,
        body: [
          "Some of this will stir up old memories. Looking back at your life through a neurodivergent lens often brings relief and grief together. That's normal, and it's a good reason to go slowly.",
          "When it gets heavy, stop and do something soothing. Come back another day. If you see a therapist, you could bring this along to sessions. If you're not coping, please reach out to someone today.",
        ],
        items: [text('support', "People and things that help when I'm wobbly", 'Names, places, a playlist, your pet')] }),
    ],
  },

  // ================================================================ 01
  {
    id: 'know', no: '01', name: 'Know yourself', skill: 'Your spiky profile', pages: '8-29',
    intro: "A kinder and more accurate map of how your brain works. Six areas where neurodivergent people process the world differently, and the strengths that come with them.",
    lessons: [
      L({ id: 'wb-six', fig: 'spiky', title: 'A spiky profile', short: 'Six differences, not a list of faults', pg: '8-9', mins: 3,
        body: [
          "Being neurodivergent is complicated. Most of us have a spiky profile. Some things come easily, even brilliantly. Others are far harder than anyone expects, and the world rarely makes room for that.",
          "The criteria used to diagnose Autism and ADHD were built mostly from studies of white boys. People who learned to hide their differences, or who don't match that picture, often got missed. That includes many women, trans and nonbinary people, First Nations people and people of colour.",
          "The book looks at six areas where our brains tend to work differently: interests, executive functioning, the senses, emotions, social expectations and communication. This module walks through each one. Notice what rings true, and skip what doesn't.",
          "People often picture the spectrum as a line from mild to severe. Many Autistic people prefer to picture it as a wheel, as in Rebecca Burgess's comic about the spectrum. Each trait sits at its own point, and the shape is different for everyone. Map yours below, and come back to it after the module.",
        ],
        items: [
          radial('spectrum', 'My spectrum wheel', {
            hub: 'me', levels: 5,
            cap: 'Tap a ring on each slice. Near the centre means close to typical for that trait. Near the edge means very different from typical, whether that shows up as a strength, a struggle or both.',
            axes: [['Interests', 'Interests'], ['Executive function', 'Executive'], ['Senses', 'Senses'], ['Body signals', 'Body signals'], ['Emotions', 'Emotions'], ['Social rules', 'Social'], ['Communication', 'Talking'], ['Movement and coordination', 'Movement']],
          }),
          text('notice', 'What I notice about my shape'),
        ] }),
      L({ id: 'wb-interests', fig: 'beams', title: 'Spins and hyperfocus', short: 'A life organised around interests', pg: '9-11',
        body: [
          "For most of us, life organises itself around interests. Something either grabs us completely or barely registers.",
          "Many Autistic people have a monotropic attention style: a narrow, deep beam that stays on a few big interests, sometimes for a lifetime. The community calls these spins. Being dragged out of one can feel physically painful.",
          "ADHDers often have scattered attention until something lights up. Then hyperfocus kicks in and hours vanish, along with meals and toilet breaks. These hyperfixations can fade as suddenly as they arrived, which gets expensive if you've just bought all the gear.",
        ],
        items: [
          chips('feel', "How I feel when I'm absorbed in an interest", ['Absorbed', 'Calm', 'Curious', 'Energised', 'Excited', 'Focused', 'Joyful', 'Motivated', 'Soothed']),
          text('spins', "Interests I've had for a long time"),
          text('fixes', 'Interests that burned bright and faded'),
          text('judged', 'Interests or collections people have called weird or a waste of time', "And what you'd say back now, if you like"),
        ] }),
      L({ id: 'wb-ef', fig: 'exec', title: 'Executive functioning', short: "Your brain's management team", pg: '11-16', mins: 7,
        body: [
          "Executive functions are your brain's management team. They get you started and help you switch. They plan, hold information in mind and keep track of time. They put the brakes on urges, check how you're going and help you adapt when plans change. Regulating emotions is one of their jobs too.",
          "These get overloaded easily, especially for ADHDers. Plenty of us cover the gaps for years with clever systems, last-minute adrenaline and a lot of anxiety. Then life gets bigger and the patches stop holding. It was never a character flaw.",
          "Tick whatever you recognise. There are a lot of boxes, so go quickly.",
        ],
        items: [
          check('ef', 'What I find hard', [
            ['Starting and switching', ['Leaving things to the last minute, or not doing them', 'Boring jobs like bills and chores', 'Stopping one thing to start another', 'Getting back into something after an interruption', 'Feeling irritated when I have to stop', 'Needing to finish the episode, chapter or level first', 'Juggling several tasks at once']],
            ['Planning and organising', ['Deciding what to do first', 'Losing things', 'Keeping my space tidy', 'Using a calendar consistently', 'Planning events or projects', 'Needing lots of information and time to decide']],
            ['Working memory', ["Forgetting things I don't do straight away", 'Losing my place in multi-step tasks', 'Forgetting names the moment I hear them', 'Following a conversation with several people', 'Working on more than one thing at once']],
            ['Attention', ["Listening when there's background noise", 'Starting lots, finishing few', 'Finishing assignments and projects', 'Drifting off in lectures, films or books', 'Missing or mishearing details', 'Zoning out into my thoughts']],
            ['Time', ['Being on time', 'Guessing how long things take', 'Spending too long on one thing and running out of time for others', 'Planning for the future']],
            ['Impulses', ['Acting without thinking about later', 'Spending big on new interests or online shopping', 'Jumping into conversations', "Finishing other people's sentences", 'Waiting in queues', 'Losing patience, or speeding', 'Resisting urges like bingeing or gambling']],
            ['Self-monitoring', ['Getting my volume right', 'Timing when I speak', "Noticing I've upset someone", "Keeping track of how far through a task I am", 'Checking my work for errors', "Catching habits while I'm doing them"]],
            ['Flexibility', ['Getting stuck on one line of thinking', 'Knowing when to stop talking', 'Needing to finish something that no longer matters', 'Unexpected changes', 'Changing plans to fit the situation', 'Seeing the big picture past the details', "Seeing things from someone else's side"]],
          ]),
          rank('top', 'My top three areas of difficulty (tap in order)', ['Starting and switching', 'Planning and organising', 'Working memory', 'Attention', 'Time', 'Impulses', 'Self-monitoring', 'Flexibility']),
          list('cost', 'Three long-term ways this has cost me', 3),
          text('media', 'Memes or videos that nailed it for me', 'Try searching "executive dysfunction" on TikTok or YouTube'),
        ] }),
      L({ id: 'wb-senses', title: "When it's too much", short: 'Sensory sensitivities', pg: '16-17',
        body: [
          "At least nine in ten Autistic people, and most ADHDers, process sensory information differently. You might be more sensitive to some things and less to others. That mix is your sensory profile.",
          "When something is too intense, it can leave you upset or overwhelmed. Avoiding it makes complete sense. That's called sensory avoidance. When a sense is muted, you might go looking for more of it. That's sensory seeking, and the next lesson looks at it.",
        ],
        items: [
          sensemap('map', 'My sensory profile', ['Sight', 'Hearing', 'Touch', 'Smell', 'Taste', 'Inside', 'Balance']),
          table('hyper', "What's too much for me", SENSES(['e.g. clutter, crowds, bright or flickering light', 'e.g. sirens, repetitive noise, certain music', 'e.g. hugs, clothing labels, tight shoes, sand', 'e.g. perfume, some food smells', 'e.g. strong flavours, certain textures'])),
          freq('freq', 'How often do I have distressing sensory experiences?'),
          text('avoid', 'Places, people or situations I avoid because of this'),
        ] }),
      L({ id: 'wb-seeking', title: "When it's not enough", short: 'Sensory seeking', pg: '18-19',
        body: [
          "With other senses you might need things turned right up before you notice them. You might not realise you're uncomfortable until you're already overwhelmed and cranky, and you can't work out why.",
          "You might also go looking for intensity: loud music, firm hugs, crunchy food, chilli, a podcast on while you work. That's sensory seeking, and it's a way of getting what your nervous system needs.",
        ],
        items: [
          table('hypo', "What I don't notice until it's strong", SENSES(['e.g. faces, street signs, mess that needs cleaning', 'e.g. someone calling my name', "e.g. shoes that are too tight", 'e.g. something burning, body odour', 'e.g. food tastes bland, so I add salt or chilli'])),
          freq('freq', 'How often do I add extra intensity to feel calm or focused?'),
          text('seek', 'What I seek out because I love the intensity'),
        ] }),
      L({ id: 'wb-inside', title: 'Your inside senses', short: 'Balance, movement and interoception', pg: '19-20',
        body: [
          "Three senses tell you where your body is in space and keep you balanced. Many Autistic people get less information from these, which can show up as clumsiness or trouble with coordination.",
          "Interoception is how you feel what's going on inside you: heartbeat, hunger, thirst, needing the toilet, tiredness, pain, emotions. About three in four Autistic people find these signals hard to read. You might not notice hunger until you're starving. Or you might feel every tiny change so loudly that it's distressing.",
          "Knowing your pattern is useful. Later modules show how to use your senses to settle yourself or lift yourself up.",
        ],
        items: [
          freq('coord', 'How often do I have trouble with coordination or balance?'),
          scales('intero', 'How strongly I feel these', 'Barely', 'Very strongly', ['Heartbeat', 'Breathing', 'Hunger', 'Thirst', 'Feeling full', 'Heat', 'Cold', 'Pain', 'Nausea', 'Itch', 'Needing the toilet', 'Tickle', 'Emotions', 'Tiredness']),
        ] }),
      L({ id: 'wb-emotions', fig: 'emoskills', title: 'Emotions', short: 'Noticing, naming, settling', pg: '20-23', help: true,
        body: [
          "Handling an emotion takes three skills: noticing the sensations in your body, working out which emotion it is, and settling it. Difficulty with the first two is called alexithymia.",
          "Some people barely feel the signals. They seem calm, then suddenly they're furious or in pieces, and nobody saw it coming, including them. Others feel huge surges but can't tell what they mean, which is frightening. They might work it out hours later, with logic.",
          "None of this is a personal failing. Regulating emotions is a skill, and module 4 is all about building it.",
        ],
        items: [
          scale('notice', 'How much I notice emotion in my body', 'Even small upsets', "Only when I'm distraught"),
          freq('label', 'How often do I struggle to name what I feel?'),
          freq('logic', 'How often do I use logic to work out how I feel?'),
          freq('lag', 'How often is there a delay before I know how I feel?'),
          check('hard', 'What I recognise', ['Moods that change fast, sometimes bigger than the moment', 'Getting stuck in a feeling for a long time', 'Finding it hard to calm down', 'Meltdowns', "Shutdowns, where I go quiet and can't speak", 'Habits like skin-picking, hair-pulling or using substances to cope']),
          freq('calm', 'How often is it hard to calm myself when upset?'),
          text('ways', 'Unhelpful ways I sometimes respond to big feelings', "Snapping at people, scrolling for hours, whatever's true"),
        ] }),
      L({ id: 'wb-social', title: 'Fairness and social rules', short: 'A culture with its own logic', pg: '23-25',
        body: [
          "A lot of mainstream social rules run on hierarchy: who's closer to whom, who's senior, who you want to impress. Neurodivergent people tend to run on fairness, honesty and consistency instead. It can feel like everyone else got the rulebook and your copy is missing pages.",
          "Our way of doing things is a real culture with its own logic. It also gets us labelled difficult, or the black sheep, more often than we deserve.",
        ],
        items: [
          check('prefs', 'What sounds like me', [
            ['Honesty and depth', ["Answering honestly about myself, even when it doesn't flatter me", 'Telling people when something is broken or could be better', 'Giving long, thoughtful answers to personal questions']],
            ['Fairness and justice', ['Speaking up when a plan could hurt someone', 'Backing people who are disadvantaged', 'Caring about animal rights', 'Giving time or money without needing credit']],
            ['Consistency', ['Expecting people to do what they said', 'Following through, even when things have changed', 'Feeling thrown by changes nobody agreed to']],
            ['Rules that make sense', ['Refusing rules that are unfair or illogical', 'Asking why a decision was made']],
          ]),
          text('clash', 'A time my way of doing things clashed with the expected rules', 'What happened, and which rules was I following?'),
        ] }),
      L({ id: 'wb-talk', fig: 'empathy', title: 'How you communicate', short: 'The double empathy problem', pg: '25-26',
        body: [
          "For years people assumed neurodivergent people were bad at communicating. Research now shows two neurodivergent people understand each other about as well as two neurotypical people do. The breakdowns happen between the two styles. It's called the double empathy problem, and it means the work belongs to both sides.",
          "For each pair, tap the one that sounds more like you. Tap both if both fit.",
        ],
        items: [
          pair('style', 'Which sounds like me?', [
            ['I take words literally. Idioms and sarcasm can trip me up.', 'I read between the lines and pick up sarcasm easily.'],
            ['Small talk bores or drains me. I want to get into it.', 'Small talk is a comfortable way to connect.'],
            ['I mostly go by the words people say.', 'I go by tone, faces and body language as well.'],
            ['I love deep detail and sharing everything I know.', 'I give enough to get the point across.'],
            ["I talk fast when I'm excited.", 'I talk at about the same pace most of the time.'],
            ['I say exactly what I mean. Leaving bits out feels like lying.', 'I soften things or hint, to keep the peace.'],
            ['I show I understand by sharing a similar story of my own.', 'I show I understand by asking about theirs.'],
            ['Once I trust someone, I share a lot, quickly.', 'I keep personal things for close people.'],
            ['I need to finish the story, even after an interruption.', "I'm fine dropping a story when the topic moves on."],
            ["I can lose my words when I'm stressed or burnt out.", "I can usually speak, whatever's going on."],
          ]),
          text('mixups', 'Where my style has led to mix-ups'),
        ] }),
      L({ id: 'wb-strengths', title: 'Your strengths', short: 'What your brain is good at', pg: '26-29', mins: 6,
        body: [
          "Most public talk about neurodivergence is about deficits. You still have real strengths, and many of them come straight from how your brain works. Seeing them clearly can point you toward hobbies, work and people that suit you.",
          "Tick what fits, and add your own.",
        ],
        items: [
          check('str', 'Strengths I have', [
            ['Processing information', ['Attention to detail', 'Sorting and classifying', 'Remembering a lot about my interests', 'Spotting tiny flaws', 'Fine senses for taste, smell or texture', 'Musical memory or pitch', 'Thinking in 3D', 'Staying clear-headed in a crisis']],
            ['Systems', ['Seeing patterns', 'Building systems that make sense', 'Solving problems', 'Organising information', "Seeing what's broken in a system and how to fix it", 'Big-picture strategy']],
            ['Creativity', ['Breaking from convention', 'Original ideas', 'Linking ideas from unrelated fields', 'Thinking in concepts']],
            ['Justice', ['Wanting to help', 'Loyalty and honesty', 'A strong sense of fairness', 'Following fair rules', 'Caring about human and animal rights']],
            ['Energy', ['Taking the initiative', 'Passion and enthusiasm', 'Willing to take risks', 'Intense curiosity', 'Spontaneity', 'Open to new ideas', 'Quick to adapt', 'Outgoing', 'Playful']],
            ['Learning and work', ['Deep expertise', 'Teaching myself, learning by doing', 'Hyperfocus', 'Bursts of huge productivity', 'Perseverance', 'Consistency', 'Thoroughness']],
          ]),
          blanks('top', 'The three strengths I value most in myself', 3),
          text('where', 'Where in my life I use them most'),
          note("If this was hard, that's information too. Most of us have had far more practice at criticism than praise. Come back and add to it whenever you notice something."),
        ] }),
    ],
  },

  // ================================================================ 02
  {
    id: 'accept', no: '02', name: 'Self-acceptance', skill: "In a world that doesn't fully accept you", pages: '30-51',
    intro: "Being different in a world that wants sameness has a cost. Here's what it does to your nervous system, and the first steps toward meeting yourself kindly.",
    lessons: [
      L({ id: 'wb-micro', title: 'Small comments, big weight', short: 'Microaggressions', pg: '30-33',
        body: [
          "Neurodivergent people hear a lot of small, dismissive comments. \"Everyone's a bit like that.\" \"You can't be, you went to uni.\" \"It's just trendy now.\" They can sound harmless, even reassuring. Underneath, they say that being neurodivergent is something shameful and you should want to be normal.",
          "Hear that often enough and you start saying it to yourself.",
        ],
        items: [
          text('heard', 'Things people have said that dismissed me'),
          chips('felt', 'How they left me feeling', ['Angry', 'Ashamed', 'Confused', 'Doubting myself', 'Embarrassed', 'Frustrated', 'Hurt', 'Invisible', 'Lonely', 'Tired']),
          text('reply', "What I wish I'd said, or would say now"),
        ] }),
      L({ id: 'wb-identity', title: 'All of who you are', short: 'Intersectionality', pg: '33-36',
        body: [
          "Your neurodivergence sits alongside everything else about you: gender, sexuality, culture, body, class, age, faith. Each one shapes how the world treats you. Some bring privilege and some bring extra hurdles, and they stack together in ways that are hard to see from outside. That's intersectionality.",
          "A well-known way to picture this is a wheel of power and privilege, based on a graphic by Sylvia Duckworth. Each slice is part of identity. The closer to the centre, the closer to the power our society hands out. The further out, the more you're pushed to the margins. Most people sit near the centre on some slices and near the edge on others.",
          "This stays on your phone. Skip any slice you'd rather not mark, or that doesn't fit how you see yourself.",
        ],
        items: [
          radial('wheel', 'Where I sit', {
            hub: 'power', levels: 3,
            cap: 'Tap a ring on each slice, or use the buttons below. The inner ring is closest to power and the outer ring is the margins. The shape shows where life has been easier for you and where it has been harder.',
            axes: [
              ['Neurotype', 'Neurotype', ['Neurotypical', 'ND, often unseen', 'ND, visible']],
              ['Disability', 'Disability', ['None', 'Some', 'Significant']],
              ['Mental health', 'Mind', ['Steady', 'Up and down', 'Struggling']],
              ['Body', 'Body', ['Fits norms', 'In between', 'Outside norms']],
              ['Gender', 'Gender', ['Cis man', 'Cis woman', 'Trans or nonbinary']],
              ['Sexuality', 'Sexuality', ['Straight', 'Gay or lesbian', 'Bi, pan, ace, queer']],
              ['Skin colour', 'Skin', ['White', 'Lighter', 'Darker']],
              ['Citizenship', 'Citizenship', ['Citizen', 'Resident', 'Visa or none']],
              ['English', 'English', ['First language', 'Second language', 'Still learning']],
              ['Money', 'Money', ['Comfortable', 'Getting by', 'Struggling']],
              ['Education', 'Education', ['Uni', 'School', 'Little formal']],
              ['Where I live', 'Place', ['City', 'Regional', 'Remote']],
            ],
          }),
          text('ids', 'The parts of my identity that shape my life most', 'In your own words'),
          text('how', 'How that mix has shaped my experience'),
        ] }),
      L({ id: 'wb-ableism', title: 'The critic you were handed', short: 'Internalised ableism', pg: '36-38', mins: 6,
        body: [
          "Our social standards are built around what suits most people. How disabled you are depends a lot on the fit between those expectations and your spiky profile. When the fit is good, you thrive. When it isn't, you struggle, however hard you try.",
          "When you take those outside standards on as your own, that's internalised ableism. It sounds like a fault-finding machine that marks how well you're performing normal. The list of things it can pick on never ends.",
          "Write down what the critic says first. Then try the other voice.",
        ],
        items: [
          line('should', 'I should be able to…'),
          line('proper', 'A proper adult would…'),
          line('problem', 'The problem with me is…'),
          text('impact', 'What this voice has done to my confidence and mood'),
          note("Now the other voice. Self-compassion starts from realistic expectations. It names what's hard, looks for help, and remembers what you're good at."),
          line('good', "I'm good at…"),
          line('hard', 'Something I find difficult is…'),
          line('help', 'I need help with…'),
          line('over', 'A challenge I can get through is…'),
          text('could', 'What might change if I spoke to myself like this more often'),
        ] }),
      L({ id: 'wb-systems', fig: 'systems', figAfter: true, title: 'Threat, drive and soothing', short: 'Three old systems in a modern world', pg: '38-40',
        body: [
          "Your brain still runs three ancient systems. The threat system keeps you safe with instant reactions: fight, flight, freeze, flop or fawn. It can't tell a real danger from a memory or a worry, so it fires at all of them.",
          "The drive system sends you after goals and resources. It feels good, and it can tip into constant striving.",
          "The soothing system lets you rest and connect. If you grew up around criticism or rejection, it may not have had much chance to develop. That's part of why kindness toward yourself can feel strange, or even wrong.",
          "Compassion uses the same skills you'd use with a tiny frightened animal: noticing the distress, wanting to help, and staying with the discomfort of caring. The practice after this one has you try it.",
        ],
        items: [
          scales('sys', 'How active each system has been for me lately', 'Quiet', 'Running hot', ['Threat: on guard, anxious, defensive', 'Drive: striving, wanting, chasing', 'Soothing: rested, safe, connected']),
          text('notice', 'What I notice about the balance'),
        ] }),
      L({ id: 'wb-small', title: 'Holding something small', short: 'Finding your compassion skills', pg: '39-40', mins: 4, stepSecs: 20, needs: ['low'],
        body: ["A short imagining. You'll notice the care you already know how to give, then turn it gently toward yourself."],
        steps: [
          'Get comfortable. Let your breathing slow a little.',
          'Imagine you find a tiny animal that has fallen from its nest. A baby bird, or whatever comes to mind.',
          "It's frightened and very fragile. Picture it in your cupped hands.",
          'Notice how carefully you hold it. Notice the urge to keep it safe.',
          "You might feel a little worried about hurting it by accident. That's part of caring too.",
          'Notice any warmth in your chest, hands or face.',
          "These are compassion skills: noticing suffering, wanting to help, and staying with the discomfort. You already have them.",
          'Now imagine turning a little of that same care toward yourself.',
          "Just a little. If it feels odd, that's fine.",
          'Take a slow breath and come back.',
        ],
        items: [text('felt', 'What I noticed, especially when I turned the care toward myself')] }),
      L({ id: 'wb-rejection', title: 'Rejection sensitivity', short: 'When rejection lands like a blow', pg: '40',
        body: [
          "After a lifetime of misunderstandings and criticism, rejection can land like a physical blow. Being left out or criticised can hurt fast and hard, and the hurt hangs around. Some people call it rejection sensitive dysphoria. It suggests your nervous system has learned to treat rejection as danger.",
          "To stay safe, many of us learn three moves: hiding who we are, keeping everyone happy, and pulling away. The next three lessons look at each of them.",
        ],
        items: [
          scale('rsd', 'How intensely I feel rejection', 'It passes quickly', 'It floors me'),
          text('recent', 'A recent moment it showed up'),
        ] }),
      L({ id: 'wb-masking', fig: 'masking', title: 'Hiding: masking', short: 'Suppressing, camouflaging, compensating', pg: '40-42',
        body: [
          "Masking means hiding your differences to fit in. It comes in three main forms.",
          "Suppressing is keeping things under wraps: your opinions, your needs, your stims, your enthusiasm, your laugh. Camouflaging is copying other people or playing a more likeable role. Compensating is working hard to cover differences: forcing eye contact, rationing how much you talk, putting on expressions, acting interested.",
          "It started as protection, and it often worked. Over time it can become so automatic that you forget you're doing it.",
        ],
        items: [
          freq('supp', 'How often do I suppress my natural behaviour?'),
          freq('cam', 'How often do I copy others or act a part so people like me?'),
          freq('comp', 'How often do I change my behaviour to cover my differences?'),
          scale('auto', 'How automatic masking has become', 'I choose it', "It's on autopilot"),
        ] }),
      L({ id: 'wb-pleasing', title: 'Keeping everyone happy', short: 'People-pleasing', pg: '43-44',
        body: [
          "People-pleasing is masking's close cousin. If everyone's happy, maybe nobody will reject you. It works in the short term. It also teaches people that your needs don't count, and it's one of the fastest roads to burnout.",
        ],
        items: [
          check('pp', 'What I do', ["Agreeing to things I don't want to do", 'Feeling guilty or anxious saying no, even to unfair requests', "Acting enthusiastic when I'm not", 'Going along with plans without thinking', 'Being the peacekeeper', 'Trying to keep everyone in a good mood', 'Doing things to earn approval or be needed', 'Being who I think people want', "Apologising for things that weren't my fault"]),
          text('cost', 'What people-pleasing has cost me', 'Time, energy, health, relationships'),
        ] }),
      L({ id: 'wb-withdraw', title: 'Pulling away', short: 'Withdrawing to stay safe', pg: '44-45', mins: 3,
        body: [
          "The third move is withdrawing: avoiding people and situations so you can't get hurt. It protects you. It can also leave you lonely, and more convinced that people don't want you around.",
        ],
        items: [
          freq('freq', "How often do I pull away from people so I can't be rejected?"),
          text('where', 'Where I tend to pull back'),
          text('miss', 'What I miss out on when I do'),
        ] }),
      L({ id: 'wb-language', title: 'Words that respect you', short: 'Affirming language', pg: '45-49', mins: 5,
        body: [
          "The words used about us shape how we see ourselves. Many people in the community now use identity-first language: Autistic person, ADHDer. For lots of us that's an act of self-acceptance. It says this is part of who I am, not something to hide or fix. Person-first language, like \"a person with ADHD\", is a valid choice too. It's your call.",
          "Labels like high-functioning and low-functioning, or phrases like \"suffers from\", tend to make people feel smaller. Swapping them for more accurate words can change how you feel about yourself. When you're talking about others, ask what they prefer.",
        ],
        items: [
          chips('heard', 'Words people have used about me or my family', ['Disorder', 'Deficit', 'High-functioning', 'Low-functioning', 'Mild', 'Severe', 'Suffers from', 'Special needs', 'Lazy', 'Difficult', 'Too much', 'Weird']),
          chips('felt', 'How those words feel', ['Angry', 'Ashamed', 'Broken', 'Defensive', 'Embarrassed', 'Frustrated', 'Hurt', 'Invalidated', 'Numb', 'Small']),
          rows('swap', "What I used to say, and what I'll say instead", [['old', 'What I used to say', 'e.g. I have a disorder'], ['new', "What I'll say instead", "e.g. I'm Autistic"]], { min: 3 }),
          text('shift', 'How affirming words might change the way I see myself'),
        ] }),
    ],
  },

  // ================================================================ 03
  {
    id: 'burnout', no: '03', name: 'Burnout', skill: 'From burnout to living well', pages: '52-81',
    intro: "Burnout touches almost every neurodivergent adult the authors work with. Learn to spot it early and recover kindly. Do this one soon, because it makes everything else easier.",
    lessons: [
      L({ id: 'wb-burnout', fig: 'cycle', title: 'Am I in burnout?', short: 'The signs, past and present', pg: '52-56', mins: 6, help: true,
        body: [
          "Neurodivergent burnout isn't the same as the work kind. It hits everything at once. Your senses get louder, people get harder, tasks feel impossible, your interests go flat and your health slides. It can last months, and it often gets mistaken for depression.",
          "Tick anything you've ever felt. Tap again to add a star if it's happened in the last week.",
        ],
        items: [
          check('signs', 'Burnout signs', [
            ['Senses', ['Noise, light and crowds feel more intense', 'Pain, headaches and fatigue feel louder']],
            ['People', ["Can't mask or perform like usual", 'More blunt or irritable', "Overwhelmed by what people ask of me", 'Needing to avoid people', 'Losing my words']],
            ['Getting things done', ['Everyday tasks feel overwhelming', 'More forgetful and distracted', 'Harder to prioritise and organise', 'Blurting things I regret']],
            ['Interests and skills', ['Losing skills I usually have', 'Things I love stop feeling good']],
            ['Mood and mental health', ['Emotionally raw', 'More meltdowns or shutdowns', 'Feeling like a failure', 'More picking, pulling, biting or bingeing', 'More urges to self-harm', 'More thoughts of suicide']],
          ], { star: 'in the last week' }),
          note("Lots of ticks suggests you've been through burnout. Lots of stars suggests you're in it now. If the last two items are starred, please talk to someone today."),
          freq('acute', 'How often do I have short, sharp burnouts?'),
          freq('recur', 'How often does the same stressor burn me out again?'),
          line('since', "If I'm in long-term burnout, roughly when it started"),
        ] }),
      L({ id: 'wb-impact', title: 'What burnout costs', short: 'Seeing where it reaches', pg: '56-58', mins: 6,
        body: ["Burnout reaches into every corner of life. Seeing exactly where can help you take it seriously, and explain it to the people around you."],
        items: [
          scales('imp', 'How much burnout affects each of these', 'No impact', 'Big impact', ['Housework', 'Bills and paperwork', 'Grocery shopping', 'Showering and teeth', 'Exercise', 'Eating well', 'Study', 'Work', 'Seeing friends', 'Relationships', 'Getting health care', 'Holidays', 'Hobbies']),
          blanks('worst', 'The three hardest things to do in burnout', 3),
          text('long', 'The long-term impact on my life'),
          text('dx', "Diagnoses I've had that burnout might partly explain", 'Many people were told depression or anxiety'),
          text('stories', "What stood out from other people's burnout stories", 'Try podcasts or videos by neurodivergent creators'),
          note('If it feels right, share what you learn with someone close. It helps them understand what you need.'),
        ] }),
      L({ id: 'wb-causes', title: 'What brings it on', short: 'Transitions and stressors', pg: '59-61', mins: 5,
        body: [
          "Burnout often lands at a big life transition, when expectations jump and support drops away. Starting high school, leaving home, a promotion, becoming a parent and perimenopause are all common times.",
          "Plenty of people hit their first big burnout in midlife, when work, kids, ageing parents and bills all pile up at once. You can't recover while the load keeps growing, so naming the causes matters.",
        ],
        items: [
          check('trans', 'Transitions that have burnt me out', ['Starting primary school', 'Starting high school', 'Finishing school', 'Uni or TAFE', 'Starting work', 'A promotion', 'Leaving home', 'Moving house, city or country', 'Partnering or marriage', 'Having kids', 'Working and parenting at once', 'A breakup', 'Getting older', 'Perimenopause or menopause']),
          check('factors', 'What feeds my burnout', ['Masking and hiding my struggles', 'People-pleasing and weak boundaries', 'Caring for others, especially with high needs', 'No support, empathy or adjustments', 'Discrimination, bullying, trauma or exclusion', 'Conflict or a relationship ending', 'Sensory overload', 'Boredom and too little stimulation', 'Pressure to meet unrealistic standards', 'My own perfectionism', 'Poor health, pain or sleep', 'Loneliness or mental health struggles', 'Money, housing or work stress, including underemployment', 'Sudden life changes or health shocks', 'Too many projects at once', 'Too much work'], { star: 'one of my top five right now' }),
        ] }),
      L({ id: 'wb-body-words', title: 'Words for your body', short: 'A sensation vocabulary', pg: '61-62', mins: 2,
        body: [
          "Recovery starts with catching burnout early, and the first signs usually show up in your body. If interoception is hard for you, a list of sensation words gives you something to reach for.",
        ],
        items: [chips('mine', 'Sensations I often notice', SENSATIONS)] }),
      L({ id: 'wb-body-now', title: 'Checking in with your body', short: 'A slow scan, then something soothing', pg: '62-64', mins: 6, stepSecs: 25, needs: ['overwhelmed', 'burnt'],
        body: ['A slow scan down through your body, then something soothing. Move whenever you need to. Rocking or tapping is welcome.'],
        steps: [
          'Get comfortable, sitting or lying down. Close your eyes or soften your gaze.',
          'Take a few long, slow breaths.',
          'Notice your feet. Temperature, pressure, tingling. Just notice.',
          'Move up through your legs. Heavy or light? Tense or loose?',
          "Now your belly and back. What's there?",
          'Your chest and breathing. Is anything tight or quick?',
          'Shoulders, arms and hands. Let them be as they are.',
          'Neck, jaw, face and scalp. Notice without fixing.',
          'If you find pain, say so out loud. Breathe gently around it.',
          'Does your body want to move? Rock, sway, wriggle, tap, or stroke something soft.',
          'Notice what happens to any discomfort as you move.',
          'Thank yourself for doing this. A few more slow breaths, and come back.',
        ],
        items: [
          { t: 'pins', k: 'map', label: 'Where I noticed things', image: 'body', tags: ['Tense', 'Tight', 'Warm', 'Heavy', 'Tingly', 'Sore', 'Numb', 'Buzzing', 'Calm'], cap: 'Tap the body wherever you noticed something, then name it underneath.' },
          chips('felt', 'What I noticed', ['Calm', 'Heavy', 'Light', 'Tense', 'Tight', 'Tingly', 'Warm', 'Restless', 'Sore', 'Soft', 'Numb', 'Tired']),
          text('where', 'Where in my body, and what helped'),
        ] }),
      L({ id: 'wb-early', title: 'Early warning signs', short: "Your body's first clues", pg: '64-65', mins: 5,
        body: ["Think back to a recent time that drained you so badly it took ages to recover. Go slowly and look for clues. You don't need to relive it."],
        items: [
          text('what', 'What happened'),
          text('before', 'What I felt in my body beforehand'),
          text('during', 'What I felt during'),
          text('after', 'What I felt afterwards'),
          chips('signs', 'My early warning signs', SENSATIONS),
          note("Over the next few weeks, watch for these. They're your cue to slow down."),
        ] }),
      L({ id: 'wb-recover', title: 'Recovering kindly', short: 'Rest and small sensory changes', pg: '65-67', mins: 5,
        body: [
          "When you notice burnout starting, get out of the situation as soon as you can. Rest, and reach for whatever settles you.",
          "Sensory stress is a huge part of burnout, so small changes to your surroundings add up. Being kind to yourself like this might feel unfamiliar. Notice the hesitation and do it anyway.",
        ],
        items: [
          check('str', 'Ways I could recover', ['Time in a quiet, dark room', 'Noise-cancelling headphones or earplugs', 'A simple daily routine', 'Clearing visual clutter', 'Safe foods, easy food or takeaway', 'Loose, comfy clothes', 'Blankets, weight or snug clothing', 'Games, shows or music', 'Time with my pet', 'A break from social media', 'Putting off chores, or asking for help with them']),
          table('adj', 'Small sensory changes for my days', SENSES(['e.g. dim lights, sunglasses, less on the walls', 'e.g. TV down low, headphones at the shops', 'e.g. soft socks, loose waistbands', 'e.g. unscented soap, no candles', 'e.g. a safe snack, extra spice to wake food up'])),
        ] }),
      L({ id: 'wb-barriers', title: 'What gets in the way of kindness', short: 'Three kinds of barrier', pg: '67-71', mins: 6,
        body: ["Most of us have reasons for not being kinder to ourselves, and they usually fall into three groups. Tick what fits and you'll see a count for each."],
        items: [
          check('bar', 'My barriers', [
            ['Fears and skill gaps', ['Kindness to myself feels unfamiliar or scary', 'It would make me weak or soft', 'If I start, I might fall apart', "I don't know how", 'It seems too hard to learn']],
            ['Beliefs I picked up', ['Self-criticism is what keeps me going', 'I need to be hard on myself to improve', "People get annoyed if I show I'm struggling", "Being hard on myself is what's expected", 'People only like me if I put them first']],
            ['Shame and guilt', ['Other people deserve kindness more', "I don't deserve it", 'It would be selfish', 'I should cope on my own', "Nobody's been kind to me, so why should I be?"]],
          ], { tally: true }),
          note("Each group needs something different. Fears and skill gaps ease with practice and small steps. Picked-up beliefs can be tested: does criticism really get you moving, or does it freeze you? Shame softens when you treat yourself like someone you love, even when it feels like pretending."),
          list('words', 'Up to six kind words for my strengths', 6, 'e.g. honest, persistent, practical'),
        ] }),
      L({ id: 'wb-stim', title: 'Stimming', short: 'Permission to move', pg: '71-74', mins: 5,
        body: [
          "Stimming is repetitive movement, sound or sensory play that helps you regulate. It can calm you down, wake you up, help you focus or let joy out. Lots of us were told to stop. You're allowed to start again.",
        ],
        items: [
          chips('like', 'Stims I enjoy or want to try', [], { groups: [
            ['Movement', ['Rocking', 'Bouncing a leg', 'Pacing', 'Spinning', 'Flapping', 'Swinging', 'Fidget toys', 'Twirling hair', 'Stroking soft fabric', 'Squeezing a stress ball']],
            ['Voice', ['Humming', 'Singing', 'Talking to myself', 'Counting', 'Whistling', 'Repeating a phrase or sound']],
            ['Looking', ['Rewatching a favourite show', 'Sparkly or moving lights', 'Ceiling fans', 'Satisfying videos', 'Sunsets, stars, the moon', 'Trains or traffic', 'Colouring', 'Puzzles', 'Patterns']],
            ['Sound', ['One song on repeat', 'Drumming', 'Bubble wrap', 'Brown or white noise', 'Rain or waves', 'Clicky pens', 'Tapping']],
            ['Taste and smell', ['Strong flavours', 'The smell of coffee', 'Baking', 'Cooking a favourite meal', 'Scents tied to good memories']],
          ] }),
          text('stopped', 'Stims I stopped because someone made me feel embarrassed'),
          chips('felt', 'How it feels when people correct my stimming', ['Angry', 'Ashamed', 'Confused', 'Embarrassed', 'Frustrated', 'Hurt', 'Self-conscious', 'Sad', 'Unsafe']),
        ] }),
      L({ id: 'wb-walk', title: 'Mindful walking', short: 'Slow steps in a small circle', pg: '75-76', mins: 8, stepSecs: 30, needs: ['burnt', 'joy'],
        body: ['Slow walking in a small loop, naming each part of each step. Stim as you go if it helps.'],
        steps: [
          'Find a spot with room to walk a small loop without bumping into anything. Stand still and look down at your feet.',
          'Feel the floor under you. Notice where your weight is.',
          'Slowly lift one foot. Say in your head: lifting.',
          'Move it forward: moving.',
          'Put it down: placing. Feel the contact.',
          'Shift your weight onto it: shifting.',
          'Now the other foot. Lifting, moving, placing, shifting.',
          'Keep going, slowly. When your mind wanders, come back to your feet and the words.',
          "Notice any feelings that come up. If embarrassment shows up, remind yourself you're safe to move however you like.",
          'When you\'re ready, slow to a stop. Stand for a moment and feel the ground.',
        ],
        items: [chips('felt', 'How I felt', ['Calm', 'Bored', 'Clumsy', 'Curious', 'Focused', 'Grounded', 'Restless', 'Relaxed', 'Silly', 'Steady'])] }),
      L({ id: 'wb-spins', title: 'Interests as medicine', short: 'Spins and hyperfixations for recovery', pg: '76-78', mins: 4, needs: ['joy'],
        body: [
          "Your interests are one of your best recovery tools. Many of ours are about how things work, patterns and systems, or collecting and sorting. Some will fire you up and some will settle you. Both are useful.",
        ],
        items: [
          chips('list', 'Interests that are mine', ['Activism', 'Aviation', 'Animals', 'Anime or cosplay', 'Architecture or interiors', 'Art or design', 'Astrology or tarot', 'Makeup', 'Plants, insects or ecology', 'Birds', 'A book series', 'Cars, buses or trucks', 'Comics or manga', 'Knitting, crochet or sewing', 'Dinosaurs', 'Fashion', 'True crime', 'Gaming', 'Rocks and geology', 'History', 'Lego', 'Language or poetry', 'Robots or engineering', 'Maths', 'Medicine', 'Model-making', 'Films', 'Music', 'Perfume', 'Physics', 'Psychology', 'Meditation', 'Spirituality']),
          text('energise', 'The ones that energise me'),
          text('calm', 'The ones that calm me'),
          note('Come back to these whenever you need to recover.'),
        ] }),
      L({ id: 'wb-perfect', title: 'A perfect day in your spin', short: 'An imagined day with no limits', pg: '79', mins: 5, stepSecs: 25, needs: ['joy', 'burnt'],
        body: ['An imagined day with your favourite interest, then a chance to move.'],
        steps: [
          'Settle in, sitting or standing. Let your breathing find a slow, easy rhythm.',
          "If you're sitting, feel the chair hold you. If you're standing, curl your toes and feel the floor.",
          'Notice your body stacked up from your feet, block by block.',
          'Think of one interest that never stops fascinating you.',
          'Imagine a whole day with it. No interruptions, no limits, nobody needing anything from you.',
          'Notice how that feels. Any warmth? Any lightness?',
          'Let a small smile come if it wants to.',
          'Breathe in slowly, three times.',
          'Now let your body show how you feel about it. Bounce, sway, spin, flap, dance. As long as you like.',
          "Slowly let the movement settle until you're still.",
          'Hold on to this feeling. You can carry it into the rest of your day.',
        ],
        items: [text('felt', 'What I noticed in my body and emotions')] }),
      L({ id: 'wb-care-body', title: 'Caring for your body', short: 'The basics that slip', pg: '80-81', mins: 3,
        body: [
          "In burnout, the basics slip: teeth, meals, appointments. Then your health slides and the burnout gets deeper. Try caring for yourself the way you'd look after a sick friend, or a pet you adore. Practical, generous, no judgement. Your health needs matter as much as anyone's.",
        ],
        items: [
          text('slip', 'Health and self-care I tend to let slide in burnout'),
          list('steps', "Up to four small ways I'll look after my body when I'm burnt out", 4, 'e.g. toothbrush in the shower, frozen meals ready'),
        ] }),
    ],
  },

  // ================================================================ 04
  {
    id: 'feel', no: '04', name: 'Big emotions', skill: 'Managing overwhelming emotions', pages: '82-106',
    intro: "Your feelings make more sense than they seem to. This module explains meltdowns and shutdowns, then teaches the book's five-step PRIMA approach for riding big emotions out.",
    lessons: [
      L({ id: 'wb-why-intense', title: 'Why it feels so big', short: 'What drives intense emotions', pg: '82-87', mins: 3,
        body: [
          "If your emotions feel huge and out of your control, there's usually a reason, often several.",
          "Sensory stress you can't escape keeps your threat system switched on, and you never really get used to it. Some people have misophonia, where sounds like chewing or pen clicking are unbearable. An overloaded executive function makes regulation harder, because regulation is one of its jobs.",
          "Many of us are hyperempathetic and soak up other people's feelings. Relationships bring rejection and misunderstanding. And plenty of us carry a heavy load of old hurts.",
          'The next few lessons help you see which of these drive your big feelings.',
        ] }),
      L({ id: 'wb-triggers', title: 'Sensory triggers', short: 'What tips you over', pg: '83-84',
        body: ['Look back at your sensory profile from module 1. This time, note what pushes you into real distress.'],
        items: [table('trig', 'What makes me intensely irritated, anxious or distressed', [...SENSES(['e.g. flickering lights, visual mess', 'e.g. chewing, sniffing, clicking', 'e.g. scratchy fabric, being bumped', 'e.g. cleaning products, cologne', 'e.g. mixed textures, surprise flavours']), ['inside', 'Inside my body', 'e.g. hunger, needing the toilet, heat'], ['balance', 'Balance and movement', 'e.g. escalators, being jostled in a crowd']])] }),
      L({ id: 'wb-situations', title: 'Tricky situations', short: 'Change, mistakes and running late', pg: '84', mins: 3,
        body: ["The Autistic brain tends to want certainty and the ADHD brain tends to crave novelty. If you have both, that tug-of-war can feel chaotic, and sudden changes hit hard."],
        items: [scales('sit', 'How I feel in these situations', 'Calm and accepting', 'Embarrassed or agitated', ['Unexpected events', 'Changes to my plans', 'Making a mistake', 'Forgetting something', 'Being distracted', 'Being interrupted', 'Running late', 'Saying the wrong thing'])] }),
      L({ id: 'wb-empathy', title: "Other people's feelings", short: 'Hyperempathy', pg: '85', mins: 3,
        body: ["If you're hyperempathetic, other people's emotions land in your body as if they were yours. Crowds and tense rooms can wear you out, and you might need time alone to sort out what's yours and what isn't."],
        items: [
          scale('emp', "How much other people's emotions affect me", 'Hardly', 'Enormously'),
          list('which', 'Up to four emotions in others that hit me hardest', 4),
        ] }),
      L({ id: 'wb-load', title: 'Your load of old hurts', short: 'Trauma load', pg: '85-87', mins: 4, help: true,
        body: [
          "Neurodivergent people often build up trauma from more kinds of experience than people expect, many of which wouldn't count as PTSD. The book calls the build-up your trauma load. It keeps your threat system on high alert and makes reactions bigger.",
          'This one can be tender. Tick only what you want to, and stop whenever you need.',
        ],
        items: [
          check('load', 'What has added to my load', ['Bullying by kids, teachers or family', 'Abuse or family violence, experienced or witnessed', 'Ongoing conflict and social stress', 'Losing someone, including a pet', 'Mental health crises', 'Serious or long-term illness', 'Time in hospital', "My own or my parents' separation", 'Injury or violence', 'Being made to do things to my body against my will']),
          note("If this stirred things up, an affirming, trauma-informed therapist can help you carry it. You don't have to sort it out on your own."),
        ] }),
      L({ id: 'wb-overwhelm', title: 'Meltdowns and shutdowns', short: 'And the habits we use to cope', pg: '88-92', mins: 5, help: true,
        body: [
          "A meltdown is your nervous system boiling over. You might shout, cry, throw things or run, and feel wrecked for days afterwards. A shutdown comes from the same overload but goes inward. You go numb, lose your words and pull away. Neither one is a tantrum or a choice.",
          "When feelings get unbearable, many of us find habits that bring quick relief: picking skin, pulling hair, biting nails, bingeing, drinking, gambling, self-harm. They make sense as ways of coping. They also cost a lot. Seeing them clearly, without judgement, is the first step toward other options.",
          "Dan Siegel's window of tolerance is a helpful picture here. Inside the window, you can feel things and still think. Above it, your system revs up into fight or flight, and a meltdown can follow. Below it, your system drops into shutdown. For many neurodivergent people the window is narrower, and sensory stress, masking and burnout shrink it further.",
        ],
        items: [
          windowMap('wot', 'Where am I right now?'),
          chips('mine', 'What overwhelm looks like for me', ['Meltdowns', 'Partial shutdowns', 'Full shutdowns', 'Going nonverbal', 'Crying', 'Shouting', 'Needing to escape']),
          check('habits', 'Coping habits I have had', ['Skin-picking', 'Hair-pulling', 'Nail or cheek biting', 'Binge eating', 'Drinking', 'Other substances', 'Gambling', 'Compulsive shopping', 'Self-harm'], { star: 'happening now' }),
        ] }),
      L({ id: 'wb-prima', fig: 'prima', title: 'PRIMA: five steps', short: 'Pause, Regulate, Identify, Meaning, Allow', pg: '93', mins: 2,
        body: [
          "The book offers a five-step approach for big emotions. PRIMA means first in Italian.",
          'Pause. Give yourself a beat before you respond.',
          'Regulate. Soothe yourself through your senses and interests.',
          'Identify. Find words for how you feel.',
          'Meaning. Work out what the emotion is trying to say, then choose your response.',
          'Allow. Let the emotion be there, and let it pass.',
          "Each step takes practice. You won't do them all well every time, and that's fine. The next lessons take them one by one.",
        ] }),
      L({ id: 'wb-safety', title: 'Safety and soothing plan', short: 'Pause: a plan for your worst moments', pg: '93-94', mins: 6, needs: ['overwhelmed'], share: true, help: true,
        body: [
          "Pause. When you're close to a meltdown or shutdown, safety comes first, yours and everyone else's. If you can, leave until you've calmed down.",
          "A plan made on a calm day does the thinking for you on a bad one. Consider sharing it with someone close, so they know the signs and what helps.",
        ],
        items: [table('plan', 'My plan', [
          ['signs', "Signs I'm getting overwhelmed", 'e.g. I want to avoid everyone, sounds get sharper, I feel wound up'],
          ['seen', 'Signs other people might see', 'e.g. I get snappy, stop answering questions, want to be alone'],
          ['do', 'What I can do to soothe myself and stay safe', 'e.g. go somewhere quiet, headphones on, rock, music'],
          ['others', 'How other people can help', 'e.g. fewer questions, keep things quiet, check on me now and then'],
          ['who', 'People I can ask for help', 'e.g. a friend, my partner, my GP'],
        ])] }),
      L({ id: 'wb-srb', title: 'Soothing rhythm breathing', short: 'Regulate: a slower, softer breath', pg: '95-96', mins: 5, stepSecs: 30, needs: ['overwhelmed', 'burnt'],
        body: ["Regulate. Once you're safe, help your body settle. This is a core CFT practice. If focusing on breath is hard, hold something with a nice texture, like a smooth stone, and focus on that as well."],
        steps: [
          'Sit comfortably. Hold your object if you have one.',
          'Let your face soften. A small smile, if it comes.',
          'Bring your attention to your breath.',
          'Let each breath drop down low, into your belly.',
          'Slow it a little. In for about four, out for about four.',
          'Find a rhythm that feels soothing, just slower than usual.',
          'When your mind wanders, and it will, bring it gently back to your breath.',
          'Feel the chair or the floor holding you. Let yourself be supported.',
          'Stay with that slow rhythm.',
          'Take a moment to appreciate that you gave yourself this time.',
          "When you're ready, open your eyes and come back.",
        ],
        items: [
          text('body', 'What changed in my body'),
          text('help', 'How this could help me'),
          line('when', "When I'll practise it", 'e.g. in the car before work, in bed'),
        ] }),
      L({ id: 'wb-regulate', title: 'Your regulation kit', short: 'Regulate: stims, a safe space, interests', pg: '96-97', mins: 5, needs: ['overwhelmed'],
        body: [
          "Stims and interests are two of the quickest ways to regulate. Some of us reach for picking, pulling or self-harm when we're overwhelmed. If that's you, look for gentle stims that meet the same need for sensation. Squeezing putty, or running your fingers over a textured fidget, are two to try.",
          "A sensory kit or a safe corner means you don't have to think when you're flooded. A basket or a drawer is enough.",
        ],
        items: [
          list('stims', "Up to six stims for when I'm distressed", 6),
          text('kit', 'What would go in my sensory kit or safe space', 'Fidgets, a blanket, headphones, a scent you love'),
          list('acts', "Up to six interest-based things that help when I'm upset", 6),
        ] }),
      L({ id: 'wb-identify', title: 'Name it', short: 'Identify: a bigger emotion vocabulary', pg: '98-101', mins: 4,
        body: ["Identify. A bigger vocabulary helps you pin down what you feel. Start with the broad family, then look for the closer word. If you can't name it, start with the body sensation and work backwards.", "The wheel below works like Gloria Willcox's feelings wheel, which many therapists use: broad feelings in the middle, more precise words further out."],
        items: [chips('words', 'Words that often fit me', [], { t: 'feelwheel', short: ['Happy', 'Curious', 'Afraid', 'Sad', 'Angry', 'Shame', 'Drained'], groups: [
          ['Happy, grateful, loving', ['Accepting', 'Affectionate', 'Amused', 'Calm', 'Content', 'Delighted', 'Grateful', 'Hopeful', 'Inspired', 'Joyful', 'Loving', 'Peaceful', 'Playful', 'Proud', 'Relaxed', 'Safe', 'Tender', 'Warm'], 'Often feels light, warm and loose in the chest'],
          ['Curious, energised, surprised', ['Brave', 'Confident', 'Curious', 'Determined', 'Energised', 'Excited', 'Fascinated', 'Interested', 'Intrigued', 'Shocked', 'Surprised'], 'Often feels buzzy or trembly'],
          ['Anxious, afraid', ['Afraid', 'Alarmed', 'Anxious', 'Confused', 'Doubtful', 'Helpless', 'Nervous', 'Overwhelmed', 'Panicked', 'Powerless', 'Scared', 'Tense', 'Trapped', 'Uneasy', 'Vulnerable', 'Worried'], 'Often feels restless, queasy, hot or tense'],
          ['Sad, disconnected', ['Disappointed', 'Discouraged', 'Detached', 'Empty', 'Flat', 'Gloomy', 'Heartbroken', 'Hopeless', 'Hurt', 'Lonely', 'Lost', 'Numb', 'Sad', 'Withdrawn', 'Worthless'], 'Often feels hollow, heavy, numb or choked up'],
          ['Angry, irritable', ['Agitated', 'Angry', 'Annoyed', 'Bitter', 'Cranky', 'Edgy', 'Exasperated', 'Frustrated', 'Furious', 'Grumpy', 'Impatient', 'Irritable', 'Outraged', 'Resentful'], 'Often feels hot, shaky and tight in the head and chest'],
          ['Shame, guilt, disgust', ['Ashamed', 'Disgusted', 'Embarrassed', 'Guilty', 'Humiliated', 'Jealous', 'Mortified', 'Regretful', 'Sorry'], 'Often feels sick, heavy or clenched in the stomach'],
          ['Exhausted, drained', ['Bored', 'Burdened', 'Burnt out', 'Depleted', 'Drained', 'Exhausted', 'Weary', 'Worn out'], 'Often feels heavy and empty all over'],
        ] })] }),
      L({ id: 'wb-track', title: 'A week of feelings', short: 'Identify: track emotions and sensations', pg: '101-103', mins: 3,
        body: ['Over the coming week, see if you can catch up to three feelings each day, plus one body sensation for each. Use the word lists when you get stuck. Come back and fill in a row each day.'],
        items: [
          rows('log', 'My week', [['day', 'Day'], ['em', 'Emotions'], ['sens', 'Sensations']], { min: 7, pre: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'] }),
          text('most', 'The emotions I noticed most'),
          text('precise', 'More precise words for them'),
        ] }),
      L({ id: 'wb-meaning', title: 'What is this feeling saying?', short: 'Meaning: map a big reaction', pg: '103-104', mins: 6, needs: ['overwhelmed'],
        body: ["Meaning. Emotions come with urges, and what you do is still your choice. When a feeling puzzles you or pushes you hard, stop and map it out. Save it to your journal and start a fresh one whenever you need to."],
        items: [table('map', 'My map', [
          ['sit', "What's happening?", "e.g. my partner hasn't replied for hours"],
          ['body', 'What do I feel in my body?', "e.g. tight chest, can't sit still"],
          ['thoughts', "What's running through my mind?", "e.g. they're sick of me"],
          ['ems', 'What emotions are here?', 'e.g. fear, hurt'],
          ['msg', 'What might they be telling me?', "e.g. this relationship matters and I'm scared of losing it"],
          ['urge', 'What do I feel the urge to do?', 'e.g. send ten messages'],
          ['follow', 'Do I want to follow that urge? Will it help?', ''],
          ['do', 'What will I do?', 'e.g. one kind message, then a walk'],
        ], { repeat: true })] }),
      L({ id: 'wb-weather', fig: 'weather', title: 'Weather in the sky', short: 'Allow: let feelings come and go', pg: '105-106', mins: 5, stepSecs: 25, needs: ['overwhelmed'],
        body: ["Allow. This imagining helps you let emotions come and go. If picturing things is hard, read the steps aloud, or draw it instead."],
        steps: [
          'Settle into a comfortable position. Take a few long, slow breaths.',
          'Picture the sky on a clear day, calm and blue.',
          'Now imagine weather rolling in. Clouds, wind, maybe a storm.',
          "When we don't like the weather, we try to control it. Notice how impossible that is.",
          "The blue sky is always there behind the weather, even when you can't see it.",
          'Now imagine you are that sky. Your feelings are the weather passing through.',
          "Notice an emotion that's here today. Let it be a cloud, or rain, or wind.",
          "Let it be there. Watch it drift. You don't have to push it away.",
          'Whatever the weather does, the sky is still the sky.',
          'A few slow breaths. Let the pictures fade in their own time.',
        ],
        items: [
          text('possible', 'What might be possible if I let emotions come and go like weather'),
          note("Big feelings get easier to live with when you stop fighting them. Take breaks and soothe yourself as often as you need."),
        ] }),
    ],
  },

  // ================================================================ 05
  {
    id: 'done', no: '05', name: 'Get things done', skill: 'Stop beating yourself up', pages: '107-130',
    intro: "You're not lazy. You've been working with a brain the world wasn't built for. Here are ways to quiet the critic and drop impossible standards, and plenty of practical tricks.",
    lessons: [
      L({ id: 'wb-not-lazy', title: "You're not lazy", short: 'Why getting things done is so hard', pg: '107-109', mins: 3,
        body: [
          "If getting things done is a struggle, you've probably heard it all, from other people and from yourself. Why can't you just do it? What's wrong with you?",
          "Getting things done uses nearly every executive function at once: starting, switching, staying on it, organising, ignoring the shiny thing. The restless, scanning attention that makes the dishes so hard would have been gold for our ancestors watching for danger. It just doesn't suit spreadsheets.",
          "Your thoughts aren't all true. You have thousands a day and lots of them are noise. The next two lessons give you some distance from the harsh ones, then a warmer voice to try instead.",
        ] }),
      L({ id: 'wb-distance', title: 'Distance from the critic', short: "I'm having the thought that…", pg: '109-110', mins: 5, needs: ['low'],
        body: ["First, write down some of the harsh things your inner critic says. Then say them a different way and see what happens."],
        items: [
          list('crit', 'Five hurtful things I say to myself', 5),
          chips('felt', 'How it feels when I say them', ['Annoyed', 'Ashamed', 'Despairing', 'Discouraged', 'Disgusted', 'Embarrassed', 'Frustrated', 'Helpless', 'Hopeless', 'Humiliated', 'Irritable', 'Lost', 'Sad', 'Worthless']),
          prefix('crit', [['Step 1. Read each one aloud like this:', "I'm having the thought that "], ['Step 2. Now read them again like this:', "I'm noticing that I'm having the thought that "]]),
          text('change', 'What changed in how strong they felt'),
        ] }),
      L({ id: 'wb-kind', title: 'Words of kindness', short: 'Practise a warmer voice', pg: '111-112', mins: 5, stepSecs: 20, needs: ['low'],
        body: ["What you say to yourself matters, and so does the tone. You can't stop thoughts arriving, but you can practise a warmer voice. Sit, lie or stand. Saying the words out loud works best. If it feels like acting, that's fine."],
        steps: [
          'Close your eyes or soften your gaze. Take a few slow breaths.',
          'With the next breath, soften your shoulders.',
          'Then your jaw.',
          'Then your forehead, and behind your eyes.',
          'Let your arms and legs go loose. If you get fidgety, wriggle, then settle again.',
          'Say aloud, warmly, as if to a friend: May you be well. Pause, and let it land.',
          'May you be happy. Pause.',
          'May you be free from suffering. Pause.',
          'Say them again, a little warmer. May you be well. May you be happy. May you be free from suffering.',
          'One more time, as kindly as you can. Let a small smile come.',
          'Three slow breaths. Soak up any warmth before you go back to your day.',
        ],
        items: [
          text('body', 'When I heard those kind words, my body felt…'),
          text('daily', 'How I could use this in daily life', 'e.g. after a mistake, in the shower'),
        ] }),
      L({ id: 'wb-ideals', title: 'Impossible standards', short: 'Perfectionism and borrowed priorities', pg: '113-114',
        body: [
          "Many of us hold ourselves to standards far higher than other people hold themselves. Everyone should like me. Every piece of work should be my best. The house should always be tidy. Those come from neurotypical ideals, and nobody meets them.",
          "Unhelpful perfectionism has a few parts. Your standards are rigid and sky-high, and they rise every time you reach them. You're scared of mistakes, the critic never lets up, and you steer clear of anything you might fail at. All of it sets off your threat system, which makes starting harder.",
        ],
        items: [
          freq('high', 'How often do I hold myself to standards that are extremely hard to meet?'),
          freq('raise', 'How often do I raise the bar after I reach it?'),
          text('drop', 'One standard I could lower, and what good enough would look like'),
          text('mine', "A priority that's truly mine, not borrowed"),
        ] }),
      L({ id: 'wb-spoons', title: 'Spoons and shortcuts', short: 'Simplify, use tech, get help', pg: '114-117', mins: 6,
        body: [
          "Spoon theory pictures your daily energy as a handful of spoons. Every task costs some. When they're gone, you're done until you rest. Saving spoons is a kind thing to do for yourself.",
          "Simplify and group tasks. Put the thing you forget on top of the thing you never forget. Pair a new habit with an old one. Make a drop zone by the door. Let technology carry some of the load: alarms, one calendar for everything, timers, voice reminders. AI can break a big job into steps, sort priorities or plan meals around your needs. Your reflection buddy in this app can help with that.",
          "And stop doing everything yourself. Ask people you trust for small things first. If you can afford it or get funding, paid help feels less personal and takes rejection out of the picture.",
        ],
        items: [
          spoonday('today', "Today's spoons"),
          freq('out', "How often do I feel like I've run out of spoons?"),
          check('try', "Shortcuts I'll try", [
            ['Simplify', ['Put what I forget with what I never forget', 'Link two tasks together', 'Pair a new habit with an old one', 'A drop zone by the front door']],
            ['Technology', ['Alarms for meds, water or bedtime', 'A habit tracker', 'One calendar for everything', 'Timers and voice reminders', 'Ask AI to break a task into steps', 'Ask AI to help me prioritise']],
            ['Help', ['Ask a friend for something small', 'A cleaner or meal service', 'A declutter coach or support worker', 'A handyperson', 'A virtual assistant or bookkeeper']],
          ]),
          freq('ask', 'How often do I ask for help?'),
          text('who', 'Who I could ask, and for what'),
        ] }),
      L({ id: 'wb-nice', fig: 'nice', title: 'Make it NICE', short: 'Novel, Interesting, Challenging, Emergency', pg: '118-119', mins: 5, needs: ['stuck'],
        body: [
          "Neurodivergent brains run on interest. We're drawn to things that are Novel, Interesting, Challenging or an Emergency. The book calls this NICE. When a task has none of those, your brain can slam the shutters down. Then the only way through is to let it become an emergency.",
          "Better to add some NICE on purpose. Turn it into a problem to solve, a race against the clock or a game with points. Set yourself a deadline. Make it beautiful or symmetrical. Theme it around a favourite film.",
        ],
        items: [
          check('q', 'What makes a task satisfying for me', ['Cracking a hard problem', 'Finding the most efficient way', 'Beating a record or a score', 'Going as fast as I can', 'Making something new', 'Making it look good', 'Adding to a collection', 'Discovering something', 'Going deeper into a topic', 'Working out how something works', 'Making sense of complex information', 'Puzzles']),
          freq('last', "How often do I leave things until they're an emergency?"),
          rows('make', 'Boring tasks, made NICE', [['task', 'Boring task', 'e.g. folding washing'], ['nice', 'How I could make it NICE', 'e.g. race one podcast episode']]),
        ] }),
      L({ id: 'wb-double', title: 'Body doubling', short: 'Someone alongside you', pg: '119-120', mins: 3, needs: ['stuck'],
        body: ["Body doubling means having someone with you while you do a task. They might help you start, work alongside you, or just be in the room. People were doing it long before it had a name, and it works over video too."],
        items: [
          freq('freq', 'How often do I use body doubling?'),
          text('what', 'Tasks where a body double would help'),
          list('who', 'Up to six people I could ask', 6),
        ] }),
      L({ id: 'wb-stimulate', title: 'The right amount of input', short: 'Stimulation and hyperfocus', pg: '120-121', mins: 3,
        body: ["If boredom is agony, you may need more input to stay on task, not less. And if you hyperfocus, you can put it to work in short bursts, with breaks for food, water and the toilet."],
        items: [check('try', "Ideas I'll try", [
          ['More input', ['A show, podcast or game in the background', 'Reading and listening at the same time', 'Saying each step out loud', 'Listening to lectures while walking', 'Doodling or taking notes to stay engaged', 'Stimming while I work']],
          ['Using hyperfocus', ['Race the clock: 15 minutes on one room', 'A 10-minute surge on similar jobs, like all the mail', 'A daily 5-minute sprint for future me', "Keep going if it's flowing, with breaks to eat and drink"]],
        ])] }),
      L({ id: 'wb-unstuck', title: 'Getting unstuck', short: 'Autistic inertia and ADHD paralysis', pg: '121-122', needs: ['stuck'],
        body: [
          "Sometimes you want to do something and your body just won't. Inside you're restless and frustrated, but nothing moves. People call it Autistic inertia or ADHD paralysis. Nobody knows yet exactly why it happens.",
          "Waking your body up gradually can help. Start with an easy stim, put on music, take movement breaks, go for a walk or a swim. Morning exercise helps some people focus all day. It's fine to ask someone for a gentle nudge too.",
        ],
        items: [
          freq('freq', 'How often do I get stuck like this?'),
          text('time', 'A time I got stuck, and what finally got me moving'),
          check('move', "Ways I'll get my body going", ['An easy, fun stim', 'Music I can move to', 'Movement breaks', 'A walk, ride or swim', 'Exercise in the morning', 'A gentle reminder from someone']),
        ] }),
      L({ id: 'wb-demand', title: 'Demand avoidance', short: 'When expectations feel like a cage', pg: '122-124',
        body: [
          "Demand avoidance is an overwhelming surge of resistance when you feel boxed in by expectations, other people's or your own. You might hear it called pathological or extreme demand avoidance, or a pervasive drive for autonomy. A demand can be anything that takes energy or attention, from washing up to answering a text.",
          "It looks like a threat system tuned very finely to losing control. It tends to get worse in burnout, and it can ease as life gets more comfortable.",
        ],
        items: [
          check('signs', 'What I notice', ['Instant resistance when asked to do something', 'Resisting even things I want to do', 'Putting things off when they feel like orders', 'Getting angry or upset at requests', 'Making excuses or changing the subject', 'Needing to be in control of plans', 'Arguing with rules that feel arbitrary', 'Doing something shocking to get out of a task', 'Avoiding things even when it costs me']),
          text('self', 'Demands I place on myself that set it off'),
        ] }),
      L({ id: 'wb-demand-plan', title: 'Working with demand avoidance', short: 'A four-part worksheet', pg: '124-129', mins: 10, needs: ['stuck'],
        body: ['Pick one task that keeps setting off resistance. It might come from someone else, or from you. Work through the four parts below.'],
        items: [
          head('Part 1. Your needs and reactions'),
          table('p1', '', [
            ['task', 'The task', 'e.g. packing my craft stuff off the dining table'],
            ['feel', 'How I feel about doing it', "e.g. resentful that it's every single time"],
            ['why', "Why I don't want to", 'e.g. it takes ages and eats my hobby time'],
            ['react', 'My reactions and urges when asked', 'e.g. grumpy, want to refuse outright'],
            ['fit', 'How that fits with how I want to treat people', 'e.g. I love them and want to be kind'],
            ['prefer', "How I'd rather respond", 'e.g. calmly, without a fight'],
          ]),
          head('Part 2. Other points of view'),
          table('p2', '', [
            ['why', 'Why it matters to the person asking, or to me', 'e.g. a clear table helps them relax'],
            ['outcome', 'The outcome they, or I, want', 'e.g. somewhere to eat dinner'],
          ]),
          head('Part 3. Your barriers'),
          check('p3', 'Is this task…', ['Complex, confusing or unclear?', 'Unrelated to my interests?', 'Dull, too easy or not urgent?', "One more thing when I'm already overloaded?", 'Interrupting something else?', 'Uncomfortable for my senses?', 'Making me anxious or unsure?', 'Physically draining or slow?', 'Not the best way to get the result?', "A neurotypical expectation that doesn't fit me?", 'Asked in a way that feels bossy or resentful?']),
          head('Part 4. Creative fixes'),
          rows('p4', 'For each barrier, a way around it', [['barrier', 'Barrier', 'e.g. asked as an order'], ['fix', 'A way around it', 'e.g. ask them to say: could we pack up when you finish?']], { min: 3 }),
          scale('will', 'Now, how willing am I to do it?', 'Not at all', 'Completely'),
        ] }),
      L({ id: 'wb-meds', title: 'Medication', short: 'Talking with your doctor', pg: '129-130', mins: 2,
        body: ["For many ADHDers, the right medication makes starting easier, thinking clearer and complexity less overwhelming. It doesn't suit everyone, and some people get so productive they overdo it and burn out. If you're curious, find an affirming doctor who'll look at your whole health and anything else you take. Only ever take it under medical care."],
        items: [text('q', "Questions I'd like to ask my doctor")] }),
      L({ id: 'wb-one', title: 'Just one thing', short: 'Narrow it down', pg: '130', mins: 3,
        body: ["That was a lot of strategies. Pick a few and go slowly, because doing too much too fast leads straight back to burnout. Some days, doing nothing is the right call. Rest counts."],
        items: [
          line('now', "One strategy I'll try straight away"),
          list('soon', "Three I'll try soon", 3),
          list('later', "Three longer-term changes I'd like", 3),
        ] }),
    ],
  },

  // ================================================================ 06
  {
    id: 'connect', no: '06', name: 'Relationships', skill: 'Safe, supportive connection', pages: '131-152',
    intro: "Relationships have often hurt. This module helps you build a few that feel safe, and gives you words for saying no and holding a boundary.",
    lessons: [
      L({ id: 'wb-hurt', title: 'Why it hurts', short: 'Connection and the threat system', pg: '131-133',
        body: [
          "Having lots of people around doesn't help if you feel unsafe with most of them. Your threat system just stays on. Many of us have a long history of friendships that ended in confusion or hurt, and a sense that our friends don't really get us. Often that's accurate.",
          "Check in with yourself as you think about friendship. If you feel anxious, flat or empty, your threat system might be stirring. Pause and soothe yourself whenever you need to in this module. Some of this module is about being on your own side.",
        ],
        items: [
          freq('get', 'How often do I feel my friends get me?'),
          scale('anx', 'How anxious I feel in social situations', 'Relaxed', 'Very anxious'),
          chips('now', 'How I feel right now, thinking about friendship', ['Anxious', 'Agitated', 'Calm', 'Detached', 'Empty', 'Hopeful', 'Hopeless', 'Lonely', 'Sad', 'Warm']),
        ] }),
      L({ id: 'wb-stories', title: 'Holding stories lightly', short: 'Letting go of unhelpful self-stories', pg: '133-136', mins: 6,
        body: [
          "If you've been hurt a lot, your mind may warn you in advance that people won't like you. It's trying to protect you, and it chips away at your confidence. Stories about yourself can become word prisons, even the nice ones. \"I'm a loyal friend\" can keep you going along with things that don't fit your values.",
          'Holding a story lightly means remembering it might be wrong.',
        ],
        items: [
          scale('assume', 'I assume most people', 'will dislike me', 'will like me'),
          check('stories', 'Stories that feel true about me', ["I'm always upsetting people", "I'm annoying", "I'm socially awkward", "I'm weird", "I can't make friends", "When a friendship ends, it's my fault", 'People only like me if I…', "I'm always letting people down"]),
          list('mine', 'Up to six stories about me and friendship, each starting with "I am…"', 6, 'e.g. I am too much. I am generous.'),
          strike('gone', 'mine', 'Take a breath. Tap story 3 to strike it out, and let it go. Notice what that feels like. Then story 5. Then the rest, one at a time.'),
          text('felt', 'Emotions and sensations I noticed as each story went'),
          note('Holding your stories lightly gives you room to choose what you do next, whatever your mind is saying.'),
        ] }),
      L({ id: 'wb-other', title: 'Your Compassionate Other', short: 'An imagined ally', pg: '136-138', mins: 7, stepSecs: 25, needs: ['low'],
        body: [
          "Imagining someone safe and kind can ease distress. In CFT this is called a Compassionate Other: an imagined ally who accepts you completely. They might be a kind character from a book or show, or a wise older person. They could be someone who's been good to you, an animal, or even a place or a light. Whatever form they take, they're an extension of you.",
          'Describe them below first, then start the guided part.',
        ],
        items: [
          chips('q', 'Qualities my Compassionate Other has', ['Warm', 'Caring', 'Calm', 'Kind', 'Forgiving', 'Patient', 'Gentle', 'Understanding', 'Wise', 'Strong', 'Playful', 'Accepting', 'Steady', 'Funny']),
          text('look', 'What they look like', 'Or how it feels to be near them'),
          text('felt', 'After the practice: what I felt connecting with them'),
        ],
        steps: [
          'Get comfortable in whatever way suits your body. Legs up, crossed, stretched out, anything.',
          'Breathe slowly for a minute, in that soothing rhythm. Stim if it helps.',
          'Bring your Compassionate Other to mind. Notice how they look, or simply feel that they are near.',
          'Imagine them sitting or standing beside you.',
          'They know you completely, and they accept you completely.',
          'Feel warmth and kindness flowing from them to you.',
          'A few slow breaths. Notice what it is like to be cared for without judgement.',
          'Notice any reactions in your body. Discomfort is welcome too.',
          'If you like, imagine them saying something kind to you.',
          'Thank your Compassionate Other, and yourself for showing up.',
          'Open your eyes. Move and stretch.',
        ] }),
      L({ id: 'wb-ways', title: 'Connecting your way', short: 'Neurodivergent ways of being together', pg: '139-142', mins: 4,
        body: [
          "Neurodivergent friendship has its own ways, and they're just as real. Sharing your spins. Diving deep into detail. Penguin pebbling: giving small things, like a meme or a nice rock, that say I thought of you (named after penguins who give pebbles). Parallel play, where you each do your own thing side by side. Swapping stories. Fast conversations full of tangents and loops. Comfortable silence and low-demand time, like texting instead of calling.",
          'Lowering expectations of each other is a form of care. It lets everyone regulate and recover in their own time.',
        ],
        items: [
          pick('joy', 'Which bring me joy?', ['Sharing spins and hyperfixations', 'Diving into detail', 'Penguin pebbling', 'Parallel play', 'Swapping stories', 'Tangents and fast talk', 'Silence and low-demand time'], ['Love it', 'Sometimes', 'Not for me']),
          line('quiet', 'I need quiet, low-demand contact when I feel…'),
          line('who', 'People I can be low-demand with'),
        ] }),
      L({ id: 'wb-neurokin', title: 'Finding your neurokin', short: 'People who share your way', pg: '142-144', mins: 5,
        body: ["Mixed friendships work well when both people are willing to adapt. Friendships with people who share your style, interests and values often feel easier. Those are your neurokin."],
        items: [
          rows('people', 'People who share my interests', [['name', 'Name'], ['enjoy', 'I enjoy their company', 'tick'], ['easy', 'Easy to talk to', 'tick'], ['more', 'Want to know them better', 'tick']], { min: 3 }),
          rows('meet', 'Ways to meet people through my interests', [['what', 'Interest or group', 'e.g. a board game night'], ['where', 'In person or online, and where', 'e.g. the café near work, Thursdays']]),
          check('support', "Help I'd need to make it happen", ['Finding the information', 'Getting organised to go', 'Making phone calls', 'Knowing what to expect', 'Someone to come along the first few times', "Support while I'm there", 'Transport']),
        ] }),
      L({ id: 'wb-strawberry', fig: 'strawberry', title: 'Your strawberry people', short: 'Choose a few and put them first', pg: '144-146', mins: 5,
        body: [
          "Neurotypical people tend to rank friends without thinking about it: a couple of close ones at the centre, then circles going outwards. Many of us try to treat everyone the same, out of fairness. The trouble is that no friendship gets the chance to go deep.",
          "Devon Price, in Unmasking Autism, calls the special few his strawberry people. The idea is to pick a handful of people who get you and put real energy into them.",
        ],
        items: [
          head('Step 1. Find people who get you'),
          list('names', 'Up to four people I feel at ease with, outside close family', 4),
          circles('rings', 'Place them, and anyone else, in your circles', 'names'),
          head('Step 2. Create a cue'),
          one('emoji', 'Pick an emoji and add it to their names in your contacts. Use the same one for each person, so their messages stand out.', ['🍓', '🌱', '⭐', '🫶', '🐧', '🌙', '🍀', '🔥', '💛', '🦋']),
          head('Step 3. Put them first'),
          note('When the emoji pops up, reply sooner. Make time to see them. Tell them you value them.'),
          text('script', 'I want to tell you that…', "e.g. I really like hanging out with you and I'd love to do it more"),
          text('ideas', 'Things I could invite them to do'),
        ] }),
      L({ id: 'wb-no', title: 'Learning to say no', short: 'Clear, kind, no long explanation', pg: '147-149', mins: 5,
        body: [
          "Trying to keep everyone happy makes sense after so much rejection. It also teaches people that your needs don't matter. It's fair to say no when you don't have the energy, or when it goes against your values. It's also fair when someone else could easily do it, or when guilt is the only reason you'd say yes.",
          "No doesn't need a long explanation. \"Sorry, I can't.\" \"Thanks for thinking of me, but I'm not free.\" \"No, thank you.\" That's plenty.",
        ],
        items: [
          table('plan', 'Practise one', [
            ['sit', 'The situation', 'e.g. my cousin always asks me to babysit at the last minute'],
            ['why', "Why it's not fair to expect this", 'e.g. I need my weekends to recover'],
            ['cost', 'What saying yes costs me', "e.g. I'm wiped out all week"],
            ['say', "How I'll say no, clearly and kindly", "e.g. Sorry, I can't this weekend."],
            ['ems', 'Emotions that might show up', "e.g. guilt, fear they'll be cross"],
            ['soothe', "How I'll look after myself while I say it", 'e.g. stim, then a favourite show'],
          ]),
          text('after', 'How saying no went, and how it felt', 'If it was hard, that just means it needs more practice'),
        ] }),
      L({ id: 'wb-boundary', title: 'Setting a boundary', short: 'Say it, then hold it', pg: '149-151', mins: 8, needs: ['convo'],
        body: [
          "Boundaries are clear statements of your needs, like respect, time alone, quiet, privacy and help. They cover how you spend your energy, what you'll give, what you'll accept from others, and who can touch you and how.",
          "A boundary can't control what someone else does. It says what you'll do if it's crossed, and then you follow through. Nobody else will hold it for you. Practise your statement out loud in a calm, steady voice before you say it for real.",
        ],
        items: [table('b', 'My boundary plan', [
          ['name', "Person's name", ''],
          ['rel', 'Relationship to me', 'e.g. my dad'],
          ['what', 'What they do that upsets me', 'e.g. comments on what I eat at family dinners'],
          ['impact', 'The impact on me', "e.g. I dread going and can't enjoy the food"],
          ['why', "Why it's not OK", 'e.g. my body is my business'],
          ['need', 'What I need here', 'e.g. respect, meals without commentary'],
          ['stmt', 'My boundary statement', 'e.g. Dad, please stop commenting on my food. It makes dinners hard for me.'],
          ['then', "What I'll do if it's crossed", "e.g. I'll leave early"],
          ['ems', 'Emotions that might show up', ''],
          ['urge', 'The urge to avoid those emotions', 'e.g. skip the conversation entirely'],
          ['soothe', "How I'll soothe myself", 'e.g. slow breaths before, music after'],
          ['support', 'Support I have', 'e.g. I can call my sister after'],
        ])] }),
    ],
  },

  // ================================================================ 07
  {
    id: 'unmask', no: '07', name: 'Unmasking', skill: 'Finding who you are', pages: '153-176',
    intro: "Masking keeps you safe and wears you out. This module helps you find who you are underneath, then take the mask off slowly, with people who are safe.",
    lessons: [
      L({ id: 'wb-mask-cost', title: "Why masking doesn't work", short: 'What it costs', pg: '153-155', mins: 3,
        body: [
          "If you've masked since childhood, the performance might be so polished you don't notice it. It protected you. It also costs a lot: exhaustion, anxiety about being found out, burnout, and losing track of who you are.",
          "Asking yourself \"Who am I?\" might only turn up roles and job titles. Many neurodivergent people answer with what they love instead: I'm a music person, a researcher, an animal person. The next lessons come at it from four angles: your values, your qualities, your interests, and the part of you that's always noticing.",
        ] }),
      L({ id: 'wb-legacy', title: 'Values are verbs', short: 'What you want your life to stand for', pg: '155-156', mins: 3,
        body: ["Values are things you do, not things you get. Being loved isn't a value. Being loving is. You never finish a value, you keep choosing it. Only you get to pick yours, and you never have to justify them."],
        items: [
          blanks('desc', "At the end of my life, I'd like people to describe me as…", 4, Q),
          blanks('mean', 'The things that will feel most meaningful then', 2),
        ] }),
      L({ id: 'wb-sweet', title: 'The sweet spot', short: 'A moment of real joy', pg: '157-158', mins: 7,
        body: [
          "Think of a time when you were completely absorbed in something that mattered and felt good. Maybe you were deep in a spin, laughing with someone you love, or moving your body. Your struggles faded and everything felt light. That's a sweet spot.",
          "If your mind starts hunting for the best example, let that go. Pick one you remember well.",
        ],
        items: [
          line('where', 'Where I was'),
          text('what', 'What I was doing'),
          line('who', 'Who I was with'),
          text('how', 'How I felt'),
          rows('ems', 'Emotions and sensations as I remember it', [['em', 'Emotion'], ['sens', 'Body sensation']], { min: 3 }),
          text('critic', 'Self-critical thoughts that showed up', 'Write them here, then let them go for now'),
          check('domains', 'Values that were in my sweet spot', DOMAINS),
          line('special', 'What was special in that moment was…'),
          line('important', "What's deeply important to me is…"),
        ] }),
      L({ id: 'wb-whose', title: 'Whose values?', short: 'Yours, or borrowed?', pg: '159', mins: 2,
        body: ["If you've always masked, you may have lived by other people's values and priorities. That's how you stayed safe, and there's no shame in it. Now you get to check."],
        items: [
          scale('whose', 'I live mostly by', "other people's values", 'my own values'),
          text('borrowed', "A value I've been living that isn't really mine"),
        ] }),
      L({ id: 'wb-qualities', title: 'Your qualities', short: 'Who you choose to be', pg: '160', mins: 4,
        body: ["Who you are shows up differently depending on where you are and who you're with, and you get to choose which qualities you bring. Tap the qualities that resonate. Tap again to star up to eight that feel essential to you."],
        items: [chips('q', 'Qualities that resonate', QUALITIES, { star: 8 })] }),
      L({ id: 'wb-living', title: 'Living your values', short: 'Qualities for each part of life', pg: '161-164', mins: 10,
        body: ["For each part of life, choose the qualities you'd like to bring. Your starred qualities appear as suggestions. Tap one to drop it into the next empty box. Skip any part of life that doesn't apply."],
        items: [
          head('Connecting with others'),
          blanks('fam', 'With family, I like to be…', 3, Q),
          blanks('friends', "I'd like my friends to see me as…", 3, Q),
          blanks('partner', 'With a partner, it matters to me to be…', 3, Q),
          blanks('conflict', 'In conflict, or with difficult people, I try to be…', 3, Q),
          blanks('all', 'Toward all people and animals, I want to be…', 3, Q),
          head('Parenting'), blanks('parent', 'As a parent, I want to be…', 3, Q),
          head('Time alone'), blanks('alone', "When I'm alone, I enjoy being…", 3, Q),
          head('Helping others and advocacy'), blanks('adv', 'When I stand up for others, I try to be…', 3, Q), blanks('care', "When I'm caring for people or animals, I'm…", 3, Q),
          head('Work'), blanks('work', 'At work, I like to be…', 3, Q), blanks('goals', 'I go after my goals being…', 3, Q),
          head('Learning'), blanks('learn', "When I'm learning, I'm…", 3, Q),
          head('Creativity'), blanks('create', "When I'm making things, I'm…", 3, Q),
          head('Wellbeing'), blanks('well', "When I look after my body and mind, I'm…", 3, Q),
          head('Community'), blanks('comm', "In my community, I'd like to be…", 3, Q),
          head('Home'), blanks('home', 'When my home is set up for me, I can be…', 3, Q),
          head('Faith and meaning'), blanks('spirit', 'In my spiritual life, I want to be…', 3, Q),
          head('Personal growth'), blanks('grow', "As I grow, I'd like to become more…", 3, Q),
          note('Let these guide you in being more yourself with other people.'),
        ] }),
      L({ id: 'wb-sparkles', title: 'Eye sparkles', short: 'Your interests are who you are', pg: '165-166', mins: 5, needs: ['joy'],
        body: [
          "You know the look when someone talks about the thing they love? Their eyes light up. This lesson links your interests to who you are under the mask.",
          "Your interests don't have to earn money or turn into a side hustle to be worth your time. Doing more of what lights you up is a real path to feeling better.",
        ],
        items: [
          line('child', "An interest I've loved since childhood"),
          line('collect', 'A collection, physical or online, that means a lot to me'),
          line('career', 'An interest that shaped my work'),
          line('friends', 'An interest that helped me make friends'),
          line('self', 'An interest that taught me about myself'),
          blanks('engrossed', "When I'm engrossed in my interests, I'm being…", 3, Q),
          blanks('regular', 'When I get regular time with them, I am…', 3, Q),
          text('more', 'New ways I could spend time with what lights me up'),
        ] }),
      L({ id: 'wb-observer', fig: 'observer', title: 'The you that notices', short: 'Meeting your observing self', pg: '166-167', mins: 5,
        body: [
          "Underneath your changing thoughts and feelings, part of you is always noticing. ACT calls it the observing self. It's the steady centre of you, and it stays the same whatever you're going through.",
          "Find somewhere you can read out loud without feeling self-conscious.",
        ],
        items: [
          head('1. Read your sweet spot aloud, as if telling a friend'),
          show('wb-sweet', [['where', 'Where'], ['what', 'What'], ['who', 'Who with'], ['how', 'How I felt']], 'Your sweet spot'),
          note('While you read, see if you can sense the part of you that hears your voice.'),
          head('2. Now read your self-critical thoughts aloud'),
          show('wb-sweet', [['critic', 'Self-critical thoughts']], 'Your critic'),
          note("Notice that part of you is listening again. The same part. It heard the joy and the criticism, and it didn't change. That steady noticing is you. Thoughts and feelings pass through it like weather through the sky."),
          text('felt', 'What I noticed about the part of me that listens'),
        ] }),
      L({ id: 'wb-safe', title: 'Unmasking with safe people', short: 'Who is safe, and what might happen', pg: '167-169', mins: 5,
        body: [
          "How much you can unmask depends on your situation. Money, family support and secure work all make it safer. When you first realise you're neurodivergent, you might want to tell everyone, a few people, or nobody yet. All of those are fine.",
          "Safe people tend to treat everyone with respect, whatever their background. They speak kindly about people who aren't in the room, they're curious about differences, and they're willing to adjust for other people's needs.",
        ],
        items: [
          line('who', 'The people I feel safe being myself with are…'),
          scale('react', "Reactions I've had when I've told people", 'Mostly hurtful', 'Mostly supportive'),
          rows('people', 'People I might tell', [['p', 'Person'], ['ben', 'Possible benefits'], ['risk', 'Possible risks']]),
        ] }),
      L({ id: 'wb-disclose', title: 'Planning to tell someone', short: 'Disclosure with confidence', pg: '169-171', mins: 7, needs: ['convo'],
        body: [
          "Telling people is a kind of coming out, and it isn't for everyone. The best outcome is that they understand what being neurodivergent means to you. Some conversations will go badly, and that can shake your confidence. Preparing helps. Use clear, affirming words, say what it means for you, and have short answers ready for the hurtful comments.",
          "People often react badly because they're worried, about what it means for you or for them. A first reaction isn't always how they'll feel forever.",
        ],
        items: [table('plan', 'My plan', [
          ['iam', 'How I describe myself ("I am…")', "e.g. I'm Autistic and an ADHDer"],
          ['words', 'Words I prefer people use', ''],
          ['day', 'What it means for me day to day', ''],
          ['str', 'Strengths in my spiky profile', ''],
          ['hard', 'Challenges it brings', ''],
          ['fears', 'What they might worry about', ''],
          ['q', 'Questions they might ask', ''],
          ['ans', 'My answers', "e.g. It's not an excuse. It explains things, and it helps me ask for what I need."],
        ])] }),
      L({ id: 'wb-rules', title: 'Choosing your social rules', short: 'Which unspoken rules you keep', pg: '171-173', mins: 4,
        body: ["Society runs on unspoken rules that everyone is supposed to know, and often you only find one by breaking it. You get to decide how many you follow. Being different in ways that feel true to you is part of unmasking."],
        items: [pick('rules', 'Will I follow this?', [
          'When someone asks how you are, say "good, thanks", whatever the truth is.',
          'Small white lies are fine to spare feelings.',
          'If plans change, you can back out of a commitment.',
          "Don't tell people they've got food in their teeth.",
          "Don't correct people's mistakes, even helpful ones.",
          'Go along with strong beliefs, even without good reasons.',
          "Don't ask people why they're doing something.",
          'If you miss your chance to make a point, let it go.',
          "Hold eye contact to show you're listening.",
          "Don't talk about your interests for too long.",
          'Stay until the end of a party.',
          'Hug people you know when you say hello.',
        ], ['Follow', 'Sometimes', 'Not for me'])] }),
      L({ id: 'wb-mask-down', title: 'Putting the mask down', short: 'Small swaps, one at a time', pg: '173-176', mins: 5,
        body: ["Unmasking happens in small steps. Think about what you do when you're most relaxed: alone, with a close friend, or with your pet. Those are clues to the real you."],
        items: [
          check('relaxed', "When I'm alone and comfortable, I…", ['Make noises', 'Stim freely', 'Move about a lot', 'Sit with my legs up', 'Lie in odd positions', 'Wear brighter or plainer clothes', 'Wear comfier clothes', 'Skip eye contact', 'Talk more, less, or not at all', 'Go without shoes or makeup', 'Get completely lost in my spins', "Don't interact with anyone", 'Say exactly what I think', 'Ask for exactly what I need']),
          rows('swap', 'Masking habits I want to change', [['mask', 'Masking habit', 'e.g. hiding my excitement'], ['choice', 'My unmasked choice', 'e.g. ask: can I tell you my favourite facts about this?']]),
          note("Start with one or two. Some people may drift away when they meet the real you. That hurts, and it also makes room for people who like you as you are. Being a bit weird is allowed."),
        ] }),
    ],
  },

  // ================================================================ 08
  {
    id: 'world', no: '08', name: 'Your world', skill: 'Asking for what you need', pages: '177-198',
    intro: "You're allowed to ask for what you need. This module helps with the fear of asking, the words to use, and the pushback that sometimes follows. It ends with a plan of your own.",
    lessons: [
      L({ id: 'wb-dismissed', title: 'When people brush you off', short: 'Why asking is hard', pg: '177-178', mins: 2,
        body: ["Every time you ask for what you need, you risk being knocked back. If you've hidden your struggles well, people may not believe you at first. Others stall, or make you feel guilty for asking. No wonder the urge to give up or hide is strong. But if you never ask, help can't reach you."],
        items: [chips('felt', 'How I feel when my requests are brushed off', ['Angry', 'Anxious', 'Ashamed', 'Betrayed', 'Confused', 'Devastated', 'Embarrassed', 'Frustrated', 'Helpless', 'Hurt', 'Ignored', 'Invalidated', 'Ridiculed', 'Unimportant', 'Unsafe'])] }),
      L({ id: 'wb-ask-barriers', title: 'What stops you asking', short: 'Three kinds of roadblock', pg: '178-180', mins: 5,
        items: [
          check('bar', 'My roadblocks', [
            ['Fears and skill gaps', ["It'll hurt too much if they say no", "I've hidden it so long I don't know what I need", 'Asking would make me look weak', "I don't know how to ask"]],
            ['Beliefs I picked up', ["I've been ignored before, so I will be again", 'People judged me last time', "I'm not disabled enough to need help", "It's unfair when others don't get help", "People will resent me getting special treatment"]],
            ['Shame and guilt', ['Asking would be selfish', "It's embarrassing to ask", "It's my fault this is hard", 'I should sort it out myself', 'I just need to try harder']],
          ], { tally: true }),
          text('origin', 'Where I think these beliefs came from'),
          text('skills', 'Skills from this workbook that could help me ask anyway', 'e.g. self-soothing, distance from the critic, my Compassionate Other'),
        ],
        body: ['Tick what fits. The counts show which kind of roadblock is biggest for you.'] }),
      L({ id: 'wb-rights', title: 'Your rights', short: 'Ableism and the law', pg: '180-183', mins: 4,
        body: [
          "When you speak up for your needs, you make it easier for other people to do the same. Pick which fights are worth it, and say no when you need to. Wearing headphones at the shops, seeing friends one at a time or leaving a party early shouldn't be a problem for anyone else.",
          "When most people put their own comfort ahead of people who need more support, that's ableism. The law offers some protection. The book describes US law. In Australia, the Disability Discrimination Act 1992 makes disability discrimination unlawful at work, in education and in services. Employers and education providers generally have to make reasonable adjustments. The Australian Human Rights Commission takes complaints, and the Fair Work Ombudsman can help with discrimination at work.",
        ],
        items: [
          text('area', 'An area where I need to advocate for myself'),
          text('found', 'What I found out about my rights'),
        ] }),
      L({ id: 'wb-adjust', title: 'Reasonable adjustments', short: 'What would help at work or study', pg: '183-186', mins: 5,
        body: ["Small changes often make a big difference. You might not know what helps at first, so try a few things. Let your workplace or uni know your needs may change."],
        items: [
          check('study', 'At uni, TAFE or school', ['Extra time for exams and assignments', 'A quiet room for exams', 'Lecture recordings or notes', 'Flexible attendance', 'Assessment in a different format', 'Breaks to move, stim or wear headphones', 'Choosing my group, or working alone', 'An access or disability plan']),
          check('work', 'At work', ['A quiet, private space instead of open-plan', 'Working from home', 'Dimmer or natural light', 'Work that uses my strengths', 'Support with time management or admin', 'Control over screen brightness', 'Uninterrupted time and headphones', 'Comfortable clothes', 'Music or podcasts in headphones', 'Stimming and fidgets', 'Flexible hours', 'Fewer, shorter meetings with an agenda', 'Camera off in online meetings', 'Sensory breaks', 'Written instructions', 'Flexible deadlines']),
          list('top', 'My top three to ask for', 3),
        ] }),
      L({ id: 'wb-assertive', title: 'Asking clearly', short: 'Assertive, not aggressive', pg: '186-188', mins: 5,
        body: [
          "Assertive communication shares your point of view and asks for change without threats or blame. Ask for what you want, not what you don't want. Bring a possible solution if you can. People tend to see that as proactive.",
          "In places that run on neurotypical politeness, which is most workplaces, it can help to borrow some of it without hiding who you are. Stay calm and stick to the problem. Speak with confidence, listen for common ground, and think about their needs too. It's tiring, so soothe yourself before and after, however it goes.",
        ],
        items: [rewrite('rw', 'Rewrite each one, then peek at one way to say it', [
          ["It'd be great if someone else did the dishes for once.", 'Could you do the dishes tonight?'],
          ['Stop booking meetings at 8am.', 'Could we start meetings at 10 or later?'],
          ['You never listen to me.', 'Can I have five minutes to finish my point?'],
          ["If this keeps happening, I'm going to HR.", 'This needs to change. Can we sort it out this week?'],
          ['Whose idea was this?', "Let's work out a fix together."],
          ['Sorry, this is probably silly, but…', 'I have a request.'],
        ])] }),
      L({ id: 'wb-assert-plan', title: 'Your assertive plan', short: 'Plan a conversation', pg: '188-190', mins: 8, needs: ['convo'],
        body: ["Plan a conversation for a change you can only get with someone else's help. Practise the key lines out loud in a calm, steady voice. Afterwards, come back and note how it went."],
        items: [
          table('p', 'My plan', [
            ['name', "Person's name", ''],
            ['rel', 'Relationship to me', 'e.g. my team leader'],
            ['prob', 'The problem, briefly', "e.g. back-to-back meetings leave me fried by 2pm"],
            ['need', 'What I need', 'e.g. recovery time between meetings'],
            ['rights', 'My rights here', 'e.g. reasonable adjustments at work'],
            ['ask', 'My proposed solution: clear, positive, no blame', 'e.g. Could we keep 30 minutes free after long meetings?'],
            ['quals', 'Qualities I want to bring', 'e.g. calm, fair, confident'],
            ['ems', 'Emotions that might show up', ''],
            ['urge', 'The urge to avoid those emotions', ''],
            ['soothe', "How I'll soothe myself", 'e.g. stim beforehand, breathe, notice the courage this takes'],
            ['support', 'Support I have', 'e.g. a colleague in the meeting, or a debrief after'],
          ]),
          head('After the conversation'),
          rows('after', 'What I felt', [['em', 'Emotion'], ['sens', 'Body sensation']], { min: 3 }),
          text('next', 'How they responded, and my next steps'),
        ] }),
      L({ id: 'wb-resist', title: 'Handling pushback', short: 'Steady replies to resistance', pg: '190-193', mins: 6,
        body: [
          "Not every request lands the first time, and resistance often isn't about you. People hold on to control when life feels shaky. They prefer how things are and dislike uncertainty. They fear losing something, even when they'd gain more, and they follow whoever is above them. Knowing this helps you calm their worries and point to the benefits.",
          'Some common kinds of pushback, with steady replies:',
          "Saying yes and doing nothing. Pin down a date and follow up. \"When can I expect to hear back?\"",
          "\"That's not our policy.\" \"Policies can be updated. This one was written before we knew much about people like me.\"",
          "Guilt and obligation: it's too expensive, everyone else copes. \"I'm happy to work with the team on a solution that suits everyone.\"",
          "\"Please keep this between us.\" \"Why does it need to be secret? Staying quiet shouldn't be the price of getting support.\"",
          "Conditions: we'll do it if you do something extra. \"This change helps me do my job well. It isn't a favour I need to pay back.\"",
        ],
        items: [rows('mine', 'Pushback I expect, and my reply', [['push', 'What they might say'], ['reply', "What I'll say"]])] }),
      L({ id: 'wb-losses', title: 'Knowing when to walk away', short: 'Cutting your losses', pg: '193-194', mins: 3,
        body: ["Some places won't change, however well you ask. If you keep hitting the same wall and it's costing your health, it may be time to cut your losses. Walking away can be how you protect yourself, so your energy goes somewhere it's valued."],
        items: [
          scale('aff', 'How affirming my work or study place is', 'Not at all', 'Very'),
          text('next', "What I could ask for to improve it, or whether it's time to leave"),
        ] }),
      L({ id: 'wb-goals', fig: 'steps', title: 'Goals that fit', short: 'Small, positive, value-based', pg: '195-196', mins: 5,
        body: [
          "Many of us set huge goals based on neurotypical ideals, fall short, and then stop setting goals at all. Helpful goals say what you want rather than what you don't. They're small and clear, connected to your values, achievable, and good for your life. They can grow over time.",
          "For example, \"stop being late\" becomes \"set a reminder to start getting ready 40 minutes before I leave\". \"Make friends\" becomes \"say yes to one invite this month\".",
        ],
        items: [rows('g', 'From broad to small', [['broad', 'A broad goal', 'e.g. stop feeling exhausted'], ['small', 'Small goals instead', 'e.g. an alarm to start winding down at 9.30']])] }),
      L({ id: 'wb-action', title: 'Your action plan', short: 'A self-compassionate plan', pg: '197-198', mins: 10, share: true,
        body: ["Pull it all together. Name one thing you want for your life. Then set up to three small goals, the values behind each, and up to three small actions for each goal. If you need ideas for values, look back at your sweet spot and qualities in module 7."],
        items: [plan('plan')] }),
      L({ id: 'wb-returns', fig: 'returns', title: 'Gentle returns', short: 'Getting back on track, again', pg: '198', mins: 2,
        body: ["Kelly Wilson, one of the founders of ACT, describes life as a series of gentle returns. You'll drift off track all the time. Everyone does. What counts is turning back toward what matters, again and again, without beating yourself up for drifting."],
        items: [text('return', 'What helps me find my way back')] }),
    ],
  },

  // ================================================================ 09
  {
    id: 'onward', no: '09', name: 'Onward', skill: 'Making a difference', pages: '199-201',
    intro: "A short send-off from the epilogue.",
    lessons: [
      L({ id: 'wb-epilogue', title: 'Being yourself out loud', short: 'For you, and for others', pg: '199-201', mins: 3,
        body: [
          "The world is poorer without different minds. When you mention your neurodivergence, stim in public or talk about what you love, other people get permission to be themselves too.",
          "You don't have to fix everything that's broken. Choose your battles. Rest. Look after yourself first, because you matter too.",
          "Thank you for doing this work. Come back to it whenever you need. Each time through, you'll notice something new.",
        ],
        items: [
          text('visible', "One way I'd like to be more visibly myself"),
          text('carry', 'What I want to remember from this workbook'),
        ] }),
    ],
  },
];

export const ALL_LESSONS = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleName: m.name, moduleNo: m.no })));
export const lessonById = (id) => ALL_LESSONS.find((l) => l.id === id);

export const WORKBOOK = {
  id: 'nd-workbook',
  title: 'Neurodivergence Skills',
  tagline: 'for autism and adhd',
  book: 'The Neurodivergence Skills Workbook for Autism and ADHD',
  authors: 'Jennifer Kemp and Monique Mitchelson',
  publisher: 'New Harbinger, 2024',
  blurb: "A chapter-by-chapter companion to Jennifer Kemp and Monique Mitchelson's workbook. Every exercise is here to tap or type into, and it all saves on this phone. The writing is ours; the page numbers take you back to the book.",
  lessons: ALL_LESSONS,
};
