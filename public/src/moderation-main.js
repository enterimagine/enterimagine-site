// Moderation page logic. The API re-checks the moderator role on every call.
// The review agent (when switched on) only prepares drafts; nothing is published without a click here.
import './page-main.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const when = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); };
export const FOUNDERS = [['dali', 'Dali · The Systems Thinker'], ['sofia', 'Sofia · The Intelligence Architect'], ['leo', 'Leo · The Quantum Explorer'], ['maya', 'Maya · The Life Innovator'], ['ethan', 'Ethan · The Challenger']];
const BY_THEME = { energy: 'dali', 'smart-mobility': 'dali', 'smart-cities': 'dali', 'ai-data': 'sofia', robotics: 'sofia', innovation: 'sofia', 'quantum-computing': 'leo', space: 'leo', biotech: 'maya' };
export const suggestedFounder = themes => BY_THEME[themes[0]] || 'sofia';
const REPLY_MAX = 500;
const post = (path, body) => fetch('/api/moderation/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function agentNote(i, agent) {
  if (i.draft) {
    const ok = i.draft.recommendation !== 'reject';
    return `<p class="mod-agent ${ok ? 'is-approve' : 'is-reject'}" data-agent-note><strong>Agent suggests: ${ok ? 'approve' : 'reject'}.</strong> ${esc(i.draft.reason || '')}</p>`;
  }
  return agent.enabled ? '<p class="mod-agent" data-agent-note>Preparing a draft…</p>' : '';
}

