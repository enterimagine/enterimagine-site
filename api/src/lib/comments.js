// Collective Minds comments: signed-in members with an approved card comment on published ideas.
// Every comment is screened by the AI check before anyone else sees it:
//   publish -> visible at once; review -> waits for the moderator; reject -> not stored at all.
// When the check is unavailable (no key, daily cap, error) the comment waits for the moderator:
// nothing is ever published unchecked. Members can report a comment; after three reports it is
// hidden until the moderator has looked at it. Replies go one level deep.
// Stored per comment: the idea, the member's card number and display name, the text, the parent
// comment (for replies), status, times, the check result, sparks and reports. No IP address.
import { randomBytes } from 'node:crypto';
import { odataString } from './table.js';
import { isModerator } from './ideas.js';

export const COMMENTS = 'comments', CSPARKS = 'commentsparks', CREPORTS = 'commentreports';
const RATE = 'ratelimit', IDEAS = 'ideas', IDEA_PK = 'idea';
export const COMMENT_LIMITS = Object.freeze({ textMin: 2, textMax: 300, perDay: 20, pageSize: 20, openDays: 60, reportsToHide: 3, checksPerDay: 300, maxBody: 4096, preview: 2, alertMinutes: 60 });

const clean = s => String(s ?? '').normalize('NFC').replace(/[\p{Cc}\p{Cf}]/gu, ' ').replace(/\s+/g, ' ').trim();
const LINKISH = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|be|nl|ru|xyz|info|biz|co)\b|@[a-z0-9-]+\.[a-z]{2,})/i;
const IDEA_ID = /^[a-z0-9]{8,40}$/, COMMENT_ID = /^c[a-z0-9]{8,40}$/;
const newId = () => 'c' + Date.now().toString(36) + randomBytes(5).toString('hex');
const json = (status, body, headers = {}) => ({ status, jsonBody: body, headers: { 'Cache-Control': 'no-store', ...headers } });
const err = (status, message) => json(status, { error: message });
const day = t => new Date(t).toISOString().slice(0, 10).replace(/-/g, '');

export function validateComment(input) {
  if (!input || typeof input !== 'object') return { error: 'Please write your comment again.' };
  const text = clean(input.text), parentId = String(input.parentId || '');
  if (text.length < COMMENT_LIMITS.textMin) return { error: 'Please write a comment first.' };
  if (text.length > COMMENT_LIMITS.textMax) return { error: `Please keep your comment under ${COMMENT_LIMITS.textMax} characters.` };
  if (LINKISH.test(text)) return { error: 'Please leave out links and email addresses.' };
  if (parentId && !COMMENT_ID.test(parentId)) return { error: 'This reply is not linked to a comment.' };
  return { value: { text, parentId } };
}

// ---- Store helpers shared with the idea and member handlers ----
const inIdea = async (store, ideaId) => (await store.query(COMMENTS, `PartitionKey eq ${odataString(ideaId)}`, 5000)).filter(c => c.PartitionKey === ideaId);
const byPartition = async (store, table, pk) => (await store.query(table, `PartitionKey eq ${odataString(pk)}`, 5000)).filter(r => r.PartitionKey === pk);
const LIVE = s => s === 'published' || s === 'review';

async function dropSide(store, commentId) {
  for (const t of [CSPARKS, CREPORTS]) for (const r of await byPartition(store, t, commentId)) await store.remove(t, r.PartitionKey, r.RowKey);
}
// A comment with live replies leaves a placeholder ("This comment was removed"), so the replies keep their place.
async function removeComment(store, c, by, rows = null) {
  const all = rows || await inIdea(store, c.PartitionKey);
  await dropSide(store, c.RowKey);
  if (!c.parentId && all.some(r => r.parentId === c.RowKey && LIVE(r.status))) {
    await store.upsert(COMMENTS, { PartitionKey: c.PartitionKey, RowKey: c.RowKey, parentId: '', status: 'removed', removedBy: by, createdAt: c.createdAt, memberId: '', name: '', text: '' });
  } else {
    await store.remove(COMMENTS, c.PartitionKey, c.RowKey);
    // The last reply under a placeholder takes the placeholder with it.
    const parent = c.parentId && all.find(r => r.RowKey === c.parentId);
    if (parent && parent.status === 'removed' && !all.some(r => r.parentId === parent.RowKey && r.RowKey !== c.RowKey && LIVE(r.status))) await store.remove(COMMENTS, parent.PartitionKey, parent.RowKey);
  }
}

