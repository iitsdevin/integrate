// Diagrams for the Neurodivergence Skills workbook. Drawn for this app (not copied from the book),
// in the Field Print style: flat blocks, 2px ink lines, condensed display type and mono labels.
// Colours come from the theme tokens, so every figure follows the scheme and light/dark mode.

const C = { ink: 'var(--ink)', g: 'var(--ground)', b1: 'var(--block1)', b2: 'var(--block2)', r: 'var(--raised)', t2: 'var(--tab-ink)', deep: 'var(--deep)' };
const SW = 2;

function T({ x, y, s = 12, a = 'middle', f = C.ink, w = 600, mono, disp, caps, children, ...rest }) {
  const style = mono ? { fontFamily: 'var(--mono)', letterSpacing: '0.04em', fontWeight: 500 } : disp ? { fontWeight: 800, fontStretch: '75%', letterSpacing: '-0.02em' } : { fontWeight: w };
  return <text x={x} y={y} fontSize={s} textAnchor={a} fill={f} style={style} {...rest}>{caps ? String(children).toUpperCase() : children}</text>;
}
const Box = ({ x, y, w, h, f = C.r, sh }) => (
  <>
    {sh && <rect x={x + 3} y={y + 3} width={w} height={h} fill={C.ink} />}
    <rect x={x} y={y} width={w} height={h} fill={f} stroke={C.ink} strokeWidth={SW} />
  </>
);
const Head = ({ x, y, rot = 0, f = C.ink }) => <polygon points="-5,-4.5 5,0 -5,4.5" fill={f} transform={`translate(${x} ${y}) rotate(${rot})`} />;

function Spiky() {
  const rows = [['Interests', 180], ['Exec. function', 58], ['Senses', 152], ['Emotions', 40], ['Social rules', 96], ['Communication', 170]];
  return (
    <>
      <T x={196} y={12} mono s={9.5} caps>what the world expects</T>
      {rows.map(([l, w], i) => {
        const y = 24 + i * 26;
        return (
          <g key={l}>
            <T x={92} y={y + 13} a="end" s={12}>{l}</T>
            <rect x={100} y={y} width={w} height={18} fill={i % 2 ? C.b2 : C.b1} stroke={C.ink} strokeWidth={SW} />
          </g>
        );
      })}
      <line x1={196} y1={18} x2={196} y2={180} stroke={C.ink} strokeWidth={SW} strokeDasharray="5 4" />
    </>
  );
}

function Beams() {
  return (
    <>
      <line x1={150} y1={8} x2={150} y2={176} stroke={C.ink} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="3 4" />
      <polygon points="68,134 76,134 104,36 40,36" fill={C.b1} stroke={C.ink} strokeWidth={1.5} />
      <Box x={40} y={12} w={64} h={24} f={C.b2} />
      <T x={72} y={28.5} f={C.t2} s={12} w={700}>a spin</T>
      <circle cx={72} cy={140} r={6} fill={C.ink} />
      <T x={72} y={160} mono s={10} caps>monotropic</T>
      <T x={72} y={173} s={11} w={500}>few, deep, lasting</T>

      {[[172, 70], [190, 104], [276, 98], [290, 62]].map(([x, y]) => (
        <g key={x}><line x1={228} y1={140} x2={x} y2={y} stroke={C.ink} strokeWidth={1.5} /><circle cx={x} cy={y} r={4.5} fill={C.r} stroke={C.ink} strokeWidth={1.5} /></g>
      ))}
      <line x1={228} y1={140} x2={166} y2={44} stroke={C.ink} strokeWidth={1.5} strokeDasharray="2 3" />
      <circle cx={166} cy={42} r={5} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="2 2" />
      <polygon points="224,134 232,134 270,36 206,36" fill={C.b1} stroke={C.ink} strokeWidth={1.5} />
      <Box x={198} y={12} w={80} h={24} f={C.b2} />
      <T x={238} y={28.5} f={C.t2} s={12} w={700}>hyperfocus</T>
      <circle cx={228} cy={140} r={6} fill={C.ink} />
      <T x={228} y={160} mono s={10} caps>roaming</T>
      <T x={228} y={173} s={11} w={500}>many, sudden, can fade</T>
    </>
  );
}

