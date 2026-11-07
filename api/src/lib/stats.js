// Pure logic for the anonymous IMAGINE visit totals (no Azure needed, so it can be tested).
// Only whitelisted values are ever stored: a page key, a screen type and counts per day and per hour.
// Nothing identifies a visitor: no cookies, no IP addresses, no identifiers.
export const SECTIONS = ['home', 'minds', 'explore', 'episodes', 'universe', 'collective-minds', 'what-if', 'privacy', 'legal', 'other'];
export const DETAILS = ['mind', 'technology', 'episode', 'article'];
export const DEVICES = ['phone', 'tablet', 'computer'];
export const MAX_SECONDS = 4 * 3600;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+){0,12}$/;

// A page key is a section ("home", "universe") or a detail page with its slug ("article:running-out-of-cold").
export function validPage(p) {
  p = String(p || '');
  if (SECTIONS.includes(p)) return true;
  const [kind, slug, extra] = p.split(':');
  return extra === undefined && DETAILS.includes(kind) && SLUG.test(slug || '') && slug.length <= 80;
}

// Turns a beacon body into a clean record, or null when anything is off.
export function clean(body) {
  if (!body || typeof body !== 'object') return null;
  const p = String(body.p || ''), d = String(body.d || '');
  if (!validPage(p) || !DEVICES.includes(d)) return null;
  if (body.e === 'open') return { page: p, device: d, kind: 'open', visit: body.v === 1 };
  if (body.e === 'time') {
    const s = Math.round(Number(body.s));
    if (!Number.isFinite(s) || s < 1 || s > MAX_SECONDS) return null;
    return { page: p, device: d, kind: 'time', seconds: s };
  }
  return null;
}

const brussels = (now, opts) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels', ...opts }).format(new Date(now));
// Day and hour in Brussels time, from the server clock (nothing comes from the visitor).
export function dayKey(now) { return brussels(now, { year: 'numeric', month: '2-digit', day: '2-digit' }); }
export function hourKey(now) { return 'hour|' + String(parseInt(brussels(now, { hour: '2-digit', hourCycle: 'h23' }), 10) % 24).padStart(2, '0'); }
export function rowKey(r) { return `page|${r.page}|${r.device}`; }

// Adds one record to an existing totals entity (or a fresh one).
export function apply(entity, r) {
  const e = { views: 0, visits: 0, timed: 0, seconds: 0 };
  for (const k of Object.keys(e)) e[k] = Number(entity?.[k]) || 0;
  if (r.kind === 'open') { e.views += 1; if (r.visit) e.visits += 1; }
  else { e.timed += 1; e.seconds += r.seconds; }
  return e;
}

// Sums table rows (PartitionKey = Brussels day) into the shape the dashboard shows.
export function summarize(rows, days, now) {
  const from = dayKey(now - (days - 1) * 86400000);
  const blank = () => ({ views: 0, visits: 0, seconds: 0, timed: 0 });
  const out = { days, from, to: dayKey(now), total: blank(), bySection: {}, byPage: {}, byDevice: {}, byDay: {}, byHour: {} };
  const add = (bucket, key, r) => { const b = bucket[key] || (bucket[key] = blank()); for (const k of ['views', 'visits', 'seconds', 'timed']) b[k] += Number(r[k]) || 0; };
  for (const r of rows) {
    const pk = r.PartitionKey ?? r.partitionKey, rk = String(r.RowKey ?? r.rowKey);
    if (!pk || pk < from) continue;
    if (rk.startsWith('hour|')) { add(out.byHour, rk.slice(5), r); continue; }
    const [, page, device] = rk.split('|');
    if (!validPage(page)) continue;
    const kind = page.split(':')[0];
    const section = { mind: 'minds', technology: 'explore', episode: 'episodes', article: 'universe' }[kind] || page;
    out.total.views += Number(r.views) || 0; out.total.visits += Number(r.visits) || 0; out.total.seconds += Number(r.seconds) || 0; out.total.timed += Number(r.timed) || 0;
    add(out.bySection, section, r); add(out.byPage, page, r); add(out.byDevice, device, r); add(out.byDay, pk, r);
  }
  return out;
}
