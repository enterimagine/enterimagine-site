// Collective Minds page: idea submission, withdrawal and display of reviewed ideas.
// Talks only to this site's own /api (CSP connect-src 'self'). Stores nothing in the browser.
import './page-main.js';

const SVG = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const monthYear = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); };

async function api(path, options = {}) {
  const res = await fetch('/api/' + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  let body = {};
  try { body = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, body };
}

export function placeIdea(idea, themes, index) {
  const theme = themes.find(t => t.id === idea.themes[0]) || themes[0];
  const [tx, ty] = theme.position, h = hash(idea.id);
  const angle = (h % 360) * Math.PI / 180, r = 62 + (h >> 9) % 46 + (index % 3) * 6;
  return [Math.max(18, Math.min(1082, tx + r * Math.cos(angle))), Math.max(18, Math.min(742, ty + r * Math.sin(angle) * 0.8)), tx, ty];
}

function renderIdeas(ideas, cfg, root) {
  const list = root.querySelector('[data-idea-list]');
  const byId = Object.fromEntries(cfg.themes.map(t => [t.id, t]));
  if (list) list.innerHTML = ideas.length
    ? ideas.map(i => `<article class="cm-idea-card"><p class="cm-idea-text">${esc(i.text)}</p><p class="cm-idea-meta"><span>${esc(i.name || 'A Collective Mind')}</span>${i.approvedAt ? `<span>${esc(monthYear(i.approvedAt))}</span>` : ''}</p><p class="cm-idea-themes">${i.themes.filter(t => byId[t]).map(t => `<a href="${esc(byId[t].path)}">${esc(byId[t].name)}</a>`).join('')}</p></article>`).join('')
    : '<p class="cm-help">No ideas have been published yet. Yours could be the first.</p>';
  const layer = root.querySelector('[data-idea-layer]');
  if (!layer) return;
  layer.replaceChildren();
  ideas.slice(0, cfg.maxNodes).forEach((idea, i) => {
    const [x, y, tx, ty] = placeIdea(idea, cfg.themes, i);
    const line = document.createElementNS(SVG, 'line');
    Object.entries({ class: 'cm-idea-edge', x1: tx, y1: ty, x2: x, y2: y }).forEach(([k, v]) => line.setAttribute(k, v));
    const dot = document.createElementNS(SVG, 'circle');
    Object.entries({ class: 'cm-idea-dot', cx: x, cy: y, r: 6 }).forEach(([k, v]) => dot.setAttribute(k, v));
    const title = document.createElementNS(SVG, 'title'); title.textContent = (idea.name || 'A Collective Mind') + ': ' + idea.text;
    dot.append(title); layer.append(line, dot);
  });
}

export function initializeIdeaWall(root = document) {
  const cfgEl = root.getElementById('cm-idea-config');
  if (!cfgEl) return;
  const cfg = JSON.parse(cfgEl.textContent);
  api('ideas').then(r => { if (r.ok && Array.isArray(r.body.ideas)) renderIdeas(r.body.ideas, cfg, root); });

  const form = root.querySelector('[data-idea-form]');
  if (!form) return;
  form.hidden = false;
  const started = Date.now();
  const text = form.querySelector('#cm-idea-text'), count = form.querySelector('#cm-idea-count');
  const error = form.querySelector('[data-idea-error]'), submit = form.querySelector('[data-idea-submit]');
  const done = root.querySelector('[data-idea-done]');
  const boxes = [...form.querySelectorAll('input[name="themes"]')];
  const showError = msg => { error.textContent = msg; error.hidden = !msg; };
  text.addEventListener('input', () => { count.textContent = text.value.trim().length + ' / ' + text.maxLength; });
  boxes.forEach(b => b.addEventListener('change', () => {
    const n = boxes.filter(x => x.checked).length;
    boxes.forEach(x => { x.disabled = !x.checked && n >= 3; });
  }));
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    const themes = boxes.filter(b => b.checked).map(b => b.value);
    const payload = { text: text.value, name: form.querySelector('#cm-idea-name').value, themes,
      consent: form.querySelector('#cm-idea-consent').checked, website: form.querySelector('#cm-idea-website').value, started };
    if (payload.text.trim().length < text.minLength) return showError(`Please write at least ${text.minLength} characters.`);
    if (!themes.length) return showError('Please choose at least one theme.');
    if (!payload.consent) return showError('Please confirm that your idea may be shown publicly after review.');
    showError(''); submit.disabled = true; submit.textContent = 'Sending…';
    const r = await api('ideas', { method: 'POST', body: JSON.stringify(payload) }).catch(() => ({ ok: false, body: {} }));
    submit.disabled = false; submit.textContent = 'Send my idea for review';
    if (!r.ok) return showError(r.body.error || 'Your idea could not be sent. Please try again later.');
    form.hidden = true; form.reset(); boxes.forEach(b => { b.disabled = false; }); count.textContent = '0 / ' + text.maxLength;
    if (r.body.id) {
      done.querySelector('[data-idea-id]').textContent = r.body.id;
      done.querySelector('[data-idea-code]').textContent = r.body.removalCode;
    }
    done.hidden = false; done.focus();
  });
  done.querySelector('[data-idea-again]').addEventListener('click', () => { done.hidden = true; form.hidden = false; text.focus(); });
  done.querySelector('[data-idea-copy]').addEventListener('click', ev => {
    const value = 'IMAGINE idea ' + done.querySelector('[data-idea-id]').textContent + ' · removal code ' + done.querySelector('[data-idea-code]').textContent;
    navigator.clipboard?.writeText(value).then(() => { ev.target.textContent = 'Copied'; }, () => { ev.target.textContent = 'Select and copy the code above'; });
  });

  const wf = root.querySelector('[data-withdraw-form]');
  wf?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const status = wf.querySelector('[data-withdraw-status]');
    const r = await api('ideas/withdraw', { method: 'POST', body: JSON.stringify({ id: wf.querySelector('#cm-withdraw-id').value.trim(), code: wf.querySelector('#cm-withdraw-code').value.trim() }) })
      .catch(() => ({ ok: false, body: {} }));
    status.textContent = r.ok ? 'Your idea has been withdrawn and deleted.' : (r.body.error || 'Something went wrong. Please try again later.');
    if (r.ok) { wf.reset(); api('ideas').then(x => { if (x.ok) renderIdeas(x.body.ideas, cfg, root); }); }
  });
}

if (typeof document !== 'undefined') initializeIdeaWall();
