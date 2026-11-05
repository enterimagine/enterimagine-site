window.__Component = (function () {

var AV = { sunny: 'assets/img_sunny.webp', whyzz: 'assets/img_ethan.webp' };
var SHAPE = { c: 'M12 3.5a8.5 8.5 0 1 0 0.01 0z', s: 'M4.5 4.5h15v15h-15z', t: 'M12 3.5l9 16h-18z' };
var COLOR = { R: '#ff6b6b', B: '#4cc3ff', Y: '#ffd84c', G: '#38e1a0' };
var ICON = { shp: 'M4 4h16v16H4zM4 4l16 16M20 4L4 20', seq: 'M4 7h3M9 7h3M14 7h3M4 17h16M18 4l3 3-3 3', pat: 'M7 7a3 3 0 1 0 .01 0zM14 4h6v6h-6zM4 14l3 6H1zM14 14h6v6h-6z', rot: 'M20 12a8 8 0 1 1-3-6.2M20 4v5h-5', ch: 'M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21.1l1.4-7L2 9.3l7-.8z', right: 'M5 12a7 7 0 0 1 12-5l2 2M19 4v5h-5', left: 'M19 12a7 7 0 0 0-12-5L5 9M5 4v5h5' };
var UI = {
  en: { shp: 'Turning shapes', shpPrompt: 'The shape changes every step. Which picture comes 4th?', title: 'Logic games', seq: 'What comes next?', pat: 'Patterns', rot: 'Turn it', ch: 'Difficult challenges', level: 'Level', lvl: ['Easy', 'Medium', 'Hard'], seqPrompt: 'Which number comes next?', patPrompt: 'Which picture comes next?', rotPrompt: 'Turn the flag. What does it look like now?', startPic: 'The flag at the start', turnRight: 'Turn it 90° to the right', turnLeft: 'Turn it 90° to the left', check: 'Check', next: 'Next', finish: 'Finish', right: 'Yes!', wrong: 'Not quite.', stars: 'Stars: {n}', levelDone: 'Level done: {n} of {t} right!', levelText: 'Well thought! Try the next level or play this one again.', again: 'Play again', nextLevel: 'Next level', chTitle: 'Difficult challenges', gateText: 'These puzzles are extra hard. First show what you know: answer 5 warm-up questions. Get all 5 right and the difficult challenges open.', startPre: 'Start the warm-up', preLabel: 'Warm-up', chLabel: 'Difficult challenge', gateFail: 'You got {n} of 5. Practise the levels a bit more and try again!', gatePass: 'All 5 right! The difficult challenges are open.', open: 'Open the challenges', chDone: 'Challenges done: {n} of {t}!', chText: 'These were the hardest puzzles. Explaining your answer to someone else is the best next step.', ruleAdd: 'Each number is {v} more than the one before.', ruleSub: 'Each number is {v} less than the one before.', ruleMul: 'Each number is {v} times the one before.', ruleHalf: 'Each number is half of the one before.', ruleFib: 'Each number is the two numbers before it added together.', ruleSq: 'These are 1×1, 2×2, 3×3 and so on.', ruleGrow: 'You add 1 more each time: +1, +2, +3, +4…', ruleTri: 'You add 2, then 3, then 4, then 5…', ruleNN: 'These are 1×2, 2×3, 3×4 and so on.', ruleFact: 'You multiply by 2, then 3, then 4, then 5.', ruleRep: 'The pattern repeats every {v} pictures.', ruleAlt: 'The shape goes circle, square, triangle; the color swaps every time.', ruleTwo: 'The shape changes every time; the color changes every {v}.', rotWhy: 'Altogether you turned it {v}° to the right.', rotWhyZero: 'Four quarter turns bring it back to the start, so only the extra turns count.' },
  fr: { shp: 'Formes qui tournent', shpPrompt: 'La forme change à chaque étape. Quelle image vient en 4e ?', title: 'Jeux de logique', seq: 'Et ensuite ?', pat: 'Motifs', rot: 'Tourne-le', ch: 'Défis difficiles', level: 'Niveau', lvl: ['Facile', 'Moyen', 'Difficile'], seqPrompt: 'Quel nombre vient ensuite ?', patPrompt: 'Quelle image vient ensuite ?', rotPrompt: 'Tourne le drapeau. À quoi ressemble-t-il maintenant ?', startPic: 'Le drapeau au départ', turnRight: 'Tourne-le de 90° vers la droite', turnLeft: 'Tourne-le de 90° vers la gauche', check: 'Vérifier', next: 'Suivant', finish: 'Terminer', right: 'Oui !', wrong: 'Pas tout à fait.', stars: 'Étoiles : {n}', levelDone: 'Niveau terminé : {n} sur {t} !', levelText: 'Bien réfléchi ! Essaie le niveau suivant ou rejoue celui-ci.', again: 'Rejouer', nextLevel: 'Niveau suivant', chTitle: 'Défis difficiles', gateText: 'Ces énigmes sont très difficiles. Montre d’abord ce que tu sais : réponds à 5 questions d’échauffement. Les 5 justes, et les défis s’ouvrent.', startPre: 'Commencer l’échauffement', preLabel: 'Échauffement', chLabel: 'Défi difficile', gateFail: 'Tu as {n} sur 5. Entraîne-toi encore un peu et réessaie !', gatePass: 'Les 5 justes ! Les défis difficiles sont ouverts.', open: 'Ouvrir les défis', chDone: 'Défis terminés : {n} sur {t} !', chText: 'C’étaient les énigmes les plus difficiles. Explique ta réponse à quelqu’un : c’est la meilleure étape suivante.', ruleAdd: 'Chaque nombre a {v} de plus que le précédent.', ruleSub: 'Chaque nombre a {v} de moins que le précédent.', ruleMul: 'Chaque nombre vaut {v} fois le précédent.', ruleHalf: 'Chaque nombre est la moitié du précédent.', ruleFib: 'Chaque nombre est la somme des deux précédents.', ruleSq: 'Ce sont 1×1, 2×2, 3×3, etc.', ruleGrow: 'On ajoute 1 de plus à chaque fois : +1, +2, +3, +4…', ruleTri: 'On ajoute 2, puis 3, puis 4, puis 5…', ruleNN: 'Ce sont 1×2, 2×3, 3×4, etc.', ruleFact: 'On multiplie par 2, puis 3, puis 4, puis 5.', ruleRep: 'Le motif se répète toutes les {v} images.', ruleAlt: 'La forme suit rond, carré, triangle ; la couleur change à chaque fois.', ruleTwo: 'La forme change à chaque fois ; la couleur change toutes les {v}.', rotWhy: 'Au total, tu l’as tourné de {v}° vers la droite.', rotWhyZero: 'Quatre quarts de tour le ramènent au départ : seuls les tours en plus comptent.' },
  nl: { shp: 'Draaiende vormen', shpPrompt: 'De vorm verandert bij elke stap. Welk plaatje komt als 4e?', title: 'Logische spelletjes', seq: 'Wat komt erna?', pat: 'Patronen', rot: 'Draai het', ch: 'Moeilijke uitdagingen', level: 'Niveau', lvl: ['Makkelijk', 'Gemiddeld', 'Moeilijk'], seqPrompt: 'Welk getal komt erna?', patPrompt: 'Welk plaatje komt erna?', rotPrompt: 'Draai de vlag. Hoe ziet hij er nu uit?', startPic: 'De vlag aan het begin', turnRight: 'Draai hem 90° naar rechts', turnLeft: 'Draai hem 90° naar links', check: 'Controleer', next: 'Volgende', finish: 'Klaar', right: 'Ja!', wrong: 'Bijna.', stars: 'Sterren: {n}', levelDone: 'Niveau klaar: {n} van de {t} goed!', levelText: 'Goed nagedacht! Probeer het volgende niveau of speel dit nog eens.', again: 'Nog eens', nextLevel: 'Volgend niveau', chTitle: 'Moeilijke uitdagingen', gateText: 'Deze puzzels zijn extra moeilijk. Laat eerst zien wat je kunt: beantwoord 5 opwarmvragen. Alle 5 goed en de moeilijke uitdagingen gaan open.', startPre: 'Start de opwarming', preLabel: 'Opwarming', chLabel: 'Moeilijke uitdaging', gateFail: 'Je hebt er {n} van de 5 goed. Oefen nog wat en probeer opnieuw!', gatePass: 'Alle 5 goed! De moeilijke uitdagingen zijn open.', open: 'Open de uitdagingen', chDone: 'Uitdagingen klaar: {n} van de {t}!', chText: 'Dit waren de moeilijkste puzzels. Leg je antwoord uit aan iemand anders: dat is de beste volgende stap.', ruleAdd: 'Elk getal is {v} meer dan het vorige.', ruleSub: 'Elk getal is {v} minder dan het vorige.', ruleMul: 'Elk getal is {v} keer het vorige.', ruleHalf: 'Elk getal is de helft van het vorige.', ruleFib: 'Elk getal is de twee getallen ervoor bij elkaar opgeteld.', ruleSq: 'Dit zijn 1×1, 2×2, 3×3 enzovoort.', ruleGrow: 'Je telt er telkens 1 meer bij: +1, +2, +3, +4…', ruleTri: 'Je telt er 2, dan 3, dan 4, dan 5 bij…', ruleNN: 'Dit zijn 1×2, 2×3, 3×4 enzovoort.', ruleFact: 'Je vermenigvuldigt met 2, dan 3, dan 4, dan 5.', ruleRep: 'Het patroon herhaalt zich om de {v} plaatjes.', ruleAlt: 'De vorm gaat rondje, vierkant, driehoek; de kleur wisselt telkens.', ruleTwo: 'De vorm verandert telkens; de kleur verandert om de {v}.', rotWhy: 'In totaal heb je hem {v}° naar rechts gedraaid.', rotWhyZero: 'Vier kwartslagen brengen hem terug naar het begin, dus alleen de extra draaien tellen.' }
};
var BANK = {
  seq: [
    [ { s: [1, 2, 3], o: [4, 5, 6], ok: 0, r: ['ruleAdd', 1] }, { s: [2, 4, 6, 8], o: [9, 10, 12], ok: 1, r: ['ruleAdd', 2] }, { s: [5, 10, 15], o: [16, 20, 25], ok: 1, r: ['ruleAdd', 5] } ],
    [ { s: [20, 18, 16, 14], o: [12, 13, 10], ok: 0, r: ['ruleSub', 2] }, { s: [1, 2, 4, 8], o: [10, 12, 16], ok: 2, r: ['ruleMul', 2] }, { s: [3, 6, 9, 12], o: [14, 15, 16], ok: 1, r: ['ruleAdd', 3] } ],
    [ { s: [1, 1, 2, 3, 5], o: [7, 8, 10], ok: 1, r: ['ruleFib'] }, { s: [1, 4, 9, 16], o: [20, 24, 25], ok: 2, r: ['ruleSq'] }, { s: [2, 3, 5, 8, 12], o: [15, 16, 17], ok: 2, r: ['ruleGrow'] } ]
  ],
  pat: [
    [ { s: ['cR', 'sB', 'cR', 'sB'], o: ['cR', 'sB', 'tY'], ok: 0, r: ['ruleRep', 2] }, { s: ['cR', 'cB', 'cY', 'cR', 'cB'], o: ['cR', 'cY', 'cB'], ok: 1, r: ['ruleRep', 3] } ],
    [ { s: ['tY', 'tY', 'sB', 'tY', 'tY', 'sB', 'tY'], o: ['sB', 'tY', 'cR'], ok: 1, r: ['ruleRep', 3] }, { s: ['sB', 'cR', 'cR', 'sB', 'cR', 'cR', 'sB'], o: ['sB', 'tY', 'cR'], ok: 2, r: ['ruleRep', 3] } ],
    [ { s: ['cR', 'sB', 'tR', 'cB', 'sR'], o: ['tB', 'tR', 'cB'], ok: 0, r: ['ruleAlt'] }, { s: ['cR', 'sR', 'tR', 'cB', 'sB'], o: ['tR', 'tB', 'cB'], ok: 1, r: ['ruleTwo', 3] } ]
  ],
  rot: [
    [ { t: [90], o: [90, 180, 270], ok: 0 }, { t: [-90], o: [90, 270, 180], ok: 1 } ],
    [ { t: [90, 90], o: [90, 180, 0], ok: 1 }, { t: [180, 90], o: [270, 90, 180], ok: 0 } ],
    [ { t: [90, 90, 90], o: [90, 180, 270], ok: 2 }, { t: [90, 90, -90], o: [0, 90, 270], ok: 1 } ]
  ],
  pre: [ { k: 'seq', s: [7, 14, 21], o: [24, 28, 35], ok: 1, r: ['ruleAdd', 7] }, { k: 'seq', s: [30, 27, 24, 21], o: [18, 19, 17], ok: 0, r: ['ruleSub', 3] }, { k: 'pat', s: ['cR', 'sB', 'tR', 'cB', 'sR'], o: ['tB', 'tR', 'cB'], ok: 0, r: ['ruleAlt'] }, { k: 'rot', t: [180, 90], o: [270, 90, 180], ok: 0 }, { k: 'seq', s: [1, 3, 6, 10], o: [14, 15, 16], ok: 1, r: ['ruleTri'] } ],
  ch: [ { k: 'seq', s: [2, 6, 12, 20, 30], o: [40, 42, 36], ok: 1, r: ['ruleNN'] }, { k: 'rot', t: [90, 90, 90, 90, 90], o: [0, 90, 180], ok: 1 }, { k: 'seq', s: [1, 2, 6, 24], o: [48, 96, 120], ok: 2, r: ['ruleFact'] }, { k: 'seq', s: [64, 32, 16, 8], o: [4, 2, 6], ok: 0, r: ['ruleHalf'] }, { k: 'rot', t: [90, 90, 90, 90, 90, 90, 90], o: [90, 180, 270], ok: 2 } ]
};
var UI2 = {"en": {"sdk": "Sudoku", "sdkHow": "Pick an empty square, then tap a number. Every row, column and box must contain each number once.", "sdkNumbers": "Numbers", "sdkNew": "New puzzle", "sdkErase": "Erase", "sdkRule": "Fill in the numbers 1 to {n}.", "sdkLeft": "{n} squares to go", "sdkGood": "So far so good!", "sdkGoodText": "No mistakes yet. Keep going.", "sdkBad": "Look again.", "sdkBadText": "The red squares break a rule.", "sdkDone": "Sudoku solved!", "sdkDoneText": "Every row, column and box is complete. Try a new puzzle or the next level.", "sdkCell": "Row {r}, column {c}", "sdkEmpty": "empty"}, "fr": {"sdk": "Sudoku", "sdkHow": "Choisis une case vide, puis touche un chiffre. Chaque ligne, colonne et bloc doit contenir chaque chiffre une fois.", "sdkNumbers": "Chiffres", "sdkNew": "Nouvelle grille", "sdkErase": "Effacer", "sdkRule": "Remplis les chiffres de 1 à {n}.", "sdkLeft": "Encore {n} cases", "sdkGood": "Jusqu’ici, tout va bien !", "sdkGoodText": "Pas d’erreur pour l’instant. Continue.", "sdkBad": "Regarde encore.", "sdkBadText": "Les cases rouges ne respectent pas une règle.", "sdkDone": "Sudoku réussi !", "sdkDoneText": "Chaque ligne, colonne et bloc est complet. Essaie une nouvelle grille ou le niveau suivant.", "sdkCell": "Ligne {r}, colonne {c}", "sdkEmpty": "vide"}, "nl": {"sdk": "Sudoku", "sdkHow": "Kies een leeg vakje en tik dan op een cijfer. Elke rij, kolom en blok moet elk cijfer één keer bevatten.", "sdkNumbers": "Cijfers", "sdkNew": "Nieuwe puzzel", "sdkErase": "Wissen", "sdkRule": "Vul de cijfers 1 tot {n} in.", "sdkLeft": "Nog {n} vakjes", "sdkGood": "Tot nu toe goed!", "sdkGoodText": "Nog geen fouten. Ga zo door.", "sdkBad": "Kijk nog eens.", "sdkBadText": "De rode vakjes breken een regel.", "sdkDone": "Sudoku opgelost!", "sdkDoneText": "Elke rij, kolom en blok is af. Probeer een nieuwe puzzel of het volgende niveau.", "sdkCell": "Rij {r}, kolom {c}", "sdkEmpty": "leeg"}};
['en', 'fr', 'nl'].forEach(function (k) { Object.assign(UI[k], UI2[k]); });
ICON.sdk = 'M4 4h16v16H4zM9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16';
// Sudoku: random full grid by backtracking, then remove cells while the solution stays unique.
var SDK = [ { n: 4, br: 2, bc: 2, keep: 8 }, { n: 6, br: 2, bc: 3, keep: 18 }, { n: 9, br: 3, bc: 3, keep: 36 } ];
function sdkShuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function sdkOk(g, cfg, i, v) { var n = cfg.n, r = Math.floor(i / n), c = i % n; for (var k = 0; k < n; k++) { if (g[r * n + k] === v || g[k * n + c] === v) return false; } var r0 = r - r % cfg.br, c0 = c - c % cfg.bc; for (var a = 0; a < cfg.br; a++) for (var b = 0; b < cfg.bc; b++) if (g[(r0 + a) * n + c0 + b] === v) return false; return true; }
function sdkFill(g, cfg) { var i = g.indexOf(0); if (i < 0) return true; var vs = sdkShuffle(Array.from({ length: cfg.n }, function (_, k) { return k + 1; })); for (var k = 0; k < vs.length; k++) { if (sdkOk(g, cfg, i, vs[k])) { g[i] = vs[k]; if (sdkFill(g, cfg)) return true; g[i] = 0; } } return false; }
function sdkCount(g, cfg, limit) { var i = g.indexOf(0); if (i < 0) return 1; var tot = 0; for (var v = 1; v <= cfg.n; v++) { if (sdkOk(g, cfg, i, v)) { g[i] = v; tot += sdkCount(g, cfg, limit - tot); g[i] = 0; if (tot >= limit) break; } } return tot; }
function sdkMake(level) {
  var cfg = SDK[level], n = cfg.n, sol = new Array(n * n).fill(0); sdkFill(sol, cfg);
  var puz = sol.slice(), order = sdkShuffle(Array.from({ length: n * n }, function (_, k) { return k; })), filled = n * n;
  for (var k = 0; k < order.length && filled > cfg.keep; k++) { var i = order[k], keep = puz[i]; puz[i] = 0; if (sdkCount(puz.slice(), cfg, 2) !== 1) puz[i] = keep; else filled--; }
  return { level: level, sol: sol, giv: puz, val: puz.slice(), sel: -1, bad: [], msg: '', done: false };
}
function fill(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }

var P8 = [[6, 6], [50, 6], [94, 6], [94, 50], [94, 94], [50, 94], [6, 94], [6, 50]];
function triD(n, k) { var a, b; if (n === 4) { a = P8[(2 * k) % 8]; b = P8[(2 * k + 2) % 8]; } else { a = P8[k % 8]; b = P8[(k + 1) % 8]; } return 'M50 50L' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + 'Z'; }
function md(x, n) { return ((x % n) + n) % n; }
function shpPaths(st) { return { grid: 'M6 6H94V94H6ZM6 6L94 94M94 6L6 94' + (st.n === 8 ? 'M50 6V94M6 50H94' : ''), gold: triD(st.n, st.g), blue: st.b < 0 ? '' : triD(st.n, st.b) }; }
function shpGen(level) {
  var out = [];
  for (var t = 0; t < 6; t++) {
    var n = level === 0 ? 4 : 8, g0 = Math.floor(Math.random() * n), y, b = 0, b0 = -1;
    if (level === 0) y = t % 2 === 0 ? 1 : -1;
    else if (level === 1) y = [1, 2, -1, -2, 1, 3][t];
    else { y = [1, 2, 1, -1, 2, 1][t]; b = [-1, -1, 2, 1, 1, -2][t]; b0 = md(g0 + 4, 8); }
    var stAt = function (i) { return { n: n, g: md(g0 + y * i, n), b: b0 < 0 ? -1 : md(b0 + b * i, n) }; };
    var right = stAt(3);
    var c = [right, { n: n, g: md(g0 + y * 2, n), b: b0 < 0 ? -1 : md(b0 + b * 2, n) }, { n: n, g: md(g0 + y * 3 + (y > 0 ? 1 : -1), n), b: right.b }];
    if (b0 >= 0) c.push({ n: n, g: right.g, b: md(b0 - b * 3, n) });
    c.push({ n: n, g: md(g0 - y * 3, n), b: right.b });
    var seen = {}, opts = [];
    c.forEach(function (x) { var key = x.g + ':' + x.b; if (!seen[key] && opts.length < 3) { seen[key] = 1; opts.push(x); } });
    var order = [0, 1, 2].sort(function () { return Math.random() - 0.5; }), o = order.map(function (i) { return opts[i]; });
    out.push({ k: 'shp', s: [stAt(0), stAt(1), stAt(2)], o: o, ok: order.indexOf(0), y: y, b: b0 < 0 ? 0 : b });
  }
  return out;
}
function dirText(lang, v) {
  var a = Math.abs(v);
  if (lang === 'fr') return 'de ' + a + ' case' + (a > 1 ? 's' : '') + (v > 0 ? ' dans le sens des aiguilles d’une montre' : ' dans le sens inverse des aiguilles d’une montre');
  if (lang === 'nl') return a + ' stap' + (a > 1 ? 'pen' : '') + (v > 0 ? ' met de klok mee' : ' tegen de klok in');
  return a + ' step' + (a > 1 ? 's' : '') + (v > 0 ? ' clockwise' : ' counterclockwise');
}
function shpWhy(lang, q) {
  var y = dirText(lang, q.y), b = q.b ? dirText(lang, q.b) : '';
  if (lang === 'fr') return 'Le jaune avance ' + y + ' à chaque fois.' + (b ? ' Le bleu avance ' + b + '.' : '');
  if (lang === 'nl') return 'Geel gaat elke keer ' + y + '.' + (b ? ' Blauw gaat ' + b + '.' : '');
  return 'Yellow moves ' + y + ' each time.' + (b ? ' Blue moves ' + b + '.' : '');
}
BANK.shp = [shpGen(0), shpGen(1), shpGen(2)];
function norm(d) { return ((d % 360) + 360) % 360; }

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { sdk: null, lang: 'en', tab: 'seq', level: 0, qi: 0, picked: -1, checked: false, score: 0, done: false, stars: 0, mode: 'gate', gateScore: -1, unlocked: false };
  }
  list() {
    var s = this.state;
    if (s.tab !== 'ch') return BANK[s.tab][s.level].map(function (q) { q.k = q.k || s.tab; return q; });
    return s.mode === 'pre' ? BANK.pre : BANK.ch;
  }
  reset(extra) { this.setState(Object.assign({ qi: 0, picked: -1, checked: false, score: 0, done: false }, extra || {})); }
  renderVals() {
    var s = this.state, self = this, L = UI[s.lang];
    var langs = ['en', 'fr', 'nl'].map(function (k) { return { code: k.toUpperCase(), on: s.lang === k, cls: s.lang === k ? 'on' : '', pick: function () { self.setState({ lang: k }); } }; });
    var tabs = ['seq', 'pat', 'rot', 'shp', 'sdk', 'ch'].map(function (k) { return { label: L[k], ic: ICON[k], on: s.tab === k, cls: s.tab === k ? 'on' : '', pick: function () { self.reset({ tab: k, level: 0, mode: k === 'ch' ? (s.unlocked ? 'ch' : 'gate') : s.mode, sdk: k === 'sdk' ? sdkMake(0) : null }); } }; });
    var levels = L.lvl.map(function (name, i) { return { label: name, on: s.level === i, cls: s.level === i ? 'on' : '', pick: function () { self.reset({ level: i, sdk: s.tab === 'sdk' ? sdkMake(i) : null }); } }; });
    var isSdk = s.tab === 'sdk', sd = isSdk ? (s.sdk || sdkMake(s.level)) : null;
    var isCh = s.tab === 'ch';
    var showGate = isCh && s.mode === 'gate';
    var sdkVals = {};
    if (isSdk) {
      var cf = SDK[sd.level], N = cf.n, put = function (v) { if (sd.sel < 0 || sd.giv[sd.sel] || sd.done) return; var nv = sd.val.slice(); nv[sd.sel] = v; var nb = sd.bad.filter(function (x) { return x !== sd.sel; }); var full = nv.indexOf(0) < 0, solved = full && nv.every(function (x, i) { return x === sd.sol[i]; }); self.setState({ sdk: Object.assign({}, sd, { val: nv, bad: nb, msg: '', done: solved }), stars: s.stars + (solved ? 3 : 0), done: solved }); };
      var selR = sd.sel < 0 ? -1 : Math.floor(sd.sel / N), selC = sd.sel < 0 ? -1 : sd.sel % N;
      sdkVals = {
        sdkN: N, sdkKey: 'sdk' + sd.level + sd.sol.join(''), sdkLabel: L.sdk + ' · ' + L.lvl[sd.level], sdkRule: fill(L.sdkRule, { n: N }),
        sdkLeft: fill(L.sdkLeft, { n: sd.val.filter(function (x) { return !x; }).length }),
        sdkCells: sd.val.map(function (v, i) { var r = Math.floor(i / N), c = i % N, cls = []; if (sd.giv[i]) cls.push('given'); if (i === sd.sel) cls.push('sel'); else if (sd.sel >= 0 && (r === selR || c === selC)) cls.push('peer'); if (sd.bad.indexOf(i) >= 0) cls.push('bad'); if ((c + 1) % cf.bc === 0 && c < N - 1) cls.push('br'); if ((r + 1) % cf.br === 0 && r < N - 1) cls.push('bb'); return { v: v || '', cls: cls.join(' '), aria: fill(L.sdkCell, { r: r + 1, c: c + 1 }) + ': ' + (v || L.sdkEmpty), pick: function () { if (!sd.giv[i]) self.setState({ sdk: Object.assign({}, sd, { sel: i }) }); } }; }),
        sdkKeys: Array.from({ length: N }, function (_, k) { return { label: String(k + 1), aria: String(k + 1), press: function () { put(k + 1); } }; }).concat([{ label: '⌫', aria: L.sdkErase, press: function () { put(0); } }]),
        sdkCheck: function () { var bad = []; sd.val.forEach(function (v, i) { if (v && !sd.giv[i] && v !== sd.sol[i]) bad.push(i); }); self.setState({ sdk: Object.assign({}, sd, { bad: bad, msg: bad.length ? 'bad' : 'good' }) }); },
        sdkNew: function () { self.reset({ sdk: sdkMake(sd.level) }); },
        sdkMsg: sd.msg ? (sd.msg === 'bad' ? L.sdkBadText : L.sdkGoodText) : '', sdkVerdict: sd.msg === 'bad' ? L.sdkBad : L.sdkGood, sdkColor: sd.msg === 'bad' ? '#ff8a8a' : '#38e1a0', sdkAvatar: sd.msg === 'bad' ? AV.whyzz : AV.sunny
      };
    }
    var list = (showGate || isSdk) ? [] : this.list();
    var q = list[s.qi] || list[0] || { k: 'seq', s: [], o: [], ok: 0 };
    var kind = q.k || s.tab;
    var opts = (q.o || []).map(function (v, i) {
      var cls = '';
      if (s.checked) cls = i === q.ok ? 'right' : (i === s.picked ? 'wrong' : '');
      else if (i === s.picked) cls = 'picked';
      var o = { cls: cls, isText: kind === 'seq', isShape: kind === 'pat', isRot: kind === 'rot', isShp: kind === 'shp', pick: function () { if (!s.checked) self.setState({ picked: i }); }, aria: String(v) };
      if (kind === 'seq') o.text = v;
      if (kind === 'pat') { o.d = SHAPE[v[0]]; o.fill = COLOR[v[1]]; }
      if (kind === 'rot') { o.deg = v; o.aria = v + '°'; }
      if (kind === 'shp') { var pp = shpPaths(v); o.grid = pp.grid; o.gold = pp.gold; o.blue = pp.blue; o.aria = String(i + 1); }
      return o;
    });
    var shpCells = kind === 'shp' ? q.s.map(function (st) { var pp = shpPaths(st); return { isQ: false, isShp: true, grid: pp.grid, gold: pp.gold, blue: pp.blue, cls: '' }; }).concat([{ isQ: true, isShp: false, grid: '', gold: '', blue: '', cls: 'q' }]) : [];
    var seqCells = kind === 'seq' ? q.s.map(function (v) { return { v: v, cls: '' }; }).concat([{ v: '?', cls: 'q' }]) : [];
    var patCells = kind === 'pat' ? q.s.map(function (v) { return { isShape: true, isQ: false, d: SHAPE[v[0]], fill: COLOR[v[1]], cls: '' }; }).concat([{ isShape: false, isQ: true, cls: 'q', d: '', fill: '' }]) : [];
    var rotSteps = kind === 'rot' ? (q.t.length > 3 ? [{ ic: ICON.right, text: L.turnRight + ' × ' + q.t.length }] : q.t.map(function (d) { return d < 0 ? { ic: ICON.left, text: L.turnLeft } : d === 180 ? { ic: ICON.right, text: L.turnRight + ' × 2' } : { ic: ICON.right, text: L.turnRight }; })) : [];
    var why = '';
    if (kind === 'shp') why = shpWhy(s.lang, q);
    if (kind === 'rot') { var tot = q.t.reduce(function (a, b) { return a + b; }, 0); why = (q.t.length > 3 ? L.rotWhyZero + ' ' : '') + fill(L.rotWhy, { v: norm(tot) }); }
    else if (q.r) why = fill(L[q.r[0]], { v: q.r[1] });
    var isRight = s.picked === q.ok;
    var last = s.qi >= list.length - 1;
    var action = function () {
      if (!s.checked) { if (s.picked < 0) return; self.setState({ checked: true, score: s.score + (isRight ? 1 : 0) }); return; }
      if (!last) { self.setState({ qi: s.qi + 1, picked: -1, checked: false }); return; }
      var stars = s.stars + s.score;
      if (isCh && s.mode === 'pre') {
        if (s.score === list.length) self.reset({ mode: 'ch', unlocked: true, gateScore: s.score, stars: stars });
        else self.reset({ mode: 'gate', gateScore: s.score, stars: stars });
        return;
      }
      self.setState({ done: true, stars: stars });
    };
    var label = isCh ? (s.mode === 'pre' ? L.preLabel : L.chLabel) : L[s.tab] + ' · ' + L.lvl[s.level];
    var prompt = kind === 'seq' ? L.seqPrompt : kind === 'pat' ? L.patPrompt : kind === 'shp' ? L.shpPrompt : L.rotPrompt;
    return Object.assign(sdkVals, {
      isSdk: isSdk && !s.done, L: L, langs: langs, tabs: tabs, levels: levels,
      showLevels: !isCh, showGate: showGate, gateFailed: showGate && s.gateScore >= 0 && s.gateScore < 5, gateResult: fill(L.gateFail, { n: s.gateScore }),
      startPretest: function () { self.reset({ mode: 'pre' }); },
      showQuestion: !showGate && !s.done && !isSdk, showDone: s.done,
      qKey: s.tab + s.level + s.mode + s.qi, qLabel: label, qCounter: (s.qi + 1) + ' / ' + list.length, qPrompt: prompt,
      accent: isCh ? '#b98cff' : '#38e1a0',
      isSeq: kind === 'seq', isPat: kind === 'pat', isRot: kind === 'rot', isShp: kind === 'shp', shpCells: shpCells, seqCells: seqCells, patCells: patCells, rotSteps: rotSteps, opts: opts,
      checked: s.checked, verdict: isRight ? L.right : L.wrong, verdictColor: isRight ? '#38e1a0' : '#ff8a8a', why: why, feedbackAvatar: isRight ? AV.sunny : AV.whyzz,
      action: action, actionDisabled: !s.checked && s.picked < 0, actionLabel: !s.checked ? L.check : (last ? L.finish : L.next),
      starsText: fill(L.stars, { n: s.stars }),
      doneTitle: isSdk ? L.sdkDone : isCh ? fill(L.chDone, { n: s.score, t: list.length }) : fill(L.levelDone, { n: s.score, t: list.length }),
      doneText: isSdk ? L.sdkDoneText : isCh ? L.chText : L.levelText,
      again: function () { self.reset(isSdk ? { sdk: sdkMake(s.level) } : {}); }, canNext: !isCh && s.level < 2, nextLabel: L.nextLevel, nextLevel: function () { self.reset({ level: s.level + 1, sdk: isSdk ? sdkMake(s.level + 1) : null }); }
    });
  }
}

;return Component;
})();