function replyEditor(i, agent) {
  const current = i.status === 'approved' ? i.reply : (i.draft && i.draft.reply ? { mind: i.draft.mind, text: i.draft.reply } : null);
  const mind = current?.mind || (i.draft?.mind) || suggestedFounder(i.themes), text = current?.text || '';
  return `<div class="mod-reply"><label class="mod-reply-label" for="r-${esc(i.id)}">Reply from</label>` +
    `<select data-reply-mind aria-label="Founding mind who signs the reply">${FOUNDERS.map(([id, label]) => `<option value="${id}"${id === mind ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select>` +
    `<textarea id="r-${esc(i.id)}" data-reply-text rows="3" maxlength="${REPLY_MAX}" placeholder="Optional reply shown under the idea">${esc(text)}</textarea>` +
    `<p class="cm-help" data-reply-count>${text.length} / ${REPLY_MAX}</p></div>`;
}

function card(i, agent) {
  const actions = i.status === 'pending'
    ? '<button class="button" data-act="approve" data-with-reply="yes">Approve idea and reply</button><button class="button cm-button-quiet" data-act="approve">Approve without reply</button>' +
      (agent.enabled ? '<button class="button cm-button-quiet" data-act="redraft">Draft again</button>' : '') +
      '<button class="button cm-button-quiet" data-act="reject">Reject and delete</button>'
    : '<button class="button" data-act="reply">Save reply</button><button class="button cm-button-quiet" data-act="remove">Unpublish and delete</button>';
  return `<article class="mod-card" data-id="${esc(i.id)}" data-status="${esc(i.status)}"><p class="cm-idea-text">${esc(i.text)}</p>` +
    `<p class="cm-idea-meta"><span>${esc(i.name || 'A Collective Mind (no name)')}</span><span>Themes: ${esc(i.themes.join(', '))}</span><span>Sent ${esc(when(i.createdAt))}</span><span>No. ${esc(i.id)}</span></p>` +
    (i.status === 'pending' ? agentNote(i, agent) : '') + replyEditor(i, agent) +
    `<p class="mod-actions">${actions}</p><p class="cm-form-error" data-card-error role="alert" hidden></p></article>`;
}

function applyDraft(el, draft) {
  const ok = draft.recommendation !== 'reject';
  const note = el.querySelector('[data-agent-note]');
  note.className = 'mod-agent ' + (ok ? 'is-approve' : 'is-reject');
  note.innerHTML = `<strong>Agent suggests: ${ok ? 'approve' : 'reject'}.</strong> ${esc(draft.reason || '')}`;
  const text = el.querySelector('[data-reply-text]');
  if (!text.dataset.edited) { text.value = draft.reply || ''; el.querySelector('[data-reply-mind]').value = draft.mind; text.dispatchEvent(new Event('input')); }
}

async function requestDraft(el, root) {
  const note = el.querySelector('[data-agent-note]');
  if (note) note.textContent = 'Preparing a draft…';
  const res = await post('draft', { id: el.dataset.id }).catch(() => null);
  const body = res ? await res.json().catch(() => ({})) : {};
  if (!res || !res.ok) { if (note) note.textContent = body.error || 'The agent could not prepare a draft. You can write the reply yourself.'; return false; }
  applyDraft(el, body.draft);
  const left = root.querySelector('[data-mod-agent]');
  if (left) left.textContent = 'Review agent on · ' + body.draftsLeft + ' drafts left today';
  return true;
}

async function load(root) {
  const err = root.querySelector('[data-mod-error]');
  const me = await fetch('/.auth/me').then(r => r.json()).catch(() => null);
  const principal = me?.clientPrincipal;
  root.querySelector('[data-mod-user]').textContent = principal ? 'Signed in as ' + principal.userDetails + (principal.userRoles.includes('moderator') ? ' · moderator' : ' · no moderator role') : 'Not signed in';
  const res = await fetch('/api/moderation/ideas', { cache: 'no-store' });
  if (!res.ok) { err.textContent = res.status === 403 || res.status === 401 ? 'Your account does not have the moderator role.' : 'The ideas could not be loaded. Try again later.'; err.hidden = false; return; }
  const { ideas, agent = { enabled: false, draftsLeft: 0 } } = await res.json();
  const status = root.querySelector('[data-mod-agent]');
  if (status) status.textContent = agent.enabled ? 'Review agent on · ' + agent.draftsLeft + ' drafts left today' : 'Review agent off · write replies yourself';
  const pending = ideas.filter(i => i.status === 'pending'), approved = ideas.filter(i => i.status === 'approved');
  root.querySelector('[data-mod-pending]').innerHTML = pending.length ? pending.map(i => card(i, agent)).join('') : '<p class="cm-help">Nothing waiting. All caught up.</p>';
  root.querySelector('[data-mod-approved]').innerHTML = approved.length ? approved.map(i => card(i, agent)).join('') : '<p class="cm-help">No published ideas yet.</p>';
  root.querySelector('[data-mod-pending-count]').textContent = '(' + pending.length + ')';
  root.querySelector('[data-mod-approved-count]').textContent = '(' + approved.length + ')';
  if (agent.enabled) {
    // Draft one idea at a time, newest first, until the daily cap is reached.
    for (const i of pending.filter(x => !x.draft)) {
      const el = root.querySelector(`[data-id="${CSS.escape(i.id)}"]`);
      if (!el || !(await requestDraft(el, root))) break;
    }
  }
}

export function initializeModeration(root = document) {
  if (!root.querySelector('[data-mod-pending]')) return;
  const logout = root.querySelector('[data-mod-logout]');
  if (logout) logout.href = '/.auth/logout?post_logout_redirect_uri=/';
  root.addEventListener('input', ev => {
    const text = ev.target.closest('[data-reply-text]');
    if (!text) return;
    if (ev.isTrusted) text.dataset.edited = 'yes';
    text.closest('.mod-reply').querySelector('[data-reply-count]').textContent = text.value.trim().length + ' / ' + REPLY_MAX;
  });
  root.addEventListener('click', async ev => {
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const el = btn.closest('[data-id]'), act = btn.dataset.act, error = el.querySelector('[data-card-error]');
    error.hidden = true;
    if (act === 'redraft') { delete el.querySelector('[data-reply-text]').dataset.edited; btn.disabled = true; await requestDraft(el, root); btn.disabled = false; return; }
    if ((act === 'reject' || act === 'remove') && btn.dataset.confirm !== 'yes') { btn.dataset.confirm = 'yes'; btn.textContent = 'Click again to delete permanently'; return; }
    const text = el.querySelector('[data-reply-text]').value.trim(), mind = el.querySelector('[data-reply-mind]').value;
    const withReply = act === 'reply' || btn.dataset.withReply === 'yes';
    if (act === 'approve' && withReply && !text) { error.textContent = 'Write a reply first, or choose Approve without reply.'; error.hidden = false; return; }
    btn.disabled = true;
    const res = await post('decision', { id: el.dataset.id, action: act, reply: withReply && text ? { mind, text } : null }).catch(() => null);
    if (!res || !res.ok) {
      const body = res ? await res.json().catch(() => ({})) : {};
      btn.disabled = false; error.textContent = body.error || 'That did not work. Try again.'; error.hidden = false; return;
    }
    load(root);
  });
  load(root);
}
if (typeof document !== 'undefined') initializeModeration();

// Visit totals (anonymous counts only).
const NAMES = { home: 'Home', minds: 'Minds', explore: 'Explore', episodes: 'Episodes', universe: 'Scientific Universe', 'collective-minds': 'Collective Minds', 'what-if': 'What If?', privacy: 'Privacy', legal: 'Legal', other: 'Other' };
const dur = s => { s = Math.round(s || 0); return s < 60 ? s + ' s' : s < 3600 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' s' : Math.floor(s / 3600) + ' h ' + Math.round((s % 3600) / 60) + ' min'; };
const bars = (keys, val, label) => { const max = Math.max(1, ...keys.map(val)); return '<div class="stats-bars">' + keys.map(k => `<div class="stats-bar" title="${esc(label(k))}: ${val(k)}"><span style="height:${Math.max(2, Math.round(val(k) / max * 100))}px"></span><i>${esc(k.slice(-2))}</i></div>`).join('') + '</div>'; };
const tableOf = (title, data, name, limit = 50) => {
  const rows = Object.entries(data).sort((a, b) => b[1].views - a[1].views).slice(0, limit);
  if (!rows.length) return '';
  return `<h3>${esc(title)}</h3><table class="stats-table"><thead><tr><th scope="col">Name</th><th scope="col">Page views</th><th scope="col">Visits started</th><th scope="col">Average time</th></tr></thead><tbody>` +
    rows.map(([k, r]) => `<tr><td>${esc(name(k))}</td><td>${r.views}</td><td>${r.visits}</td><td>${dur(r.timed ? r.seconds / r.timed : 0)}</td></tr>`).join('') + '</tbody></table>';
};
const pageName = k => { const [kind, slug] = k.split(':'); return slug ? ({ mind: 'Mind', technology: 'Technology', episode: 'Episode', article: 'Article' }[kind] || kind) + ': ' + slug.replace(/-/g, ' ') : (NAMES[k] || k); };
async function loadStats(days) {
  const out = document.querySelector('[data-stats]');
  if (!out) return;
  for (const b of document.querySelectorAll('[data-stats-range] button')) b.className = 'button' + (b.dataset.days === String(days) ? '' : ' cm-button-quiet');
  try {
    const res = await fetch('/api/moderation/stats?days=' + days, { cache: 'no-store' });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error || 'Visit totals are unavailable.');
    const t = d.total, dayKeys = [], hours = [];
    for (let i = d.days - 1; i >= 0 && dayKeys.length < 90; i--) dayKeys.push(new Date(Date.parse(d.to) - i * 86400000).toISOString().slice(0, 10));
    for (let h = 0; h < 24; h++) hours.push(String(h).padStart(2, '0'));
    out.innerHTML = `<div class="stats-tiles"><div><b>${t.visits}</b><span>visits</span></div><div><b>${t.views}</b><span>page views</span></div><div><b>${t.visits ? (t.views / t.visits).toFixed(1) : '–'}</b><span>pages per visit</span></div><div><b>${dur(t.timed ? t.seconds / t.timed : 0)}</b><span>average time per page view</span></div><div><b>${dur(t.seconds)}</b><span>total time</span></div></div>` +
      `<p class="cm-help">${esc(d.from)} to ${esc(d.to)} (Brussels days). Counting started on 7 November 2026.</p>` +
      `<h3>Visits per day</h3>` + bars(dayKeys, k => (d.byDay[k] || {}).visits || 0, k => k) +
      `<h3>Visits by time of day</h3>` + bars(hours, h => (d.byHour[h] || {}).visits || 0, h => h + ':00–' + h + ':59') +
      tableOf('Sections', d.bySection, k => NAMES[k] || k) + tableOf('Pages', d.byPage, pageName, 30) + tableOf('Screen type', d.byDevice, k => k[0].toUpperCase() + k.slice(1));
  } catch (e) { out.innerHTML = `<p class="cm-form-error" role="alert">${esc(e.message)}</p>`; }
}
document.querySelector('[data-stats-range]')?.addEventListener('click', e => { const b = e.target.closest('button[data-days]'); if (b) loadStats(+b.dataset.days); });
loadStats(7);
