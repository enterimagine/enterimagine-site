// Collective Minds page: idea submission, withdrawal and display of reviewed ideas.
// Talks only to this site's own /api (CSP connect-src 'self'). Stores nothing in the browser.
import './page-main.js';

const SVG = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const cardId = idea => 'cm-idea-' + String(idea.id).replace(/[^A-Za-z0-9_-]/g, '');
const monthYear =iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); };

async function api(path, options = {}) {
  const res = await fetch('/api/' + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  let body = {};
  try { body = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, body };
}

// Geometry of the desktop network (viewBox 1100 x 760): theme pills are 210 x 44, founder cards 118 x 144.
const CENTRE = [550, 340], PILL = [105, 22], CARD = [59, 72], GAP = 12;
const inside = ([x, y], [cx, cy], [hw, hh], pad) => Math.abs(x - cx) < hw + pad && Math.abs(y - cy) < hh + pad;

// Place a reviewed idea as a dot just outside its first theme's pill, on the side facing away from the
// centre, never under a pill, a founder card or the centre label. Deterministic per idea id.
// Mobile constellation (percent of its box): founders sit on a ring around (50, 52.3) at about
// -147, -90, -33, 46 and 134 degrees; idea slots use the free arcs between them on two rings.
const MOBILE_ANGLES = [0, 15, 75, 90, 105, 165, 180, 195, 240, 300];
export const MOBILE_SLOTS = [40, 46].flatMap(r => MOBILE_ANGLES.map(deg => {
  const t = deg * Math.PI / 180;
  return [Math.round((50 + r * Math.cos(t)) * 10) / 10, Math.round((52.3 + r * Math.sin(t)) * 10) / 10];
})).filter(([x, y]) => x >= 3 && x <= 97 && y >= 3 && y <= 97);

export function placeIdea(idea, themes, index, founders = []) {
  const theme = themes.find(t => t.id === idea.themes[0]) || themes[0];
  const [tx, ty] = theme.position, h = hash(idea.id);
  const outward = Math.atan2(ty - CENTRE[1], tx - CENTRE[0]);
  const blocked = p => p[0] < 14 || p[0] > 1086 || p[1] < 14 || p[1] > 746
    || themes.some(t => inside(p, t.position, PILL, GAP))
    || founders.some(f => inside(p, f, CARD, GAP))
    || inside(p, CENTRE, [60, 20], GAP);
  const spread = ((h % 101) / 100 - 0.5) * 1.6;        // about +-46 degrees around the outward direction
  const extra = 8 + (h >>> 9) % 26 + (index % 3) * 9;
  let first;
  for (let k = 0; k < 24; k++) {
    // Try the preferred angle first, then alternate further around the pill.
    const a = outward + spread + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.26;
    const c = Math.cos(a), s = Math.sin(a);
    const along = ([hw, hh]) => Math.min(hw / Math.max(Math.abs(c), 1e-6), hh / Math.max(Math.abs(s), 1e-6));
    const out = along([PILL[0] + GAP, PILL[1] + GAP]) + extra, rim = along(PILL);
    const p = [tx + out * c, ty + out * s], edge = [tx + rim * c, ty + rim * s];
    first ||= [...p, ...edge];
    if (!blocked(p)) return [...p, ...edge];
  }
  return first;
}

const founderOf = (cfg, id) => (cfg.founders || []).find(f => f && f.id === id);
const replyHtml = (i, cfg) => {
  const f = i.reply && founderOf(cfg, i.reply.mind);
  if (!f) return '';
  return `<div class="cm-idea-reply">${f.portrait ? `<img src="${esc(f.portrait)}" alt="" width="40" height="50" loading="lazy" decoding="async">` : ''}<div><p class="cm-reply-by">Reply from <a href="${esc(f.path)}">${esc(f.name)}</a> · ${esc(f.role)}</p><p class="cm-reply-text">${esc(i.reply.text)}</p></div></div>`;
};

// Members sit a little further out than idea dots, with room for their name label below the node.
export function placeMember(member, themes, founders = []) {
  const theme = themes.find(t => t.id === member.domains[0]) || themes[0];
  const [tx, ty] = theme.position, h = hash(member.id);
  const outward = Math.atan2(ty - CENTRE[1], tx - CENTRE[0]);
  const labelW = Math.min(14, member.name.length) * 7.5;
  const clash = ([x, y]) => {
    const boxes = [[x, y, 12, 12], [x, y + 25, labelW / 2 + 4, 10]];
    return x < 30 + labelW / 2 || x > 1070 - labelW / 2 || y < 24 || y > 716
      || boxes.some(([bx, by, hw, hh]) => themes.some(t => inside([bx, by], t.position, [PILL[0] + hw, PILL[1] + hh], GAP))
        || founders.some(f => inside([bx, by], f, [CARD[0] + hw, CARD[1] + hh], GAP)) || inside([bx, by], CENTRE, [60 + hw, 20 + hh], GAP));
  };
  let first;
  for (let k = 0; k < 36; k++) {
    const a = outward + ((h % 61) / 60 - 0.5) * 0.8 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.22;
    for (const dist of [150, 175, 125, 200]) {
      const p = [tx + dist * Math.cos(a), ty + dist * Math.sin(a) * 0.8];
      first ||= p;
      if (!clash(p)) return p;
    }
  }
  return first;
}

const memberCardId = id => 'cm-member-' + String(id).replace(/[^A-Za-z0-9_-]/g, '');
const shortName = n => (n.length > 14 ? n.slice(0, 13) + '…' : n);

function sparkHtml(i, state) {
  const n = Number(i.sparks || 0);
  if (state.me) {
    const on = state.sparks.has(i.id);
    return `<p class="cm-spark-row"><button class="cm-spark" type="button" data-spark="${esc(i.id)}" aria-pressed="${on}" aria-label="${on ? 'Remove your spark' : 'Spark this idea'}">✦ <span>${n}</span></button></p>`;
  }
  return `<p class="cm-spark-row"><a class="cm-spark" href="/collective-minds/member/" aria-label="Join to spark this idea">✦ <span>${n}</span></a><span class="cm-help-inline">Members can spark ideas</span></p>`;
}

export function renderIdeas(ideas, cfg, root, state = { members: [], me: null, sparks: new Set() }) {
  const list = root.querySelector('[data-idea-list]');
  const byId = Object.fromEntries(cfg.themes.map(t => [t.id, t]));
  const members = state.members || [], memberById = Object.fromEntries(members.map(m => [m.id, m]));
  const author = i => { const m = i.memberId && memberById[i.memberId]; return m ? `<a href="#${esc(memberCardId(m.id))}">${esc(m.name)}</a>` : esc(i.name || 'A Collective Mind'); };
  if (list) list.innerHTML = ideas.length
    ? ideas.map(i => `<article class="cm-idea-card" id="${esc(cardId(i))}" tabindex="-1"><p class="cm-idea-text">${esc(i.text)}</p><p class="cm-idea-meta"><span>${author(i)}</span>${i.approvedAt ? `<span>${esc(monthYear(i.approvedAt))}</span>` : ''}</p><p class="cm-idea-themes">${i.themes.filter(t => byId[t]).map(t => `<a href="${esc(byId[t].path)}">${esc(byId[t].name)}</a>`).join('')}</p>${replyHtml(i, cfg)}${sparkHtml(i, state)}</article>`).join('')
    : '<p class="cm-help">No ideas have been published yet. Yours could be the first.</p>';
  const mlist = root.querySelector('[data-member-list]');
  if (mlist && members.length) mlist.innerHTML = members.map(m => `<article class="cm-idea-card cm-member-card" id="${esc(memberCardId(m.id))}" tabindex="-1"><p class="member-card-name">${esc(m.name)}</p><p class="cm-idea-themes">${m.domains.filter(t => byId[t]).map(t => `<a href="${esc(byId[t].path)}">${esc(byId[t].name)}</a>`).join('')}</p>${m.whatIf ? `<p class="cm-idea-text">${esc(m.whatIf)}</p>` : ''}<p class="cm-idea-meta"><span>Member since ${esc(monthYear(m.joinedAt))}</span><span>${ideas.filter(i => i.memberId === m.id).length} ideas</span></p></article>`).join('');
  const joined = root.querySelector('[data-minds-joined]');
  if (joined && (ideas.length || members.length)) {
    const parts = [members.length ? members.length + (members.length === 1 ? ' member' : ' members') : '', ideas.length ? ideas.length + (ideas.length === 1 ? ' idea' : ' ideas') : ''].filter(Boolean);
    joined.textContent = '+ ' + parts.join(' · ') + ' from new minds.'; joined.hidden = false;
  }
  const layer = root.querySelector('[data-idea-layer]');
  if (!layer) return;
  layer.replaceChildren();
  const positions = (cfg.founders || []).map(f => (Array.isArray(f) ? f : f.position));
  const edge = (cls, x1, y1, x2, y2) => { const l = document.createElementNS(SVG, 'line'); Object.entries({ class: cls, x1, y1, x2, y2 }).forEach(([k, v]) => l.setAttribute(k, v)); return l; };
  const links = document.createElementNS(SVG, 'g'); links.setAttribute('class', 'cm-idea-links');
  layer.append(links);
  // Members are named nodes linked to each of their favorite domains.
  const memberPos = {};
  members.slice(0, cfg.maxNodes).forEach((m, i) => {
    const [x, y] = placeMember(m, cfg.themes, positions);
    memberPos[m.id] = [x, y];
    m.domains.map(t => byId[t]).filter(Boolean).forEach((t, k) => links.append(edge(k ? 'cm-member-edge cm-member-edge--extra' : 'cm-member-edge', x, y, t.position[0], t.position[1])));
    const a = document.createElementNS(SVG, 'a');
    a.setAttribute('href', '#' + memberCardId(m.id)); a.setAttribute('tabindex', '-1'); a.setAttribute('class', 'cm-member-link');
    const c = document.createElementNS(SVG, 'circle');
    Object.entries({ class: 'cm-member-node', cx: x, cy: y, r: 10 }).forEach(([k, v]) => c.setAttribute(k, v));
    const label = document.createElementNS(SVG, 'text');
    Object.entries({ class: 'cm-member-label', x, y: y + 25, 'text-anchor': 'middle' }).forEach(([k, v]) => label.setAttribute(k, v));
    label.textContent = shortName(m.name);
    const title = document.createElementNS(SVG, 'title'); title.textContent = m.name + ' · member of the Collective';
    a.append(title, c, label); layer.append(a);
  });
  ideas.slice(0, cfg.maxNodes).forEach((idea, i) => {
    const [x, y, ex, ey] = placeIdea(idea, cfg.themes, i, positions);
    const line = edge('cm-idea-edge', ex, ey, x, y);
    // Every new mind connects to each theme it touches; the theme pills are drawn on top, so lines end at their rim.
    idea.themes.slice(1).map(t => byId[t]).filter(Boolean).forEach(t => links.append(edge('cm-idea-edge cm-idea-edge--extra', x, y, t.position[0], t.position[1])));
    const f = idea.reply && founderOf(cfg, idea.reply.mind);
    if (f && f.position) links.append(edge('cm-idea-reply-edge', x, y, f.position[0], f.position[1]));
    const mp = idea.memberId && memberPos[idea.memberId];
    if (mp) links.append(edge('cm-idea-member-edge', x, y, mp[0], mp[1]));
    // The network graphic is decorative for assistive technology; the linked card list below carries the content.
    const link = document.createElementNS(SVG, 'a');
    link.setAttribute('href', '#' + cardId(idea)); link.setAttribute('tabindex', '-1'); link.setAttribute('class', 'cm-idea-link');
    const dot = document.createElementNS(SVG, 'circle');
    Object.entries({ class: 'cm-idea-dot', cx: x, cy: y, r: 7 }).forEach(([k, v]) => dot.setAttribute(k, v));
    const title = document.createElementNS(SVG, 'title'); title.textContent = (idea.name || 'A Collective Mind') + ': ' + idea.text + ' (click to read)';
    link.append(title, dot); layer.append(line, link);
  });
  // Mobile view: dots on the outer ring, in the arcs between the five founding minds.
  const mlayer = root.querySelector('[data-mobile-idea-layer]');
  if (mlayer) {
    mlayer.replaceChildren();
    const msvg = root.querySelector('.cm-mobile-lines');
    msvg?.querySelectorAll('.cm-mobile-idea-edge').forEach(n => n.remove());
    const mline = (cls, x1, y1, x2, y2) => { const l = document.createElementNS(SVG, 'line'); Object.entries({ class: 'cm-mobile-idea-edge ' + cls, x1, y1, x2, y2, 'vector-effect': 'non-scaling-stroke' }).forEach(([k, v]) => l.setAttribute(k, v)); msvg?.append(l); };
    const free = MOBILE_SLOTS.slice(), mpos = {};
    // Members take evenly spaced slots on the outer ring, so their name labels never crowd together.
    const outer = free.filter(([x, y]) => Math.hypot(x - 50, y - 52.3) > 43).sort((a, b) => Math.atan2(a[1] - 52.3, a[0] - 50) - Math.atan2(b[1] - 52.3, b[0] - 50));
    const shown = members.slice(0, Math.min(6, outer.length));
    const picks = shown.map((m, i) => outer[Math.floor(i * outer.length / shown.length)]);
    shown.forEach((m, i) => {
      const [x, y] = picks[i];
      free.splice(free.indexOf(picks[i]), 1);
      mpos[m.id] = [x, y];
      mline('cm-member-edge', x, y, 50, 52.3);
      const a = document.createElement('a');
      a.className = 'cm-mobile-member'; a.href = '#' + memberCardId(m.id); a.tabIndex = -1; a.title = m.name;
      a.style.left = x + '%'; a.style.top = y + '%';
      const span = document.createElement('span'); span.textContent = shortName(m.name);
      span.className = x < 20 ? 'is-left' : x > 80 ? 'is-right' : '';
      a.append(span);
      mlayer.append(a);
    });
    ideas.slice(0, free.length).forEach(idea => {
      const [x, y] = free.splice(hash(idea.id) % free.length, 1)[0];
      // Each new mind links into the shared centre (or its member), and to the founding mind who replied.
      const mp = idea.memberId && mpos[idea.memberId];
      mline('cm-idea-edge', x, y, mp ? mp[0] : 50, mp ? mp[1] : 52.3);
      const f = idea.reply && founderOf(cfg, idea.reply.mind);
      if (f && f.mobilePosition) mline('cm-idea-reply-edge', x, y, f.mobilePosition[0], f.mobilePosition[1]);
      const a = document.createElement('a');
      a.className = 'cm-mobile-idea'; a.href = '#' + cardId(idea); a.tabIndex = -1;
      a.title = (idea.name || 'A Collective Mind') + ': ' + idea.text;
      a.style.left = x + '%'; a.style.top = y + '%';
      mlayer.append(a);
    });
    const note = root.querySelector('[data-mobile-idea-note]');
    if (note) note.hidden = !(ideas.length || members.length);
  }
  const count = root.querySelector('[data-idea-count-link]');
  if (count && ideas.length) {
    count.textContent = `Read ${ideas.length === 1 ? 'the 1 visitor idea' : `the ${ideas.length} visitor ideas`} ↓`;
    count.hidden = false;
  }
}

export function initializeIdeaWall(root = document) {
  const cfgEl = root.getElementById('cm-idea-config');
  if (!cfgEl) return;
  const cfg = JSON.parse(cfgEl.textContent);
  const state = { members: [], me: null, sparks: new Set(), ideas: [] };
  const draw = () => renderIdeas(state.ideas, cfg, root, state);
  const reload = () => Promise.all([api('ideas'), api('members').catch(() => ({ ok: false })), api('members/me').catch(() => ({ ok: false }))]).then(([r, m, me]) => {
    state.members = m.ok && Array.isArray(m.body.members) ? m.body.members : [];
    state.me = me.ok ? me.body.member : null;
    state.sparks = new Set(me.ok && Array.isArray(me.body.sparks) ? me.body.sparks : []);
    if (r.ok && Array.isArray(r.body.ideas)) state.ideas = r.body.ideas;
    draw();
    // Signed-in members share under their card's name.
    const as = root.querySelector('[data-sharing-as]'), nameField = root.querySelector('[data-name-field]'), cta = root.querySelector('[data-member-cta]');
    if (state.me) {
      if (as) { as.textContent = 'You share as ' + state.me.name + ', and the idea is linked to your card.'; as.hidden = false; }
      if (nameField) nameField.hidden = true;
      if (cta) cta.textContent = 'Your card';
    }
  });
  reload();
  root.querySelector('[data-idea-list]')?.addEventListener('click', async ev => {
    const btn = ev.target.closest('[data-spark]');
    if (!btn) return;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.disabled = true;
    const r = await api('members/spark', { method: 'POST', body: JSON.stringify({ id: btn.dataset.spark, on }) }).catch(() => ({ ok: false }));
    btn.disabled = false;
    if (!r.ok) return;
    if (on) state.sparks.add(btn.dataset.spark); else state.sparks.delete(btn.dataset.spark);
    const idea = state.ideas.find(i => i.id === btn.dataset.spark);
    if (idea) idea.sparks = r.body.sparks;
    btn.setAttribute('aria-pressed', String(on)); btn.setAttribute('aria-label', on ? 'Remove your spark' : 'Spark this idea');
    btn.querySelector('span').textContent = r.body.sparks;
  });

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
    // Members follow and remove their ideas on their card, so they need no removal code.
    done.querySelector('[data-member-done]').hidden = !state.me;
    done.querySelector('[data-anon-done]').hidden = !!state.me;
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
    if (r.ok) { wf.reset(); reload(); }
  });
}

if (typeof document !== 'undefined') initializeIdeaWall();
