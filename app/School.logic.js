window.__Component = (function () {

var UI = {
  en: { area: 'School', sub: 'School pack · enterimagine.com/schools', roles: ['Teacher', 'School custodian'], tTitle: 'Class 5B: progress', cTitle: 'School overview', sample: 'Sample data for the design. Pupils appear only as the number or code the school chose; the school keeps its own list linking numbers to names.',
    tTiles: ['Pupils active this week', 'Average episodes completed', 'Ready for difficult challenges', 'May need support'], gridH: 'Class progress per world', filter: 'Group', fAll: 'All', seat: 'Pupil no.', group: 'Group', next: 'Suggested next',
    worlds: ['Energy', 'AI & Data', 'Quantum', 'Biotech', 'Logic'], groups: { none: 'No group', sup: 'Extra support', ch: 'Extra challenge' },
    lg: ['Not started', 'Started', 'Completed', 'Repeated misses'], nexts: ['Difficult challenges', 'AI & Data episode 2', 'Energy episode 3 again', 'Quantum quiz again', 'Logic: medium level', 'Biotech episode 1'],
    readyH: 'Ready for difficult challenges', readyNote: 'These pupils passed the warm-up test with 5 of 5.', assignCh: 'Assign challenges',
    supportH: 'May need support', supportNote: 'Repeated misses on the same skill. The suggested episode explains it again in another way.', assignEp: 'Assign episode to these pupils',
    cTiles: ['Licences used', 'Active classes', 'Teachers', 'Average completion'], cNotes: ['of 120 seats', 'this term', 'with access', 'all classes'], classesH: 'Classes', addClass: 'Add class', addTeacher: 'Invite teacher',
    cCols: ['Class', 'Teacher', 'Seats', 'Average completion', 'Ready for challenges'],
    rulesH: 'Data rules for this school', rules: ['Each pupil gets a number or code chosen by the school, plus a class code and picture password; no names or emails.', 'The school keeps its own list linking numbers to names, outside IMAGINE.', 'No health or diagnosis fields and no free-text notes; groups only.', 'The school is the data controller; IMAGINE processes data under the signed agreement.'],
    disclaimer: 'Suggestions are based only on activities in IMAGINE Kids. They are not a test, a diagnosis or a school assessment, and they do not replace the teacher’s judgement.' },
  fr: { area: 'École', sub: 'Pack école · enterimagine.com/schools', roles: ['Enseignant', 'Responsable de l’école'], tTitle: 'Classe 5B : progression', cTitle: 'Vue de l’école', sample: 'Données d’exemple pour la maquette. Les élèves n’apparaissent que par le numéro ou code choisi par l’école ; l’école garde sa propre liste des numéros et des noms.',
    tTiles: ['Élèves actifs cette semaine', 'Épisodes terminés en moyenne', 'Prêts pour les défis difficiles', 'Ont peut-être besoin d’aide'], gridH: 'Progression de la classe par monde', filter: 'Groupe', fAll: 'Tous', seat: 'N° élève', group: 'Groupe', next: 'Suite conseillée',
    worlds: ['Énergie', 'IA et données', 'Quantique', 'Biotech', 'Logique'], groups: { none: 'Sans groupe', sup: 'Soutien', ch: 'Défi en plus' },
    lg: ['Pas commencé', 'Commencé', 'Terminé', 'Erreurs répétées'], nexts: ['Défis difficiles', 'IA et données, épisode 2', 'Énergie, épisode 3 à revoir', 'Quiz quantique à refaire', 'Logique : niveau moyen', 'Biotech, épisode 1'],
    readyH: 'Prêts pour les défis difficiles', readyNote: 'Ces élèves ont réussi l’échauffement avec 5 sur 5.', assignCh: 'Attribuer les défis',
    supportH: 'Ont peut-être besoin d’aide', supportNote: 'Erreurs répétées sur la même notion. L’épisode conseillé l’explique autrement.', assignEp: 'Attribuer l’épisode à ces élèves',
    cTiles: ['Licences utilisées', 'Classes actives', 'Enseignants', 'Progression moyenne'], cNotes: ['sur 120 places', 'ce trimestre', 'avec accès', 'toutes les classes'], classesH: 'Classes', addClass: 'Ajouter une classe', addTeacher: 'Inviter un enseignant',
    cCols: ['Classe', 'Enseignant', 'Places', 'Progression moyenne', 'Prêts pour les défis'],
    rulesH: 'Règles de données pour cette école', rules: ['Chaque élève reçoit un numéro ou code choisi par l’école, plus un code de classe et un mot de passe en images ; pas de nom ni d’e-mail.', 'L’école garde sa propre liste des numéros et des noms, en dehors d’IMAGINE.', 'Aucun champ santé ou diagnostic, aucune note libre ; seulement des groupes.', 'L’école est responsable du traitement ; IMAGINE traite les données selon le contrat signé.'],
    disclaimer: 'Les suggestions reposent uniquement sur les activités dans IMAGINE Kids. Ce n’est ni un test, ni un diagnostic, ni une évaluation scolaire, et cela ne remplace pas le jugement de l’enseignant.' },
  nl: { area: 'School', sub: 'Schoolpakket · enterimagine.com/schools', roles: ['Leerkracht', 'Schoolbeheerder'], tTitle: 'Klas 5B: voortgang', cTitle: 'Schooloverzicht', sample: 'Voorbeeldgegevens voor het ontwerp. Leerlingen staan er alleen met het nummer of de code die de school koos; de school bewaart zelf de lijst van nummers en namen.',
    tTiles: ['Actieve leerlingen deze week', 'Gemiddeld afgeronde afleveringen', 'Klaar voor moeilijke uitdagingen', 'Hebben misschien hulp nodig'], gridH: 'Voortgang van de klas per wereld', filter: 'Groep', fAll: 'Alle', seat: 'Leerlingnr.', group: 'Groep', next: 'Voorgestelde volgende stap',
    worlds: ['Energie', 'AI en data', 'Quantum', 'Biotech', 'Logica'], groups: { none: 'Geen groep', sup: 'Extra steun', ch: 'Extra uitdaging' },
    lg: ['Niet begonnen', 'Begonnen', 'Afgerond', 'Herhaalde fouten'], nexts: ['Moeilijke uitdagingen', 'AI en data, aflevering 2', 'Energie, aflevering 3 opnieuw', 'Quantumquiz opnieuw', 'Logica: niveau gemiddeld', 'Biotech, aflevering 1'],
    readyH: 'Klaar voor moeilijke uitdagingen', readyNote: 'Deze leerlingen haalden de opwarmtest met 5 van 5.', assignCh: 'Uitdagingen toewijzen',
    supportH: 'Hebben misschien hulp nodig', supportNote: 'Herhaalde fouten bij dezelfde vaardigheid. De voorgestelde aflevering legt het op een andere manier uit.', assignEp: 'Aflevering toewijzen aan deze leerlingen',
    cTiles: ['Gebruikte licenties', 'Actieve klassen', 'Leerkrachten', 'Gemiddelde voortgang'], cNotes: ['van 120 plaatsen', 'dit trimester', 'met toegang', 'alle klassen'], classesH: 'Klassen', addClass: 'Klas toevoegen', addTeacher: 'Leerkracht uitnodigen',
    cCols: ['Klas', 'Leerkracht', 'Plaatsen', 'Gemiddelde voortgang', 'Klaar voor uitdagingen'],
    rulesH: 'Gegevensregels voor deze school', rules: ['Elke leerling krijgt een nummer of code die de school kiest, plus een klascode en een plaatjeswachtwoord; geen namen of e-mailadressen.', 'De school bewaart zelf de lijst van nummers en namen, buiten IMAGINE.', 'Geen velden voor gezondheid of diagnoses en geen vrije notities; alleen groepen.', 'De school is verwerkingsverantwoordelijke; IMAGINE verwerkt gegevens volgens de getekende overeenkomst.'],
    disclaimer: 'Suggesties zijn alleen gebaseerd op activiteiten in IMAGINE Kids. Het is geen toets, diagnose of schoolbeoordeling en vervangt het oordeel van de leerkracht niet.' }
};
// cell codes: 0 not started, 1 started, 2 completed, 3 repeated misses
var PUPILS = [
  { seat: 1, animal: 'Fox', g: 'ch', c: [2, 2, 2, 1, 2], n: 0 }, { seat: 2, animal: 'Owl', g: 'none', c: [2, 1, 0, 0, 1], n: 1 },
  { seat: 3, animal: 'Bear', g: 'sup', c: [3, 1, 0, 0, 1], n: 2 }, { seat: 4, animal: 'Lynx', g: 'none', c: [2, 2, 3, 0, 1], n: 3 },
  { seat: 5, animal: 'Otter', g: 'ch', c: [2, 2, 2, 2, 2], n: 0 }, { seat: 6, animal: 'Hare', g: 'none', c: [2, 1, 1, 0, 0], n: 4 },
  { seat: 7, animal: 'Seal', g: 'sup', c: [1, 0, 0, 0, 3], n: 4 }, { seat: 8, animal: 'Wren', g: 'none', c: [2, 2, 1, 1, 1], n: 5 }
];
var CELL = [ { bg: '#eef1f7', fg: '#55627e', v: '–' }, { bg: '#cfe0ff', fg: '#163a8a', v: '1/2' }, { bg: '#bff0d8', fg: '#0d5b37', v: '✓' }, { bg: '#ffe0a3', fg: '#6a4300', v: '!' } ];
var GROUP = { none: { bg: '#eef1f7', fg: '#3a4660' }, sup: { bg: '#ffe9bf', fg: '#6a4300' }, ch: { bg: '#e6dcff', fg: '#4b2aa6' } };
class Component extends DCLogic {
  constructor(props) { super(props); this.state = { lang: 'en', role: 0, filter: 'all' }; }
  renderVals() {
    var s = this.state, self = this, L = UI[s.lang];
    var shown = PUPILS.filter(function (p) { return s.filter === 'all' || p.g === s.filter; });
    var seatName = function (p) { return '#' + p.seat; };
    return {
      L: L, isTeacher: s.role === 0, isCustodian: s.role === 1, viewTitle: s.role === 0 ? L.tTitle : L.cTitle,
      langs: ['en', 'fr', 'nl'].map(function (k) { return { code: k.toUpperCase(), on: s.lang === k, cls: s.lang === k ? 'on' : '', pick: function () { self.setState({ lang: k }); } }; }),
      roles: L.roles.map(function (r, i) { return { label: r, on: s.role === i, cls: s.role === i ? 'on' : '', pick: function () { self.setState({ role: i }); } }; }),
      filters: [['all', L.fAll], ['sup', L.groups.sup], ['ch', L.groups.ch]].map(function (f) { return { label: f[1], on: s.filter === f[0], cls: s.filter === f[0] ? 'on' : '', pick: function () { self.setState({ filter: f[0] }); } }; }),
      tTiles: L.tTiles.map(function (t, i) { return { label: t, value: ['24 / 26', '9.4', '5', '3'][i] }; }),
      rows: shown.map(function (p) { return { seat: seatName(p), group: L.groups[p.g], gBg: GROUP[p.g].bg, gFg: GROUP[p.g].fg, next: L.nexts[p.n], cells: p.c.map(function (c) { return CELL[c]; }) }; }),
      legend: L.lg.map(function (l, i) { return { label: CELL[i].v + '  ' + l, bg: CELL[i].bg }; }),
      readyList: '#1, #5, #12, #19, #23', supportList: '#3, #4, #7',
      cTiles: L.cTiles.map(function (t, i) { return { label: t, value: ['104', '5', '6', '58%'][i], note: L.cNotes[i] }; }),
      classes: [ { name: '4A', teacher: 'teacher1@school.example', seats: '22 / 24', pct: '49%', ready: '2' }, { name: '5B', teacher: 'teacher2@school.example', seats: '26 / 26', pct: '63%', ready: '5' }, { name: '6A', teacher: 'teacher3@school.example', seats: '25 / 26', pct: '71%', ready: '7' }, { name: '6B', teacher: 'teacher4@school.example', seats: '21 / 24', pct: '52%', ready: '3' }, { name: '5A', teacher: 'teacher5@school.example', seats: '10 / 20', pct: '31%', ready: '0' } ]
    };
  }
}

;return Component;
})();