function ExecWheel() {
  const L = ['starting', 'planning', 'memory', 'attention', 'time', 'brakes', 'self-check', 'flexing'];
  const pts = L.map((l, i) => { const a = (-90 + i * 45) * Math.PI / 180; return [l, 150 + 112 * Math.cos(a), 115 + 88 * Math.sin(a)]; });
  return (
    <>
      {pts.map(([l, x, y]) => <line key={l} x1={150} y1={115} x2={x} y2={y} stroke={C.ink} strokeWidth={1.5} />)}
      {pts.map(([l, x, y], i) => (
        <g key={l + 'b'}>
          <Box x={x - 38} y={y - 13} w={76} h={26} f={i % 2 ? C.r : C.b1} />
          <T x={x} y={y + 4.5} s={11.5}>{l}</T>
        </g>
      ))}
      <circle cx={150} cy={115} r={30} fill={C.ink} />
      <T x={150} y={121} disp s={20} f={C.g}>you</T>
    </>
  );
}

function SenseProfile() {
  const rows = [['Sight', 270], ['Hearing', 282], ['Touch', 250], ['Smell', 236], ['Taste', 110], ['Inside', 122], ['Balance', 142]];
  const bands = [[92, 68, C.b2, 'seeking'], [160, 68, C.r, 'comfy'], [228, 68, C.b1, 'avoiding']];
  return (
    <>
      {bands.map(([x, w, f, l]) => (
        <g key={l}><rect x={x} y={22} width={w} height={190} fill={f} stroke={C.ink} strokeWidth={SW} /><T x={x + w / 2} y={14} mono s={9.5} caps>{l}</T></g>
      ))}
      {rows.map(([l, x], i) => {
        const y = 38 + i * 25;
        return (
          <g key={l}>
            <T x={84} y={y + 4.5} a="end" s={12}>{l}</T>
            <line x1={96} y1={y} x2={292} y2={y} stroke={C.ink} strokeOpacity={0.35} strokeWidth={1.5} />
            <circle cx={x} cy={y} r={7} fill={C.ink} />
          </g>
        );
      })}
    </>
  );
}

function EmotionSkills() {
  const b = [['notice', 'the body', C.b1, C.ink], ['name', 'the feeling', C.b1, C.ink], ['settle', 'yourself', C.b2, C.t2]];
  return (
    <>
      {b.map(([w, s, f, tf], i) => {
        const x = 6 + i * 102;
        return (
          <g key={w}>
            <Box x={x} y={14} w={84} h={50} f={f} sh={i === 2} />
            <T x={x + 42} y={39} disp s={22} f={tf}>{w}</T>
            <T x={x + 42} y={55} mono s={9.5} f={tf}>{s}</T>
            {i < 2 && <><line x1={x + 87} y1={39} x2={x + 97} y2={39} stroke={C.ink} strokeWidth={SW} /><Head x={x + 98} y={39} /></>}
          </g>
        );
      })}
      <path d="M8 76 V84 H190 V76" fill="none" stroke={C.ink} strokeWidth={1.5} />
      <T x={99} y={102} mono s={9.5} caps>alexithymia makes</T>
      <T x={99} y={115} mono s={9.5} caps>these two harder</T>
    </>
  );
}

function DoubleEmpathy() {
  const cl = (cx, f) => [[cx - 22, 58], [cx + 22, 58], [cx, 98]].map(([x, y]) => ({ x, y, f }));
  const L = cl(62, C.b1), R = cl(238, C.b2);
  const edges = (P) => [[0, 1], [1, 2], [2, 0]].map(([a, b]) => <line key={a + '' + b + P[0].x} x1={P[a].x} y1={P[a].y} x2={P[b].x} y2={P[b].y} stroke={C.ink} strokeWidth={SW} />);
  return (
    <>
      {edges(L)}{edges(R)}
      {[...L, ...R].map((p) => <circle key={p.x + '-' + p.y} cx={p.x} cy={p.y} r={12} fill={p.f} stroke={C.ink} strokeWidth={SW} />)}
      <line x1={104} y1={80} x2={138} y2={80} stroke={C.ink} strokeWidth={SW} strokeDasharray="4 4" />
      <line x1={162} y1={80} x2={196} y2={80} stroke={C.ink} strokeWidth={SW} strokeDasharray="4 4" />
      <Head x={102} y={80} rot={180} /><Head x={198} y={80} />
      <T x={150} y={84} disp s={18}>?</T>
      <T x={150} y={56} mono s={9.5} caps>misses go</T>
      <T x={150} y={68} mono s={9.5} caps>both ways</T>
      <T x={62} y={130} s={11} w={500}>in sync</T>
      <T x={238} y={130} s={11} w={500}>in sync</T>
      <T x={62} y={148} mono s={9.5} caps>neurodivergent</T>
      <T x={238} y={148} mono s={9.5} caps>neurotypical</T>
    </>
  );
}

