import { initializeNavigation } from './navigation.js';
import { entityUrl } from './routes.js';
import { characters, technologies, episodes, assets } from './content.js';
import { characterCard, technologyCard, episodeFeature, escapeHtml } from './components.js';

document.querySelector('.hero-image').src = assets.hero;
document.querySelector('#mind-cards').innerHTML = characters.map(characterCard).join('');
document.querySelector('#technology-cards').innerHTML = technologies.map(technologyCard).join('');
document.querySelector('#featured-episode').innerHTML = episodeFeature([...episodes].sort((a, b) => b.number - a.number)[0]);
document.querySelector('#perspectives').innerHTML = characters.map(mind =>
  '<li><a href="' + escapeHtml(entityUrl('characters', mind)) + '"><strong>' + escapeHtml(mind.name) +
  '</strong><span>' + escapeHtml(mind.tagline) + '</span></a></li>').join('');

initializeNavigation();
