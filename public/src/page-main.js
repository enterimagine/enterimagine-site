import { initializeNavigation } from './navigation.js';

export function initializeEpisodePlayers(root = document) {
  for (const player of root.querySelectorAll('[data-episode-player]')) {
    const id = player.dataset.videoId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id || '') || player.dataset.initialized) continue;
    const frame = player.querySelector('[data-player-frame]');
    const preview = player.querySelector('[data-player-preview]');
    const load = player.querySelector('[data-player-load]');
    const close = player.querySelector('[data-player-close]');
    if (!frame || !preview || !load || !close) continue;
    player.dataset.initialized = 'true';
    let iframe;
    load.hidden = false;
    load.addEventListener('click', () => {
      if (iframe) return;
      iframe = root.createElement('iframe');
      iframe.title = player.dataset.videoTitle + ' — YouTube video player';
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.tabIndex = 0;
      preview.hidden = true;
      frame.append(iframe);
      close.hidden = false;
      iframe.focus();
    });
    close.addEventListener('click', () => {
      iframe?.remove();
      iframe = undefined;
      preview.hidden = false;
      close.hidden = true;
      load.focus();
    });
  }
}
// Opening an article always starts at its title. A link to a citation (#ref-3) and the
// browser's Back/Forward keep their own position; this also scrolls a hosting frame.
export function startArticleAtTop(root = document) {
  const article = root.querySelector('.article-page');
  if (!article || location.hash) return;
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  if (nav && nav.type === 'back_forward') return;
  const reveal = () => { scrollTo(0, 0); root.body.scrollIntoView({ block: 'start', behavior: 'instant' }); };
  reveal();
  addEventListener('load', reveal, { once: true });
}
if (typeof document !== 'undefined') {
  initializeNavigation();
  initializeEpisodePlayers();
  startArticleAtTop();
}
