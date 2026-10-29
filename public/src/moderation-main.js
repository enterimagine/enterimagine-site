// Moderation page logic. The API re-checks the moderator role on every call.
import './page-main.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const when = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }); };

async function load(root) {
  const err = root.querySelector('[data-mod-error]');
  const me = await fetch('/.auth/me').then(r => r.json()).catch(() => null);
  const principal = me?.clientPrincipal;
  root.querySelector('[data-mod-user]').textContent = principal ? 'Signed in as ' + principal.userDetails + (principal.userRoles.includes('moderator') ? ' · moderator' : ' · no moderator role') : 'Not signed in';
  const res = await fetch('/api/moderation/ideas', { cache: 'no-store' });
  if (!res.ok) { err.textContent = res.status === 403 || res.status === 401 ? 'Your account does not have the moderator role.' : 'The ideas could not be loaded. Try again later.'; err.hidden = false; return; }
  const { ideas } = await res.json();
  const card = i => `<article class="mod-card" data-id="${esc(i.id)}"><p class="cm-idea-text">${esc(i.text)}</p>` +
    `<p class="cm-idea-meta"><span>${esc(i.name || 'A Collective Mind (no name)')}</span><span>Themes: ${esc(i.themes.join(', '))}</span><span>Sent ${esc(when(i.createdAt))}</span><span>No. ${esc(i.id)}</span></p>` +
    `<p class="mod-actions">${i.status === 'pending' ? '<button class="button" data-act="approve">Approve and publish</button><button class="button cm-button-quiet" data-act="reject">Reject and delete</button>' : '<button class="button cm-button-quiet" data-act="remove">Unpublish and delete</button>'}</p></article>`;
  const pending = ideas.filter(i => i.status === 'pending'), approved = ideas.filter(i => i.status === 'approved');
  root.querySelector('[data-mod-pending]').innerHTML = pending.length ? pending.map(card).join('') : '<p class="cm-help">Nothing waiting. All caught up.</p>';
  root.querySelector('[data-mod-approved]').innerHTML = approved.length ? approved.map(card).join('') : '<p class="cm-help">No published ideas yet.</p>';
  root.querySelector('[data-mod-pending-count]').textContent = '(' + pending.length + ')';
  root.querySelector('[data-mod-approved-count]').textContent = '(' + approved.length + ')';
}

export function initializeModeration(root = document) {
  if (!root.querySelector('[data-mod-pending]')) return;
  const logout = root.querySelector('[data-mod-logout]');
  if (logout) logout.href = '/.auth/logout?post_logout_redirect_uri=/';
  root.addEventListener('click', async ev => {
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const card = btn.closest('[data-id]'), act = btn.dataset.act;
    if (act !== 'approve' && btn.dataset.confirm !== 'yes') { btn.dataset.confirm = 'yes'; btn.textContent = 'Click again to delete permanently'; return; }
    btn.disabled = true;
    const res = await fetch('/api/moderation/decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: card.dataset.id, action: act }) });
    if (!res.ok) { btn.disabled = false; btn.textContent = 'Failed. Try again'; return; }
    load(root);
  });
  load(root);
}
if (typeof document !== 'undefined') initializeModeration();
