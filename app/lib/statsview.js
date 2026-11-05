/* Owner dashboard for IMAGINE Kids visit totals (reads /api/stats). */
(function () {
  var NAMES = { index: 'Home', Main: 'Energy world', Episodes: 'Episodes', Subjects: 'School subjects', Logic: 'Logic games', Logic2: 'Puzzle lab', Parents: 'Parent dashboard', School: 'School view', Family: 'Free and family plan', Storyboard: 'Storyboard', privacy: 'Privacy' };
  var LANGS = { en: 'English', fr: 'French', nl: 'Dutch' }, DEV = { phone: 'Phone', tablet: 'Tablet', computer: 'Computer' };
  var out = document.getElementById('out'), days = 30;
  function fmtT(sec) { sec = Math.round(sec); if (sec < 60) return sec + ' s'; var m = Math.floor(sec / 60), s = sec % 60; return m < 60 ? m + ' min ' + (s ? s + ' s' : '') : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function table(title, obj, names) {
    var keys = Object.keys(obj).sort(function (a, b) { return obj[b].views - obj[a].views; });
    if (!keys.length) return '';
    var max = Math.max.apply(null, keys.map(function (k) { return obj[k].views; })) || 1;
    return '<h2>' + title + '</h2><table><thead><tr><th scope="col">Name</th><th scope="col">Visits</th><th scope="col">Average time</th><th scope="col">Total time</th></tr></thead><tbody>' + keys.map(function (k) {
      var r = obj[k], avg = r.views ? r.seconds / r.views : 0;
      return '<tr><td>' + esc(names[k] || k) + '</td><td><span class="bar" style="width:' + Math.max(4, Math.round(r.views / max * 120)) + 'px"></span>' + r.views + '</td><td>' + fmtT(avg) + '</td><td>' + fmtT(r.seconds) + '</td></tr>';
    }).join('') + '</tbody></table>';
  }
  function load() {
    out.innerHTML = '<p>Loading…</p>';
    fetch('/api/stats?days=' + days, { credentials: 'same-origin', cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
      if (d.error) { out.innerHTML = '<p class="warn">The counter cannot reach the storage account.</p><p class="small">' + esc(d.error) + '</p>'; return; }
      if (!d.configured) { out.innerHTML = '<p class="warn">Counting is not switched on yet: the STATS_STORAGE setting is missing in Azure.</p>'; return; }
      var t = d.total, avg = t.views ? t.seconds / t.views : 0;
      var dayKeys = Object.keys(d.byDay).sort(), maxD = Math.max.apply(null, dayKeys.map(function (k) { return d.byDay[k].views; }).concat([1]));
      out.innerHTML = '<div class="tiles"><div><b>' + t.views + '</b><span>visits</span></div><div><b>' + fmtT(avg) + '</b><span>average time per visit</span></div><div><b>' + fmtT(t.seconds) + '</b><span>total time</span></div></div>' +
        '<p class="small">' + esc(d.from) + ' to ' + esc(d.to) + ' (UTC days). A visit is one page opened; one child moving through three sections counts as three.</p>' +
        (dayKeys.length ? '<h2>Visits per day</h2><div class="days">' + dayKeys.map(function (k) { var v = d.byDay[k].views; return '<div class="day" title="' + k + ': ' + v + '"><span style="height:' + Math.max(2, Math.round(v / maxD * 100)) + 'px"></span><i>' + k.slice(8) + '</i></div>'; }).join('') + '</div>' : '') +
        table('Sections', d.byPage, NAMES) + table('Language', d.byLang, LANGS) + table('Screen', d.byDevice, DEV);
    }).catch(function (e) { out.innerHTML = '<p class="warn">Could not load the totals (' + esc(e.message) + '). Are you signed in with the owner account?</p>'; });
  }
  document.querySelectorAll('[data-days]').forEach(function (b) { b.addEventListener('click', function () { days = +b.getAttribute('data-days'); document.querySelectorAll('[data-days]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); load(); }); });
  load();
})();
