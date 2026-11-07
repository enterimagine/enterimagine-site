// Anonymous visit totals: no cookies, no storage, no identifiers. When a page opens it sends
// the page key, the screen type (phone, tablet or computer) and whether this page starts a visit
// (the previous page was not on this site). When the page is hidden or closed it sends the seconds
// it was visible. Nothing is sent when the browser asks not to be tracked (Do Not Track or Global
// Privacy Control), and nothing on the moderation pages.
const SECTION_DETAIL = { minds: 'mind', explore: 'technology', episodes: 'episode', universe: 'article' };
const SECTIONS = ['minds', 'explore', 'episodes', 'universe', 'collective-minds', 'what-if', 'privacy', 'legal'];
export function pageKey(pathname) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  if (!parts.length || parts[0] === 'index.html') return 'home';
  if (!SECTIONS.includes(parts[0])) return 'other';
  if (parts.length === 1) return parts[0];
  return SECTION_DETAIL[parts[0]] && /^[a-z0-9-]{1,80}$/.test(parts[1]) ? SECTION_DETAIL[parts[0]] + ':' + parts[1] : parts[0];
}
let counting = false;
export function startVisitCounter(win = window) {
  try {
    const nav = win.navigator, doc = win.document;
    if (counting || !nav.sendBeacon || nav.globalPrivacyControl || nav.doNotTrack === '1' || win.doNotTrack === '1') return;
    if (/^\/moderate/.test(win.location.pathname)) return;
    counting = true;
    const page = pageKey(win.location.pathname);
    const w = Math.min(win.screen.width || win.innerWidth, win.screen.height || win.innerHeight);
    const device = w < 600 ? 'phone' : w < 1000 ? 'tablet' : 'computer';
    const send = o => { try { nav.sendBeacon('/api/hit', new Blob([JSON.stringify(o)], { type: 'text/plain' })); } catch { /* counting never breaks a page */ } };
    let start = doc.visibilityState === 'visible' ? Date.now() : 0;
    const flush = () => { if (!start) return; const s = Math.round((Date.now() - start) / 1000); start = 0; if (s >= 1) send({ p: page, d: device, e: 'time', s: Math.min(s, 14400) }); };
    doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'hidden') flush(); else start = Date.now(); });
    win.addEventListener('pagehide', flush);
    let entry = 1;
    try {
      const n = win.performance.getEntriesByType('navigation')[0];
      if (n && (n.type === 'reload' || n.type === 'back_forward')) entry = 0;
      else if (doc.referrer && new URL(doc.referrer).origin === win.location.origin) entry = 0;
    } catch { /* keep entry = 1 */ }
    win.setTimeout(() => send({ p: page, d: device, e: 'open', v: entry }), 400);
  } catch { /* counting never breaks a page */ }
}

export function initializeNavigation() {
  startVisitCounter();
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (!toggle || !nav) return;
  toggle.hidden = false;
  document.documentElement.classList.add('js');
  const close = () => {
    toggle.setAttribute('aria-expanded','false');
    nav.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close(); toggle.focus();
    }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
  matchMedia('(min-width: 761px)').addEventListener('change', close);
}
