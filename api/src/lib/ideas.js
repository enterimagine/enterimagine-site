// Collective Minds idea wall: validation and request handlers (storage injected for testing).
// Data kept per idea: the idea text, 1-3 themes, an optional display name, the consent time,
// timestamps and a hash of the removal code. No email, no account, no IP address.
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { odataString } from './table.js';

export const THEMES = Object.freeze(['ai-data', 'quantum-computing', 'energy', 'smart-mobility', 'smart-cities', 'biotech', 'robotics', 'space', 'innovation']);
export const LIMITS = Object.freeze({ textMin: 15, textMax: 300, nameMax: 40, perDay: 5, minSeconds: 3, pendingDays: 90, maxBody: 4096 });
const IDEAS = 'ideas', RATE = 'ratelimit', PK = 'idea';

const sha256 = s => createHash('sha256').update(s).digest('hex');
const clean = s => String(s ?? '').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f]/g, ' ').replace(/\s+/g, ' ').trim();
const LINKISH = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|be|nl|ru|xyz|info|biz|co)\b|@[a-z0-9-]+\.[a-z]{2,})/i;
const id = () => Date.now().toString(36) + randomBytes(5).toString('hex');
const removalCode = () => { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = randomBytes(10); return [...b].map(x => a[x % a.length]).join('').replace(/(.{5})(.{5})/, '$1-$2'); };
const json = (status, body, headers = {}) => ({ status, jsonBody: body, headers: { 'Cache-Control': 'no-store', ...headers } });
const err = (status, message) => json(status, { error: message });

