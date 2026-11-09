// IMAGINE article link check (no dependencies). Copied into the publication repo as .github/check-links.mjs.
// Runs in the deploy workflow next to "verify", so the results are on the run page before the owner approves.
//   node .github/check-links.mjs
// 1. Internal: every link inside public/universe/*/index.html that points at the site must exist in public/.
//    A link to a draft or private document (claude.ai, Google Docs, OneDrive, ...) is an error.
// 2. External: every outside link on the article pages (mostly references) is opened once (GET, redirects followed).
//    broken  = 404, 410, other 4xx, 5xx, DNS or connection failure -> error annotation, job fails (red)
//    blocked = 401, 403, 429, 999 or a timeout: the site refuses automated checks; check by hand -> warning
// The deploy job does not depend on this job: a red link check is a signal to look before approving.
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const site = 'public';
const draft = /^https?:\/\/([a-z0-9-]+\.)*(claude\.ai|docs\.google\.com|drive\.google\.com|sharepoint\.com|onedrive\.live\.com|1drv\.ms|notion\.so)\//i;
const own = /^https?:\/\/(www\.)?enterimagine\.com(\/|$)/i;
const social = /^https?:\/\/(www\.)?(x\.com|twitter\.com|instagram\.com|youtube\.com|youtu\.be|tiktok\.com|linkedin\.com)\//i;
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const errors = [], warnings = [], rows = [];
const external = new Map(); // url -> [pages]
const dirs = (await readdir(join(site, 'universe'), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name);
for (const slug of dirs) {
  const page = '/universe/' + slug + '/';
  const html = await readFile(join(site, 'universe', slug, 'index.html'), 'utf8');
  const main = html.replace(/<header class="site-header[\s\S]*?<\/header>/, '').replace(/<footer[\s\S]*$/, '');
  for (const m of main.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = decode(m[1]);
    if (draft.test(href)) { errors.push(`${page}: link to a draft or private document: ${href}`); continue; }
    if (href.startsWith('#') || href.startsWith('mailto:')) continue;
    if (href.startsWith('/') || own.test(href)) {
      const path = href.replace(own, '/').split(/[?#]/)[0];
      const file = join(site, path.endsWith('/') ? path + 'index.html' : path);
      try { await access(file); } catch { errors.push(`${page}: internal link goes nowhere: ${href}`); }
      continue;
    }
    if (social.test(href) || !/^https?:\/\//.test(href)) continue;
    if (!external.has(href)) external.set(href, []);
    external.get(href).push(page);
  }
}

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
async function probe(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000),
        headers: { 'user-agent': ua, accept: 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8', 'accept-language': 'en-US,en;q=0.9' } });
      await res.body?.cancel();
      if (res.status >= 500 && attempt === 0) continue;
      return res.status;
    } catch (err) {
      if (attempt === 1) return err.name === 'TimeoutError' ? 'timeout' : 'unreachable';
    }
  }
}
const urls = [...external.keys()];
const results = new Array(urls.length);
let next = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next < urls.length) { const i = next++; results[i] = await probe(urls[i]); }
}));
urls.forEach((url, i) => {
  const status = results[i], pages = external.get(url).join(', ');
  const blocked = status === 'timeout' || [401, 403, 429, 999].includes(status);
  const ok = typeof status === 'number' && status < 400;
  const verdict = ok ? 'ok' : blocked ? 'blocked (check by hand)' : 'BROKEN';
  if (!ok) (blocked ? warnings : errors).push(`${pages}: ${status} ${url}`);
  rows.push(`| ${verdict} | ${status} | ${url} | ${pages} |`);
});

for (const e of errors) console.log('::error title=Article link::' + e);
for (const w of warnings) console.log('::warning title=Article link (site blocks automated checks)::' + w);
const summary = [`## Article links`, ``,
  `${dirs.length} article pages, ${urls.length} outside links: ${rows.filter(r => r.startsWith('| ok')).length} ok, ${warnings.length} blocked (check by hand), ${errors.length} broken or wrong.`, ``,
  ...(errors.length ? ['### Broken or wrong', ...errors.map(e => '- ' + e), ''] : []),
  `| Result | Status | Link | Page |`, `|---|---|---|---|`, ...rows.filter(r => !r.startsWith('| ok')), ...rows.filter(r => r.startsWith('| ok'))].join('\n');
if (process.env.GITHUB_STEP_SUMMARY) await (await import('node:fs/promises')).appendFile(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
console.log(summary);
if (errors.length) process.exitCode = 1;
