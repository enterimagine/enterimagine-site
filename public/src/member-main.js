// Member page: passkey join and sign-in (WebAuthn), email confirmation and sign-in links, and the member's own card.
// Talks only to this site's /api/members/* (CSP connect-src 'self'). The session is an HttpOnly cookie.
import './page-main.js';
import { characters, technologies } from './content.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const themeName = Object.fromEntries(technologies.map(t => [t.id, t.name]));
const mind = Object.fromEntries(characters.map(c => [c.id, c]));
const monthYear = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); };

// --- WebAuthn helpers: the server sends JSON options with base64url fields -------------------------
const fromB64u = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)).buffer; };
const toB64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export function creationOptions(o) {
  return { ...o, challenge: fromB64u(o.challenge), user: { ...o.user, id: fromB64u(o.user.id) },
    excludeCredentials: (o.excludeCredentials || []).map(c => ({ ...c, id: fromB64u(c.id) })) };
}
export function requestOptions(o) {
  return { ...o, challenge: fromB64u(o.challenge), allowCredentials: (o.allowCredentials || []).map(c => ({ ...c, id: fromB64u(c.id) })) };
}
function credentialJSON(cred) {
  const r = cred.response, out = { id: cred.id, rawId: toB64u(cred.rawId), type: cred.type, clientExtensionResults: cred.getClientExtensionResults ? cred.getClientExtensionResults() : {},
    authenticatorAttachment: cred.authenticatorAttachment || undefined, response: { clientDataJSON: toB64u(r.clientDataJSON) } };
  if (r.attestationObject) {
    out.response.attestationObject = toB64u(r.attestationObject);
    out.response.transports = r.getTransports ? r.getTransports() : [];
  } else {
    out.response.authenticatorData = toB64u(r.authenticatorData);
    out.response.signature = toB64u(r.signature);
    if (r.userHandle) out.response.userHandle = toB64u(r.userHandle);
  }
  return out;
}

async function api(path, body) {
  const res = await fetch('/api/members/' + path, body === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok && !data.error) data.error = res.status === 401 || res.status === 403 ? 'Please sign in again and retry.' : `Something went wrong (error ${res.status}). Please try again.`;
  return { ok: res.ok, status: res.status, data };
}
const passkeyError = e => e && e.name === 'NotAllowedError' ? 'The passkey request was cancelled or timed out.' :
  e && e.name === 'InvalidStateError' ? 'This device already has a passkey for your card.' : 'Your device could not create or use a passkey here.';

