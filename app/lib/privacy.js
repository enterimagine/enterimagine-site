(function () {
  var btns = document.querySelectorAll('[data-set]');
  function set(l) {
    document.documentElement.lang = l;
    document.querySelectorAll('[data-lang]').forEach(function (s) { s.classList.toggle('on', s.getAttribute('data-lang') === l); });
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set') === l ? 'true' : 'false'); });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-set')); }); });
  var q = (location.hash || '').replace('#', '');
  if (q === 'fr' || q === 'nl' || q === 'en') set(q);
})();
