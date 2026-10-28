// IMAGINE publication check (no dependencies). Copied into the publication repo as .github/verify-release.mjs.
//   node .github/verify-release.mjs                 -> public/ must equal release-manifest.json exactly
//   node .github/verify-release.mjs --live <url>    -> every manifest file served by <url> must match byte-for-byte,
//                                                      required security headers present, /api/* and config not served
import { readFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative, sep } from 'node:path';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const fail = message => { console.error('FAIL: ' + message); process.exitCode = 1; };

const manifestBytes = await readFile('release-manifest.json');
const recorded = (await readFile('release-manifest.sha256', 'utf8')).trim().split(/\s+/)[0];
if (sha256(manifestBytes) !== recorded) throw new Error('release-manifest.json does not match release-manifest.sha256');
const manifest = JSON.parse(manifestBytes);
if (manifest.kind !== 'imagine-public-release' || manifest.schemaVersion !== 1) throw new Error('Unexpected manifest kind/schema');
if (!manifest.productionEligible) throw new Error('Manifest is not production eligible');
const expected = new Map(manifest.files.map(f => [f.path, f]));
console.log(`Release ${manifest.payloadId.slice(0, 12)} from source ${manifest.sourceCommit.slice(0, 12)}: ${expected.size} files`);

const liveIndex = process.argv.indexOf('--live');
if (liveIndex === -1) {
  const found = new Set();
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      const name = relative('public', full).split(sep).join('/');
      if ((await lstat(full)).isSymbolicLink()) { fail('symbolic link: ' + name); continue; }
      if (entry.isDirectory()) { await walk(full); continue; }
      found.add(name);
      const want = expected.get(name);
      if (!want) { fail('file not in manifest: ' + name); continue; }
      const bytes = await readFile(full);
      if (bytes.length !== want.size || sha256(bytes) !== want.sha256) fail('content mismatch: ' + name);
    }
  }
  await walk('public');
  for (const name of expected.keys()) if (!found.has(name)) fail('missing file: ' + name);
  if (!found.has('staticwebapp.config.json')) fail('staticwebapp.config.json missing');
  if (!process.exitCode) console.log('OK: public/ matches the manifest exactly.');
} else {
  const base = (process.argv[liveIndex + 1] || '').replace(/\/+$/, '');
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(base)) throw new Error('A https site URL is required (repository variable SITE_URL).');
  const get = async path => {
    for (let attempt = 1; ; attempt++) {
      try { return await fetch(base + path, { redirect: 'manual', cache: 'no-store' }); }
      catch (error) { if (attempt >= 3) throw error; await new Promise(r => setTimeout(r, 2000 * attempt)); }
    }
  };
  let checked = 0;
  for (const [name, want] of expected) {
    if (name === 'staticwebapp.config.json') continue;
    const response = await get('/' + name);
    if (response.status !== 200) { fail(`${name}: HTTP ${response.status}`); continue; }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (sha256(bytes) !== want.sha256) fail('live content differs: ' + name);
    checked++;
  }
  const home = await get('/');
  for (const header of ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy'])
    if (!home.headers.get(header)) fail('missing header on /: ' + header);
  for (const path of ['/staticwebapp.config.json', '/api/health', '/does-not-exist-' + Date.now()]) {
    const response = await get(path);
    if (response.status !== 404) fail(`${path}: expected 404, got ${response.status}`);
  }
  console.log(`Robots: ${home.headers.get('x-robots-tag') || 'indexable'}`);
  if (!process.exitCode) console.log(`OK: ${checked} live files match the approved release; headers and 404s as expected.`);
}
