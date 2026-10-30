// Scientific Universe series map: interaction layer (the map itself is pre-rendered at build time).
// Adapted from the owner's IMAGINE Map package. Stores nothing in the browser.
import './page-main.js';

function initializeUniverseMap(root = document) {
  const dataEl = root.getElementById('su-data');
  if (!dataEl) return;
  const data = JSON.parse(dataEl.textContent);
  const byId = Object.fromEntries(data.domains.map(d => [d.id, d]));
  const nodes = [...root.querySelectorAll('.su-node')];
  const edges = [...root.querySelectorAll('.su-edge')];
  const cards = [...root.querySelectorAll('.su-card')];
  const threads = [...root.querySelectorAll('.su-thread')];
  const reset = root.querySelector('[data-map-reset]');
  const eyebrow = root.querySelector('[data-panel-eyebrow]'), title = root.querySelector('[data-panel-title]');
  const text = root.querySelector('[data-panel-text]'), note = root.querySelector('[data-panel-note]');
  const articleDomains = Object.fromEntries(data.articles.map(a => [a.n, a.d]));
  let state = null;

  function select(next) {
    state = state && next && state.type === next.type && state.id === next.id ? null : next;
    render();
  }

  function render() {
    let shown = Object.keys(articleDomains).map(Number), domains = null, edgeOn = null, hl = [];
    let ey = 'All articles', ti = 'The series so far', tx = data.allText, empty = false;
    if (state?.type === 'domain') {
      const d = byId[state.id];
      shown = shown.filter(n => articleDomains[n].includes(d.id));
      domains = new Set([d.id]); shown.forEach(n => articleDomains[n].forEach(x => domains.add(x)));
      edgeOn = pair => pair.split('|').includes(d.id);
      ey = 'Domain · ' + shown.length + ' article' + (shown.length === 1 ? '' : 's'); ti = d.name; tx = d.blurb; hl = [d.id];
      empty = shown.length === 0;
    } else if (state?.type === 'article') {
      const ds = articleDomains[state.id]; shown = [state.id]; domains = new Set(ds); hl = ds;
      edgeOn = pair => { const [p, q] = pair.split('|'); return ds.includes(p) && ds.includes(q); };
      ey = 'Article No. ' + state.id; ti = root.querySelector('.su-card[data-article="' + state.id + '"] h3').textContent;
      tx = 'Crosses ' + ds.map(x => byId[x].name).join(', ') + '.';
    } else if (state?.type === 'thread') {
      const th = data.threads.find(t => t.id === state.id); shown = th.articles;
      domains = new Set(); shown.forEach(n => articleDomains[n].forEach(x => domains.add(x)));
      edgeOn = (pair, arts) => arts.some(n => th.articles.includes(n));
      ey = 'Thread'; ti = th.title; tx = th.text;
    }
    for (const g of nodes) {
      const id = g.dataset.domain;
      g.classList.toggle('on', !!domains && domains.has(id) && (state?.type === 'domain' ? hl.includes(id) : true));
      g.classList.toggle('dim', !!domains && !domains.has(id));
      g.setAttribute('aria-pressed', String(state?.type === 'domain' && state.id === id));
    }
    for (const p of edges) {
      const on = edgeOn ? edgeOn(p.dataset.pair, p.dataset.articles.split(' ').map(Number)) : false;
      p.classList.toggle('on', on); p.classList.toggle('dim', !!edgeOn && !on);
    }
    for (const c of cards) {
      const n = Number(c.dataset.article);
      c.hidden = !shown.includes(n);
      c.classList.toggle('on', state?.type === 'article' && state.id === n);
      for (const chip of c.querySelectorAll('.su-chip')) chip.classList.toggle('hl', hl.includes(chip.dataset.domain));
    }
    if (state?.type === 'thread') {
      const box = cards[0].parentNode; state && data.threads.find(t => t.id === state.id).articles.forEach(n => box.append(cards.find(c => Number(c.dataset.article) === n)));
    } else {
      const box = cards[0].parentNode; [...cards].sort((a, b) => a.dataset.article - b.dataset.article).forEach(c => box.append(c));
    }
    for (const t of threads) t.classList.toggle('on', state?.type === 'thread' && state.id === t.dataset.thread);
    eyebrow.textContent = ey; title.textContent = ti; text.textContent = tx;
    note.innerHTML = empty ? '<p class="su-empty"><strong>Open territory.</strong> No article crosses this domain yet. It is the clearest gap in the series and a natural subject for the next batch.</p>' : '';
    reset.hidden = !state;
  }

  const activate = (el, handler) => {
    el.addEventListener('click', handler);
    el.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target === el) { ev.preventDefault(); handler(ev); } });
  };
  nodes.forEach(g => activate(g, () => select({ type: 'domain', id: g.dataset.domain })));
  // A card opens its article wherever it is pressed (picture, title, summary); the links inside handle it natively.
  cards.forEach(c => c.addEventListener('click', ev => {
    if (ev.target.closest('a') || ev.defaultPrevented) return;
    const link = c.querySelector('.su-read'); if (link) location.href = link.href;
  }));
  root.querySelectorAll('[data-thread-pick]').forEach(b => b.addEventListener('click', () => {
    select({ type: 'thread', id: b.dataset.threadPick });
    root.querySelector('.su-main').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }));
  reset.addEventListener('click', () => select(null));
  root.documentElement.classList.add('su-ready');
}

if (typeof document !== 'undefined') initializeUniverseMap();
