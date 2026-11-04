/* IMAGINE Kids visit totals. No cookies, no storage, no identifiers.
   Sends the page name, language and screen type when a page opens, and the
   seconds it was visible when it is hidden or closed. Nothing is sent when the
   browser asks not to be tracked (Do Not Track or Global Privacy Control). */
(function () {
  try {
    if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    if (!navigator.sendBeacon) return;
    var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
    var w = Math.min(screen.width || innerWidth, screen.height || innerHeight);
    var device = w < 600 ? 'phone' : (w < 1000 ? 'tablet' : 'computer');
    function lang() { var d = (document.documentElement.lang || '').slice(0, 2), m = /lang=(en|fr|nl)/.exec(location.hash || ''); return /^(en|fr|nl)$/.test(d) ? d : (m ? m[1] : 'en'); }
    function send(o) { try { navigator.sendBeacon('/api/hit', new Blob([JSON.stringify(o)], { type: 'text/plain' })); } catch (e) {} }
    var start = document.visibilityState === 'visible' ? Date.now() : 0;
    function flush() { if (!start) return; var s = Math.round((Date.now() - start) / 1000); start = 0; if (s >= 1) send({ p: page, l: lang(), d: device, e: 'time', s: Math.min(s, 14400) }); }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); else start = Date.now(); });
    window.addEventListener('pagehide', flush);
    setTimeout(function () { send({ p: page, l: lang(), d: device, e: 'open' }); }, 400);
  } catch (e) {}
})();