export async function deleteCommentsOfIdea(store, ideaId) {
  for (const c of await inIdea(store, ideaId)) { await dropSide(store, c.RowKey); await store.remove(COMMENTS, c.PartitionKey, c.RowKey); }
}
export async function commentsOfMember(store, memberId) {
  return (await store.query(COMMENTS, `memberId eq ${odataString(memberId)}`, 5000)).filter(c => c.memberId === memberId && c.status !== 'removed');
}
async function recount(store, table, c) {
  const n = (await byPartition(store, table, c.RowKey)).length;
  const fresh = await store.get(COMMENTS, c.PartitionKey, c.RowKey);
  if (fresh) await store.upsert(COMMENTS, { ...fresh, [table === CSPARKS ? 'sparkCount' : 'reportCount']: n });
  return n;
}
// Account deletion (and removal for abuse): the member's comments, sparks and reports go.
export async function removeCommentsOfMember(store, memberId) {
  for (const c of await commentsOfMember(store, memberId)) { const fresh = await store.get(COMMENTS, c.PartitionKey, c.RowKey); if (fresh) await removeComment(store, fresh, 'author'); }
  for (const t of [CSPARKS, CREPORTS]) {
    for (const r of (await store.query(t, `RowKey eq ${odataString(memberId)}`, 5000)).filter(r => r.RowKey === memberId)) {
      await store.remove(t, r.PartitionKey, r.RowKey);
      const c = (await store.query(COMMENTS, `RowKey eq ${odataString(r.PartitionKey)}`, 5)).find(x => x.RowKey === r.PartitionKey);
      if (c) await recount(store, t, c);
    }
  }
}
// For the member card: replies to the member's comments and comments on the member's own ideas.
export async function responsesFor(store, memberId, ideaIds = []) {
  const mine = await commentsOfMember(store, memberId), mineIds = new Set(mine.map(c => c.RowKey)), out = [];
  const partitions = new Set([...mine.map(c => c.PartitionKey), ...ideaIds]);
  for (const ideaId of partitions) {
    for (const c of await inIdea(store, ideaId)) {
      if (c.status !== 'published' || c.memberId === memberId) continue;
      const reply = c.parentId && mineIds.has(c.parentId);
      if (reply || (!c.parentId && ideaIds.includes(ideaId))) out.push({ idea: ideaId, id: c.RowKey, by: c.name, text: c.text, at: c.publishedAt || c.createdAt, kind: reply ? 'reply' : 'idea' });
    }
  }
  return out.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 30);
}

// ---- Views ----
const publicView = (c, me, sparked, reported) => c.status === 'removed'
  ? { id: c.RowKey, removed: true, at: c.createdAt }
  : { id: c.RowKey, ...(c.parentId ? { parentId: c.parentId } : {}), name: c.name, memberId: c.memberId, text: c.text, at: c.publishedAt || c.createdAt,
      sparks: Number(c.sparkCount || 0), ...(me && c.memberId === me ? { own: true } : {}), ...(c.status === 'review' ? { checking: true } : {}),
      ...(sparked?.has(c.RowKey) ? { sparked: true } : {}), ...(reported?.has(c.RowKey) ? { reported: true } : {}) };
const topFirst = (a, b) => (Number(b.sparkCount || 0) - Number(a.sparkCount || 0)) || String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt));
const newFirst = (a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt));
const openUntil = idea => Date.parse(idea.approvedAt || 0) + COMMENT_LIMITS.openDays * 864e5;

