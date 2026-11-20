// Idea page: one published idea, the founding mind's reply (pinned) and the conversation between members.
// Talks only to this site's own /api. Stores nothing in the browser.
import './page-main.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const monthYear = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); };
const shortDate = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
const MAX = 300;
export const ideaIdFromPath = path => (String(path).match(/^\/collective-minds\/idea\/([a-z0-9]{8,40})\/?$/) || [])[1] || '';

async function api(path, options = {}) {
  const res = await fetch('/api/' + path, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store', ...options });
  let body = {};
  try { body = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, body };
}
const postJson = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) }).catch(() => ({ ok: false, body: {} }));

export function commentHtml(c, s, isReply = false) {
  if (c.removed) return `<article class="cm-comment is-removed" data-comment="${esc(c.id)}"><p class="cm-help">This comment was removed.</p>${repliesHtml(c, s)}</article>`;
  const v = s.viewer, can = v && v.canComment;
  const spark = can && !c.own
    ? `<button class="cm-spark" type="button" data-cspark aria-pressed="${!!c.sparked}" aria-label="${c.sparked ? 'Remove your spark' : 'Spark this comment'}">✦ <span>${c.sparks}</span></button>`
    : `<span class="cm-spark is-static" aria-label="${c.sparks} sparks">✦ <span>${c.sparks}</span></span>`;
  const actions = [
    spark,
    !isReply && can && s.open && !c.checking ? '<button class="text-link" type="button" data-reply>Reply</button>' : '',
    can && !c.own ? (c.reported ? '<span class="cm-help-inline">Reported. Thank you.</span>' : '<button class="text-link cm-quiet-link" type="button" data-report>Report</button>') : '',
    c.own ? '<button class="text-link cm-quiet-link" type="button" data-delete>Delete</button>' : ''
  ].filter(Boolean).join('');
  return `<article class="cm-comment${isReply ? ' is-reply' : ''}${c.checking ? ' is-checking' : ''}" data-comment="${esc(c.id)}">` +
    `<p class="cm-comment-meta">${isReply ? '<span class="cm-reply-mark" aria-hidden="true">↳</span>' : ''}<strong>${esc(c.name)}</strong><span>${esc(shortDate(c.at))}</span>${c.checking ? '<span class="member-new">Being checked</span>' : ''}</p>` +
    `<p class="cm-comment-text">${esc(c.text)}</p>` +
    (c.checking ? '<p class="cm-help">Only you can see this comment until the check is done.</p>' : '') +
    `<p class="cm-comment-actions">${actions}</p>` + (isReply ? '' : repliesHtml(c, s)) + '</article>';
}
const repliesHtml = (c, s) => `<div class="cm-replies" data-replies>${(c.replies || []).map(r => commentHtml(r, s, true)).join('')}</div>`;

export function composerHtml(s, parentId = '') {
  const v = s.viewer;
  if (!s.open) return '<p class="cm-help cm-closed">This conversation is closed for new comments. You can still read it.</p>';
  if (!v) return `<div class="cm-join-invite"><p><strong>Join the Universe to take part.</strong> Members can comment, reply and spark the comments they like.</p><p class="actions"><a class="button" href="/collective-minds/member/">Join the Collective</a><a class="text-link" href="/collective-minds/member/?next=${encodeURIComponent(location.pathname)}#signin">Already a member? Sign in</a></p></div>`;
  if (!v.canComment) return '<p class="cm-help">You can take part as soon as IMAGINE has approved your member card. This usually takes a day.</p>';
  const idp = parentId ? 'r-' + parentId : 'c-new';
  return `<form class="cm-composer" data-composer-form${parentId ? ` data-parent="${esc(parentId)}"` : ''} novalidate>` +
    `<label class="${parentId ? 'cm-sr' : ''}" for="${idp}">${parentId ? 'Your reply' : 'Add to the conversation as ' + esc(v.name)}</label>` +
    `<textarea id="${idp}" name="text" rows="${parentId ? 2 : 3}" maxlength="${MAX}" required placeholder="${parentId ? 'Write a reply…' : 'What do you think? Add a question, an example or a friendly challenge.'}"></textarea>` +
    `<p class="cm-composer-foot"><span class="cm-count" data-count>0 / ${MAX}</span><span class="cm-composer-buttons">${parentId ? '<button class="text-link" type="button" data-cancel>Cancel</button>' : ''}<button class="button" type="submit">${parentId ? 'Post reply' : 'Post comment'}</button></span></p>` +
    '<p class="cm-form-error" data-composer-error role="alert" hidden></p></form>';
}

