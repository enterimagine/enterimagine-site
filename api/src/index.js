const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');
const S = require('./stats');

// The connection string is set by the site owner as the app setting
// STATS_STORAGE in the Azure portal. Without it, visits are simply not counted.
// The live site writes {"table":"kidslive"} to config.json at deploy time, so
// test and live visits never mix. Without it (the test site) the table is kidsstats.
const TABLE = (() => { try { const t = require('./config.json').table; return /^[A-Za-z][A-Za-z0-9]{2,62}$/.test(t) ? t : 'kidsstats'; } catch (e) { return 'kidsstats'; } })();
let client = null, lastError = '';

// Describes a setup problem without ever revealing the secret itself.
function describe(e, cs) {
  const parts = String(cs || '').split(';').map(x => x.split('=')[0].trim()).filter(x => /^[A-Za-z]{2,40}$/.test(x));
  let hint = '';
  if (/^["']|["']$/.test(cs)) hint = 'The value starts or ends with a quote; remove the quotes.';
  else if (/^https?:/i.test(cs)) hint = 'The value is a URL; use the full connection string from Access keys instead.';
  else if (!/AccountName/.test(cs) || !/AccountKey/.test(cs)) hint = 'The value is not a full connection string (it needs AccountName and AccountKey).';
  const code = (e && (e.code || e.statusCode || e.name)) || 'Error';
  const msg = String((e && e.message) || e).replace(/AccountKey=[^;\s]+/gi, 'AccountKey=***').replace(/sig=[^&\s]+/gi, 'sig=***').slice(0, 300);
  return `${code}: ${msg}${hint ? ' Hint: ' + hint : ''} (setting contains: ${parts.join(', ') || 'nothing'})`;
}

async function table() {
  if (client) return client;
  const cs = String(process.env.STATS_STORAGE || '').trim().replace(/^["']+|["']+$/g, '');
  if (!cs) return null;
  try {
    const c = TableClient.fromConnectionString(cs, TABLE);
    try { await c.createTable(); } catch (e) { if (e.statusCode !== 409) throw e; }
    client = c; lastError = '';
    return c;
  } catch (e) {
    lastError = describe(e, process.env.STATS_STORAGE);
    throw e;
  }
}

async function readBody(request) {
  try { const t = await request.text(); return t && t.length < 500 ? JSON.parse(t) : null; } catch (e) { return null; }
}

// POST /api/hit: one anonymous page open or the seconds a page was open.
app.http('hit', {
  methods: ['POST'], authLevel: 'anonymous', route: 'hit',
  handler: async (request) => {
    const r = S.clean(await readBody(request));
    let t = null;
    try { t = r && await table(); } catch (e) { t = null; } // counting must never break a page
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
    let t = null;
    try { t = await table(); } catch (e) { return { status: 200, headers: { 'Cache-Control': 'no-store' }, jsonBody: { configured: true, error: lastError || describe(e, process.env.STATS_STORAGE) } }; }
    if (!t) return { status: 200, jsonBody: { configured: false } };
    const from = S.dayKey(Date.now() - (days - 1) * 86400000);
    const rows = [];
    try {
      for await (const e of t.listEntities({ queryOptions: { filter: `PartitionKey ge '${from}'` } })) rows.push(e);
    } catch (e) { client = null; return { status: 200, headers: { 'Cache-Control': 'no-store' }, jsonBody: { configured: true, error: describe(e, process.env.STATS_STORAGE) } }; }
    return { status: 200, headers: { 'Cache-Control': 'no-store' }, jsonBody: Object.assign({ configured: true }, S.summarize(rows, days, Date.now())) };
  }
});