function ThreeSystems() {
  return (
    <>
      <circle cx={96} cy={160} r={58} fill={C.b2} stroke={C.ink} strokeWidth={SW} />
      <circle cx={204} cy={160} r={58} fill={C.b1} stroke={C.ink} strokeWidth={SW} />
      <circle cx={150} cy={66} r={58} fill={C.ink} stroke={C.ink} strokeWidth={SW} />
      <T x={150} y={64} disp s={26} f={C.g}>threat</T>
      <T x={150} y={82} mono s={9.5} f={C.g}>protect</T>
      <T x={88} y={164} disp s={26} f={C.t2}>drive</T>
      <T x={88} y={182} mono s={9.5} f={C.t2}>want, chase</T>
      <T x={212} y={164} disp s={26}>soothing</T>
      <T x={212} y={182} mono s={9.5}>rest, connect</T>
    </>
  );
}

function Masking() {
  const k = [['suppress', 'hide stims,', 'needs, joy'], ['camouflage', 'copy others,', 'play a role'], ['compensate', 'force eye', 'contact, rehearse']];
  return (
    <>
      {[50, 150, 250].map((x) => <line key={x} x1={150} y1={62} x2={x} y2={96} stroke={C.ink} strokeWidth={1.5} />)}
      <path d="M98 30 Q150 8 202 30 Q208 54 186 63 Q166 71 150 56 Q134 71 114 63 Q92 54 98 30 Z" fill={C.b1} stroke={C.ink} strokeWidth={SW} />
      <ellipse cx={126} cy={39} rx={11} ry={7} fill={C.g} stroke={C.ink} strokeWidth={SW} />
      <ellipse cx={174} cy={39} rx={11} ry={7} fill={C.g} stroke={C.ink} strokeWidth={SW} />
      {k.map(([t, a, b], i) => {
        const x = 4 + i * 100;
        return (
          <g key={t}>
            <Box x={x} y={96} w={92} h={66} />
            <T x={x + 46} y={118} disp s={19}>{t}</T>
            <T x={x + 46} y={138} s={10.5} w={500}>{a}</T>
            <T x={x + 46} y={152} s={10.5} w={500}>{b}</T>
          </g>
        );
      })}
    </>
  );
}

function BurnoutCycle() {
  const n = [['demands rise', C.r, C.ink], ['mask harder', C.r, C.ink], ['capacity drops', C.r, C.ink], ['burnout', C.ink, C.g], ['slow recovery', C.b1, C.ink]];
  const RX = 104, RY = 82;
  const at = (deg) => { const a = deg * Math.PI / 180; return [150 + RX * Math.cos(a), 112 + RY * Math.sin(a)]; };
  const tan = (deg) => { const a = deg * Math.PI / 180; return Math.atan2(RY * Math.cos(a), -RX * Math.sin(a)) * 180 / Math.PI; };
  return (
    <>
      <ellipse cx={150} cy={112} rx={RX} ry={RY} fill="none" stroke={C.ink} strokeWidth={SW} />
      {[-54, 18, 90, 162, 234].map((d) => { const [x, y] = at(d); return <Head key={d} x={x} y={y} rot={tan(d)} />; })}
      {n.map(([l, f, tf], i) => {
        const [x, y] = at(-90 + i * 72);
        return <g key={l}><Box x={x - 46} y={y - 15} w={92} h={30} f={f} /><T x={x} y={y + 4.5} s={11.5} f={tf} w={tf === C.g ? 700 : 600}>{l}</T></g>;
      })}
      <T x={150} y={114} mono s={9.5} caps>if nothing</T>
      <T x={150} y={127} mono s={9.5} caps>changes</T>
    </>
  );
}

