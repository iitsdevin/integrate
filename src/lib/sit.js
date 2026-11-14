// Timing for a sit: pure functions, so they can be tested.
export const total = (phases) => phases.reduce((a, p) => a + p.min, 0) * 60;

// Which phase is running `el` seconds in, and how many seconds came before it.
// Past the end it stays on the last phase.
export function locate(active, el) {
  let acc = 0, idx = 0;
  for (; idx < active.phases.length - 1; idx++) {
    if (el < acc + active.phases[idx].min * 60) break;
    acc += active.phases[idx].min * 60;
  }
  return { idx, acc };
}

// A rough sit: keep what was done, cut the current phase short and add a rest.
export function restPlan(active, el, restText, restMin = 5) {
  const { idx, acc } = locate(active, el);
  const kept = active.phases.slice(0, idx);
  kept.push({ ...active.phases[idx], min: Math.max(0.02, (el - acc) / 60) });
  kept.push({ label: 'Rest', min: restMin, text: restText });
  return { ...active, phases: kept, idx: kept.length - 1, rough: true };
}
