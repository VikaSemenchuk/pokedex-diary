const btn = document.getElementById('backToTopBtn');

if (btn) {
  const toggle = () => {
    const show = window.scrollY > 300;
    ['opacity-0', 'translate-y-4', 'pointer-events-none'].forEach(c => btn.classList.toggle(c, !show));
    ['opacity-100', 'translate-y-0'].forEach(c => btn.classList.toggle(c, show));
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { toggle(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  toggle();
}