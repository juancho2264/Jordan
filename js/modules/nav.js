// Menú móvil, header compacto y "scroll spy" (resaltar la sección visible).
// Todo con IntersectionObserver: el navegador avisa cuando algo entra o sale
// de pantalla, en lugar de escuchar 'scroll' decenas de veces por segundo.

export function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const links = [...menu.querySelectorAll('a')];

  // --- Menú móvil: el estado vive en aria-expanded (accesible y fácil de leer en CSS)
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));

  // --- Header compacto cuando la portada deja de verse
  const hero = document.getElementById('inicio');
  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('nav--solid', !entry.isIntersecting);
  }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);

  // --- Scroll spy: marca el link de la sección que cruza el centro de la pantalla
  const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  byId.forEach((_, id) => spy.observe(document.getElementById(id)));
}

/** Hace aparecer suavemente los elementos con [data-reveal] al entrar en pantalla. */
export function initReveal(root = document) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target); // una sola vez, no hace falta seguir mirando
    });
  }, { threshold: 0.15 });
  root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((n) => io.observe(n));
}
