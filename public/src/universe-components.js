import { characterById, technologyById, episodes } from './content.js';
import { escapeHtml as e, image, tags } from './components.js';
import { entityUrl } from './routes.js';
import { maturityLevels, capabilityProfiles, universeConnections } from './universe.js';

export const universeLink = (kind, entity, label=entity.name || entity.title) =>
  '<a href="' + e(entityUrl(kind,entity)) + '">' + e(label) + '</a>';
export const maturityIndicator = item => {
  const level=maturityLevels.find(level=>level.id===item.status);
  return '<span class="maturity-indicator maturity-' + e(level.id) + '">' + e(level.label) + '</span>';
};
export function capabilityList(items) {
  return '<ul class="capability-list">' + items.map(item=>'<li>' + maturityIndicator(item) +
    '<div><strong>' + e(item.scope) + '</strong><p>' + e(item.note) + '</p></div></li>').join('') + '</ul>';
}
export function connectedUniverse(kind, entity) {
  const groups=universeConnections(kind,entity);
  const labels={characters:'Related minds',technologies:'Related technologies',episodes:'Related episodes'};
  return '<section class="editorial-section universe-connections" id="connected-universe" aria-labelledby="connected-universe-title">' +
    '<p class="eyebrow">Keep exploring</p><h2 id="connected-universe-title">Connected in the Universe</h2><div class="universe-link-groups">' +
    Object.entries(groups).filter(([,items])=>items.length).map(([group,items])=>'<div><h3>' + labels[group] +
      '</h3><ul>' + items.map(item=>'<li>'+universeLink(group,item)+'</li>').join('')+'</ul></div>').join('')+'</div></section>';
}
export function hubMindCard(mind) {
  return '<article class="mind-card hub-mind-card"><a class="hub-art-link" href="' + e(mind.path) + '" tabindex="-1" aria-hidden="true">' +
    image(mind.portrait,mind.name+' — '+mind.role,'portrait') + '</a><div class="card-copy"><h3>' + universeLink('characters',mind) +
    '</h3><p class="role">' + e(mind.role) + '</p>' + tags(mind.focus) + '<p class="mind-question">' + e(mind.perspective) +
    '</p><p class="detail-label">Associated technologies</p><ul class="hub-related">' +
    mind.technologies.map(id=>'<li>'+universeLink('technologies',technologyById[id])+'</li>').join('')+'</ul>' +
    '<a class="text-link hub-card-cta" href="' + e(mind.path) + '">Meet '+e(mind.name)+' <span aria-hidden="true">↗</span></a></div></article>';
}
export function hubTechnologyCard(technology) {
  const capability=capabilityProfiles[technology.id][0];
  return '<article class="technology-card hub-technology-card"><a class="hub-art-link technology-visual" href="' + e(technology.path) +
    '" tabindex="-1" aria-hidden="true">' + image(technology.image,'IMAGINE vision of '+technology.name) +
    '</a><div class="card-copy"><h3>'+universeLink('technologies',technology)+'</h3><p>'+e(technology.shortDescription) +
    '</p><p class="associated">With '+technology.characters.map(id=>universeLink('characters',characterById[id])).join(' &amp; ') +
    '</p><p class="hub-capability">'+maturityIndicator(capability)+'<span>'+e(capability.scope)+'</span></p><p class="hub-horizon">Horizon: '+e(technology.horizon) +
    '</p><a class="text-link hub-card-cta" href="'+e(technology.path)+'">Explore '+e(technology.name)+' <span aria-hidden="true">↗</span></a></div></article>';
}
export function hubEpisodeCard(episode) {
  return '<article class="character-episode-card hub-episode-card"><a class="character-episode-media" href="'+e(episode.path)+'" tabindex="-1" aria-hidden="true">'+
    image(episode.artwork || technologyById[episode.technologies[1]].image,episode.artworkAlt || 'IMAGINE quantum computing laboratory')+'</a><div class="character-episode-copy">'+
    '<p class="eyebrow">Episode '+e(String(episode.number).padStart(2, '0'))+' · '+e(episode.status)+(episode.number === Math.max(...episodes.map(item=>item.number)) ? ' · Latest episode' : '')+'</p><p class="episode-domain-links">'+episode.technologies.map(id=>universeLink('technologies',technologyById[id])).join(' × ')+
    '</p><h3>'+universeLink('episodes',episode)+'</h3><p>'+e(episode.summary)+'</p><p>'+(episode.perspectiveLabel ? e(episode.perspectiveLabel)+': ' : 'With ')+episode.characters.map(id=>universeLink('characters',characterById[id])).join(' + ')+
    ' · Challenger: '+episode.supportingCharacters.map(id=>universeLink('characters',characterById[id])).join(', ')+'</p><p class="episode-status">' + e(episode.status) + '</p>'+
    '<a class="text-link" href="'+e(episode.path)+'#video">Watch the episode <span aria-hidden="true">↗</span></a></div></article>';
}
