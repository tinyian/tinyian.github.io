const root = document.documentElement;
const toggle = document.querySelector('[data-theme-toggle]');

toggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// on load
const saved = localStorage.getItem('theme');
if (saved) root.setAttribute('data-theme', saved);
