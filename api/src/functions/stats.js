// Anonymous visit totals for enterimagine.com (Azure Functions v4).
// POST /api/hit stores counts only. GET /api/moderation/stats is for the moderator:
// protected by the "moderator" route rule in staticwebapp.config.json and checked again here.
// Uses the same storage account as the idea wall (IDEAS_STORAGE), in its own table.
import { app } from '@azure/functions';
import { createTableClient, odataString } from '../lib/table.js';
import { clean, dayKey, hourKey, rowKey, apply, summarize } from '../lib/stats.js';

const TABLE = 'SiteStats';
let client;
const table = () => client || (client = createTableClient(process.env.IDEAS_STORAGE));
const noStore = { 'Cache-Control': 'no-store' };

async function readBody(request) {
  try { const t = await request.text(); return t && t.length < 400 ? JSON.parse(t) : null; } catch { return null; }
}

// Adds one record to a totals row. Counts are best effort: a lost count never breaks a page.
async function bump(t, pk, rk, r) {
  for (let i = 0; i < 3; i++) {
    try {
      const cur = await t.get(TABLE, pk, rk);
      await t.upsert(TABLE, { PartitionKey: pk, RowKey: rk, ...apply(cur, r) });
      return;
    } catch { /* retry once or twice, then give up quietly */ }
  }
}

export function isModerator(request) {
  try {
    const raw = request.headers.get('x-ms-client-principal');
    const p = JSON.parse(Buffer.from(raw || '', 'base64').toString('utf8'));
    return Array.isArray(p.userRoles) && p.userRoles.includes('moderator');
  } catch { return false; }
}

app.http('hit', { route: 'hit', methods: ['POST'], authLevel: 'anonymous', handler: async (request, context) => {
  const r = clean(await readBody(request));
  if (r && process.env.IDEAS_STORAGE) {
    try { const t = table(), now = Date.now(), pk = dayKey(now); await bump(t, pk, rowKey(r), r); await bump(t, pk, hourKey(now), r); }
    catch (e) { context.error('stats: ' + e.message); }
  }
  return { status: 204, headers: noStore };
} });

app.http('moderation-stats', { route: 'moderation/stats', methods: ['GET'], authLevel: 'anonymous', handler: async (request, context) => {
  if (!isModerator(request)) return { status: 403, headers: noStore, jsonBody: { error: 'Moderators only.' } };
  const days = Math.min(365, Math.max(1, parseInt(request.query.get('days') || '30', 10) || 30));
  const now = Date.now(), from = dayKey(now - (days - 1) * 86400000);
  try {
    const rows = await table().query(TABLE, `PartitionKey ge ${odataString(from)}`, 20000);
    return { status: 200, headers: noStore, jsonBody: summarize(rows, days, now) };
  } catch (e) {
    context.error('stats: ' + e.message);
    return { status: 503, headers: noStore, jsonBody: { error: 'Visit totals are temporarily unavailable.' } };
  }
} });
