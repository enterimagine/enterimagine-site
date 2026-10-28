import { characterById, technologyById, episodes } from './content.js';
import { entityUrl, published } from './routes.js';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const e = escapeHtml;
export const tags = items => '<ul class="tags">' + items.map(item => '<li>' + e(item) + '</li>').join('') + '</ul>';
export const image = (src, alt, className = '') => '<img class="' + e(className) + '" src="' + e(src) + '" alt="' + e(alt) + '" loading="lazy" decoding="async">';
export function characterCard(mind) {
  return `<article class="mind-card" id="mind-${e(mind.id)}">
    ${image(mind.portrait, mind.name + ', ' + mind.role, 'portrait')}
    <div class="card-copy"><h3>${published.characters.has(mind.id) ? '<a href="' + e(entityUrl('characters', mind)) + '">' + e(mind.name) + '</a>' : e(mind.name)}</h3><p class="role">${e(mind.role)}</p>
    <p class="focus">${e(mind.focus.join(' · '))}</p>
    <p class="mind-question">“${e(mind.perspective)}”</p>
    <details><summary>Meet ${e(mind.name)}</summary><p>${e(mind.description)}</p><p class="detail-label">Explore with ${e(mind.name)}</p><ul class="detail-links">${mind.technologies.map(id => '<li><a href="' + e(entityUrl('technologies', technologyById[id])) + '">' + e(technologyById[id].name) + '</a></li>').join('')}</ul></details></div></article>`;
}
export function technologyCard(technology, index) {
  return `<article class="technology-card" id="technology-${e(technology.id)}">
    <div class="technology-visual">${image(technology.image, 'IMAGINE vision of ' + technology.name)}<span class="card-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></div>
    <div class="card-copy"><h3>${published.technologies.has(technology.id) ? '<a href="' + e(entityUrl('technologies', technology)) + '">' + e(technology.name) + '</a>' : e(technology.name)}</h3><p>${e(technology.shortDescription)}</p>
    <p class="associated">With ${technology.characters.map(id => '<a href="' + e(entityUrl('characters', characterById[id])) + '">' + e(characterById[id].name) + '</a>').join(' &amp; ')}</p>
    <details><summary>Explore ${e(technology.name)}</summary><p><strong>Where we are:</strong> ${e(technology.maturity)}.</p><p><strong>Horizon:</strong> ${e(technology.horizon)}.</p><p class="detail-label">Connected technologies</p><ul class="detail-links">${technology.relatedTechnologies.map(id => '<li><a href="' + e(entityUrl('technologies', technologyById[id])) + '">' + e(technologyById[id].name) + '</a></li>').join('')}</ul>${technology.episodes.length ? '<a href="' + e(episodes.find(item => item.id === technology.episodes[0]).path) + '">Discover the featured episode →</a>' : ''}</details></div></article>`;
}
export function episodeFeature(episode) {
  return `<article class="episode-feature"><div class="episode-media">${image(technologyById['quantum-computing'].image, 'IMAGINE quantum computing laboratory')}</div>
    <div class="episode-copy">${tags(episode.technologies.map(id => technologyById[id].name))}
    <h2 id="episode-title"><a href="${e(entityUrl('episodes', episode))}">${e(episode.title)}</a></h2><p class="lead">${e(episode.hook)}</p><p>${e(episode.summary)}</p>
    <p>With ${episode.characters.map(id => '<a href="' + e(entityUrl('characters', characterById[id])) + '">' + e(characterById[id].name) + '</a>').join(' &amp; ')} · Challenged by <a href="${e(entityUrl('characters', characterById['ethan']))}">Ethan</a></p>
    <p class="episode-status">${e(episode.status)}</p>
    <p><a class="button" href="${e(episode.path)}#video">Watch Episode ${String(episode.number).padStart(3, '0')} <span aria-hidden="true">↗</span></a></p>
    <details class="episode-details"><summary>Explore the episode idea</summary>
    <h3>Current reality</h3><p>${e(episode.currentReality)}</p><h3>Future possibility</h3><p>${e(episode.futurePossibility)}</p>
    ${tags(episode.applications)}<h3>Ethan’s reality check</h3><p>${e(episode.realismNotes)}</p>
    <p class="classification">${e(episode.classification.maturity)} · ${e(episode.classification.horizon)}</p><p class="what-if">${e(episode.whatIfQuestion)}</p></details></div></article>`;
}

// Progressive enhancement: no iframe, YouTube artwork or third-party script before a deliberate click.
export function episodePlayer(episode) {
  if (episode.videoProvider !== 'youtube' || !/^[A-Za-z0-9_-]{11}$/.test(episode.videoId || '') ||
      episode.videoUrl !== 'https://youtu.be/' + episode.videoId) return '';
  const id = 'player-' + episode.id;
  const credit = episode.musicCredit;
  return `<section class="episode-watch" id="video" aria-labelledby="video-title">
    <p class="eyebrow">${e(episode.status)} · EnterImagine</p><h2 id="video-title">Watch the conversation.</h2>
    <div class="episode-player" data-episode-player data-video-id="${e(episode.videoId)}" data-video-title="${e(episode.title)}">
      <div class="episode-player-frame" id="${e(id)}" data-player-frame>
        <div class="episode-player-preview" data-player-preview>${image(episode.artwork || technologyById[episode.technologies[1]].image, episode.artworkAlt || 'IMAGINE quantum computing laboratory — episode artwork')}
          <button class="button episode-load" type="button" data-player-load aria-controls="${e(id)}" aria-describedby="video-privacy" hidden>Load YouTube player <span aria-hidden="true">▶</span></button>
        </div>
      </div>
      <p class="player-privacy" id="video-privacy">The player connects to YouTube/Google only when you load it. Playback may use cookies or other storage. You can also watch directly on YouTube.</p>
      <div class="episode-player-actions"><a class="text-link" href="${e(episode.videoUrl)}" rel="external">Watch on YouTube <span aria-hidden="true">↗</span></a>
        <button class="text-link episode-unload" type="button" data-player-close hidden>Close YouTube player</button></div>
    </div>
    ${credit ? `<details class="episode-music-credit"><summary>Music credit &amp; license</summary><p>${e(credit.attribution)}<br><a href="${e(credit.website)}">www.scottbuckley.com.au</a><br>Track: <a href="${e(credit.trackUrl)}">${e(credit.trackUrl)}</a><br>License: <a href="${e(credit.licenseUrl)}">${e(credit.licenseUrl)}</a><br>${e(credit.adaptation)}</p></details>` : ''}
  </section>`;
}
