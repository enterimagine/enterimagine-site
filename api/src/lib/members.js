// Collective Minds membership: passkey sign-in (WebAuthn), member cards reviewed before they appear,
// ideas linked to their member, sparks and reply notices.
// Stored per member: display name, 1-3 domains, an optional one-line What If?, status and timestamps,
// the passkeys' public keys (no biometrics ever leave the device), and a verified email address, kept
// encrypted (AES-256-GCM) with a keyed hash for look-ups. No password, no IP address.
// The email lets members sign in with a one-time link (lost device, or a device without passkeys) and,
// if they wish, receive a notice when a founding mind replies.
import { createHash, createHmac, createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { odataString } from './table.js';
import { THEMES, isModerator } from './ideas.js';
import { emails } from './mailer.js';
import { MINDS } from './agent.js';

export const MEMBERS = 'members', CREDS = 'credentials', EMAILS = 'emailindex', TOKENS = 'emailtokens', SPARKS = 'sparks', IDEAS = 'ideas', RATE = 'ratelimit';
const PK = 'member', IDEA_PK = 'idea';
export const MEMBER_LIMITS = Object.freeze({ nameMin: 2, nameMax: 30, whatIfMax: 140, sessionDays: 30, challengeMinutes: 5, emailLinksPerDay: 10, emailsPerAddressPerHour: 3, verifyHours: 24, signInMinutes: 30, maxBody: 16384 });

const sha256 = s => createHash('sha256').update(s).digest('hex');
const clean = s => String(s ?? '').normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu, ' ').replace(/\s+/g, ' ').trim();
const LINKISH = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|be|nl|ru|xyz|info|biz|co)\b|@[a-z0-9-]+\.[a-z]{2,})/i;
const b64u = buf => Buffer.from(buf).toString('base64url');
const json = (status, body, headers = {}) => ({ status, jsonBody: body, headers: { 'Cache-Control': 'no-store', ...headers } });
const err = (status, message, headers) => json(status, { error: message }, headers);
const newId = () => 'm' + Date.now().toString(36) + randomBytes(5).toString('hex');
export const normalizeEmail = s => String(s ?? '').trim().toLowerCase();
export const validEmail = e => e.length <= 254 && /^[^\s@<>()",;:]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(e);
const VALID_ID = /^m[a-z0-9]{8,40}$/;

export function validateProfile(input) {
  if (!input || typeof input !== 'object') return { error: 'Please fill in the form again.' };
  const displayName = clean(input.displayName), whatIf = clean(input.whatIf);
  if (displayName.length < MEMBER_LIMITS.nameMin || displayName.length > MEMBER_LIMITS.nameMax) return { error: `Choose a display name of ${MEMBER_LIMITS.nameMin} to ${MEMBER_LIMITS.nameMax} characters.` };
  if (!/^[\p{L}\p{M}0-9 ._'’-]+$/u.test(displayName)) return { error: 'Display name: use only letters, numbers, spaces and the signs . - _ \' (for example Sam_K or Maya-23).' };
  if (whatIf.length > MEMBER_LIMITS.whatIfMax) return { error: `Please keep your What If? under ${MEMBER_LIMITS.whatIfMax} characters.` };
  if (LINKISH.test(displayName) || LINKISH.test(whatIf)) return { error: 'Please leave out links and email addresses.' };
  const domains = Array.isArray(input.domains) ? [...new Set(input.domains.map(String))] : [];
  if (!domains.length || domains.length > 3 || domains.some(d => !THEMES.includes(d))) return { error: 'Please choose one to three favorite domains.' };
  return { value: { displayName, domains, whatIf } };
}

export const publicMember = m => ({ id: m.RowKey, name: m.displayName, domains: String(m.domains || '').split(',').filter(Boolean), whatIf: m.whatIf || '', joinedAt: m.approvedAt || m.createdAt });
const ownView = m => ({ ...publicMember(m), status: m.status, note: m.status === 'changes' ? (m.reviewNote || 'Your card was not approved yet. Please edit it and send it again.') : '', createdAt: m.createdAt,
  emailVerified: !!m.emailVerified, notifyReplies: m.notifyReplies !== false });

// Where the request came from: the page origin must be this same site (blocks cross-site requests),
// and it doubles as the passkey relying-party id, so passkeys made on one host only work there.
export function siteOf(request) {
  const origin = request.headers.get('origin') || '';
  let host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const original = request.headers.get('x-ms-original-url');
  if (original) { try { host = new URL(original).host; } catch {} }
  host = host.split(',')[0].trim().toLowerCase();
  let o;
  try { o = new URL(origin); } catch { return null; }
  if (o.host.toLowerCase() !== host) return null;
  const local = o.hostname === 'localhost';
  if (o.protocol !== 'https:' && !(local && o.protocol === 'http:')) return null;
  return { origin: o.origin, rpID: o.hostname };
}

async function readJson(request) {
  const text = await request.text();
  if (text.length > MEMBER_LIMITS.maxBody) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export function createMemberHandlers(store, { secret, now = () => Date.now(), checker = null, draftCap = null, mailer = null }) {
  if (!secret) throw new Error('Missing session secret.');
  const sign = data => { const body = b64u(JSON.stringify(data)); return body + '.' + createHmac('sha256', secret).update(body).digest('base64url'); };
  const unsign = token => {
    const [body, mac] = String(token || '').split('.');
    if (!body || !mac) return null;
    const want = createHmac('sha256', secret).update(body).digest('base64url');
    if (want.length !== mac.length || !timingSafeEqual(Buffer.from(want), Buffer.from(mac))) return null;
    try { const d = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); return d.exp > now() ? d : null; } catch { return null; }
  };
  const cookieHeader = (value, maxAge, secure) => `im_member=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
  const sessionCookie = (memberId, site) => cookieHeader(sign({ s: memberId, exp: now() + MEMBER_LIMITS.sessionDays * 864e5 }), MEMBER_LIMITS.sessionDays * 86400, site.origin.startsWith('https:'));
  const clearCookie = site => cookieHeader('', 0, !site || site.origin.startsWith('https:'));
  const readSession = request => {
    const m = String(request.headers.get('cookie') || '').match(/(?:^|;\s*)im_member=([^;]+)/);
    const d = m && unsign(m[1]);
    return d && typeof d.s === 'string' && VALID_ID.test(d.s) ? d.s : null;
  };
  async function currentMember(request) {
    const id = readSession(request);
    return id ? store.get(MEMBERS, PK, id) : null;
  }
  const challengeToken = (purpose, challenge, extra = {}) => sign({ p: purpose, c: challenge, exp: now() + MEMBER_LIMITS.challengeMinutes * 60000, ...extra });

  // Email at rest: encrypted with a key derived from the server secret; looked up by keyed hash only.
  const dataKey = createHash('sha256').update('imagine-email-key|' + secret).digest();
  const emailHash = email => createHmac('sha256', secret).update('email|' + email).digest('hex');
  const seal = text => { const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', dataKey, iv), ct = Buffer.concat([c.update(text, 'utf8'), c.final()]); return [iv, c.getAuthTag(), ct].map(b64u).join('.'); };
  const unseal = box => { try { const [iv, tag, ct] = String(box || '').split('.').map(x => Buffer.from(x, 'base64url')); const d = createDecipheriv('aes-256-gcm', dataKey, iv); d.setAuthTag(tag); return Buffer.concat([d.update(ct), d.final()]).toString('utf8'); } catch { return ''; } };
  const memberLink = (site, param, token) => `${site.origin}/collective-minds/member/?${param}=${encodeURIComponent(token)}`;

  // Single-use email tokens (stored as hashes): verify (24 h), change (24 h) and sign-in (30 min).
  async function issueToken(purpose, memberId, extra, minutes) {
    const token = randomBytes(24).toString('base64url');
    const stale = (await store.query(TOKENS, `PartitionKey eq ${odataString(purpose)}`, 2000)).filter(t => t.PartitionKey === purpose && (Number(t.exp) < now() || t.memberId === memberId));
    for (const t of stale) await store.remove(TOKENS, t.PartitionKey, t.RowKey);
    await store.upsert(TOKENS, { PartitionKey: purpose, RowKey: sha256(token), memberId, exp: now() + minutes * 60000, ...extra });
    return token;
  }
  async function useToken(purpose, token) {
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(String(token || ''))) return null;
    const row = await store.get(TOKENS, purpose, sha256(token));
    if (!row) return null;
    await store.remove(TOKENS, purpose, row.RowKey);
    return Number(row.exp) >= now() ? row : null;
  }
  // Limits on outgoing email: per visitor per day, and per address per hour.
  async function allowEmail(request, email) {
    const ip = (request.headers.get('x-azure-clientip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    const day = new Date(now()).toISOString().slice(0, 10).replace(/-/g, ''), hour = new Date(now()).toISOString().slice(0, 13);
    const keys = [['mail-ip-' + createHmac('sha256', secret).update(day + ip).digest('hex').slice(0, 24), MEMBER_LIMITS.emailLinksPerDay],
      ['mail-to-' + createHmac('sha256', secret).update(hour + email).digest('hex').slice(0, 24), MEMBER_LIMITS.emailsPerAddressPerHour]];
    for (const [key, max] of keys) {
      const used = await store.get(RATE, day, key);
      if (used && Number(used.count) >= max) return false;
    }
    for (const [key] of keys) { const used = await store.get(RATE, day, key); await store.upsert(RATE, { PartitionKey: day, RowKey: key, count: (used ? Number(used.count) : 0) + 1 }); }
    return true;
  }
  async function sendVerification(request, site, member, email, purpose = 'verify') {
    if (!mailer) return 'off';
    if (!(await allowEmail(request, email))) return 'limited';
    const token = await issueToken(purpose, member.RowKey, { emailEnc: seal(email) }, MEMBER_LIMITS.verifyHours * 60);
    await mailer({ to: email, ...emails.verify(member.displayName, memberLink(site, purpose === 'change' ? 'change' : 'verify', token)) });
    return 'sent';
  }
  async function linkEmail(member, email) {
    const hash = emailHash(email), owner = await store.get(EMAILS, 'email', hash);
    if (owner && owner.memberId !== member.RowKey && await store.get(MEMBERS, PK, owner.memberId)) return false;
    if (member.emailHash && member.emailHash !== hash) await store.remove(EMAILS, 'email', member.emailHash);
    await store.upsert(EMAILS, { PartitionKey: 'email', RowKey: hash, memberId: member.RowKey });
    await store.upsert(MEMBERS, { ...member, emailEnc: seal(email), emailHash: hash, emailVerified: true, emailVerifiedAt: new Date(now()).toISOString() });
    return true;
  }
  const unsubscribeToken = id => sign({ u: id, exp: now() + 3650 * 864e5 });
  async function forgetEmail(member) {
    if (member.emailHash) {
      const owner = await store.get(EMAILS, 'email', member.emailHash);
      if (owner && owner.memberId === member.RowKey) await store.remove(EMAILS, 'email', member.emailHash);
    }
    for (const purpose of ['verify', 'change', 'signin'])
      for (const t of (await store.query(TOKENS, `PartitionKey eq ${odataString(purpose)}`, 2000)).filter(t => t.PartitionKey === purpose && t.memberId === member.RowKey))
        await store.remove(TOKENS, t.PartitionKey, t.RowKey);
  }

  async function storeCredential(memberId, info) {
    const c = info.credential;
    await store.upsert(CREDS, { PartitionKey: 'cred', RowKey: c.id, memberId, publicKey: b64u(c.publicKey), counter: c.counter, transports: (c.transports || []).join(','), createdAt: new Date(now()).toISOString() });
  }
  const passkeysOf = async id => (await store.query(CREDS, `PartitionKey eq 'cred' and memberId eq ${odataString(id)}`, 50)).filter(c => c.memberId === id);
  async function recountSparks(ideaId) {
    const rows = (await store.query(SPARKS, `PartitionKey eq ${odataString(ideaId)}`, 5000)).filter(r => r.PartitionKey === ideaId);
    const idea = await store.get(IDEAS, IDEA_PK, ideaId);
    if (idea) await store.upsert(IDEAS, { ...idea, sparkCount: rows.length });
  }
  const guard = async (request, needMember = true) => {
    const site = siteOf(request);
    if (!site) return { fail: err(403, 'Please use the form on enterimagine.com.') };
    const body = await readJson(request);
    if (body === null) return { fail: err(400, 'Please send the form again.') };
    if (!needMember) return { site, body };
    const member = await currentMember(request);
    if (!member) return { fail: err(401, 'Please sign in with your passkey first.', { 'Set-Cookie': clearCookie(site) }) };
    return { site, body, member };
  };

  return {
    currentMember,

    // 1. Join: validate the card, then ask the device to create a passkey.
    async joinOptions(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const p = validateProfile(g.body);
      if (p.error) return err(400, p.error);
      const email = normalizeEmail(g.body.email);
      if (!validEmail(email)) return err(400, 'Please enter a valid email address.');
      if (g.body.age16 !== true) return err(400, 'Membership is for people aged 16 or older.');
      if (g.body.consent !== true) return err(400, 'Please confirm that your card may be shown publicly after review.');
      const memberId = newId();
      const options = await generateRegistrationOptions({ rpName: 'IMAGINE Collective Minds', rpID: g.site.rpID, userName: p.value.displayName,
        userDisplayName: p.value.displayName, userID: Buffer.from(memberId), attestationType: 'none',
        authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' }, timeout: 120000 });
      // Optional: also share the card's What If? as an idea, so it goes to idea review and can get a founding mind's reply.
      const share = g.body.shareIdea === true && p.value.whatIf.length >= 15 ? 1 : 0;
      return json(200, { options, token: challengeToken('join', options.challenge, { m: memberId, prof: p.value, e: seal(email), s: share }) });
    },

    async joinVerify(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const t = unsign(g.body.token);
      if (!t || t.p !== 'join') return err(400, 'This sign-up expired. Please start again.');
      let info;
      try { info = await verifyRegistrationResponse({ response: g.body.response, expectedChallenge: t.c, expectedOrigin: g.site.origin, expectedRPID: g.site.rpID, requireUserVerification: false }); }
      catch { return err(400, 'The passkey could not be verified. Please try again.'); }
      if (!info.verified || !info.registrationInfo) return err(400, 'The passkey could not be verified. Please try again.');
      if (await store.get(MEMBERS, PK, t.m)) return err(409, 'This sign-up was already completed. Please sign in.');
      const ts = new Date(now()).toISOString();
      const email = unseal(t.e);
      if (!email) return err(400, 'This sign-up expired. Please start again.');
      const member = { PartitionKey: PK, RowKey: t.m, displayName: t.prof.displayName, domains: t.prof.domains.join(','), whatIf: t.prof.whatIf, status: 'pending',
        consentAt: ts, ageConfirmedAt: ts, createdAt: ts, repliesSeenAt: ts, emailVerified: false, notifyReplies: true };
      await storeCredential(t.m, info.registrationInfo);
      await store.insert(MEMBERS, member);
      if (t.s === 1 && member.whatIf) {
        await store.insert(IDEAS, { PartitionKey: IDEA_PK, RowKey: Date.now().toString(36) + randomBytes(5).toString('hex'), status: 'pending', text: member.whatIf, name: member.displayName,
          themes: member.domains, consentAt: ts, createdAt: ts, codeHash: createHash('sha256').update(randomBytes(16)).digest('hex'), memberId: t.m }).catch(e => console.error('idea from card failed: ' + e.message));
      }
      const sent = await sendVerification(request, g.site, member, email).catch(e => { console.error('email send failed: ' + e.message); return 'failed'; });
      return json(201, { member: ownView(member), email: sent }, { 'Set-Cookie': sessionCookie(t.m, g.site) });
    },

    // 2. Sign in with a passkey already on this device (or a synced one).
    async loginOptions(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const options = await generateAuthenticationOptions({ rpID: g.site.rpID, userVerification: 'preferred', timeout: 120000 });
      return json(200, { options, token: challengeToken('login', options.challenge) });
    },

    async loginVerify(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const t = unsign(g.body.token);
      if (!t || t.p !== 'login') return err(400, 'This sign-in expired. Please try again.');
      const credId = String(g.body.response?.id || '');
      if (!/^[A-Za-z0-9_-]{16,512}$/.test(credId)) return err(400, 'Unknown passkey.');
      const cred = await store.get(CREDS, 'cred', credId);
      if (!cred) return err(404, 'This passkey is not linked to a Collective Minds card. Did you delete your account?');
      let info;
      try {
        info = await verifyAuthenticationResponse({ response: g.body.response, expectedChallenge: t.c, expectedOrigin: g.site.origin, expectedRPID: g.site.rpID, requireUserVerification: false,
          credential: { id: cred.RowKey, publicKey: new Uint8Array(Buffer.from(cred.publicKey, 'base64url')), counter: Number(cred.counter || 0), transports: String(cred.transports || '').split(',').filter(Boolean) } });
      } catch { return err(400, 'The passkey could not be verified. Please try again.'); }
      if (!info.verified) return err(400, 'The passkey could not be verified. Please try again.');
      await store.upsert(CREDS, { ...cred, counter: info.authenticationInfo.newCounter, lastUsedAt: new Date(now()).toISOString() });
      const member = await store.get(MEMBERS, PK, cred.memberId);
      if (!member) return err(404, 'This passkey is not linked to a Collective Minds card.');
      return json(200, { member: ownView(member) }, { 'Set-Cookie': sessionCookie(member.RowKey, g.site) });
    },

    // 3. Email: confirm the address, sign in with a one-time link, change the address, reply notices.
    async verifyEmail(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const purpose = g.body.change ? 'change' : 'verify';
      const row = await useToken(purpose, g.body.token);
      const member = row && await store.get(MEMBERS, PK, row.memberId);
      if (!member) return err(400, 'This link has expired or was already used. Sign in and ask for a new one.');
      const email = unseal(row.emailEnc);
      if (!email || !(await linkEmail(member, email))) return err(409, 'This email address is already linked to another card.');
      const fresh = await store.get(MEMBERS, PK, member.RowKey);
      return json(200, { member: ownView(fresh), confirmed: true }, { 'Set-Cookie': sessionCookie(member.RowKey, g.site) });
    },

    async resendVerification(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const pending = (await store.query(TOKENS, `PartitionKey eq 'verify'`, 2000)).find(t => t.memberId === g.member.RowKey);
      const email = g.member.emailVerified ? '' : unseal(pending?.emailEnc || '');
      if (!email) return err(400, 'Please enter your email address again under "Change email".');
      const sent = await sendVerification(request, g.site, g.member, email).catch(e => { console.error('email send failed: ' + e.message); return 'failed'; });
      return sent === 'sent' ? json(200, { ok: true }) : err(sent === 'limited' ? 429 : 503, sent === 'limited' ? 'Too many emails. Please try again later.' : sent === 'off' ? 'Email is not set up on this site yet (code E1).' : 'Sending the email failed. Please try again later (code E2).');
    },

    async changeEmail(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const email = normalizeEmail(g.body.email);
      if (!validEmail(email)) return err(400, 'Please enter a valid email address.');
      // Members who never confirmed an address simply restart verification with the new one.
      const purpose = g.member.emailVerified ? 'change' : 'verify';
      const sent = await sendVerification(request, g.site, g.member, email, purpose).catch(e => { console.error('email send failed: ' + e.message); return 'failed'; });
      return sent === 'sent' ? json(200, { ok: true }) : err(sent === 'limited' ? 429 : 503, sent === 'limited' ? 'Too many emails. Please try again later.' : sent === 'off' ? 'Email is not set up on this site yet (code E1).' : 'Sending the email failed. Please try again later (code E2).');
    },

    // Same answer whether or not the address belongs to a card, so the form cannot reveal members.
    async requestSignIn(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const email = normalizeEmail(g.body.email);
      if (!validEmail(email)) return err(400, 'Please enter a valid email address.');
      const done = json(200, { ok: true, message: 'If this email belongs to a confirmed Collective Minds card, a sign-in link is on its way. It works once, for 30 minutes.' });
      if (!mailer || !(await allowEmail(request, email))) return done;
      const owner = await store.get(EMAILS, 'email', emailHash(email));
      const member = owner && await store.get(MEMBERS, PK, owner.memberId);
      if (!member || !member.emailVerified) return done;
      const token = await issueToken('signin', member.RowKey, {}, MEMBER_LIMITS.signInMinutes);
      await mailer({ to: email, ...emails.signIn(memberLink(g.site, 'signin', token)) }).catch(() => {});
      return done;
    },

    async signInWithLink(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const row = await useToken('signin', g.body.token);
      const member = row && await store.get(MEMBERS, PK, row.memberId);
      if (!member) return err(400, 'This sign-in link has expired or was already used. Please ask for a new one.');
      return json(200, { member: ownView(member), viaEmail: true }, { 'Set-Cookie': sessionCookie(member.RowKey, g.site) });
    },

    async setNotifications(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      await store.upsert(MEMBERS, { ...g.member, notifyReplies: g.body.replies === true });
      return json(200, { ok: true, notifyReplies: g.body.replies === true });
    },

    async unsubscribe(request) {
      const g = await guard(request, false); if (g.fail) return g.fail;
      const t = unsign(g.body.token);
      const member = t && typeof t.u === 'string' && VALID_ID.test(t.u) && await store.get(MEMBERS, PK, t.u);
      if (!member) return err(400, 'This unsubscribe link is not valid.');
      await store.upsert(MEMBERS, { ...member, notifyReplies: false });
      return json(200, { ok: true });
    },

    // Called by the idea handlers when a founding mind replies to a member's idea.
    async notifyReply(idea, siteOrigin) {
      if (!mailer || !idea.memberId) return;
      const member = await store.get(MEMBERS, PK, idea.memberId);
      if (!member || !member.emailVerified || member.notifyReplies === false) return;
      const email = unseal(member.emailEnc);
      if (!email) return;
      const founder = MINDS[idea.replyMind]?.name || 'A founding mind';
      const base = siteOrigin || 'https://enterimagine.com';
      await mailer({ to: email, ...emails.reply(founder, idea.text, base + '/collective-minds/member/', base + '/collective-minds/member/?unsubscribe=' + encodeURIComponent(unsubscribeToken(member.RowKey))) });
    },

    async passkeyOptions(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const existing = await passkeysOf(g.member.RowKey);
      const options = await generateRegistrationOptions({ rpName: 'IMAGINE Collective Minds', rpID: g.site.rpID, userName: g.member.displayName,
        userDisplayName: g.member.displayName, userID: Buffer.from(g.member.RowKey), attestationType: 'none',
        excludeCredentials: existing.map(c => ({ id: c.RowKey })), authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' }, timeout: 120000 });
      return json(200, { options, token: challengeToken('add', options.challenge, { m: g.member.RowKey }) });
    },

    async passkeyVerify(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const t = unsign(g.body.token);
      if (!t || t.p !== 'add' || t.m !== g.member.RowKey) return err(400, 'This request expired. Please try again.');
      let info;
      try { info = await verifyRegistrationResponse({ response: g.body.response, expectedChallenge: t.c, expectedOrigin: g.site.origin, expectedRPID: g.site.rpID, requireUserVerification: false }); }
      catch { return err(400, 'The passkey could not be verified. Please try again.'); }
      if (!info.verified || !info.registrationInfo) return err(400, 'The passkey could not be verified. Please try again.');
      await storeCredential(g.member.RowKey, info.registrationInfo);
      return json(200, { ok: true });
    },

    // 4. The member's own card, ideas, replies and sparks.
    async me(request) {
      const member = await currentMember(request);
      if (!member) return json(200, { member: null });
      const ideas = (await store.query(IDEAS, `PartitionKey eq '${IDEA_PK}' and memberId eq ${odataString(member.RowKey)}`, 300)).filter(i => i.memberId === member.RowKey);
      ideas.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      const sparks = (await store.query(SPARKS, `RowKey eq ${odataString(member.RowKey)}`, 2000)).filter(s => s.RowKey === member.RowKey).map(s => s.PartitionKey);
      const seen = String(member.repliesSeenAt || '');
      return json(200, {
        member: { ...ownView(member), passkeys: (await passkeysOf(member.RowKey)).length, emailPending: !member.emailVerified,
          // Cards created before email existed have no address at all: the page then asks for one.
          emailOnFile: !!member.emailVerified || (await store.query(TOKENS, `PartitionKey eq 'verify'`, 2000)).some(t => t.PartitionKey === 'verify' && t.memberId === member.RowKey && Number(t.exp) >= now()) },
        ideas: ideas.map(i => ({ id: i.RowKey, text: i.text, themes: String(i.themes || '').split(',').filter(Boolean), status: i.status, createdAt: i.createdAt, sparks: Number(i.sparkCount || 0),
          reply: i.replyText ? { mind: i.replyMind, text: i.replyText, at: i.replyAt, isNew: String(i.replyAt || '') > seen } : null })),
        sparks
      });
    },

    async updateProfile(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const p = validateProfile(g.body);
      if (p.error) return err(400, p.error);
      const same = p.value.displayName === g.member.displayName && p.value.domains.join(',') === g.member.domains && p.value.whatIf === (g.member.whatIf || '');
      if (same) return json(200, { member: ownView(g.member) });
      // Every change is reviewed again before the card reappears.
      const next = { ...g.member, displayName: p.value.displayName, domains: p.value.domains.join(','), whatIf: p.value.whatIf, status: 'pending', reviewNote: '', updatedAt: new Date(now()).toISOString() };
      for (const k of ['checkRecommendation', 'checkReason', 'checkedAt']) delete next[k];
      await store.upsert(MEMBERS, next);
      return json(200, { member: ownView(next) });
    },

    async seen(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      await store.upsert(MEMBERS, { ...g.member, repliesSeenAt: new Date(now()).toISOString() });
      return json(200, { ok: true });
    },

    async removeIdea(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const id = String(g.body.id || '');
      const idea = /^[a-z0-9]{8,40}$/.test(id) && await store.get(IDEAS, IDEA_PK, id);
      if (!idea || idea.memberId !== g.member.RowKey) return err(404, 'This idea is not on your card.');
      for (const s of (await store.query(SPARKS, `PartitionKey eq ${odataString(id)}`, 5000)).filter(s => s.PartitionKey === id)) await store.remove(SPARKS, s.PartitionKey, s.RowKey);
      await store.remove(IDEAS, IDEA_PK, id);
      return json(200, { ok: true });
    },

    async spark(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const id = String(g.body.id || '');
      const idea = /^[a-z0-9]{8,40}$/.test(id) && await store.get(IDEAS, IDEA_PK, id);
      if (!idea || idea.status !== 'approved') return err(404, 'This idea is not published.');
      if (g.body.on === false) await store.remove(SPARKS, id, g.member.RowKey);
      else await store.upsert(SPARKS, { PartitionKey: id, RowKey: g.member.RowKey, at: new Date(now()).toISOString() });
      await recountSparks(id);
      return json(200, { ok: true, sparks: Number((await store.get(IDEAS, IDEA_PK, id))?.sparkCount || 0), on: g.body.on !== false });
    },

    async logout(request) {
      return json(200, { ok: true }, { 'Set-Cookie': clearCookie(siteOf(request)) });
    },

    // Deleting the account removes the card, email address, passkeys, sparks and the member's ideas.
    async deleteAccount(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      if (g.body.confirm !== true) return err(400, 'Please confirm that you want to delete your card.');
      const id = g.member.RowKey;
      for (const c of await passkeysOf(id)) await store.remove(CREDS, 'cred', c.RowKey);
      await forgetEmail(g.member);
      const sparked = (await store.query(SPARKS, `RowKey eq ${odataString(id)}`, 2000)).filter(s => s.RowKey === id);
      for (const s of sparked) await store.remove(SPARKS, s.PartitionKey, s.RowKey);
      for (const s of sparked) await recountSparks(s.PartitionKey);
      const own = (await store.query(IDEAS, `PartitionKey eq '${IDEA_PK}' and memberId eq ${odataString(id)}`, 300)).filter(i => i.memberId === id);
      for (const i of own) {
        for (const s of (await store.query(SPARKS, `PartitionKey eq ${odataString(i.RowKey)}`, 5000)).filter(s => s.PartitionKey === i.RowKey)) await store.remove(SPARKS, s.PartitionKey, s.RowKey);
        await store.remove(IDEAS, IDEA_PK, i.RowKey);
      }
      await store.remove(MEMBERS, PK, id);
      return json(200, { ok: true }, { 'Set-Cookie': clearCookie(g.site) });
    },

    // Public list of approved member cards.
    async listPublic() {
      const rows = (await store.query(MEMBERS, `PartitionKey eq '${PK}' and status eq 'approved'`, 1000)).filter(m => m.status === 'approved');
      rows.sort((a, b) => String(a.approvedAt).localeCompare(String(b.approvedAt)));
      return json(200, { members: rows.map(publicMember) }, { 'Cache-Control': 'public, max-age=60' });
    },

    // Moderation of member cards.
    async listForModeration(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      const rows = await store.query(MEMBERS, `PartitionKey eq '${PK}'`, 2000);
      const order = { pending: 0, changes: 1, approved: 2 };
      rows.sort((a, b) => (order[a.status] - order[b.status]) || String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
      // The moderator sees whether the email is confirmed, not the address itself (that is in the export only).
      return json(200, { members: rows.map(m => ({ ...ownView(m), ...(m.checkedAt ? { check: { recommendation: m.checkRecommendation, reason: m.checkReason } } : {}) })), agent: { enabled: !!checker } });
    },

    async check(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      if (!checker) return err(409, 'The review agent is not switched on.');
      const body = await readJson(request);
      const m = VALID_ID.test(String(body?.id || '')) && await store.get(MEMBERS, PK, body.id);
      if (!m) return err(404, 'This member no longer exists.');
      if (draftCap && !(await draftCap())) return err(429, 'Daily limit of agent checks reached. Checking resumes tomorrow.');
      const r = await checker({ displayName: m.displayName, whatIf: m.whatIf || '', domains: String(m.domains).split(',') });
      await store.upsert(MEMBERS, { ...m, checkRecommendation: r.recommendation, checkReason: r.reason, checkedAt: new Date(now()).toISOString() });
      return json(200, { check: r });
    },

    async decide(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      const body = await readJson(request);
      const id = String(body?.id || ''), action = String(body?.action || '');
      if (!VALID_ID.test(id) || !['approve', 'changes', 'remove'].includes(action)) return err(400, 'Unknown member or action.');
      const m = await store.get(MEMBERS, PK, id);
      if (!m) return err(404, 'This member no longer exists.');
      if (action === 'approve' && !m.emailVerified) return err(409, 'This member has not confirmed their email address yet.');
      if (action === 'approve') await store.upsert(MEMBERS, { ...m, status: 'approved', reviewNote: '', approvedAt: m.approvedAt || new Date(now()).toISOString() });
      else if (action === 'changes') await store.upsert(MEMBERS, { ...m, status: 'changes', reviewNote: clean(body.note).slice(0, 200) });
      else {
        // Remove for abuse: the card and passkeys go; the member's ideas stay only if already published.
        for (const c of await passkeysOf(id)) await store.remove(CREDS, 'cred', c.RowKey);
        await forgetEmail(m);
        await store.remove(MEMBERS, PK, id);
      }
      return json(200, { ok: true });
    },

    // Copy of a member's data, for a request by email (GDPR right of access). Moderator only.
    async exportMember(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      const body = await readJson(request);
      const key = String(body?.query || '').trim();
      let m = VALID_ID.test(key) ? await store.get(MEMBERS, PK, key) : null;
      if (!m && validEmail(normalizeEmail(key))) {
        const owner = await store.get(EMAILS, 'email', emailHash(normalizeEmail(key)));
        m = owner && await store.get(MEMBERS, PK, owner.memberId);
      }
      if (!m) return err(404, 'No member card matches this email address or card number.');
      const id = m.RowKey;
      const ideas = (await store.query(IDEAS, `PartitionKey eq '${IDEA_PK}' and memberId eq ${odataString(id)}`, 300)).filter(i => i.memberId === id);
      const sparks = (await store.query(SPARKS, `RowKey eq ${odataString(id)}`, 2000)).filter(s => s.RowKey === id);
      const keys = await passkeysOf(id);
      return json(200, { export: {
        exportedAt: new Date(now()).toISOString(), controller: 'EnterImagine Media (enterimagine.com)',
        card: { number: id, displayName: m.displayName, domains: String(m.domains || '').split(',').filter(Boolean), whatIf: m.whatIf || '', status: m.status,
          joinedAt: m.createdAt, approvedAt: m.approvedAt || null, updatedAt: m.updatedAt || null },
        email: { address: unseal(m.emailEnc) || null, confirmed: !!m.emailVerified, confirmedAt: m.emailVerifiedAt || null, replyNotifications: m.notifyReplies !== false },
        consents: { publicCardAt: m.consentAt || null, aged16OrOlderConfirmedAt: m.ageConfirmedAt || null },
        passkeys: keys.map(k => ({ createdAt: k.createdAt || null, lastUsedAt: k.lastUsedAt || null, deviceTypes: String(k.transports || '').split(',').filter(Boolean) })),
        ideas: ideas.map(i => ({ number: i.RowKey, text: i.text, themes: String(i.themes || '').split(',').filter(Boolean), status: i.status, sharedAt: i.createdAt, publishedAt: i.approvedAt || null,
          sparks: Number(i.sparkCount || 0), reply: i.replyText ? { from: MINDS[i.replyMind]?.name || i.replyMind, text: i.replyText, at: i.replyAt || null } : null })),
        sparksGiven: sparks.map(s => ({ idea: s.PartitionKey, at: s.at || null })),
        notes: 'Passkeys: only the public key is stored; biometrics and private keys never leave the member\'s device. No password, IP address or tracking data is stored.'
      } });
    }
  };
}