async function readJson(request) {
  const text = await request.text();
  if (text.length > COMMENT_LIMITS.maxBody) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export function createCommentHandlers(store, { now = () => Date.now(), memberOf, siteOf, screener = null, notifier = null }) {
  const publishedIdea = async id => { const i = IDEA_ID.test(id) && await store.get(IDEAS, IDEA_PK, id); return i && i.status === 'approved' ? i : null; };
  const me = async request => memberOf ? await memberOf(request).catch(() => null) : null;
  const canComment = m => !!m && m.status === 'approved';
  // At most one push alert per hour; it says only how many comments need a look.
  async function alert() {
    if (!notifier) return;
    const d = day(now()), last = await store.get(RATE, d, 'comment-alert-last');
    if (last && now() - Number(last.at) < COMMENT_LIMITS.alertMinutes * 60000) return;
    await store.upsert(RATE, { PartitionKey: d, RowKey: 'comment-alert-last', at: now() });
    const waiting = (await store.query(COMMENTS, `status eq 'review'`, 5000)).filter(c => c.status === 'review').length;
    await notifier(waiting, 'comment');
  }
  async function screen(text, idea) {
    if (!screener) return { decision: 'review', reason: 'Automatic check not switched on.', flag: 'unchecked' };
    const d = day(now()), used = Number((await store.get(RATE, d, 'comment-checks'))?.count || 0);
    if (used >= COMMENT_LIMITS.checksPerDay) return { decision: 'review', reason: 'Daily limit of automatic checks reached.', flag: 'unchecked' };
    await store.upsert(RATE, { PartitionKey: d, RowKey: 'comment-checks', count: used + 1 });
    try { const r = await screener({ text, idea: idea.text }); return { ...r, flag: r.decision === 'review' ? 'ai' : '' }; }
    catch { return { decision: 'review', reason: 'The automatic check did not answer.', flag: 'unchecked' }; }
  }
  const guard = async request => {
    if (siteOf && !siteOf(request)) return { fail: err(403, 'Please use the form on enterimagine.com.') };
    const body = await readJson(request);
    if (body === null) return { fail: err(400, 'Please send it again.') };
    const member = await me(request);
    if (!member) return { fail: err(401, 'Please sign in to take part.') };
    return { body, member };
  };
  const target = async body => {
    const ideaId = String(body.idea || ''), id = String(body.id || '');
    if (!IDEA_ID.test(ideaId) || !COMMENT_ID.test(id)) return null;
    return store.get(COMMENTS, ideaId, id);
  };

  return {
    // GET /api/comments?idea=<id>&sort=top|new&offset=0 — one page of conversations with their replies.
    async list(request) {
      const q = request.query instanceof URLSearchParams ? request.query : new URL(request.url || '/', 'http://x').searchParams, ideaId = q.get('idea') || '';
      const idea = await publishedIdea(ideaId);
      if (!idea) return err(404, 'This idea is not published.');
      const member = await me(request), mid = member?.RowKey || null;
      const rows = await inIdea(store, ideaId);
      const visible = c => c.status === 'published' || (c.status === 'review' && mid && c.memberId === mid);
      const replies = rows.filter(c => c.parentId && visible(c));
      const tops = rows.filter(c => !c.parentId && (visible(c) || (c.status === 'removed' && replies.some(r => r.parentId === c.RowKey))));
      tops.sort(q.get('sort') === 'new' ? newFirst : topFirst);
      const offset = Math.max(0, parseInt(q.get('offset') || '0', 10) || 0), page = tops.slice(offset, offset + COMMENT_LIMITS.pageSize);
      let sparked = new Set(), reported = new Set();
      if (mid) {
        sparked = new Set((await store.query(CSPARKS, `RowKey eq ${odataString(mid)}`, 5000)).filter(r => r.RowKey === mid).map(r => r.PartitionKey));
        reported = new Set((await store.query(CREPORTS, `RowKey eq ${odataString(mid)}`, 5000)).filter(r => r.RowKey === mid).map(r => r.PartitionKey));
      }
      const view = c => publicView(c, mid, sparked, reported);
      return json(200, {
        comments: page.map(c => ({ ...view(c), replies: replies.filter(r => r.parentId === c.RowKey).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))).map(view) })),
        total: rows.filter(c => c.status === 'published').length, conversations: tops.length, offset, more: offset + page.length < tops.length,
        open: now() < openUntil(idea), closesAt: new Date(openUntil(idea)).toISOString(),
        viewer: member ? { name: member.displayName, canComment: canComment(member), status: member.status } : null
      });
    },

    // GET /api/comments/summary — for the idea wall: comment count and the two most-sparked conversations per idea.
    async summary() {
      const rows = (await store.query(COMMENTS, `status eq 'published'`, 10000)).filter(c => c.status === 'published');
      const out = {};
      for (const c of rows) {
        const v = (out[c.PartitionKey] ||= { count: 0, tops: [] });
        v.count++;
        if (!c.parentId) v.tops.push(c);
      }
      for (const v of Object.values(out)) {
        v.top = v.tops.sort(topFirst).slice(0, COMMENT_LIMITS.preview).map(c => ({ id: c.RowKey, name: c.name, text: c.text, sparks: Number(c.sparkCount || 0) }));
        delete v.tops;
      }
      return json(200, { ideas: out }, { 'Cache-Control': 'public, max-age=60' });
    },

    async post(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      if (!canComment(g.member)) return err(403, 'You can comment once IMAGINE has approved your card.');
      const idea = await publishedIdea(String(g.body.idea || ''));
      if (!idea) return err(404, 'This idea is not published.');
      if (now() >= openUntil(idea)) return err(409, 'This conversation is closed for new comments.');
      const v = validateComment(g.body);
      if (v.error) return err(400, v.error);
      if (v.value.parentId) {
        const parent = await store.get(COMMENTS, idea.RowKey, v.value.parentId);
        if (!parent || parent.parentId || parent.status !== 'published') return err(404, 'This comment can no longer be answered.');
      }
      const d = day(now()), key = 'c-' + g.member.RowKey, used = Number((await store.get(RATE, d, key))?.count || 0);
      if (used >= COMMENT_LIMITS.perDay) return err(429, 'You have reached today\'s limit of comments. Please continue tomorrow.');
      await store.upsert(RATE, { PartitionKey: d, RowKey: key, count: used + 1 });
      const s = await screen(v.value.text, idea);
      if (s.decision === 'reject') return err(422, 'This comment cannot be published. Please keep it kind and on topic, without personal details or advertising.');
      const ts = new Date(now()).toISOString(), status = s.decision === 'publish' ? 'published' : 'review';
      const row = { PartitionKey: idea.RowKey, RowKey: newId(), memberId: g.member.RowKey, name: g.member.displayName, text: v.value.text, parentId: v.value.parentId,
        status, createdAt: ts, ...(status === 'published' ? { publishedAt: ts } : {}), checkDecision: s.decision, checkReason: String(s.reason || '').slice(0, 200), flag: s.flag || '', sparkCount: 0, reportCount: 0 };
      await store.insert(COMMENTS, row);
      if (status === 'review') await alert().catch(() => {});
      return json(201, { comment: publicView(row, g.member.RowKey), status });
    },

    async remove(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      const c = await target(g.body);
      if (!c || c.memberId !== g.member.RowKey) return err(404, 'This is not one of your comments.');
      await removeComment(store, c, 'author');
      return json(200, { ok: true });
    },

    async spark(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      if (!canComment(g.member)) return err(403, 'You can spark comments once IMAGINE has approved your card.');
      const c = await target(g.body);
      if (!c || c.status !== 'published') return err(404, 'This comment is not published.');
      if (g.body.on === false) await store.remove(CSPARKS, c.RowKey, g.member.RowKey);
      else await store.upsert(CSPARKS, { PartitionKey: c.RowKey, RowKey: g.member.RowKey, at: new Date(now()).toISOString() });
      return json(200, { ok: true, sparks: await recount(store, CSPARKS, c), on: g.body.on !== false });
    },

    // Three reports from different members hide a comment until the moderator has looked at it.
    async report(request) {
      const g = await guard(request); if (g.fail) return g.fail;
      if (!canComment(g.member)) return err(403, 'You can report comments once IMAGINE has approved your card.');
      const c = await target(g.body);
      if (!c || c.status !== 'published') return err(404, 'This comment is not published.');
      if (c.memberId === g.member.RowKey) return err(400, 'You cannot report your own comment.');
      await store.upsert(CREPORTS, { PartitionKey: c.RowKey, RowKey: g.member.RowKey, at: new Date(now()).toISOString(), reason: clean(g.body.reason).slice(0, 100) });
      const n = await recount(store, CREPORTS, c);
      if (n >= COMMENT_LIMITS.reportsToHide) {
        const fresh = await store.get(COMMENTS, c.PartitionKey, c.RowKey);
        await store.upsert(COMMENTS, { ...fresh, status: 'review', flag: 'reports' });
        await alert().catch(() => {});
      }
      return json(200, { ok: true });
    },

    // Moderation: comments that need a look (doubtful, unchecked or reported), and the latest published ones.
    async listForModeration(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      const all = (await store.query(COMMENTS, `PartitionKey ne ''`, 10000)).filter(c => c.status !== 'removed');
      const ideas = {};
      const ideaText = async id => (ideas[id] ??= (await store.get(IDEAS, IDEA_PK, id))?.text || '');
      const view = async c => ({ idea: c.PartitionKey, ideaText: await ideaText(c.PartitionKey), id: c.RowKey, name: c.name, text: c.text, reply: !!c.parentId, status: c.status,
        createdAt: c.createdAt, flag: c.flag || '', check: c.checkDecision ? { decision: c.checkDecision, reason: c.checkReason || '' } : null, reports: Number(c.reportCount || 0), sparks: Number(c.sparkCount || 0) });
      const review = all.filter(c => c.status === 'review').sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
      const recent = all.filter(c => c.status === 'published').sort(newFirst).slice(0, 50);
      return json(200, { review: await Promise.all(review.map(view)), recent: await Promise.all(recent.map(view)), published: all.filter(c => c.status === 'published').length, agent: { enabled: !!screener } });
    },

    async decide(request) {
      if (!isModerator(request)) return err(403, 'Moderator access required.');
      const body = await readJson(request);
      const action = String(body?.action || '');
      if (!['publish', 'remove'].includes(action)) return err(400, 'Unknown action.');
      const c = body && await target(body);
      if (!c || c.status === 'removed') return err(404, 'This comment no longer exists.');
      if (action === 'publish') {
        for (const r of await byPartition(store, CREPORTS, c.RowKey)) await store.remove(CREPORTS, r.PartitionKey, r.RowKey);
        await store.upsert(COMMENTS, { ...c, status: 'published', publishedAt: c.publishedAt || new Date(now()).toISOString(), reportCount: 0, flag: '' });
      } else await removeComment(store, c, 'moderator');
      return json(200, { ok: true });
    }
  };
}