export function initializeMember(root = document) {
  const box = root.querySelector('[data-member-root]');
  if (!box) return;
  const $ = s => box.querySelector(s), $$ = s => [...box.querySelectorAll(s)];
  const errorEl = $('[data-member-error]');
  const showError = msg => { errorEl.textContent = msg || ''; errorEl.hidden = !msg; if (msg) errorEl.scrollIntoView({ block: 'center' }); };
  const show = state => { $('[data-state-loading]').hidden = true; $$('[data-state]').forEach(s => { s.hidden = s.dataset.state !== state; }); };
  const showInfo = msg => { showError(msg); errorEl.classList.toggle('is-info', !!msg); };
  const showCheck = text => { if (text) $('[data-check-text]').textContent = text; show('check'); $('[data-state="check"]').focus(); };
  const supported = typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials;

  // Domain boxes: at most three.
  box.addEventListener('change', ev => {
    if (ev.target.name !== 'domains') return;
    const boxes = [...ev.target.form.querySelectorAll('input[name="domains"]')], n = boxes.filter(b => b.checked).length;
    boxes.forEach(b => { b.disabled = !b.checked && n >= 3; });
  });
  const readCard = form => ({ displayName: form.displayName.value, whatIf: form.whatIf.value,
    domains: [...form.querySelectorAll('input[name="domains"]:checked')].map(b => b.value) });

  function renderIn(data, recovered) {
    const m = data.member;
    const label = { pending: 'Waiting for review', approved: 'Live in the network', changes: 'Please edit' }[m.status] || m.status;
    $('[data-member-status]').textContent = label;
    $('[data-member-status]').className = 'member-status is-' + m.status;
    const note = $('[data-member-note]');
    note.textContent = m.status === 'pending' ? 'IMAGINE reviews every card before it appears in the network. This usually takes a day.' : m.note || '';
    note.hidden = !note.textContent;
    $('[data-member-card]').innerHTML = `<p class="member-card-name">${esc(m.name)}</p><p class="cm-idea-themes">${m.domains.map(d => `<span>${esc(themeName[d] || d)}</span>`).join('')}</p>` +
      (m.whatIf ? `<p class="cm-idea-text">${esc(m.whatIf)}</p>` : '') + `<p class="cm-idea-meta"><span>${m.status === 'approved' ? 'Member since ' + esc(monthYear(m.joinedAt)) : 'Joined ' + esc(monthYear(m.createdAt))}</span></p>`;
    const form = $('[data-profile-form]');
    form.displayName.value = m.name; form.whatIf.value = m.whatIf;
    form.querySelectorAll('input[name="domains"]').forEach(b => { b.checked = m.domains.includes(b.value); });
    form.querySelector('input[name="domains"]').dispatchEvent(new Event('change', { bubbles: true }));
    const newReplies = data.ideas.filter(i => i.reply && i.reply.isNew).length;
    $('[data-member-ideas]').innerHTML = data.ideas.length ? data.ideas.map(i => {
      const status = i.status === 'approved' ? 'Published' : 'Waiting for review';
      const f = i.reply && mind[i.reply.mind];
      return `<article class="cm-idea-card" data-idea="${esc(i.id)}"><p class="cm-idea-text">${esc(i.text)}</p><p class="cm-idea-meta"><span>${status}</span>${i.status === 'approved' ? `<span>✦ ${i.sparks} spark${i.sparks === 1 ? '' : 's'}</span>` : ''}</p>` +
        (f ? `<div class="cm-idea-reply">${f.portrait ? `<img src="${esc(f.portrait)}" alt="" width="40" height="50" loading="lazy" decoding="async">` : '<span></span>'}<div><p class="cm-reply-by">${i.reply.isNew ? '<span class="member-new">New</span> ' : ''}Reply from ${esc(f.name)} · ${esc(f.role)}</p><p class="cm-reply-text">${esc(i.reply.text)}</p></div></div>` : '') +
        `<p><button class="text-link" type="button" data-remove-idea>Remove this idea</button></p></article>`;
    }).join('') : '<p class="cm-help">You have not shared an idea yet.</p>';
    $('[data-passkey-count]').textContent = m.passkeys === 1 ? 'You have 1 passkey.' : m.passkeys ? `You have ${m.passkeys} passkeys.` : 'You have no passkey yet. Add one to sign in with your face, fingerprint or PIN.';
    $('[data-recovered]').hidden = !(recovered || !m.passkeys);
    const banner = $('[data-email-banner]');
    banner.hidden = m.emailVerified;
    const onFile = m.emailOnFile !== false;
    $('[data-email-banner-text]').textContent = onFile
      ? 'Please confirm your email address with the link we sent you. Your card goes to review once it is confirmed, and the email lets you sign in again if you lose this device.'
      : 'Please add an email address to your card. We send a link to confirm it; it lets you sign in again if you lose this device and, if you wish, tells you when a founding mind replies. It is never shown on your card.';
    $('[data-resend-box]').hidden = !onFile;
    $('[data-add-email-form]').hidden = onFile;
    $('[data-email-status]').textContent = m.emailVerified ? 'Your email address is confirmed. We use it only for sign-in links and, if you wish, reply notices. It is never shown on your card.' : 'Your email address is not confirmed yet.';
    const notify = $('[data-notify]');
    notify.checked = m.notifyReplies; notify.disabled = !m.emailVerified;
    show('in');
    if (newReplies) api('seen', {});
  }

  // Links from our emails: ?verify=, ?change=, ?signin=, ?unsubscribe=
  async function handleEmailLink() {
    const q = new URLSearchParams(location.search);
    const [param, value] = ['verify', 'change', 'signin', 'unsubscribe'].map(k => [k, q.get(k)]).find(([, v]) => v) || [];
    if (!param) return false;
    history.replaceState(null, '', location.pathname);
    const r = param === 'signin' ? await api('email/signin', { token: value })
      : param === 'unsubscribe' ? await api('email/unsubscribe', { token: value })
      : await api('email/verify', { token: value, change: param === 'change' });
    if (!r.ok) { await refresh(); showError(r.data.error); return true; }
    await refresh(param === 'signin');
    showInfo(param === 'signin' ? 'You are signed in.' : param === 'unsubscribe' ? 'You will no longer receive reply notices by email.' : 'Thank you, your email address is confirmed.');
    return true;
  }

  async function refresh(recovered) {
    const r = await api('me');
    if (!r.ok) { show('out'); showError(r.data.error || 'Collective Minds is temporarily unavailable.'); return; }
    if (!r.data.member) { show('out'); return; }
    renderIn(r.data, recovered);
  }

  async function createPasskey(optionsPath, verifyPath, body) {
    if (!supported) return showError('This browser does not support passkeys. Try an up-to-date browser on your phone or computer.');
    const o = await api(optionsPath, body);
    if (!o.ok) return showError(o.data.error || 'Please try again.');
    let cred;
    try { cred = await navigator.credentials.create({ publicKey: creationOptions(o.data.options) }); }
    catch (e) { return showError(passkeyError(e)); }
    const v = await api(verifyPath, { token: o.data.token, response: credentialJSON(cred) });
    if (!v.ok) return showError(v.data.error || 'Please try again.');
    return v.data;
  }

  $('[data-join-form]').addEventListener('submit', async ev => {
    ev.preventDefault(); showError('');
    const form = ev.target, card = readCard(form);
    if (!form.email.value.trim()) return showError('Please enter your email address.');
    if (!form.age16.checked) return showError('Membership is for people aged 16 or older.');
    if (!form.consent.checked) return showError('Please confirm that your card may be shown publicly after review.');
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
    const done = await createPasskey('join/options', 'join/verify', { ...card, email: form.email.value, age16: true, consent: true, shareIdea: !!(form.shareIdea && form.shareIdea.checked) });
    btn.disabled = false;
    if (done) showCheck(done.email === 'sent' ? '' : 'Your card is created, but we could not send the confirmation email right now. Open your card and choose “Send the confirmation again” later.');
  });

  $('[data-login]').addEventListener('click', async () => {
    showError('');
    if (!supported) return showError('This browser does not support passkeys.');
    const o = await api('login/options', {});
    if (!o.ok) return showError(o.data.error || 'Please try again.');
    let cred;
    try { cred = await navigator.credentials.get({ publicKey: requestOptions(o.data.options) }); }
    catch (e) { return showError(passkeyError(e)); }
    const v = await api('login/verify', { token: o.data.token, response: credentialJSON(cred) });
    if (!v.ok) return showError(v.data.error || 'Please try again.');
    refresh();
  });

  $('[data-signin-form]').addEventListener('submit', async ev => {
    ev.preventDefault(); showError('');
    const r = await api('email/signin-request', { email: ev.target.email.value });
    if (!r.ok) return showError(r.data.error);
    $('[data-signin-status]').textContent = r.data.message;
  });
  $('[data-check-done]').addEventListener('click', () => refresh());
  $('[data-resend]').addEventListener('click', async ev => {
    showError('');
    const r = await api('email/resend', {});
    if (!r.ok) return showError(r.data.error);
    ev.target.textContent = 'Sent. Check your inbox';
  });
  $('[data-add-email-form]').addEventListener('submit', async ev => {
    ev.preventDefault(); showError('');
    const r = await api('email/change', { email: ev.target.email.value });
    if (!r.ok) return showError(r.data.error);
    ev.target.reset();
    await refresh();
    showInfo('We sent a confirmation link to your email address. It works once and expires in 24 hours.');
  });
  $('[data-email-form]').addEventListener('submit', async ev => {
    ev.preventDefault(); showError('');
    const r = await api('email/change', { email: ev.target.email.value });
    if (!r.ok) return showError(r.data.error);
    $('[data-email-form-status]').textContent = 'We sent a confirmation link to the new address. Your current address stays active until you confirm.';
    ev.target.reset();
  });
  $('[data-notify]').addEventListener('change', async ev => {
    const r = await api('notifications', { replies: ev.target.checked });
    if (!r.ok) { ev.target.checked = !ev.target.checked; showError(r.data.error); }
  });

  $$('[data-add-passkey]').forEach(b => b.addEventListener('click', async () => {
    showError('');
    const done = await createPasskey('passkey/options', 'passkey/verify', {});
    if (done) { await refresh(); showInfo('Passkey added. Next time, sign in with your face, fingerprint or PIN.'); }
  }));


  $('[data-profile-form]').addEventListener('submit', async ev => {
    ev.preventDefault(); showError('');
    const r = await api('profile', readCard(ev.target));
    if (!r.ok) return showError(r.data.error || 'Please try again.');
    ev.target.closest('details').open = false; refresh();
  });

  $('[data-member-ideas]').addEventListener('click', async ev => {
    const btn = ev.target.closest('[data-remove-idea]');
    if (!btn) return;
    if (btn.dataset.confirm !== 'yes') { btn.dataset.confirm = 'yes'; btn.textContent = 'Click again to remove it permanently'; return; }
    const r = await api('ideas/remove', { id: btn.closest('[data-idea]').dataset.idea });
    if (!r.ok) return showError(r.data.error || 'Please try again.');
    refresh();
  });

  $('[data-logout]').addEventListener('click', async () => { await api('logout', {}); show('out'); });
  $('[data-delete]').addEventListener('click', async ev => {
    const btn = ev.target;
    if (btn.dataset.confirm !== 'yes') { btn.dataset.confirm = 'yes'; btn.textContent = 'Click again to delete everything permanently'; return; }
    const r = await api('delete', { confirm: true });
    if (!r.ok) return showError(r.data.error || 'Please try again.');
    show('out'); showError('');
    errorEl.classList.add('is-info'); errorEl.textContent = 'Your card, email address, passkeys, sparks and ideas are deleted. You can remove the passkey from your device\'s password manager too.';
    errorEl.hidden = false; errorEl.classList.add('is-info');
  });

  handleEmailLink().then(handled => { if (!handled) refresh(); });
}

if (typeof document !== 'undefined') initializeMember();