function Prima() {
  const s = [['P', 'pause', 'wait'], ['R', 'regulate', 'soothe'], ['I', 'identify', 'name it'], ['M', 'meaning', 'listen'], ['A', 'allow', 'let be']];
  return (
    <>
      {s.map(([l, w, d], i) => {
        const x = 4 + i * 60, lime = i % 2 === 1;
        return (
          <g key={l}>
            <Box x={x} y={8} w={52} h={64} f={lime ? C.b2 : C.b1} />
            <T x={x + 26} y={56} disp s={44} f={lime ? C.t2 : C.ink}>{l}</T>
            <T x={x + 26} y={90} mono s={9.5} caps>{w}</T>
            <T x={x + 26} y={106} s={11} w={500}>{d}</T>
            {i < 4 && <Head x={x + 56} y={40} />}
          </g>
        );
      })}
    </>
  );
}

function Spoons() {
  const spent = (i) => i < 11;
  const groups = [[0, 1, 'shower'], [2, 7, 'work day'], [8, 10, 'groceries']];
  const X = (i) => 14 + i * 24;
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const x = X(i), dim = spent(i);
        const p = { stroke: C.ink, strokeWidth: 1.5, strokeDasharray: dim ? '3 2' : undefined, fill: dim ? 'none' : C.b2, opacity: dim ? 0.6 : 1 };
        return <g key={i}><ellipse cx={x} cy={30} rx={8} ry={11} {...p} /><rect x={x - 2} y={41} width={4} height={40} rx={2} {...p} /></g>;
      })}
      {groups.map(([a, b, l]) => (
        <g key={l}><path d={`M${X(a) - 8} 90 V96 H${X(b) + 8} V90`} fill="none" stroke={C.ink} strokeWidth={1.5} /><T x={(X(a) + X(b)) / 2} y={112} mono s={9.5} caps>{l}</T></g>
      ))}
      <T x={X(11)} y={112} mono s={9.5} caps a="middle">left</T>
      <T x={X(11)} y={98} disp s={16}>1</T>
    </>
  );
}

function Nice() {
  const c = [['N', 'Novel', 'new or different', C.b1, C.ink], ['I', 'Interesting', 'tied to a spin', C.b2, C.t2], ['C', 'Challenging', 'a puzzle', C.b2, C.t2], ['E', 'Emergency', 'the last resort', C.ink, C.g]];
  return c.map(([l, w, s, f, tf], i) => {
    const x = 4 + (i % 2) * 148, y = 4 + Math.floor(i / 2) * 82;
    return (
      <g key={l}>
        <Box x={x} y={y} w={144} h={76} f={f} />
        <T x={x + 12} y={y + 52} a="start" disp s={46} f={tf}>{l}</T>
        <T x={x + 48} y={y + 34} a="start" s={13} w={700} f={tf}>{w}</T>
        <T x={x + 48} y={y + 52} a="start" s={11} w={500} f={tf}>{s}</T>
      </g>
    );
  });
}

function Strawberry() {
  const ring = (cx, r, n, f, rr, off = 0) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI + off; return <circle key={cx + '-' + r + '-' + i} cx={cx + r * Math.cos(a)} cy={78 + r * Math.sin(a)} r={rr} fill={f} stroke={C.ink} strokeWidth={1.5} />; });
  return (
    <>
      <circle cx={75} cy={78} r={52} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
      {ring(75, 52, 8, C.r, 6)}
      <circle cx={75} cy={78} r={10} fill={C.ink} />
      <T x={75} y={150} mono s={9.5} caps>everyone the same</T>
      <T x={75} y={164} s={11} w={500}>fair, but nobody close</T>

      <circle cx={225} cy={78} r={56} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
      {ring(225, 56, 5, C.r, 6, 0.4)}
      <circle cx={225} cy={78} r={24} fill="none" stroke={C.ink} strokeWidth={SW} />
      {ring(225, 24, 3, C.b2, 7.5, -Math.PI / 2)}
      <circle cx={225} cy={78} r={8} fill={C.ink} />
      <T x={225} y={150} mono s={9.5} caps>strawberry people</T>
      <T x={225} y={164} s={11} w={500}>a few, held close</T>
    </>
  );
}