function ideaHtml(idea, cfg, state) {
  const byId = Object.fromEntries(cfg.themes.map(t => [t.id, t]));
  const f = idea.reply && cfg.founders.find(x => x.id === idea.reply.mind);
  const n = Number(idea.sparks || 0);
  const spark = state.member
    ? `<button class="cm-spark" type="button" data-idea-spark aria-pressed="${state.ideaSparked}" aria-label="${state.ideaSparked ? 'Remove your spark' : 'Spark this idea'}">✦ <span>${n}</span></button>`
    : `<a class="cm-spark" href="/collective-minds/member/" aria-label="Join to spark this idea">✦ <span>${n}</span></a>`;
  return `<h1 class="idea-title">${esc(idea.text)}</h1>` +
    `<p class="cm-idea-meta"><span>Shared by ${esc(idea.name || 'A Collective Mind')}</span>${idea.approvedAt ? `<span>${esc(monthYear(idea.approvedAt))}</span>` : ''}</p>` +
    `<p class="cm-idea-themes">${idea.themes.filter(t => byId[t]).map(t => `<a href="${esc(byId[t].path)}">${esc(byId[t].name)}</a>`).join('')}</p>` +
    `<p class="cm-spark-row">${spark}</p>` +
    (f ? `<div class="cm-idea-reply idea-pinned"><img src="${esc(f.portrait)}" alt="" width="40" height="50" loading="lazy" decoding="async"><div><p class="cm-reply-by">Pinned · Reply from <a href="${esc(f.path)}">${esc(f.name)}</a> · ${esc(f.role)}</p><p class="cm-reply-text">${esc(idea.reply.text)}</p><p class="cm-help">Written with AI assistance and approved by IMAGINE. The founding minds are IMAGINE characters.</p></div></div>` : '');
}

