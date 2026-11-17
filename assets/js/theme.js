// Runs before first paint (loaded without defer) so the right theme is set
// before anything is drawn. Kept in its own file so the CSP can forbid inline scripts.
(function () {
  var root = document.documentElement, t = null;
  try { t = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  root.setAttribute('data-theme', t);
  root.setAttribute('data-mode', 'campus');
  root.classList.add('js');
})();
