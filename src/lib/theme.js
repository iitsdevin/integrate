// Colour scheme and light/dark mode. The status bar colour follows the ground colour.
export const SCHEMES = [
  { id: 'paper', name: 'Paper', note: 'lavender and lime', light: ['#F3EFE4', '#17160F', '#4B42C9', '#C9C5F6', '#DCE86A'], dark: ['#15140E', '#E9E4D6', '#C9C5F6', '#4B3FD0', '#DCE86A'] },
  { id: 'apricot', name: 'Apricot', note: 'from the flower mood board', light: ['#F4ECE2', '#1F1611', '#B4471F', '#F5C3A3', '#A9C3D9'], dark: ['#2A1A12', '#F4E3D3', '#F5A27A', '#A83A12', '#A9C3D9'] },
  { id: 'moss', name: 'Moss', note: 'forest and mustard', light: ['#ECEDE3', '#141812', '#2E5A3C', '#C6D9C2', '#E8C547'], dark: ['#1C3324', '#E6ECDD', '#BFD9B8', '#1B6E42', '#E8C547'] },
  { id: 'cobalt', name: 'Cobalt', note: 'stage blue and pink', light: ['#ECECF3', '#11121B', '#2A37D8', '#C7CBFF', '#F3B6C8'], dark: ['#0E1030', '#E7E8F6', '#A9B1FF', '#2F3FE0', '#F3B6C8'] },
];

const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

export function resolveDark(mode) {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return !!media?.matches;
}

export function applyTheme({ scheme, mode }) {
  const root = document.documentElement;
  const s = SCHEMES.find((x) => x.id === scheme) || SCHEMES[0];
  const dark = resolveDark(mode);
  root.dataset.scheme = s.id;
  root.dataset.theme = dark ? 'dark' : 'light';
  root.style.colorScheme = dark ? 'dark' : 'light';
  setThemeColor(dark ? s.dark[0] : s.light[0]);
}

export function setThemeColor(color) {
  // Replace the per-scheme tags from index.html with one tag the app controls.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m, i) => { if (i > 0) m.remove(); });
  let tag = document.querySelector('meta[name="theme-color"]');
  if (!tag) { tag = document.createElement('meta'); tag.name = 'theme-color'; document.head.append(tag); }
  tag.removeAttribute('media');
  tag.content = color;
}

export function onSystemThemeChange(fn) {
  if (!media) return () => {};
  media.addEventListener('change', fn);
  return () => media.removeEventListener('change', fn);
}
