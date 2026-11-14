// Línea de tiempo y momentos con video: se generan a partir de los JSON.
import { el } from './dom.js';

export function renderTimeline(items) {
  const list = document.getElementById('timeline');
  list.replaceChildren(...items.map((item) =>
    el('li', { class: 'timeline__item', 'data-reveal': true },
      el('span', { class: 'timeline__year', text: item.year }),
      el('div', {},
        el('h3', { text: item.title }),
        el('p', { text: item.text }),
      ),
    ),
  ));
}

export function renderMoments(moments) {
  const grid = document.getElementById('moments');
  const dialog = document.getElementById('video-dialog');
  const frame = document.getElementById('video-frame');

  const openVideo = (moment) => {
    // El iframe se crea recién al abrir: la página carga rápido y YouTube no
    // descarga nada hasta que el usuario realmente quiere ver el video.
    frame.replaceChildren(el('iframe', {
      src: `https://www.youtube-nocookie.com/embed/${moment.id}?autoplay=1&rel=0`,
      title: moment.title,
      allow: 'autoplay; encrypted-media; picture-in-picture',
      allowfullscreen: true,
    }));
    dialog.showModal();
  };

  // Al cerrar (botón, Esc o click afuera) sacamos el iframe para cortar el audio
  dialog.addEventListener('close', () => frame.replaceChildren());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });

  grid.replaceChildren(...moments.map((m) =>
    el('article', { class: 'moment', 'data-reveal': true },
      el('button', { class: 'moment__thumb', type: 'button', 'aria-label': `Ver video: ${m.title}`, onclick: () => openVideo(m) },
        // Miniatura oficial que YouTube publica para cada video
        el('img', { src: `https://i.ytimg.com/vi/${m.id}/hqdefault.jpg`, alt: '', loading: 'lazy', width: 480, height: 360 }),
        el('span', { class: 'moment__play', 'aria-hidden': 'true' }),
      ),
      el('div', { class: 'moment__body' },
        el('p', { class: 'kicker', text: m.date }),
        el('h3', { text: m.title }),
        el('p', { text: m.text }),
      ),
    ),
  ));
}