export function validateSubmission(input, now = Date.now()) {
  if (!input || typeof input !== 'object') return { error: 'Please send the form again.' };
  if (clean(input.website)) return { error: 'Please send the form again.', spam: true };
  const started = Number(input.started);
  if (!Number.isFinite(started) || now - started < LIMITS.minSeconds * 1000) return { error: 'Please take a moment before sending.', spam: true };
  const text = clean(input.text), name = clean(input.name);
  if (text.length < LIMITS.textMin) return { error: `Please write at least ${LIMITS.textMin} characters.` };
  if (text.length > LIMITS.textMax) return { error: `Please keep your idea under ${LIMITS.textMax} characters.` };
  if (LINKISH.test(text) || LINKISH.test(name)) return { error: 'Please leave out links and email addresses.' };
  if (name.length > LIMITS.nameMax) return { error: `Please keep the name under ${LIMITS.nameMax} characters.` };
  if (name && !/^[\p{L}\p{M}0-9 .'’-]+$/u.test(name)) return { error: 'Please use letters, numbers and spaces in the name.' };
  const themes = Array.isArray(input.themes) ? [...new Set(input.themes.map(String))] : [];
  if (!themes.length || themes.length > 3 || themes.some(t => !THEMES.includes(t))) return { error: 'Please choose one to three themes.' };
  if (input.consent !== true) return { error: 'Please confirm that your idea and display name may be shown publicly.' };
  return { value: { text, name, themes } };
}

const publicIdea = e => ({ id: e.RowKey, text: e.text, name: e.name || '', themes: String(e.themes || '').split(',').filter(Boolean), approvedAt: e.approvedAt });
const moderatorView = e => ({ ...publicIdea(e), status: e.status, createdAt: e.createdAt });

export function isModerator(request) {
  try {
    const raw = request.headers.get('x-ms-client-principal');
    if (!raw) return false;
    const p = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    return Array.isArray(p.userRoles) && p.userRoles.includes('moderator');
  } catch { return false; }
}

async function readJson(request) {
  const text = await request.text();
  if (text.length > LIMITS.maxBody) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export function createHandlers(store, { secret, now = () => Date.now() }) {
  if (!secret) throw new Error('Missing rate-limit secret.');
  const clientKey = request => {
    const ip = (request.headers.get('x-azure-clientip') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().replace(/:\d+$/, '');
    const day = new Date(now()).toISOString().slice(0, 10).replace(/-/g, '');
    return { day, key: createHmac('sha256', secret).update(day + '|' + ip).digest('hex').slice(0, 32) };
  };

  return {
    async submit(request) {
      const body = await readJson(request);
      const checked = validateSubmission(body, now());
      if (checked.spam) return json(202, { ok: true, pending: true });
      if (checked.error) return err(400, checked.error);
      const { day, key } = clientKey(request);
      const used = await store.get(RATE, day, key);
      if (used && Number(used.count) >= LIMITS.perDay) return err(429, 'Thanks for your enthusiasm. Please share more ideas tomorrow.');
      await store.upsert(RATE, { PartitionKey: day, RowKey: key, count: (used ? Number(used.count) : 0) + 1 });
      // Rate-limit keys are pseudonymous and only needed for the current day: delete older days.
      for (const old of await store.query(RATE, `PartitionKey lt ${odataString(day)}`, 100)) await store.remove(RATE, old.PartitionKey, old.RowKey);
      const code = removalCode(), rowId = id(), ts = new Date(now()).toISOString();
      await store.insert(IDEAS, { PartitionKey: PK, RowKey: rowId, status: 'pending', text: checked.value.text, name: checked.value.name,
        themes: checked.value.themes.join(','), consentAt: ts, createdAt: ts, codeHash: sha256(code) });
      return json(201, { ok: true, id: rowId, removalCode: code });
    },

    async listPublic() {
      const rows = await store.query(IDEAS, `PartitionKey eq ${odataString(PK)} and status eq 'approved'`, 300);
      rows.sort((a, b) => String(b.approvedAt).localeCompare(String(a.approvedAt)));
      return json(200, { ideas: rows.map(publicIdea) }, { 'Cache-Control': 'public, max-age=60' });
    },

    async withdraw(request) {
      const body = await readJson(request);
      const rowId = String(body?.id || ''), code = String(body?.code || '').toUpperCase().trim();
      if (!/^[a-z0-9]{8,40}$/.test(rowId) || !/^[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(code)) return err(400, 'Please check the idea number and removal code.');
      const row = await store.get(IDEAS, PK, rowId);
      const a = Buffer.from(sha256(code)), b = Buffer.from(String(row?.codeHash || '').padEnd(64, '0').slice(0, 64));
      if (!row || !timingSafeEqual(a, b)) return err(404, 'We could not find an idea with that number and removal code.');
      await store.remove(IDEAS, PK, rowId);
      return json(200, { ok: true });
    },

    async listForModeration(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      const rows = await store.query(IDEAS, `PartitionKey eq ${odataString(PK)}`, 1000);
      const cutoff = now() - LIMITS.pendingDays * 864e5, kept = [];
      for (const r of rows) {
        if (r.status === 'pending' && Date.parse(r.createdAt) < cutoff) await store.remove(IDEAS, PK, r.RowKey);
        else kept.push(r);
      }
      kept.sort((a, b) => (a.status === b.status ? String(b.createdAt).localeCompare(String(a.createdAt)) : a.status === 'pending' ? -1 : 1));
      return json(200, { ideas: kept.map(moderatorView) });
    },

    async decide(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      const body = await readJson(request);
      const rowId = String(body?.id || ''), action = String(body?.action || '');
      if (!/^[a-z0-9]{8,40}$/.test(rowId) || !['approve', 'reject', 'remove'].includes(action)) return err(400, 'Unknown idea or action.');
      const row = await store.get(IDEAS, PK, rowId);
      if (!row) return err(404, 'This idea no longer exists.');
      if (action === 'approve') {
        await store.upsert(IDEAS, { ...row, status: 'approved', approvedAt: new Date(now()).toISOString() });
      } else {
        await store.remove(IDEAS, PK, rowId); // rejected and removed ideas are deleted, not archived
      }
      return json(200, { ok: true });
    }
  };
}
