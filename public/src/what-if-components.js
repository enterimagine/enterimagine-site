import { technologies, characterById, technologyById, episodes } from './content.js';
import { escapeHtml as e, image } from './components.js';
import { universeLink, capabilityList } from './universe-components.js';
import { innovationLens } from './what-if-data.js';

const paragraphs=items=>items.map(text=>'<p>'+e(text)+'</p>').join('');
const resultSection=(title,body,label='')=>'<section class="scenario-section">'+(label?'<p class="eyebrow">'+e(label)+'</p>':'')+'<h3>'+e(title)+'</h3>'+body+'</section>';
export function technologySelector() {
  return '<section class="editorial-section technology-selector" aria-labelledby="selector-title"><p class="eyebrow">Start with a connection</p><h2 id="selector-title">Choose two or three technologies.</h2>'+
    '<p id="selector-guidance">Select the fields that spark your curiosity. Innovation adds a cross-domain lens.</p><div class="selector-grid" role="group" aria-labelledby="selector-title" aria-describedby="selector-guidance">'+
    technologies.map(technology=>'<button class="technology-choice" type="button" data-technology="'+e(technology.id)+'" aria-label="'+e(technology.name)+'" aria-pressed="false" disabled>'+
      '<span class="selector-art" aria-hidden="true">'+image(technology.image,'IMAGINE vision of '+technology.name)+'</span><span class="selector-copy"><span class="selector-name">'+e(technology.name)+
      '</span><span class="selector-state" aria-hidden="true">Select <span>+</span></span></span></button>').join('')+'</div>'+
    '<div class="selector-actions"><p id="selection-status" role="status" aria-live="polite" aria-atomic="true">Choose at least two technologies to explore an intersection.</p>'+
    '<div class="actions"><button class="button" id="explore-intersection" type="button" disabled>Explore this intersection <span aria-hidden="true">↗</span></button>'+
    '<button class="selector-reset" id="reset-selection" type="button" disabled>Clear selection</button></div></div></section>';
}
export function mindAttribution(ids) {
  return '<div class="scenario-minds">'+ids.map(id=>{
    const mind=characterById[id];
    return '<a class="scenario-mind" href="'+e(mind.path)+'">'+image(mind.portrait,mind.name+' — '+mind.role)+
      '<span><strong>'+e(mind.name)+'</strong><span>'+e(mind.role)+'</span></span></a>';
  }).join('')+'</div>';
}
function selectedLinks(result) {
  const groups=[
    ['Related technologies',result.selected.map(id=>universeLink('technologies',technologyById[id]))],
    ['Related minds',result.minds.map(id=>universeLink('characters',characterById[id]))],
    ['Related episodes',(result.scenario?.relatedEpisodes || []).map(id=>universeLink('episodes',episodes.find(episode=>episode.id===id)))]
  ];
  return '<section class="scenario-section universe-connections"><h3>Connected in the Universe</h3><div class="universe-link-groups">'+groups.filter(([,links])=>links.length).map(([label,links])=>
    '<div><h4>'+e(label)+'</h4><ul>'+links.map(link=>'<li>'+link+'</li>').join('')+'</ul></div>').join('')+'</div></section>';
}
export function scenarioResult(result) {
  if (result.kind==='incomplete' || result.kind==='invalid') return '<div class="scenario-empty"><p class="eyebrow">What If?</p><h2>Your next question starts with a connection.</h2><p>'+e(result.message || 'Choose at least two technologies, then explore the intersection.')+'</p></div>';
  const intersection=result.selected.map(id=>technologyById[id].name).join(' × ');
  const header='<p class="eyebrow">Technology intersection</p><p class="scenario-intersection">'+e(intersection)+'</p>';
  const lens=result.lens ? '<aside class="innovation-lens"><h3>'+e(innovationLens.title)+'</h3><p>'+e(innovationLens.description)+'</p></aside>' : '';
  if (result.kind!=='curated') return '<article class="scenario-panel">'+header+'<h2 id="scenario-heading">'+e(result.kind==='lens'?innovationLens.title:'This intersection has not been explored yet.')+'</h2>'+
    '<p>'+e(result.kind==='lens'?innovationLens.standalone:'A future What If? exploration could begin here. Explore the selected technologies and their perspectives below.')+'</p>'+
    (result.kind==='unknown'?lens:'')+resultSection('The Minds',mindAttribution(result.minds),'Perspectives for this intersection')+selectedLinks(result)+'</article>';
  const scenario=result.scenario;
  return '<article class="scenario-panel">'+header+'<p class="eyebrow">What If?</p><h2 id="scenario-heading">'+e(scenario.question)+'</h2>'+lens+
    resultSection('Why it matters',paragraphs(scenario.whyItMatters))+
    '<div class="reality-grid">'+resultSection('Current Reality',paragraphs([scenario.currentReality]),'What exists today')+
      resultSection('Future Possibility',paragraphs([scenario.futurePossibility]),'What could become possible')+'</div>'+
    resultSection('The Minds',mindAttribution(result.minds),'Different perspectives. Shared curiosity.')+
    (result.minds.includes('ethan')?resultSection('Ethan’s Reality Check','<blockquote>'+e(scenario.realityCheck)+'</blockquote>','Ambition, tested'):'')+
    resultSection('Maturity',capabilityList(scenario.maturity)+'<p class="classification-note"><a href="/explore/#maturity">Read the four classifications</a>. Labels describe the named capability, not the whole field.</p>')+
    selectedLinks(result)+(scenario.sources?.length?resultSection('Go deeper','<ul class="source-links">'+scenario.sources.map(source=>'<li><a href="'+e(source.url)+'">'+e(source.title)+'</a></li>').join('')+'</ul>','Primary sources'):'')+'</article>';
}
export function whatIfPage() {
  return '<section class="detail-hero hub-hero what-if-hero"><p class="eyebrow">The future may emerge at the intersections.</p><h1>What If?</h1>'+
    '<p class="lead">Choose technologies that interest you and explore what might become possible when they begin to work together.</p></section><div class="editorial-container what-if-container">'+
    '<noscript><div class="innovation-lens"><h2>Explore the connected universe.</h2><p>Enable JavaScript to select an intersection and read its curated scenario. You can still visit every technology on the <a href="/explore/">Explore hub</a>.</p></div></noscript>'+
    technologySelector()+'<section id="scenario-result" class="scenario-result" aria-label="Your intersection" tabindex="-1">'+
    scenarioResult({kind:'incomplete'})+'</section></div>';
}
