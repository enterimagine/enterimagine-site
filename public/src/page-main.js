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
if (typeof document !== 'undefined') {
  initializeNavigation();
  initializeEpisodePlayers();
}
