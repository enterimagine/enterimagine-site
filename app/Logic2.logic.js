window.__Component = (function () {

var AV = { sunny: 'assets/img_sunny.webp', whyzz: 'assets/img_ethan.webp' };
var ICON = { mirror: 'M12 3v18M4 7l5 5-5 5zM20 7l-5 5 5 5z', cubes: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5', maze: 'M3 3h18v18H3zM7 3v10M11 21V9h6M15 13v4' };
var UI = {
  en: { title: 'More logic games', mirror: 'Mirror image', cubes: 'Counting cubes', maze: 'Paths and mazes', level: 'Level', lvl: ['Easy', 'Medium', 'Hard'],
    mirrorPrompt: 'Which picture is the mirror image?', mHint: ['Imagine a mirror on the yellow line, standing to the right of the picture.', 'Imagine a mirror on the yellow line, under the picture.', 'Imagine a mirror on the yellow diagonal line.'], original: 'The picture and the mirror line',
    cubesPrompt: 'How many cubes are there?', cubesHint: 'Every cube stands on the floor or on another cube, so hidden cubes count too.', cubesAria: 'A stack of cubes',
    mazePrompt: 'Which arrow code takes the robot to the star?', mazeAria: 'A maze with a robot and a star', check: 'Check', next: 'Next', finish: 'Finish', right: 'Yes!', wrong: 'Not quite.',
    mirrorWhy: 'In a mirror, left and right swap, but the picture does not turn around.', mirrorWhyH: 'In a mirror below, top and bottom swap.', mirrorWhyD: 'With a diagonal mirror, rows become columns.', cubesWhy: 'Count each stack: {s} = {n} cubes.', mazeWhy: 'This code goes around the walls and reaches the star in {n} steps. The other codes bump into a wall or stop in the wrong place.',
    result: '{n} of {t} right!', doneText: 'Well thought! Try the next level or play again with new puzzles.', again: 'New puzzles', nextLevel: 'Next level', stars: 'Stars: {n}' },
  fr: { title: 'Encore des jeux de logique', mirror: 'Image miroir', cubes: 'Compter les cubes', maze: 'Chemins et labyrinthes', level: 'Niveau', lvl: ['Facile', 'Moyen', 'Difficile'],
    mirrorPrompt: 'Quelle image est le reflet dans le miroir ?', mHint: ['Imagine un miroir sur la ligne jaune, à droite de l’image.', 'Imagine un miroir sur la ligne jaune, sous l’image.', 'Imagine un miroir sur la ligne jaune en diagonale.'], original: 'L’image et la ligne du miroir',
    cubesPrompt: 'Combien y a-t-il de cubes ?', cubesHint: 'Chaque cube est posé sur le sol ou sur un autre cube : les cubes cachés comptent aussi.', cubesAria: 'Une pile de cubes',
    mazePrompt: 'Quel code de flèches mène le robot à l’étoile ?', mazeAria: 'Un labyrinthe avec un robot et une étoile', check: 'Vérifier', next: 'Suivant', finish: 'Terminer', right: 'Oui !', wrong: 'Pas tout à fait.',
    mirrorWhy: 'Dans un miroir, la gauche et la droite s’échangent, mais l’image ne tourne pas.', mirrorWhyH: 'Avec un miroir en dessous, le haut et le bas s’échangent.', mirrorWhyD: 'Avec un miroir en diagonale, les lignes deviennent des colonnes.', cubesWhy: 'Compte chaque pile : {s} = {n} cubes.', mazeWhy: 'Ce code contourne les murs et atteint l’étoile en {n} pas. Les autres codes cognent un mur ou s’arrêtent au mauvais endroit.',
    result: '{n} sur {t} !', doneText: 'Bien réfléchi ! Essaie le niveau suivant ou rejoue avec de nouvelles énigmes.', again: 'Nouvelles énigmes', nextLevel: 'Niveau suivant', stars: 'Étoiles : {n}' },
  nl: { title: 'Meer logische spelletjes', mirror: 'Spiegelbeeld', cubes: 'Blokjes tellen', maze: 'Paden en doolhoven', level: 'Niveau', lvl: ['Makkelijk', 'Gemiddeld', 'Moeilijk'],
    mirrorPrompt: 'Welk plaatje is het spiegelbeeld?', mHint: ['Stel je een spiegel voor op de gele lijn, rechts van het plaatje.', 'Stel je een spiegel voor op de gele lijn, onder het plaatje.', 'Stel je een spiegel voor op de gele schuine lijn.'], original: 'Het plaatje en de spiegellijn',
    cubesPrompt: 'Hoeveel blokjes zijn er?', cubesHint: 'Elk blokje staat op de grond of op een ander blokje, dus verborgen blokjes tellen ook.', cubesAria: 'Een stapel blokjes',
    mazePrompt: 'Welke pijlencode brengt de robot naar de ster?', mazeAria: 'Een doolhof met een robot en een ster', check: 'Controleer', next: 'Volgende', finish: 'Klaar', right: 'Ja!', wrong: 'Bijna.',
    mirrorWhy: 'In een spiegel wisselen links en rechts, maar het plaatje draait niet om.', mirrorWhyH: 'Met een spiegel eronder wisselen boven en onder.', mirrorWhyD: 'Met een schuine spiegel worden rijen kolommen.', cubesWhy: 'Tel elke stapel: {s} = {n} blokjes.', mazeWhy: 'Deze code gaat om de muren heen en komt in {n} stappen bij de ster. De andere codes botsen tegen een muur of stoppen op de verkeerde plek.',
    result: '{n} van de {t} goed!', doneText: 'Goed nagedacht! Probeer het volgende niveau of speel opnieuw met nieuwe puzzels.', again: 'Nieuwe puzzels', nextLevel: 'Volgend niveau', stars: 'Sterren: {n}' }
};
function fill(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

/* Mirror image */
function figKey(f) { return f.cells.map(function (c) { return c.join(','); }).sort().join(';'); }
function figPaths(f) {
  var n = f.n, s = 112 / n, grid = '', a = '', b = '';
  for (var i = 0; i <= n; i++) { var p = 4 + i * s; grid += 'M' + p + ' 4V116M4 ' + p + 'H116'; }
  f.cells.forEach(function (c) { var d = 'M' + (4 + c[1] * s + 1) + ' ' + (4 + c[0] * s + 1) + 'h' + (s - 2) + 'v' + (s - 2) + 'h' + (-(s - 2)) + 'Z'; if (c[2]) b += d; else a += d; });
  return { grid: grid, a: a, b: b };
}
function tf(f, fn) { return { n: f.n, cells: f.cells.map(function (c) { var r = fn(c[0], c[1], f.n); return [r[0], r[1], c[2]]; }) }; }
var MV = function (r, c, n) { return [r, n - 1 - c]; }, MH = function (r, c, n) { return [n - 1 - r, c]; }, MD = function (r, c) { return [c, r]; }, R180 = function (r, c, n) { return [n - 1 - r, n - 1 - c]; }, AD = function (r, c, n) { return [n - 1 - c, n - 1 - r]; };
function mirrorGen(level) {
  var out = [];
  while (out.length < 6) {
    var n = level === 0 ? 4 : 5, k = level === 0 ? 5 : level === 1 ? 6 : 7, used = {}, cells = [];
    var r = rnd(0, n - 1), c = rnd(0, n - 1);
    while (cells.length < k) { var key = r + ',' + c; if (!used[key]) { used[key] = 1; cells.push([r, c, cells.length === 0 && level > 0 ? 1 : 0]); } var d = rnd(0, 3); r = Math.max(0, Math.min(n - 1, r + [1, -1, 0, 0][d])); c = Math.max(0, Math.min(n - 1, c + [0, 0, 1, -1][d])); }
    var f = { n: n, cells: cells }, mfn = [MV, MH, MD][level];
    var right = tf(f, mfn), cands = [right, f, tf(f, R180), tf(f, [MH, MV, AD][level])];
    var keys = {}, opts = [];
    cands.forEach(function (x) { var kk = figKey(x); if (!keys[kk]) { keys[kk] = 1; opts.push(x); } });
    if (opts.length < 3 || figKey(right) === figKey(f)) continue;
    opts = opts.slice(0, 3); var order = shuffle([0, 1, 2]);
    out.push({ kind: 'mirror', level: level, fig: f, o: order.map(function (i) { return opts[i]; }), ok: order.indexOf(0) });
  }
  return out;
}

/* Counting cubes */
function cubesGen(level) {
  var out = [];
  for (var t = 0; t < 6; t++) {
    var n = level === 0 ? 2 : 3, maxH = level === 0 ? 2 : 3, h = [];
    for (var x = 0; x < n; x++) { h.push([]); for (var y = 0; y < n; y++) { var v = level === 0 ? rnd(1, 2) : level === 1 ? Math.max(0, Math.min(maxH, rnd(0, 3) - Math.floor((x + y) / 2))) : rnd(1, maxH); h[x].push(v); } }
    if (level > 0 && h[0][0] === 0) h[0][0] = 2;
    for (var bx = n - 1; bx >= 0; bx--) for (var by = n - 1; by >= 0; by--) { if (bx + 1 < n && by + 1 < n) h[bx][by] = Math.max(h[bx][by], h[bx + 1][by + 1]); if (h[bx][by] === 0 && bx + 1 < n && by + 1 < n && h[bx + 1][by + 1] > 0) h[bx][by] = 1; }
    var total = 0, parts = [];
    h.forEach(function (row) { row.forEach(function (v) { total += v; if (v) parts.push(v); }); });
    var opts = shuffle([total, total + 1, total - 1, total + 2].filter(function (v, i, a) { return v > 0 && a.indexOf(v) === i; }).slice(0, 3));
    out.push({ kind: 'cubes', level: level, h: h, total: total, parts: parts, o: opts, ok: opts.indexOf(total) });
  }
  return out;
}
function cubeList(h) {
  var n = h.length, list = [], ox = 184 - 0, oy = 60 + (4 - n) * 10;
  for (var s = 0; s <= 2 * (n - 1); s++) for (var x = 0; x < n; x++) { var y = s - x; if (y < 0 || y >= n) continue; for (var z = 0; z < h[x][y]; z++) list.push({ left: (ox + (x - y) * 26) + 'px', top: (oy + (x + y) * 15 - z * 30 + 60) + 'px' }); }
  return list;
}

/* Paths and mazes */
var DIRS = { R: [0, 1], L: [0, -1], D: [1, 0], U: [-1, 0] }, ARROW = { R: '→', L: '←', D: '↓', U: '↑' };
function bfs(n, wall, s, g) {
  var prev = {}, q = [s], seen = {}; seen[s] = 1;
  while (q.length) { var cur = q.shift(); if (cur[0] === g[0] && cur[1] === g[1]) break; for (var k in DIRS) { var r = cur[0] + DIRS[k][0], c = cur[1] + DIRS[k][1], key = r + ',' + c; if (r < 0 || c < 0 || r >= n || c >= n || wall[key] || seen[key]) continue; seen[key] = 1; prev[key] = [cur, k]; q.push([r, c]); } }
  var gk = g[0] + ',' + g[1]; if (!seen[gk]) return null;
  var path = [], at = gk; while (prev[at]) { path.unshift(prev[at][1]); var p = prev[at][0]; at = p[0] + ',' + p[1]; }
  return path;
}
function runCode(n, wall, s, code) { var r = s[0], c = s[1]; for (var i = 0; i < code.length; i++) { r += DIRS[code[i]][0]; c += DIRS[code[i]][1]; if (r < 0 || c < 0 || r >= n || c >= n || wall[r + ',' + c]) return null; } return [r, c]; }
function mazeGen(level) {
  var out = [], guard = 0;
  while (out.length < 6 && guard++ < 400) {
    var n = [5, 6, 7][level], wall = {}, s = [0, 0], g = [n - 1, n - 1], dens = [0.22, 0.28, 0.32][level];
    if (level > 0 && Math.random() < 0.5) g = [n - 1, rnd(1, n - 1)];
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (Math.random() < dens && !(r === s[0] && c === s[1]) && !(r === g[0] && c === g[1])) wall[r + ',' + c] = 1;
    var path = bfs(n, wall, s, g); var minLen = [4, 7, 9][level];
    if (!path || path.length < minLen || path.length > 14) continue;
    var wrong = [], tries = 0, keys = {}; keys[path.join('')] = 1;
    while (wrong.length < 2 && tries++ < 200) {
      var w = path.slice(), m = rnd(0, 2);
      if (m === 0) { var i = rnd(0, w.length - 1); w[i] = ['R', 'L', 'U', 'D'][rnd(0, 3)]; }
      else if (m === 1) { var j = rnd(0, w.length - 2); var t = w[j]; w[j] = w[j + 1]; w[j + 1] = t; }
      else { w.splice(rnd(0, w.length - 1), 1); }
      var end = runCode(n, wall, s, w), key = w.join('');
      if (keys[key] || (end && end[0] === g[0] && end[1] === g[1])) continue;
      keys[key] = 1; wrong.push(w);
    }
    if (wrong.length < 2) continue;
    var order = shuffle([0, 1, 2]), all = [path, wrong[0], wrong[1]];
    out.push({ kind: 'maze', level: level, n: n, wall: wall, s: s, g: g, path: path, o: order.map(function (i) { return all[i]; }), ok: order.indexOf(0) });
  }
  return out;
}
function arrows(code) { var out = ''; code.forEach(function (d, i) { if (i > 0 && d !== code[i - 1]) out += ' '; out += ARROW[d]; }); return out; }
function gen(tab, level) { return tab === 'mirror' ? mirrorGen(level) : tab === 'cubes' ? cubesGen(level) : mazeGen(level); }

class Component extends DCLogic {
  constructor(props) { super(props); this.state = { lang: 'en', tab: 'mirror', level: 0, qs: gen('mirror', 0), qi: 0, picked: -1, checked: false, score: 0, done: false, stars: 0, round: 0 }; }
  renderVals() {
    var s = this.state, self = this, L = UI[s.lang], q = s.qs[s.qi] || s.qs[0];
    var restart = function (o) { var n = Object.assign({}, s, o); self.setState(Object.assign(o, { qs: gen(n.tab, n.level), qi: 0, picked: -1, checked: false, score: 0, done: false, round: s.round + 1 })); };
    var isRight = s.picked === q.ok, last = s.qi >= s.qs.length - 1, why = '';
    if (q.kind === 'mirror') why = [L.mirrorWhy, L.mirrorWhyH, L.mirrorWhyD][q.level];
    if (q.kind === 'cubes') why = fill(L.cubesWhy, { s: q.parts.join(' + '), n: q.total });
    if (q.kind === 'maze') why = fill(L.mazeWhy, { n: q.path.length });
    var mazeCells = [];
    if (q.kind === 'maze') for (var r = 0; r < q.n; r++) for (var c = 0; c < q.n; c++) { var isS = r === q.s[0] && c === q.s[1], isG = r === q.g[0] && c === q.g[1]; mazeCells.push({ bg: q.wall[r + ',' + c] ? '#c4562f' : 'rgba(255,255,255,.14)', isStart: isS, isGoal: isG }); }
    var fig = q.kind === 'mirror' ? figPaths(q.fig) : { grid: '', a: '', b: '' };
    var mirrorLine = q.kind === 'mirror' ? ['M116 0V120', 'M0 116H120', 'M0 0L120 120'][q.level] : '';
    var prompt = q.kind === 'mirror' ? L.mirrorPrompt : q.kind === 'cubes' ? L.cubesPrompt : L.mazePrompt;
    return {
      L: L,
      langs: ['en', 'fr', 'nl'].map(function (k) { return { code: k.toUpperCase(), on: s.lang === k, cls: s.lang === k ? 'on' : '', pick: function () { self.setState({ lang: k }); } }; }),
      tabs: ['mirror', 'cubes', 'maze'].map(function (k) { return { label: L[k], ic: ICON[k], on: s.tab === k, cls: s.tab === k ? 'on' : '', pick: function () { restart({ tab: k, level: 0 }); } }; }),
      levels: L.lvl.map(function (name, i) { return { label: name, on: s.level === i, cls: s.level === i ? 'on' : '', pick: function () { restart({ level: i }); } }; }),
      starsText: fill(L.stars, { n: s.stars }), running: !s.done, done: s.done,
      qKey: s.tab + s.level + s.round + '-' + s.qi, qLabel: L[s.tab] + ' · ' + L.lvl[s.level], counter: (s.qi + 1) + ' / ' + s.qs.length, prompt: prompt,
      isMirror: q.kind === 'mirror', isCubes: q.kind === 'cubes', isMaze: q.kind === 'maze',
      fig: fig, mirrorLine: mirrorLine, mirrorHint: q.kind === 'mirror' ? L.mHint[q.level] : '',
      cubes: q.kind === 'cubes' ? cubeList(q.h) : [], mazeN: q.kind === 'maze' ? q.n : 5, mazeCells: mazeCells,
      opts: q.o.map(function (v, i) {
        var cls = s.checked ? (i === q.ok ? 'right' : (i === s.picked ? 'wrong' : '')) : (i === s.picked ? 'picked' : '');
        var o = { cls: cls, isText: q.kind !== 'mirror', isFig: q.kind === 'mirror', pick: function () { if (!s.checked) self.setState({ picked: i }); }, aria: String(i + 1), text: '', grid: '', a: '', b: '' };
        if (q.kind === 'cubes') { o.text = String(v); o.aria = String(v); }
        if (q.kind === 'maze') { o.text = arrows(v); o.aria = arrows(v); }
        if (q.kind === 'mirror') { var pp = figPaths(v); o.grid = pp.grid; o.a = pp.a; o.b = pp.b; }
        return o;
      }),
      checked: s.checked, verdict: isRight ? L.right : L.wrong, vColor: isRight ? '#38e1a0' : '#ff8a8a', why: q.kind === 'cubes' ? L.cubesHint + ' ' + why : why, avatar: isRight ? AV.sunny : AV.whyzz,
      actionDisabled: !s.checked && s.picked < 0, actionLabel: !s.checked ? L.check : (last ? L.finish : L.next),
      action: function () { if (!s.checked) { if (s.picked < 0) return; self.setState({ checked: true, score: s.score + (isRight ? 1 : 0), stars: s.stars + (isRight ? 1 : 0) }); return; } if (last) self.setState({ done: true }); else self.setState({ qi: s.qi + 1, picked: -1, checked: false }); },
      result: fill(L.result, { n: s.score, t: s.qs.length }), again: function () { restart({}); }, canNext: s.level < 2, nextLevel: function () { restart({ level: s.level + 1 }); }
    };
  }
}

;return Component;
})();
