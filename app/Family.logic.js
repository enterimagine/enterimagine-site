window.__Component = (function () {

var IMG = { solar: 'assets/img_solar.webp', wind: 'assets/img_wind.webp', night: 'assets/img_night.webp', hero: 'assets/img_hero.webp', guides: 'assets/img_guides.webp' };
var EPS = [ { img: IMG.solar, free: true }, { img: IMG.wind, free: false }, { img: IMG.night, free: false }, { img: IMG.hero, free: false }, { img: IMG.guides, free: true, logic: true }, { img: IMG.guides, free: false, ch: true } ];
var UI = {
  en: { title: 'Free and family plan (design only)', flow: 'How a family unlocks more, without any child data', tabs: ['What a child sees', 'Grown-ups only', 'Plans for parents', 'Family code'],
    kidH: 'Energy world with Sunny', kidP: 'Free episodes play right away. The rest waits for a family code.', freeNow: 'Free version', famNow: 'Family code active',
    epTitles: ['How does sunshine switch on the lights?', 'The wind’s secret', 'Power for the night', 'The energy city', 'Logic games: easy and medium', 'Difficult challenges'], ep: 'Episode', game: 'Game', free: 'Free', locked: 'Family', open: 'Unlocked',
    askGrownUp: 'Ask a grown-up to unlock this.', kidNote: 'Rule: a child never sees a price, a buy button or a countdown. Locked items only say “Ask a grown-up”.',
    gateH: 'For grown-ups', gateQ: 'To continue, tap the answer: seven times eight', gateOk: 'Thanks! Opening the parents’ page on the main IMAGINE site.', gateNo: 'Not right. Ask a grown-up to help.',
    whyH: 'Why this gate', whyList: ['The question is written in words, so young children cannot simply read off the sum.', 'Behind the gate everything is on the adult site, not in the kids app.', 'No name, birthday or email of the child is ever asked.'],
    plansH: 'Plans for parents', plansNote: 'Prices, payment provider and trial length are still to be decided. Payment happens only on the adult site; the kids app never handles money.',
    plans: [ { tag: 'Now', name: 'Free', price: 'No account needed', items: ['First episode of every world', 'Quiz and simple games for those episodes', 'Logic games: easy and medium levels', 'Voices and subtitles in EN, FR and NL', 'No progress is saved'] },
             { tag: 'Family', name: 'Family plan', price: 'Monthly or yearly · price to decide', items: ['All episodes in all five worlds', 'All logic game levels', 'Difficult challenges (after the warm-up test)', 'Printable activity sheets', 'One code for every device in the family', 'Progress dashboard for parents (Child 1, Child 2: no names needed)'] },
             { tag: 'Later', name: 'School pack', price: 'For classes and teachers', items: ['Everything in the family plan', 'Teacher guide per episode', 'Class codes, still with no pupil data'] } ],
    codeH: 'Unlock with the family code', codeP: 'After subscribing, the parent receives a code by email and types it in the kids app.', enter: 'Try the code', entered: 'Code entered', codeOk: 'All episodes and difficult challenges are now open on this device.', lockAgain: 'Lock again',
    codeRulesH: 'How the code works', codeRules: ['The code belongs to the family plan, not to a child.', 'Only the parent’s email is stored, on the adult site, for billing.', 'The kids app checks the code and keeps nothing else.', 'Parents can reset the code at any time if it gets shared too widely.', 'To decide: remember the code on the device (simple storage, no tracking) or type it each visit.'] },
  fr: { title: 'Gratuit et formule famille (maquette)', flow: 'Comment une famille débloque plus, sans aucune donnée d’enfant', tabs: ['Ce que voit l’enfant', 'Réservé aux adultes', 'Formules pour les parents', 'Code famille'],
    kidH: 'Le monde de l’énergie avec Sunny', kidP: 'Les épisodes gratuits se lancent tout de suite. Le reste attend un code famille.', freeNow: 'Version gratuite', famNow: 'Code famille actif',
    epTitles: ['Comment le soleil allume-t-il les lampes ?', 'Le secret du vent', 'De l’énergie pour la nuit', 'La ville de l’énergie', 'Jeux de logique : facile et moyen', 'Défis difficiles'], ep: 'Épisode', game: 'Jeu', free: 'Gratuit', locked: 'Famille', open: 'Débloqué',
    askGrownUp: 'Demande à un adulte de le débloquer.', kidNote: 'Règle : un enfant ne voit jamais de prix, de bouton d’achat ni de compte à rebours. Les éléments verrouillés disent seulement « Demande à un adulte ».',
    gateH: 'Pour les adultes', gateQ: 'Pour continuer, touche la réponse : sept fois huit', gateOk: 'Merci ! Ouverture de la page parents sur le site IMAGINE.', gateNo: 'Ce n’est pas ça. Demande à un adulte.',
    whyH: 'Pourquoi ce contrôle', whyList: ['La question est écrite en lettres : un jeune enfant ne peut pas simplement lire le calcul.', 'Derrière ce contrôle, tout se passe sur le site adulte, pas dans l’appli enfants.', 'On ne demande jamais le nom, la date de naissance ou l’e-mail de l’enfant.'],
    plansH: 'Formules pour les parents', plansNote: 'Prix, prestataire de paiement et durée d’essai restent à décider. Le paiement se fait uniquement sur le site adulte ; l’appli enfants ne gère jamais d’argent.',
    plans: [ { tag: 'Maintenant', name: 'Gratuit', price: 'Sans compte', items: ['Le premier épisode de chaque monde', 'Quiz et jeux simples pour ces épisodes', 'Jeux de logique : niveaux facile et moyen', 'Voix et sous-titres en EN, FR et NL', 'Aucune progression enregistrée'] },
             { tag: 'Famille', name: 'Formule famille', price: 'Mensuelle ou annuelle · prix à décider', items: ['Tous les épisodes des cinq mondes', 'Tous les niveaux des jeux de logique', 'Défis difficiles (après l’échauffement)', 'Fiches d’activités à imprimer', 'Un seul code pour tous les appareils de la famille', 'Tableau de progression pour les parents (Enfant 1, Enfant 2 : aucun nom requis)'] },
             { tag: 'Plus tard', name: 'Pack école', price: 'Pour les classes et les enseignants', items: ['Tout le contenu de la formule famille', 'Guide de l’enseignant par épisode', 'Codes de classe, toujours sans données d’élèves'] } ],
    codeH: 'Débloquer avec le code famille', codeP: 'Après l’abonnement, le parent reçoit un code par e-mail et le tape dans l’appli enfants.', enter: 'Essayer le code', entered: 'Code saisi', codeOk: 'Tous les épisodes et les défis difficiles sont ouverts sur cet appareil.', lockAgain: 'Verrouiller',
    codeRulesH: 'Comment fonctionne le code', codeRules: ['Le code appartient à la formule famille, pas à un enfant.', 'Seul l’e-mail du parent est conservé, sur le site adulte, pour la facturation.', 'L’appli enfants vérifie le code et ne garde rien d’autre.', 'Les parents peuvent changer le code à tout moment s’il circule trop.', 'À décider : mémoriser le code sur l’appareil (simple stockage, sans suivi) ou le taper à chaque visite.'] },
  nl: { title: 'Gratis en gezinsabonnement (alleen ontwerp)', flow: 'Hoe een gezin meer ontgrendelt, zonder gegevens van kinderen', tabs: ['Wat een kind ziet', 'Alleen voor volwassenen', 'Abonnementen voor ouders', 'Gezinscode'],
    kidH: 'Energiewereld met Sunny', kidP: 'Gratis afleveringen starten meteen. De rest wacht op een gezinscode.', freeNow: 'Gratis versie', famNow: 'Gezinscode actief',
    epTitles: ['Hoe zet zonneschijn de lampen aan?', 'Het geheim van de wind', 'Stroom voor de nacht', 'De energiestad', 'Logische spelletjes: makkelijk en gemiddeld', 'Moeilijke uitdagingen'], ep: 'Aflevering', game: 'Spel', free: 'Gratis', locked: 'Gezin', open: 'Open',
    askGrownUp: 'Vraag een volwassene om dit te openen.', kidNote: 'Regel: een kind ziet nooit een prijs, een koopknop of een aftelklok. Bij vergrendelde onderdelen staat alleen “Vraag een volwassene”.',
    gateH: 'Voor volwassenen', gateQ: 'Tik om verder te gaan het antwoord aan: zeven keer acht', gateOk: 'Bedankt! De ouderpagina op de IMAGINE-site gaat open.', gateNo: 'Dat klopt niet. Vraag een volwassene om hulp.',
    whyH: 'Waarom deze controle', whyList: ['De vraag staat in woorden, zodat jonge kinderen de som niet zomaar kunnen aflezen.', 'Achter de controle gebeurt alles op de site voor volwassenen, niet in de kinder-app.', 'Er wordt nooit naar de naam, geboortedatum of het e-mailadres van het kind gevraagd.'],
    plansH: 'Abonnementen voor ouders', plansNote: 'Prijzen, betaalprovider en proefperiode moeten nog worden gekozen. Betalen gebeurt alleen op de site voor volwassenen; de kinder-app komt nooit aan geld.',
    plans: [ { tag: 'Nu', name: 'Gratis', price: 'Geen account nodig', items: ['De eerste aflevering van elke wereld', 'Quiz en eenvoudige spelletjes bij die afleveringen', 'Logische spelletjes: makkelijk en gemiddeld', 'Stemmen en ondertitels in EN, FR en NL', 'Er wordt geen voortgang bewaard'] },
             { tag: 'Gezin', name: 'Gezinsabonnement', price: 'Per maand of per jaar · prijs nog te bepalen', items: ['Alle afleveringen in alle vijf werelden', 'Alle niveaus van de logische spelletjes', 'Moeilijke uitdagingen (na de opwarmtest)', 'Werkbladen om te printen', 'Eén code voor alle apparaten in het gezin', 'Voortgangsoverzicht voor ouders (Kind 1, Kind 2: geen namen nodig)'] },
             { tag: 'Later', name: 'Schoolpakket', price: 'Voor klassen en leerkrachten', items: ['Alles uit het gezinsabonnement', 'Handleiding voor de leerkracht per aflevering', 'Klascodes, nog steeds zonder leerlinggegevens'] } ],
    codeH: 'Ontgrendel met de gezinscode', codeP: 'Na het abonneren krijgt de ouder een code per e-mail en typt die in de kinder-app.', enter: 'Probeer de code', entered: 'Code ingevoerd', codeOk: 'Alle afleveringen en moeilijke uitdagingen zijn nu open op dit apparaat.', lockAgain: 'Weer vergrendelen',
    codeRulesH: 'Hoe de code werkt', codeRules: ['De code hoort bij het gezinsabonnement, niet bij een kind.', 'Alleen het e-mailadres van de ouder wordt bewaard, op de site voor volwassenen, voor de facturatie.', 'De kinder-app controleert de code en bewaart verder niets.', 'Ouders kunnen de code altijd vernieuwen als hij te veel gedeeld wordt.', 'Nog te kiezen: de code op het apparaat onthouden (eenvoudige opslag, geen tracking) of elke keer intypen.'] }
};
var PLAN_STYLE = [ { color: '#7fe7ff', border: 'rgba(127,231,255,.4)' }, { color: '#ffd84c', border: '#ffd84c' }, { color: '#b98cff', border: 'rgba(185,140,255,.4)' } ];

class Component extends DCLogic {
  constructor(props) { super(props); this.state = { lang: 'en', tab: 0, unlocked: false, gate: 0 }; }
  renderVals() {
    var s = this.state, self = this, L = UI[s.lang];
    var langs = ['en', 'fr', 'nl'].map(function (k) { return { code: k.toUpperCase(), on: s.lang === k, cls: s.lang === k ? 'on' : '', pick: function () { self.setState({ lang: k }); } }; });
    var tabs = L.tabs.map(function (label, i) { return { n: i + 1, label: label, on: s.tab === i, cls: s.tab === i ? 'on' : '', pick: function () { self.setState({ tab: i }); } }; });
    var epNo = 0;
    var eps = EPS.map(function (e, i) {
      var locked = !e.free && !s.unlocked;
      var isGame = e.logic || e.ch;
      if (!isGame) epNo++;
      return { img: e.img, title: L.epTitles[i], num: isGame ? L.game : L.ep + ' ' + epNo, locked: locked, cls: locked ? 'locked' : '', op: locked ? 0.45 : 1,
        badge: e.free ? L.free : (locked ? L.locked : L.open), badgeBg: e.free ? '#38e1a0' : (locked ? '#b98cff' : '#ffd84c'), badgeFg: '#0b1530' };
    });
    var gateKeys = [54, 56, 63, 48].map(function (v) { return { v: v, border: s.gate === 0 ? 'rgba(255,255,255,.2)' : (v === 56 && s.gate === 1 ? '#38e1a0' : (s.gate === v ? '#ff8a8a' : 'rgba(255,255,255,.2)')), pick: function () { self.setState({ gate: v === 56 ? 1 : v }); } }; });
    var plans = L.plans.map(function (p, i) { return Object.assign({}, p, PLAN_STYLE[i]); });
    var codeParts = ['SUN', '4821', 'QBI'].map(function (v) { return { v: v, border: s.unlocked ? '#38e1a0' : 'rgba(255,255,255,.2)' }; });
    return {
      L: L, langs: langs, tabs: tabs, eps: eps, plans: plans, gateKeys: gateKeys, codeParts: codeParts,
      isKid: s.tab === 0, isGate: s.tab === 1, isPlans: s.tab === 2, isCode: s.tab === 3,
      statusText: s.unlocked ? L.famNow : L.freeNow, statusBg: s.unlocked ? 'rgba(255,216,76,.2)' : 'rgba(56,225,160,.18)', statusFg: s.unlocked ? '#ffd84c' : '#38e1a0',
      gateMsgOn: s.gate !== 0, gateMsg: s.gate === 1 ? L.gateOk : L.gateNo, gateMsgColor: s.gate === 1 ? '#38e1a0' : '#ff8a8a',
      unlocked: s.unlocked, codeBtn: s.unlocked ? L.entered : L.enter,
      enterCode: function () { self.setState({ unlocked: true }); }, lockAgain: function () { self.setState({ unlocked: false }); }
    };
  }
}

;return Component;
})();
