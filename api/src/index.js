const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');
const S = require('./stats');

// The connection string is set by the site owner as the app setting
// STATS_STORAGE in the Azure portal. Without it, visits are simply not counted.
const TABLE = 'kidsstats';
let client = null;
async function table() {
  if (client) return client;
  const cs = process.env.STATS_STORAGE;
  if (!cs) return null;
  const c = TableClient.fromConnectionString(cs, TABLE);
  try { await c.createTable(); } catch (e) { /* already exists */ }
  client = c;
  return c;
}

async function readBody(request) {
  try { const t = await request.text(); return t && t.length < 500 ? JSON.parse(t) : null; } catch (e) { return null; }
}

// POST /api/hit: one anonymous page open or the seconds a page was open.
app.http('hit', {
  methods: ['POST'], authLevel: 'anonymous', route: 'hit',
  handler: async (request) => {
    const r = S.clean(await readBody(request));
    const t = r && await table();
    if (t) {
      const pk = S.dayKey(Date.now()), rk = S.rowKey(r);
      for (let i = 0; i < 4; i++) {
        let cur = null;
        try { cur = await t.getEntity(pk, rk); } catch (e) { cur = null; }
        const next = Object.assign({ partitionKey: pk, rowKey: rk }, S.apply(cur && { views: cur.views, timed: cur.timed, seconds: cur.seconds }, r));
        try {
          if (cur) await t.updateEntity(next, 'Replace', { etag: cur.etag }); else await t.createEntity(next);
          break;
        } catch (e) { /* someone else wrote at the same moment: read again and retry */ }
      }
    }
    return { status: 204, headers: { 'Cache-Control': 'no-store' } };
  }
});

// GET /api/stats?days=30: totals for the owner dashboard. Protected by the
// route rule in staticwebapp.config.json (role "owner").
app.http('stats', {
  methods: ['GET'], authLevel: 'anonymous', route: 'stats',
  handler: async (request) => {
    const days = Math.min(365, Math.max(1, parseInt(request.query.get('days') || '30', 10) || 30));
    const t = await table();
    if (!t) return { status: 200, jsonBody: { configured: false } };
    const from = S.dayKey(Date.now() - (days - 1) * 86400000);
    const rows = [];
    for await (const e of t.listEntities({ queryOptions: { filter: `PartitionKey ge '${from}'` } })) rows.push(e);
    return { status: 200, headers: { 'Cache-Control': 'no-store' }, jsonBody: Object.assign({ configured: true }, S.summarize(rows, days, Date.now())) };
  }
});
