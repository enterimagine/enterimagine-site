import { initializeNavigation } from './navigation.js';
import { toggleTechnology, resolveSelection, selectionUrl, parseSelection } from './what-if-model.js';
import { scenarioResult } from './what-if-components.js';

initializeNavigation();
const choices=[...document.querySelectorAll('[data-technology]')];
const explore=document.querySelector('#explore-intersection');
const reset=document.querySelector('#reset-selection');
const status=document.querySelector('#selection-status');
const panel=document.querySelector('#scenario-result');
let selected=[];
function syncSelection(message='') {
  for (const choice of choices) {
    const active=selected.includes(choice.dataset.technology);
    choice.disabled=false;
    choice.setAttribute('aria-pressed',String(active));
    choice.setAttribute('aria-disabled',String(!active && selected.length===3));
    choice.querySelector('.selector-state').innerHTML=active?'Selected <span>✓</span>':'Select <span>+</span>';
  }
  explore.disabled=selected.length<2;
  reset.disabled=selected.length===0;
  status.textContent=message || (selected.length<2
    ? selected.length+' selected. Choose at least two technologies to explore an intersection.'
    : selected.length+' selected. Ready to explore this intersection.');
}
function displayResult(focus=false) {
  const result=resolveSelection(selected);
  panel.innerHTML=scenarioResult(result);
  if (focus) {
    panel.focus({preventScroll:true});
    panel.scrollIntoView({behavior:'instant',block:'start'});
  }
}
function restoreFromUrl() {
  const parsed=parseSelection(location.search);
  selected=parsed.ids;
  syncSelection(parsed.message);
  displayResult();
  if (location.hash==='#scenario-result') panel.scrollIntoView({behavior:'instant',block:'start'});
}
for (const choice of choices) choice.addEventListener('click',()=>{
  const next=toggleTechnology(selected,choice.dataset.technology);
  if (next.message) {syncSelection(next.message);return;}
  selected=next.ids;
  syncSelection();
  // A previous result must never describe a new pending selection.
  panel.innerHTML=scenarioResult({kind:'incomplete',message:'Explore this intersection to read its curated perspective.'});
});
explore.addEventListener('click',()=>{
  if (selected.length<2) return;
  history.pushState(null,'',selectionUrl(selected)+'#scenario-result');
  displayResult(true);
  status.textContent=selected.length+' selected. The intersection is ready below.';
});
reset.addEventListener('click',()=>{
  selected=[];
  history.pushState(null,'','/what-if/');
  syncSelection();
  displayResult();
  choices[0].focus();
});
window.addEventListener('popstate',restoreFromUrl);
restoreFromUrl();
