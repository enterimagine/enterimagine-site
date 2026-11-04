// Pure logic for IMAGINE Kids visit totals. Kept separate so it can be tested
// without Azure. Only whitelisted values are ever stored; nothing identifies a visitor.
const PAGES = ['index', 'Main', 'Episodes', 'Subjects', 'Logic', 'Logic2', 'Parents', 'School', 'Family', 'Storyboard', 'privacy'];
const LANGS = ['en', 'fr', 'nl'];
const DEVICES = ['phone', 'tablet', 'computer'];
const MAX_SECONDS = 4 * 3600;

// Turns a beacon body into a clean record, or null when anything is off.
function clean(body) {
  if (!body || typeof body !== 'object') return null;
  const p = String(body.p || ''), l = String(body.l || 'en'), d = String(body.d || '');
  if (!PAGES.includes(p) || !LANGS.includes(l) || !DEVICES.includes(d)) return null;
  if (body.e === 'open') return { page: p, lang: l, device: d, kind: 'open' };
  if (body.e === 'time') {
    const s = Math.round(Number(body.s));
    if (!Number.isFinite(s) || s < 1 || s > MAX_SECONDS) return null;
    return { page: p, lang: l, device: d, kind: 'time', seconds: s };
  }
  return null;
}

function dayKey(now) { return new Date(now).toISOString().slice(0, 10); }
function rowKey(r) { return `${r.page}|${r.lang}|${r.device}`; }

// Adds one record to an existing totals entity (or a fresh one).
function apply(entity, r) {
  const e = Object.assign({ views: 0, timed: 0, seconds: 0 }, entity || {});
  if (r.kind === 'open') e.views += 1;
  else { e.timed += 1; e.seconds += r.seconds; }
  return e;
}

// Sums table rows into the shape the dashboard shows.
function summarize(rows, days, now) {
  const from = dayKey(now - (days - 1) * 86400000);
  const out = { days, from, to: dayKey(now), total: { views: 0, seconds: 0, timed: 0 }, byPage: {}, byLang: {}, byDevice: {}, byDay: {} };
  const add = (bucket, key, r) => { const b = bucket[key] || (bucket[key] = { views: 0, seconds: 0, timed: 0 }); b.views += r.views || 0; b.seconds += r.seconds || 0; b.timed += r.timed || 0; };
  for (const r of rows) {
    if (r.partitionKey < from) continue;
    const [page, lang, device] = String(r.rowKey).split('|');
    add(out, 'total', r);
    add(out.byPage, page, r); add(out.byLang, lang, r); add(out.byDevice, device, r); add(out.byDay, r.partitionKey, r);
  }
  return out;
}

module.exports = { PAGES, LANGS, DEVICES, MAX_SECONDS, clean, dayKey, rowKey, apply, summarize };
