(function () {
  var btns = document.querySelectorAll('[data-set]');
  function set(l) {
    document.documentElement.lang = l;
    document.querySelectorAll('[data-lang]').forEach(function (s) { s.classList.toggle('on', s.getAttribute('data-lang') === l); });
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set') === l ? 'true' : 'false'); });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-set')); }); });
  var m = /(?:lang=)?(en|fr|nl)/.exec(location.hash || '');
  if (m) set(m[1]);
  var home = document.querySelector('a[href="index.html"]');
  btns.forEach(function (b) { b.addEventListener('click', function () { if (home) home.setAttribute('href', 'index.html#lang=' + b.getAttribute('data-set')); }); });
  if (home && m) home.setAttribute('href', 'index.html#lang=' + m[1]);
})();
