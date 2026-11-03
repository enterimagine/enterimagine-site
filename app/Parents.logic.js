window.__Component = (function () {

var UI = {
  en: { area: 'Parents', sub: 'Family plan · enterimagine.com/parents', title: 'Progress dashboard', child: 'Child', sample: 'Sample data for the design. Children are listed as Child 1, Child 2 and so on; progress is stored only under that number.', profH: 'Child profiles', nameLabel: 'nickname (optional, saved only on this device)', warn: 'Privacy tip: the number stays fixed and is all IMAGINE stores. The nickname is saved only on this device and never sent to IMAGINE; on another device you can enter it again. Do not enter your child’s real name or other personal details such as birthday, school or address.',
    tiles: ['This week', 'Episodes completed', 'Quiz average', 'Stars collected'], tileNotes: ['minutes, 4 sessions', 'of 30 in all worlds', 'last 10 quizzes', 'logic games'],
    timeH: 'Time spent per week (minutes)', timeNote: 'Rounded to whole minutes. Only the date is kept, not the time of day.', worldsH: 'Progress per world', eps: 'episodes',
    worlds: ['Energy', 'AI & Data', 'Quantum', 'Biotech', 'Logic games'], doneH: 'Recent completions', colWhen: 'When', colWhat: 'Activity', colResult: 'Result',
    acts: ['Quiz: Power for the night', 'Logic: What comes next? Hard', 'Episode: Pixel and the sorting robot', 'Warm-up for difficult challenges', 'Quiz: Qubi spins the coin'],
    res: ['4 of 5', '3 stars', 'Completed', 'Passed: 5 of 5', '2 of 5'], days: ['Today', 'Yesterday', '2 days ago', '4 days ago', '5 days ago'],
    recs: [ { tag: 'Strong area', title: 'Number patterns', text: 'All number-row levels done with 3 stars.', why: 'Easy, medium and hard completed without misses.' },
            { tag: 'Ready for more', title: 'Difficult challenges are open', text: 'Try the five hardest puzzles together and ask how they found the answer.', why: 'The warm-up test was passed with 5 of 5.' },
            { tag: 'Practise', title: 'Quantum: superposition', text: 'Watch “Qubi spins the coin” again, then retry its quiz.', why: 'Two quiz tries in this world scored 2 of 5.' } ],
    why: 'Why:', disclaimer: 'These suggestions are based only on activities in IMAGINE Kids. They are not a test, a diagnosis or a school assessment. Every child learns at their own pace. If you have questions about your child’s learning, talk to their teacher or a qualified professional.',
    dataNote: 'You decide what stays: export this data or remove a profile at any time. Everything is deleted 12 months after the family plan ends.', export: 'Download data for', remove: 'Remove' },
  fr: { area: 'Parents', sub: 'Formule famille · enterimagine.com/parents', title: 'Tableau de progression', child: 'Enfant', sample: 'Données d’exemple pour la maquette. Les enfants apparaissent comme Enfant 1, Enfant 2, etc. ; la progression est enregistrée uniquement sous ce numéro.', profH: 'Profils des enfants', nameLabel: 'surnom (facultatif, gardé uniquement sur cet appareil)', warn: 'Conseil de confidentialité : le numéro reste fixe et c’est tout ce qu’IMAGINE enregistre. Le surnom est gardé uniquement sur cet appareil et n’est jamais envoyé à IMAGINE ; sur un autre appareil, vous pouvez le saisir à nouveau. N’indiquez pas le vrai nom de votre enfant ni d’autres données personnelles comme la date de naissance, l’école ou l’adresse.',
    tiles: ['Cette semaine', 'Épisodes terminés', 'Moyenne des quiz', 'Étoiles gagnées'], tileNotes: ['minutes, 4 séances', 'sur 30 dans tous les mondes', '10 derniers quiz', 'jeux de logique'],
    timeH: 'Temps par semaine (minutes)', timeNote: 'Arrondi à la minute. Seule la date est gardée, pas l’heure.', worldsH: 'Progression par monde', eps: 'épisodes',
    worlds: ['Énergie', 'IA et données', 'Quantique', 'Biotech', 'Jeux de logique'], doneH: 'Dernières réussites', colWhen: 'Quand', colWhat: 'Activité', colResult: 'Résultat',
    acts: ['Quiz : De l’énergie pour la nuit', 'Logique : Et ensuite ? Difficile', 'Épisode : Pixel et le robot trieur', 'Échauffement des défis difficiles', 'Quiz : Qubi fait tourner la pièce'],
    res: ['4 sur 5', '3 étoiles', 'Terminé', 'Réussi : 5 sur 5', '2 sur 5'], days: ['Aujourd’hui', 'Hier', 'Il y a 2 jours', 'Il y a 4 jours', 'Il y a 5 jours'],
    recs: [ { tag: 'Point fort', title: 'Suites de nombres', text: 'Tous les niveaux de suites réussis avec 3 étoiles.', why: 'Facile, moyen et difficile terminés sans erreur.' },
            { tag: 'Prêt pour plus', title: 'Les défis difficiles sont ouverts', text: 'Essayez ensemble les cinq énigmes les plus dures et demandez comment la réponse a été trouvée.', why: 'L’échauffement a été réussi avec 5 sur 5.' },
            { tag: 'À pratiquer', title: 'Quantique : la superposition', text: 'Revoir « Qubi fait tourner la pièce », puis refaire son quiz.', why: 'Deux essais de quiz dans ce monde : 2 sur 5.' } ],
    why: 'Pourquoi :', disclaimer: 'Ces suggestions reposent uniquement sur les activités dans IMAGINE Kids. Ce n’est ni un test, ni un diagnostic, ni une évaluation scolaire. Chaque enfant apprend à son rythme. Pour toute question sur l’apprentissage de votre enfant, parlez-en à son enseignant ou à un professionnel qualifié.',
    dataNote: 'Vous décidez de ce qui reste : exportez ces données ou supprimez un profil à tout moment. Tout est effacé 12 mois après la fin de la formule famille.', export: 'Télécharger les données de', remove: 'Supprimer' },
  nl: { area: 'Ouders', sub: 'Gezinsabonnement · enterimagine.com/parents', title: 'Voortgangsoverzicht', child: 'Kind', sample: 'Voorbeeldgegevens voor het ontwerp. Kinderen staan er als Kind 1, Kind 2 enzovoort; voortgang wordt alleen onder dat nummer bewaard.', profH: 'Profielen van de kinderen', nameLabel: 'bijnaam (optioneel, alleen bewaard op dit apparaat)', warn: 'Privacytip: het nummer blijft vast en is het enige wat IMAGINE bewaart. De bijnaam wordt alleen op dit apparaat bewaard en nooit naar IMAGINE gestuurd; op een ander apparaat kunt u hem opnieuw invullen. Vul niet de echte naam van uw kind in, en ook geen andere persoonlijke gegevens zoals verjaardag, school of adres.',
    tiles: ['Deze week', 'Afleveringen klaar', 'Gemiddelde quiz', 'Verdiende sterren'], tileNotes: ['minuten, 4 keer', 'van de 30 in alle werelden', 'laatste 10 quizzen', 'logische spelletjes'],
    timeH: 'Tijd per week (minuten)', timeNote: 'Afgerond op hele minuten. Alleen de datum wordt bewaard, niet het tijdstip.', worldsH: 'Voortgang per wereld', eps: 'afleveringen',
    worlds: ['Energie', 'AI en data', 'Quantum', 'Biotech', 'Logische spelletjes'], doneH: 'Recent afgerond', colWhen: 'Wanneer', colWhat: 'Activiteit', colResult: 'Resultaat',
    acts: ['Quiz: Stroom voor de nacht', 'Logica: Wat komt erna? Moeilijk', 'Aflevering: Pixel en de sorteerrobot', 'Opwarming moeilijke uitdagingen', 'Quiz: Qubi laat de munt draaien'],
    res: ['4 van 5', '3 sterren', 'Afgerond', 'Geslaagd: 5 van 5', '2 van 5'], days: ['Vandaag', 'Gisteren', '2 dagen geleden', '4 dagen geleden', '5 dagen geleden'],
    recs: [ { tag: 'Sterk punt', title: 'Getallenreeksen', text: 'Alle niveaus van getallenreeksen gehaald met 3 sterren.', why: 'Makkelijk, gemiddeld en moeilijk zonder fouten.' },
            { tag: 'Klaar voor meer', title: 'De moeilijke uitdagingen zijn open', text: 'Probeer samen de vijf moeilijkste puzzels en vraag hoe het antwoord gevonden werd.', why: 'De opwarmtest is gehaald met 5 van 5.' },
            { tag: 'Oefenen', title: 'Quantum: superpositie', text: 'Bekijk “Qubi laat de munt draaien” opnieuw en doe daarna de quiz nog eens.', why: 'Twee quizpogingen in deze wereld: 2 van 5.' } ],
    why: 'Waarom:', disclaimer: 'Deze suggesties zijn alleen gebaseerd op activiteiten in IMAGINE Kids. Het is geen toets, diagnose of schoolbeoordeling. Elk kind leert in zijn eigen tempo. Hebt u vragen over het leren van uw kind, praat dan met de leerkracht of een deskundige.',
    dataNote: 'U beslist wat blijft: exporteer deze gegevens of verwijder een profiel wanneer u wilt. Alles wordt gewist 12 maanden na het einde van het gezinsabonnement.', export: 'Gegevens downloaden van', remove: 'Verwijderen' }
};
var KIDS = [
  { year: { en: 'Year 6', fr: '6e primaire', nl: '6e leerjaar' }, color: '#ffd84c', mins: [35, 42, 28, 50, 61, 44, 57, 63], tiles: ['63', '14', '78%', '41'], worlds: [[5, 6], [3, 6], [2, 6], [1, 6], [9, 9]] },
  { year: { en: 'Year 4', fr: '4e primaire', nl: '4e leerjaar' }, color: '#7fe7ff', mins: [12, 20, 18, 25, 22, 30, 24, 27], tiles: ['27', '6', '84%', '15'], worlds: [[4, 6], [1, 6], [0, 6], [1, 6], [4, 9]] }
];
var WCOL = ['#ffb020', '#2f6fed', '#8b5cf6', '#16a36a', '#e0457b'];
var GUIDES = ['Sunny', 'Pixel', 'Qubi', 'Bloom', 'Whyzz'];
class Component extends DCLogic {
  constructor(props) { super(props); this.state = { lang: 'en', kid: 0, names: ['', 'Comet'] }; }
  renderVals() {
    var s = this.state, self = this, L = UI[s.lang], K = KIDS[s.kid];
    var max = Math.max.apply(null, K.mins);
    return {
      L: L,
      langs: ['en', 'fr', 'nl'].map(function (k) { return { code: k.toUpperCase(), on: s.lang === k, cls: s.lang === k ? 'on' : '', pick: function () { self.setState({ lang: k }); } }; }),
      currentId: L.child + ' ' + (s.kid + 1),
      kids: KIDS.map(function (k, i) { var def = L.child + ' ' + (i + 1); var nick = (s.names[i] || '').trim(); var nm = nick ? nick + ' (' + def + ')' : def; return { name: nm, defaultName: def, custom: s.names[i] || '', inputId: 'child-name-' + i, onName: function (e) { var v = e && e.target ? e.target.value : ''; var n = s.names.slice(); n[i] = v; self.setState({ names: n }); }, band: k.year[s.lang], color: k.color, initial: String(i + 1), on: s.kid === i, cls: s.kid === i ? 'on' : '', pick: function () { self.setState({ kid: i }); } }; }),
      tiles: L.tiles.map(function (t, i) { return { label: t, value: K.tiles[i], note: L.tileNotes[i] }; }),
      weeks: K.mins.map(function (m, i) { return { min: m, h: Math.round(m / max * 120) + 'px', label: 'W' + (37 + i) }; }),
      worlds: K.worlds.map(function (w, i) { return { name: L.worlds[i], guide: GUIDES[i], text: w[0] + ' / ' + w[1] + (i < 4 ? ' ' + L.eps : ''), pct: Math.round(w[0] / w[1] * 100) + '%', color: WCOL[i] }; }),
      done: L.acts.map(function (a, i) { return { when: L.days[i], what: a, result: L.res[i], color: i === 4 ? '#b4232f' : '#16794c' }; }),
      recs: L.recs.map(function (r, i) { return { tag: r.tag, title: r.title, text: r.text, why: r.why, color: ['#16a36a', '#8b5cf6', '#ffb020'][i], tagColor: ['#16794c', '#6b3fd4', '#8a5a00'][i] }; })
    };
  }
}

;return Component;
})();