export function initializeIdeaPage(doc = document, loc = location) {
  const cfgEl = doc.getElementById('idea-page-config');
  if (!cfgEl) return;
  const cfg = JSON.parse(cfgEl.textContent);
  const id = ideaIdFromPath(loc.pathname);
  const main = doc.querySelector('[data-idea-main]'), conv = doc.querySelector('[data-conversation]');
  const list = doc.querySelector('[data-comment-list]'), composer = doc.querySelector('[data-composer]'), info = doc.querySelector('[data-comment-info]');
  const moreWrap = doc.querySelector('[data-more-wrap]');
  const s = { sort: 'top', comments: [], offset: 0, more: false, viewer: null, open: true, member: null, ideaSparked: false, idea: null };
  const notFound = () => { main.innerHTML = '<h1>This idea is not available</h1><p class="lead">It may have been withdrawn by the person who shared it. <a href="/collective-minds/#cm-ideas">See all ideas from the Collective</a>.</p>'; };
  const say = msg => { info.textContent = msg; info.hidden = !msg; };
  const drawIdea = () => { main.innerHTML = ideaHtml(s.idea, cfg, s); };
  const drawList = () => {
    list.innerHTML = s.comments.length ? s.comments.map(c => commentHtml(c, s)).join('') : `<p class="cm-help">No comments yet. ${s.open ? 'Start the conversation.' : ''}</p>`;
    moreWrap.hidden = !s.more;
  };
  async function loadComments(reset = true) {
    const offset = reset ? 0 : s.offset;
    const r = await api(`comments?idea=${encodeURIComponent(id)}&sort=${s.sort}&offset=${offset}`).catch(() => ({ ok: false, body: {} }));
    if (!r.ok) { list.innerHTML = '<p class="cm-help">The conversation could not be loaded. Please try again later.</p>'; return; }
    s.comments = reset ? r.body.comments : [...s.comments, ...r.body.comments];
    s.offset = offset + r.body.comments.length; s.more = r.body.more; s.open = r.body.open; s.viewer = r.body.viewer;
    doc.querySelector('[data-comment-count]').textContent = r.body.total ? String(r.body.total) : '';
    composer.innerHTML = composerHtml(s);
    drawList();
  }

  (async () => {
    if (!id) return notFound();
    const [ideas, me] = await Promise.all([api('ideas').catch(() => ({ ok: false })), api('members/me').catch(() => ({ ok: false }))]);
    s.idea = ideas.ok && Array.isArray(ideas.body.ideas) ? ideas.body.ideas.find(i => i.id === id) : null;
    if (!s.idea) return notFound();
    s.member = me.ok ? me.body.member : null;
    s.ideaSparked = !!(me.ok && Array.isArray(me.body.sparks) && me.body.sparks.includes(id));
    doc.title = (s.idea.text.length > 60 ? s.idea.text.slice(0, 57) + '…' : s.idea.text) + ' — IMAGINE';
    drawIdea();
    conv.hidden = false;
    await loadComments();
    if (loc.hash && loc.hash.startsWith('#comment-')) doc.querySelector(`[data-comment="${CSS.escape(loc.hash.slice(9))}"]`)?.scrollIntoView({ block: 'center' });
  })();

  main.addEventListener('click', async ev => {
    const btn = ev.target.closest('[data-idea-spark]');
    if (!btn) return;
    const on = !s.ideaSparked;
    btn.disabled = true;
    const r = await postJson('members/spark', { id, on });
    btn.disabled = false;
    if (!r.ok) return;
    s.ideaSparked = on; s.idea.sparks = r.body.sparks; drawIdea();
  });

  doc.querySelectorAll('[data-sort]').forEach(b => b.addEventListener('click', () => {
    s.sort = b.dataset.sort;
    doc.querySelectorAll('[data-sort]').forEach(x => { const on = x === b; x.setAttribute('aria-pressed', String(on)); x.className = 'button' + (on ? '' : ' cm-button-quiet'); });
    loadComments();
  }));
  doc.querySelector('[data-more]').addEventListener('click', () => loadComments(false));

  // Character counters and posting (new comments and replies share one handler).
  conv.addEventListener('input', ev => {
    const f = ev.target.closest('[data-composer-form]');
    if (f && ev.target.name === 'text') f.querySelector('[data-count]').textContent = ev.target.value.trim().length + ' / ' + MAX;
  });
  conv.addEventListener('submit', async ev => {
    const f = ev.target.closest('[data-composer-form]');
    if (!f) return;
    ev.preventDefault();
    const err = f.querySelector('[data-composer-error]'), btn = f.querySelector('button[type="submit"]');
    const text = f.text.value.trim();
    if (text.length < 2) { err.textContent = 'Please write a comment first.'; err.hidden = false; return; }
    err.hidden = true; btn.disabled = true;
    const r = await postJson('comments', { idea: id, text, parentId: f.dataset.parent || '' });
    btn.disabled = false;
    if (!r.ok) { err.textContent = r.body.error || 'Your comment could not be posted. Please try again later.'; err.hidden = false; return; }
    say(r.body.status === 'published' ? '' : 'Thank you. Your comment is being checked and appears for everyone soon.');
    await loadComments();
  });

  list.addEventListener('click', async ev => {
    const el = ev.target.closest('[data-comment]');
    if (!el) return;
    const cid = el.dataset.comment;
    if (ev.target.closest('[data-reply]')) {
      if (el.querySelector(':scope > [data-replies] > [data-composer-form]')) return;
      el.querySelector(':scope > [data-replies]').insertAdjacentHTML('beforeend', composerHtml(s, cid));
      el.querySelector(':scope > [data-replies] > [data-composer-form] textarea').focus();
    } else if (ev.target.closest('[data-cancel]')) {
      ev.target.closest('[data-composer-form]').remove();
    } else if (ev.target.closest('[data-cspark]')) {
      const b = ev.target.closest('[data-cspark]'), on = b.getAttribute('aria-pressed') !== 'true';
      b.disabled = true;
      const r = await postJson('comments/spark', { idea: id, id: cid, on });
      b.disabled = false;
      if (r.ok) { b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Remove your spark' : 'Spark this comment'); b.querySelector('span').textContent = r.body.sparks; }
    } else if (ev.target.closest('[data-report]')) {
      const b = ev.target.closest('[data-report]');
      // Two steps, so a report is never sent by a stray tap.
      if (!b.dataset.confirm) { b.dataset.confirm = '1'; b.textContent = 'Report this comment as breaking the house rules?'; return; }
      const r = await postJson('comments/report', { idea: id, id: cid });
      b.outerHTML = r.ok ? '<span class="cm-help-inline">Reported. Thank you.</span>' : '<span class="cm-help-inline">The report could not be sent.</span>';
    } else if (ev.target.closest('[data-delete]')) {
      const b = ev.target.closest('[data-delete]');
      if (!b.dataset.confirm) { b.dataset.confirm = '1'; b.textContent = 'Delete permanently?'; return; }
      const r = await postJson('comments/remove', { idea: id, id: cid });
      if (r.ok) await loadComments();
    }
  });
}

if (typeof document !== 'undefined') initializeIdeaPage();