const cloud = 'M0 20 a12 12 0 0 1 10 -18 a16 16 0 0 1 28 -6 a13 13 0 0 1 24 10 a10 10 0 0 1 2 14 z';
function Weather() {
  return (
    <>
      <rect x={2} y={2} width={296} height={146} fill={C.b1} stroke={C.ink} strokeWidth={SW} />
      <g className="fig-drift"><path d={cloud} transform="translate(26 30) scale(1.15)" fill={C.r} stroke={C.ink} strokeWidth={1.8} /></g>
      <g className="fig-drift fig-drift-2"><path d={cloud} transform="translate(186 22) scale(0.9)" fill={C.r} stroke={C.ink} strokeWidth={2} /></g>
      <g className="fig-drift fig-drift-3">
        <path d={cloud} transform="translate(120 66) scale(1.25)" fill={C.ink} stroke={C.ink} strokeWidth={1.6} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={134 + i * 16} y1={98} x2={128 + i * 16} y2={112} stroke={C.ink} strokeWidth={SW} strokeLinecap="round" />)}
      </g>
      <T x={16} y={136} a="start" disp s={22}>you are the sky</T>
      <T x={150} y={168} mono s={9.5} caps>feelings are the weather. they pass.</T>
    </>
  );
}

function Observer() {
  const tags = [['the critic', 150, 22], ['joy', 262, 64], ['worry', 256, 124], ['a memory', 150, 162], ['pride', 44, 124], ['an itch', 40, 64]];
  return (
    <>
      <ellipse cx={150} cy={92} rx={112} ry={68} fill="none" stroke={C.ink} strokeWidth={1.5} strokeDasharray="4 4" />
      {tags.map(([t, x, y]) => { const w = t.length * 6.6 + 18; return <g key={t}><rect x={x - w / 2} y={y - 11} width={w} height={22} rx={11} fill={C.r} stroke={C.ink} strokeWidth={1.5} /><T x={x} y={y + 4} s={11.5}>{t}</T></g>; })}
      <circle cx={150} cy={92} r={36} fill={C.b2} stroke={C.ink} strokeWidth={SW} />
      <T x={150} y={92} disp s={17} f={C.t2}>noticing</T>
      <T x={150} y={106} mono s={9.5} f={C.t2}>you</T>
    </>
  );
}

function Returns() {
  return (
    <>
      <line x1={10} y1={60} x2={284} y2={60} stroke={C.ink} strokeWidth={SW} strokeDasharray="5 4" />
      <Head x={288} y={60} />
      <path d="M10 60 C34 60 46 28 68 26 S100 56 110 60 C128 64 148 96 168 98 S200 64 210 60 C228 56 240 34 256 34 S276 56 284 60" fill="none" stroke={C.deep} strokeWidth={3} strokeLinecap="round" />
      {[110, 210].map((x) => <circle key={x} cx={x} cy={60} r={6} fill={C.b2} stroke={C.ink} strokeWidth={SW} />)}
      <T x={68} y={16} mono s={9.5} caps>drift</T>
      <T x={168} y={116} mono s={9.5} caps>drift</T>
      <T x={110} y={82} mono s={9.5} caps>return</T>
      <T x={210} y={44} mono s={9.5} caps>return</T>
      <T x={10} y={116} a="start" s={11} w={600}>toward what matters</T>
    </>
  );
}

function Steps() {
  const s = ['one text', 'one coffee', 'one group', 'go again'];
  return (
    <>
      <T x={8} y={16} a="start" mono s={9.5} caps>broad goal: feel less alone</T>
      {s.map((l, i) => {
        const x = 8 + i * 70, top = 118 - i * 26;
        return <g key={l}><Box x={x} y={top} w={66} h={146 - top} f={i % 2 ? C.r : C.b1} /><T x={x + 33} y={top + 17} s={11}>{l}</T></g>;
      })}
      <line x1={260} y1={40} x2={260} y2={20} stroke={C.ink} strokeWidth={SW} />
      <polygon points="260,20 290,26 260,32" fill={C.b2} stroke={C.ink} strokeWidth={1.5} />
    </>
  );
}

