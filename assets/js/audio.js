export const sounds = {
  click: new Audio('/assets/audio/click.wav'),
  drawer: new Audio('/assets/audio/drawer-open.wav')
};

export function play(sound) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  sounds[sound]?.play().catch(() => {});
}