export const FIGS = {
  spiky: { h: 184, draw: Spiky, alt: 'Bar chart of a spiky profile. Interests, senses and communication are well above a dashed line marking what the world expects. Executive function and emotions sit well below it. Social rules is close to the line.', cap: 'A spiky profile. Some abilities sit well above what the world expects and others well below. An average would hide both.' },
  beams: { h: 180, draw: Beams, alt: 'Two kinds of attention. On the left, one narrow beam reaches deep into a single spin. On the right, thin lines reach several interests, one fades, and one wide beam is labelled hyperfocus.', cap: 'Monotropic attention goes deep into a few spins. ADHD attention roams, then locks on in hyperfocus.' },
  exec: { h: 222, draw: ExecWheel, alt: 'You in the centre, connected to eight executive functions: starting, planning, memory, attention, time, brakes, self-check and flexing.', cap: "Your brain's management team. When one of them is overloaded, the others feel it." },
  senses: { h: 216, draw: SenseProfile, alt: 'An example sensory profile. Sight, hearing, touch and smell sit in the avoiding zone. Taste, inside senses and balance sit in the seeking zone.', cap: 'An example sensory profile. Most of us avoid in some senses and seek in others. Yours will look different.' },
  emoskills: { h: 120, draw: EmotionSkills, alt: 'Three steps in a row: notice the body, name the feeling, settle yourself. A bracket under the first two says alexithymia makes these two harder.', cap: 'Three skills for handling an emotion. If the first two are hard, the third gets much harder.' },
  empathy: { h: 156, draw: DoubleEmpathy, alt: 'Two groups of three linked circles, neurodivergent and neurotypical, each labelled in sync. A broken dashed line between the groups is labelled misses go both ways.', cap: 'The double empathy problem. Each style communicates well within itself. The gap sits between them, so both sides share the work.' },
  systems: { h: 226, draw: ThreeSystems, alt: 'Three overlapping circles: threat (protect), drive (want, chase) and soothing (rest, connect).', cap: 'The three systems. Years of rejection keep threat loud. This work grows soothing.' },
  masking: { h: 166, draw: Masking, alt: 'A mask with three branches: suppress (hide stims, needs, joy), camouflage (copy others, play a role) and compensate (force eye contact, rehearse).', cap: 'Three forms of masking. Each one protects you and costs energy.' },
  cycle: { h: 212, draw: BurnoutCycle, alt: 'A loop of five steps: demands rise, mask harder, capacity drops, burnout, slow recovery, then back to demands rise. The centre reads: if nothing changes.', cap: 'How burnout repeats. Recovery only lasts if something in the loop changes.' },
  prima: { h: 112, draw: Prima, alt: 'Five blocks in a row: P pause, R regulate, I identify, M meaning, A allow.', cap: 'PRIMA, the five steps for big emotions.' },
  spoons: { h: 118, draw: Spoons, alt: 'Twelve spoons. Two are spent on a shower, six on a work day and three on groceries, leaving one.', cap: 'Spoon theory. Everything costs energy, and when the spoons are gone you need rest, not willpower.' },
  nice: { h: 166, draw: Nice, alt: 'Four squares: N for novel, I for interesting, C for challenging, E for emergency, the last resort.', cap: 'Make it NICE. Add the first three on purpose so you rely less on the fourth.' },
  strawberry: { h: 170, draw: Strawberry, alt: 'Two diagrams. On the left, you are at the centre with eight people all at the same distance. On the right, three strawberry people sit close to you inside a small circle, with others further out.', cap: 'Treating everyone the same keeps everyone at a distance. Strawberry people are the few you hold close.' },
  weather: { h: 172, draw: Weather, alt: 'A sky with two light clouds and one dark rain cloud. The sky is labelled you are the sky. Below: feelings are the weather, they pass.', cap: 'Weather moves through. The sky stays the sky.' },
  observer: { h: 176, draw: Observer, alt: 'A circle labelled noticing you, with thoughts and feelings orbiting around it: the critic, joy, worry, a memory, pride, an itch.', cap: 'Thoughts and feelings come and go. The part of you that notices them stays.' },
  returns: { h: 122, draw: Returns, alt: 'A dashed arrow labelled toward what matters, with a wavy line that drifts away from it and returns to it twice.', cap: 'Gentle returns. Drifting is normal. Turning back is the practice.' },
  steps: { h: 148, draw: Steps, alt: 'Four rising steps toward a flag: one text, one coffee, one group, go again. The flag marks the broad goal, feel less alone.', cap: 'A broad goal is reached by small, kind steps.' },
};

export function Figure({ id }) {
  const f = FIGS[id];
  if (!f) return null;
  const D = f.draw;
  return (
    <figure className="fig">
      <svg viewBox={`0 0 300 ${f.h}`} role="img" aria-label={f.alt}>
        <D />
      </svg>
      <figcaption>{f.cap}</figcaption>
    </figure>
  );
}
