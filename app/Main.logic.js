window.__Component = (function () {

var IMG = { hero: 'assets/img_hero.webp', solar: 'assets/img_solar.webp', wind: 'assets/img_wind.webp', night: 'assets/img_night.webp', dali: 'assets/img_sunny.webp', ethan: 'assets/img_ethan.webp' };
var VOICE = {
  en: ['assets/audio_webm_kids-voice-en1.webm','assets/audio_webm_kids-voice-en2.webm','assets/audio_webm_kids-voice-en3.webm','assets/audio_webm_kids-voice-en4.webm','assets/audio_webm_kids-voice-en5.webm','assets/audio_webm_kids-voice-en6.webm'],
  fr: ['assets/audio_webm_kids-voice-fr1.webm','assets/audio_webm_kids-voice-fr2.webm','assets/audio_webm_kids-voice-fr3.webm','assets/audio_webm_kids-voice-fr4.webm','assets/audio_webm_kids-voice-fr5.webm','assets/audio_webm_kids-voice-fr6.webm'],
  nl: ['assets/audio_webm_kids-voice-nl1.webm','assets/audio_webm_kids-voice-nl2.webm','assets/audio_webm_kids-voice-nl3.webm','assets/audio_webm_kids-voice-nl4.webm','assets/audio_webm_kids-voice-nl5.webm','assets/audio_webm_kids-voice-nl6.webm']
};
var ICON = {
  energy: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  ai: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V4z',
  quantum: 'M10.5 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M3 12c0-2.5 4-4.5 9-4.5s9 2 9 4.5-4 4.5-9 4.5-9-2-9-4.5zM7.5 4.2c2.2-1.2 5.8 1.3 8 5.6s2.2 8.9 0 10.1-5.8-1.3-8-5.6-2.2-8.9 0-10.1z',
  robotics: 'M5 8h14v11H5zM12 4v4M9 13h.01M15 13h.01M9 16h6',
  biotech: 'M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12M8 7h8M8 17h8',
  space: 'M7 12a5 5 0 1 0 10 0 5 5 0 1 0-10 0M3 15c2 2 16-4 18-8',
  cities: 'M3 21h18M5 21V9l5-3v15M10 21V4l9 4v13M14 10h2M14 14h2',
  mobility: 'M5 16h14v-4l-2-5H7l-2 5zM5 12h14M6.5 16a1.5 1.5 0 1 0 3 0M14.5 16a1.5 1.5 0 1 0 3 0',
  innovation: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z',
  school: 'M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5M12 9v.01',
  park: 'M12 22v-6M12 16a5 5 0 0 0 5-5 5 5 0 0 0-2-4 4 4 0 0 0-6 0 5 5 0 0 0-2 4 5 5 0 0 0 5 5z',
  street: 'M4 21L8 3M20 21L16 3M12 5v2M12 11v2M12 17v2',
  home: 'M3 11l9-7 9 7v10H3zM9 21v-6h6v6',
  dark: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  hot: 'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z',
  waste: 'M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5',
  charge: 'M3 8h15v8H3zM21 11v2M7 11v2M11 11v2',
  solar: 'M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  wind: 'M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7',
  battery: 'M3 8h15v8H3zM21 11v2M7 11v2M11 11v2',
  sensor: 'M10.5 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8',
  turbine: 'M12 10v12M9 22h6M12 10l-1-7M12 10l6 4M12 10l-6 3'
};
var KIDS = {
  langs: { en: 'English', fr: 'Français', nl: 'Nederlands' },
  ui: {
    en: { tagline: 'Powering up our future', voiceBtn: 'Voice', hello: 'Welcome, explorer!', intro: 'Pick a world, watch a short story, play and build your own idea.', explore: 'Start exploring', domains: 'Your universe', soon: 'Coming soon', open: 'Open', home: 'Home', watch: 'Watch', quiz: 'Quiz', play: 'Play', build: 'Build', adults: 'For parents & teachers', episode: 'Episode 1', epTitle: 'How does sunshine switch on the lights?', minutes: '4 min', next: 'Next', prev: 'Back', playBtn: 'Play', pauseBtn: 'Pause', voice: 'Voice and subtitles', afterEp: 'Great watching! What next?', quizTitle: 'Energy quiz', check: 'Check', nextQ: 'Next question', finish: 'See my score', score: 'You got {n} of {t} right!', again: 'Try again', badge: 'Badge earned: Sun Catcher', right: 'Yes!', wrongV: 'Not quite.', gameTitle: 'Power the town', gameIntro: 'Keep all four houses lit on a sunny day, a windy night and a calm night. You have {b} coins.', coins: 'Coins left', panel: 'Solar panel', turbine: 'Wind turbine', battery: 'Battery', cost: '{c} coin(s)', add: 'Add', remove: 'Remove', sunnyDay: 'Sunny day', windyNight: 'Windy night', calmNight: 'Calm night', lit: '{n} of 4 houses lit', allLit: 'All four houses are lit!', win: 'You powered the town in every situation! Badge earned: Town Lighter', tipCalm: 'Tip: on a calm night there is no sun and no wind. Where could energy come from?', tipDay: 'Tip: in the day, panels light the houses and fill the batteries.', tipStart: 'Add solar panels, wind turbines and batteries to light the houses.', buildTitle: 'Build your idea', place: '1. Where?', problem: '2. What is the problem?', helper: '3. Which helper?', yourIdea: 'Your idea card', pickAll: 'Pick a place, a problem and a helper to make your idea card.', ethanAsks: 'Whyzz asks', print: 'Print my idea card', keep: 'Your idea stays on this device. Nothing is sent anywhere.', adultsTitle: 'For parents & teachers', promise: 'Our promise', promiseShort: 'No accounts, no cookies, no tracking', promiseItems: ['No accounts and no sign-in', 'No cookies, no tracking, no ads', 'Children cannot type or upload anything', 'Badges are saved only in this browser'], teachersTitle: 'Coming later: class mode', teachersItems: ['A lesson plan for every episode', 'Printable quizzes and idea cards', 'A class idea wall, sent in and checked by the teacher'], teachersNote: 'Schools and institutions will be able to join the universe with their classes.', badges: 'My badges', none: 'none yet', sun: 'Sun Catcher', town: 'Town Lighter' },
    fr: { tagline: 'Donnons de l’énergie à notre avenir', voiceBtn: 'Voix', hello: 'Bienvenue, explorateur !', intro: 'Choisis un monde, regarde une petite histoire, joue et invente ta propre idée.', explore: 'Commencer l’exploration', domains: 'Ton univers', soon: 'Bientôt', open: 'Ouvrir', home: 'Accueil', watch: 'Regarder', quiz: 'Quiz', play: 'Jouer', build: 'Inventer', adults: 'Parents et enseignants', episode: 'Épisode 1', epTitle: 'Comment le soleil allume-t-il les lampes ?', minutes: '4 min', next: 'Suivant', prev: 'Retour', playBtn: 'Lire', pauseBtn: 'Pause', voice: 'Voix et sous-titres', afterEp: 'Bravo ! Et maintenant ?', quizTitle: 'Quiz de l’énergie', check: 'Vérifier', nextQ: 'Question suivante', finish: 'Voir mon score', score: 'Tu as {n} bonnes réponses sur {t} !', again: 'Réessayer', badge: 'Badge gagné : Attrape-soleil', right: 'Oui !', wrongV: 'Pas tout à fait.', gameTitle: 'Allume la ville', gameIntro: 'Garde les quatre maisons allumées par une journée ensoleillée, une nuit venteuse et une nuit calme. Tu as {b} pièces.', coins: 'Pièces restantes', panel: 'Panneau solaire', turbine: 'Éolienne', battery: 'Batterie', cost: '{c} pièce(s)', add: 'Ajouter', remove: 'Retirer', sunnyDay: 'Journée ensoleillée', windyNight: 'Nuit venteuse', calmNight: 'Nuit calme', lit: '{n} maisons sur 4 allumées', allLit: 'Les quatre maisons sont allumées !', win: 'Tu as alimenté la ville dans toutes les situations ! Badge gagné : Allumeur de ville', tipCalm: 'Astuce : par une nuit calme, il n’y a ni soleil ni vent. D’où peut venir l’énergie ?', tipDay: 'Astuce : le jour, les panneaux éclairent les maisons et remplissent les batteries.', tipStart: 'Ajoute des panneaux solaires, des éoliennes et des batteries pour éclairer les maisons.', buildTitle: 'Invente ton idée', place: '1. Où ?', problem: '2. Quel est le problème ?', helper: '3. Quel assistant ?', yourIdea: 'Ta carte idée', pickAll: 'Choisis un lieu, un problème et un assistant pour créer ta carte idée.', ethanAsks: 'Whyzz demande', print: 'Imprimer ma carte idée', keep: 'Ton idée reste sur cet appareil. Rien n’est envoyé.', adultsTitle: 'Pour les parents et les enseignants', promise: 'Notre promesse', promiseShort: 'Pas de compte, pas de cookies, pas de suivi', promiseItems: ['Pas de compte, pas de connexion', 'Pas de cookies, pas de suivi, pas de publicité', 'Les enfants ne peuvent rien écrire ni envoyer', 'Les badges restent uniquement dans ce navigateur'], teachersTitle: 'Bientôt : le mode classe', teachersItems: ['Une fiche de cours pour chaque épisode', 'Des quiz et des cartes idées à imprimer', 'Un mur d’idées de la classe, envoyé et vérifié par l’enseignant'], teachersNote: 'Les écoles et les institutions pourront rejoindre l’univers avec leurs classes.', badges: 'Mes badges', none: 'pas encore', sun: 'Attrape-soleil', town: 'Allumeur de ville' },
    nl: { tagline: 'Energie voor onze toekomst', voiceBtn: 'Stem', hello: 'Welkom, ontdekker!', intro: 'Kies een wereld, kijk een kort verhaal, speel en bouw je eigen idee.', explore: 'Begin met ontdekken', domains: 'Jouw universum', soon: 'Binnenkort', open: 'Openen', home: 'Start', watch: 'Kijken', quiz: 'Quiz', play: 'Spelen', build: 'Bouwen', adults: 'Ouders en leerkrachten', episode: 'Aflevering 1', epTitle: 'Hoe zet zonneschijn de lampen aan?', minutes: '4 min', next: 'Volgende', prev: 'Terug', playBtn: 'Afspelen', pauseBtn: 'Pauze', voice: 'Stem en ondertitels', afterEp: 'Goed gekeken! Wat nu?', quizTitle: 'Energiequiz', check: 'Controleer', nextQ: 'Volgende vraag', finish: 'Bekijk mijn score', score: 'Je hebt er {n} van de {t} goed!', again: 'Opnieuw', badge: 'Badge verdiend: Zonnevanger', right: 'Ja!', wrongV: 'Bijna.', gameTitle: 'Geef de stad stroom', gameIntro: 'Houd alle vier de huizen verlicht op een zonnige dag, een winderige nacht en een windstille nacht. Je hebt {b} munten.', coins: 'Munten over', panel: 'Zonnepaneel', turbine: 'Windmolen', battery: 'Batterij', cost: '{c} munt(en)', add: 'Toevoegen', remove: 'Weghalen', sunnyDay: 'Zonnige dag', windyNight: 'Winderige nacht', calmNight: 'Windstille nacht', lit: '{n} van de 4 huizen verlicht', allLit: 'Alle vier de huizen branden!', win: 'Je hebt de stad in elke situatie van stroom voorzien! Badge verdiend: Stadsverlichter', tipCalm: 'Tip: op een windstille nacht is er geen zon en geen wind. Waar kan de energie vandaan komen?', tipDay: 'Tip: overdag verlichten de panelen de huizen en vullen ze de batterijen.', tipStart: 'Voeg zonnepanelen, windmolens en batterijen toe om de huizen te verlichten.', buildTitle: 'Bouw je idee', place: '1. Waar?', problem: '2. Wat is het probleem?', helper: '3. Welke helper?', yourIdea: 'Jouw ideekaart', pickAll: 'Kies een plek, een probleem en een helper om je ideekaart te maken.', ethanAsks: 'Whyzz vraagt', print: 'Druk mijn ideekaart af', keep: 'Je idee blijft op dit apparaat. Er wordt niets verstuurd.', adultsTitle: 'Voor ouders en leerkrachten', promise: 'Onze belofte', promiseShort: 'Geen account, geen cookies, geen tracking', promiseItems: ['Geen account en niet inloggen', 'Geen cookies, geen tracking, geen reclame', 'Kinderen kunnen niets typen of uploaden', 'Badges worden alleen in deze browser bewaard'], teachersTitle: 'Later: klasmodus', teachersItems: ['Een lesplan bij elke aflevering', 'Quizzen en ideekaarten om af te drukken', 'Een ideeënmuur van de klas, ingestuurd en gecontroleerd door de leerkracht'], teachersNote: 'Scholen en instellingen kunnen later met hun klassen aansluiten bij het universum.', badges: 'Mijn badges', none: 'nog geen', sun: 'Zonnevanger', town: 'Stadsverlichter' },
  },
  domains: [
    { id: 'energy', color: '#38e1a0', open: true, name: { en: 'Energy', fr: 'Énergie', nl: 'Energie' } },
    { id: 'ai', color: '#4cc3ff', name: { en: 'AI & Data', fr: 'IA et données', nl: 'AI en data' } },
    { id: 'quantum', color: '#b98cff', name: { en: 'Quantum', fr: 'Quantique', nl: 'Quantum' } },
    { id: 'robotics', color: '#ff9a4c', name: { en: 'Robotics', fr: 'Robotique', nl: 'Robotica' } },
    { id: 'biotech', color: '#ff7fdc', name: { en: 'Biotech', fr: 'Biotech', nl: 'Biotech' } },
    { id: 'space', color: '#8fa4ff', name: { en: 'Space', fr: 'Espace', nl: 'Ruimte' } },
    { id: 'cities', color: '#ffd84c', name: { en: 'Smart Cities', fr: 'Villes intelligentes', nl: 'Slimme steden' } },
    { id: 'mobility', color: '#ff8a8a', name: { en: 'Smart Mobility', fr: 'Mobilité', nl: 'Slimme mobiliteit' } },
    { id: 'innovation', color: '#ffe066', name: { en: 'Innovation', fr: 'Innovation', nl: 'Innovatie' } }
  ],
  scenes: [
    { img: 'hero', who: 'Sunny', alt: 'A sunrise city full of lights', t: { en: 'Hi, I’m Sunny! Every lamp, tablet and fridge needs energy. But where does it come from?', fr: 'Salut, je suis Sunny ! Chaque lampe, tablette et frigo a besoin d’énergie. Mais d’où vient-elle ?', nl: 'Hoi, ik ben Sunny! Elke lamp, tablet en koelkast heeft energie nodig. Maar waar komt die vandaan?' } },
    { img: 'solar', who: 'Sunny', alt: 'A school with solar panels catching sunlight', t: { en: 'Look up! The Sun sends us light. Solar panels catch that light and turn it into electricity.', fr: 'Regarde en l’air ! Le Soleil nous envoie de la lumière. Les panneaux solaires l’attrapent et la transforment en électricité.', nl: 'Kijk omhoog! De zon stuurt ons licht. Zonnepanelen vangen dat licht en maken er elektriciteit van.' } },
    { img: 'wind', who: 'Sunny', alt: 'Wind turbines on green hills sending energy to a town', t: { en: 'Wind can help too. It spins the blades of a wind turbine, and a generator inside makes electricity.', fr: 'Le vent peut aussi aider. Il fait tourner les pales d’une éolienne, et un générateur à l’intérieur produit de l’électricité.', nl: 'De wind helpt ook. Hij draait de wieken van een windmolen rond, en een generator binnenin maakt elektriciteit.' } },
    { img: 'night', who: 'Sunny', alt: 'A town at night lit by a big glowing battery', t: { en: 'But at night the Sun is gone, and some nights there is no wind. So we store energy in big batteries for later.', fr: 'Mais la nuit, il n’y a plus de soleil, et parfois pas de vent. Alors on garde l’énergie dans de grosses batteries pour plus tard.', nl: 'Maar ’s nachts is de zon weg, en soms waait het niet. Daarom bewaren we energie in grote batterijen voor later.' } },
    { img: 'night', who: 'Whyzz', alt: 'The town at night with the explorer kids', both: true, t: { en: '“What if everyone switches everything on at once?” Then the grid has to share energy smartly, like passing plates at a big dinner.', fr: '« Et si tout le monde allume tout en même temps ? » Alors le réseau doit partager l’énergie intelligemment, comme on fait passer les plats à un grand repas.', nl: '“En als iedereen alles tegelijk aanzet?” Dan moet het net de energie slim verdelen, zoals je schalen doorgeeft aan een grote tafel.' } },
    { img: 'hero', who: 'Sunny', alt: 'The sunrise city again', t: { en: 'Now you know! What would YOU power with sunshine and wind? Let’s build your idea.', fr: 'Maintenant tu sais ! Qu’est-ce que TOI tu alimenterais avec le soleil et le vent ? Invente ton idée.', nl: 'Nu weet je het! Wat zou JIJ laten werken op zon en wind? Bouw je eigen idee.' } }
  ],
  quiz: [
    { q: { en: 'What do solar panels catch?', fr: 'Qu’est-ce que les panneaux solaires attrapent ?', nl: 'Wat vangen zonnepanelen op?' }, a: [ { en: 'Sunlight', fr: 'La lumière du soleil', nl: 'Zonlicht' }, { en: 'Rain', fr: 'La pluie', nl: 'Regen' }, { en: 'Sound', fr: 'Le bruit', nl: 'Geluid' } ], ok: 0, why: { en: 'Solar panels turn sunlight into electricity.', fr: 'Les panneaux solaires transforment la lumière du soleil en électricité.', nl: 'Zonnepanelen maken van zonlicht elektriciteit.' } },
    { q: { en: 'What spins the blades of a wind turbine?', fr: 'Qu’est-ce qui fait tourner les pales d’une éolienne ?', nl: 'Wat laat de wieken van een windmolen draaien?' }, a: [ { en: 'A motor', fr: 'Un moteur', nl: 'Een motor' }, { en: 'The wind', fr: 'Le vent', nl: 'De wind' }, { en: 'The Moon', fr: 'La Lune', nl: 'De maan' } ], ok: 1, why: { en: 'The wind pushes the blades, and a generator inside makes electricity.', fr: 'Le vent pousse les pales, et un générateur produit de l’électricité.', nl: 'De wind duwt de wieken, en een generator maakt elektriciteit.' } },
    { q: { en: 'Why do we need batteries?', fr: 'Pourquoi a-t-on besoin de batteries ?', nl: 'Waarom hebben we batterijen nodig?' }, a: [ { en: 'To make the Sun shine', fr: 'Pour faire briller le soleil', nl: 'Om de zon te laten schijnen' }, { en: 'To make wind', fr: 'Pour faire du vent', nl: 'Om wind te maken' }, { en: 'To keep energy for later', fr: 'Pour garder l’énergie pour plus tard', nl: 'Om energie te bewaren voor later' } ], ok: 2, why: { en: 'Batteries store energy from sunny or windy moments for the night.', fr: 'Les batteries gardent l’énergie des moments de soleil ou de vent pour la nuit.', nl: 'Batterijen bewaren energie van zonnige of winderige momenten voor de nacht.' } },
    { q: { en: 'When does a solar panel make the most electricity?', fr: 'Quand un panneau solaire produit-il le plus d’électricité ?', nl: 'Wanneer maakt een zonnepaneel de meeste elektriciteit?' }, a: [ { en: 'At midnight', fr: 'À minuit', nl: 'Om middernacht' }, { en: 'On a sunny day around noon', fr: 'Par une journée ensoleillée vers midi', nl: 'Op een zonnige dag rond de middag' }, { en: 'In thick fog', fr: 'Dans un épais brouillard', nl: 'In dikke mist' } ], ok: 1, why: { en: 'The more sunlight reaches the panel, the more electricity it makes.', fr: 'Plus le panneau reçoit de lumière, plus il produit d’électricité.', nl: 'Hoe meer zonlicht op het paneel valt, hoe meer elektriciteit het maakt.' } },
    { q: { en: 'Whyzz’s question: what if everyone switches on at once?', fr: 'La question de Whyzz : et si tout le monde allume en même temps ?', nl: 'De vraag van Whyzz: wat als iedereen tegelijk alles aanzet?' }, a: [ { en: 'The grid must share energy smartly', fr: 'Le réseau doit partager l’énergie intelligemment', nl: 'Het net moet de energie slim verdelen' }, { en: 'Nothing happens', fr: 'Rien ne se passe', nl: 'Er gebeurt niets' }, { en: 'The lamps get brighter', fr: 'Les lampes brillent plus fort', nl: 'De lampen gaan feller branden' } ], ok: 0, why: { en: 'Energy has to be shared so everyone has enough at the same moment.', fr: 'Il faut partager l’énergie pour que chacun en ait assez au même moment.', nl: 'Energie moet verdeeld worden zodat iedereen op hetzelfde moment genoeg heeft.' } }
  ],
  build: {
    place: [ { k: 'school', t: { en: 'my school', fr: 'mon école', nl: 'mijn school' } }, { k: 'park', t: { en: 'the park', fr: 'le parc', nl: 'het park' } }, { k: 'street', t: { en: 'my street', fr: 'ma rue', nl: 'mijn straat' } }, { k: 'home', t: { en: 'my home', fr: 'ma maison', nl: 'mijn huis' } } ],
    problem: [ { k: 'dark', t: { en: 'it is too dark at night', fr: 'il fait trop sombre la nuit', nl: 'het is ’s nachts te donker' } }, { k: 'hot', t: { en: 'it gets too hot', fr: 'il fait trop chaud', nl: 'het wordt te warm' } }, { k: 'waste', t: { en: 'energy is wasted', fr: 'on gaspille de l’énergie', nl: 'er wordt energie verspild' } }, { k: 'charge', t: { en: 'there is nowhere to charge', fr: 'il n’y a nulle part où recharger', nl: 'er is nergens om op te laden' } } ],
    helper: [ { k: 'solar', t: { en: 'solar panels', fr: 'des panneaux solaires', nl: 'zonnepanelen' } }, { k: 'wind', t: { en: 'a small wind turbine', fr: 'une petite éolienne', nl: 'een kleine windmolen' } }, { k: 'battery', t: { en: 'a big battery', fr: 'une grosse batterie', nl: 'een grote batterij' } }, { k: 'sensor', t: { en: 'a smart sensor', fr: 'un capteur intelligent', nl: 'een slimme sensor' } } ],
    sentence: { en: 'At {place}, {problem}. My idea: use {helper} to fix it!', fr: 'À {place}, {problem}. Mon idée : utiliser {helper} pour régler ça !', nl: 'Bij {place}: {problem}. Mijn idee: gebruik {helper} om het op te lossen!' },
    ethan: { en: ['Where does the energy come from on a cloudy day?', 'Who will look after it?', 'How much space does it need?'], fr: ['D’où vient l’énergie un jour nuageux ?', 'Qui va s’en occuper ?', 'Combien de place faut-il ?'], nl: ['Waar komt de energie vandaan op een bewolkte dag?', 'Wie gaat ervoor zorgen?', 'Hoeveel ruimte is er nodig?'] }
  }
};
var BUDGET = 10, COST = { panel: 1, turbine: 2, battery: 2 };
function fill(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { lang: 'en', screen: 'home', scene: 0, playing: false, epDone: false, qi: 0, picked: -1, checked: false, score: 0, quizDone: false, panel: 0, turbine: 0, battery: 0, place: -1, problem: -1, helper: -1, badgeSun: false, badgeTown: false, voiceOn: true };
  }
  componentDidMount() {
    var self = this;
    this.audio = null;
    try { this.audio = new Audio(); this.audio.preload = 'auto'; } catch (e) {}
    if (this.audio) {
      this.audio.addEventListener('ended', function () { self.advance(); });
      this.audio.addEventListener('error', function () { self.fallback = setTimeout(function () { self.advance(); }, 6500); });
    }
    this.timer = setInterval(function () {
      var st = self.state;
      if (!st.playing || st.screen !== 'ep' || st.voiceOn) return;
      self.advance();
    }, 6500);
  }
  componentDidUpdate(prevProps, prevState) {
    var st = this.state, p = prevState || {};
    if (st.screen === p.screen && st.scene === p.scene && st.lang === p.lang && st.playing === p.playing && st.voiceOn === p.voiceOn) return;
    clearTimeout(this.fallback);
    if (!this.audio) return;
    if (st.playing && st.screen === 'ep' && st.voiceOn) {
      var src = VOICE[st.lang][st.scene];
      if (this.currentSrc !== src || st.scene !== p.scene || st.lang !== p.lang) { this.audio.src = src; this.currentSrc = src; try { this.audio.currentTime = 0; } catch (e) {} }
      var pr = this.audio.play(); if (pr && pr.catch) pr.catch(function () {});
    } else {
      this.audio.pause();
    }
  }
  componentWillUnmount() { clearInterval(this.timer); clearTimeout(this.fallback); if (this.audio) this.audio.pause(); }
  advance() {
    var st = this.state;
    if (!st.playing || st.screen !== 'ep') return;
    if (st.scene >= KIDS.scenes.length - 1) this.setState({ playing: false, epDone: true });
    else this.setState({ scene: st.scene + 1 });
  }
  go(screen) { this.setState({ screen: screen, playing: false }); try { window.scrollTo(0, 0); } catch (e) {} }
  energy() {
    var p = this.state.panel, t = this.state.turbine, b = this.state.battery;
    var day = 2 * p;
    var charged = Math.max(0, Math.min(b, Math.floor((day - 4) / 2)));
    return { day: day, windy: 2 * t + 2 * charged, calm: 2 * charged, charged: charged };
  }
  renderVals() {
    var s = this.state, lang = s.lang, L = KIDS.ui[lang], self = this;
    var nav = [['home', L.home], ['ep', L.watch], ['quiz', L.quiz], ['game', L.play], ['build', L.build], ['adults', L.adults]].map(function (n) {
      return { label: n[1], cls: s.screen === n[0] ? 'on' : '', go: function () { self.go(n[0]); } };
    });
    var langs = Object.keys(KIDS.langs).map(function (k) { return { code: k.toUpperCase(), name: KIDS.langs[k], on: lang === k, cls: lang === k ? 'on' : '', pick: function () { self.setState({ lang: k }); } }; });
    var domains = KIDS.domains.map(function (d) {
      return { name: d.name[lang], color: d.color, ic: ICON[d.id], bg: d.color + '22', border: d.open ? d.color : 'rgba(255,255,255,.12)', cls: d.open ? '' : 'locked', locked: !d.open, status: d.open ? L.open : L.soon, go: function () { if (d.open) self.go('ep'); } };
    });
    var sc = KIDS.scenes[s.scene];
    var scene = { key: 'sc' + s.scene, img: IMG[sc.img], alt: sc.alt, who: sc.who, text: sc.t[lang], avatar: sc.who === 'Whyzz' ? IMG.ethan : IMG.dali, ring: sc.who === 'Whyzz' ? '#ff8a8a' : '#38e1a0' };
    var dots = KIDS.scenes.map(function (x, i) { return { w: i === s.scene ? '34px' : '12px', c: i <= s.scene ? '#ffd84c' : 'rgba(255,255,255,.25)' }; });
    // quiz
    var Q = KIDS.quiz[s.qi], isRight = s.picked === Q.ok;
    var qOpts = Q.a.map(function (a, i) {
      var cls = '';
      if (s.checked) cls = i === Q.ok ? 'right' : (i === s.picked ? 'wrong' : '');
      else if (i === s.picked) cls = 'picked';
      return { text: a[lang], cls: cls, pick: function () { if (!s.checked) self.setState({ picked: i }); } };
    });
    var lastQ = s.qi === KIDS.quiz.length - 1;
    var qAction = function () {
      if (!s.checked) { if (s.picked < 0) return; self.setState({ checked: true, score: s.score + (s.picked === Q.ok ? 1 : 0) }); }
      else if (lastQ) self.setState({ quizDone: true, badgeSun: true });
      else self.setState({ qi: s.qi + 1, picked: -1, checked: false });
    };
    // game
    var E = this.energy();
    var spent = s.panel * COST.panel + s.turbine * COST.turbine + s.battery * COST.battery;
    var left = BUDGET - spent;
    var shop = [['panel', ICON.solar], ['turbine', ICON.turbine], ['battery', ICON.battery]].map(function (x) {
      var k = x[0], n = s[k];
      var u = {}; u[k] = n + 1; var d = {}; d[k] = Math.max(0, n - 1);
      return { name: L[k], ic: x[1], n: n, cost: fill(L.cost, { c: COST[k] }), cantAdd: left < COST[k], plus: function () { if (left >= COST[k]) self.setState(u); }, minus: function () { self.setState(d); }, plusLabel: L.add + ' ' + L[k], minusLabel: L.remove + ' ' + L[k] };
    });
    function scen(name, supply, look) {
      var lit = Math.min(4, Math.floor(supply));
      var houses = [0, 1, 2, 3].map(function (i) { return { fill: i < lit ? '#ffd84c' : 'rgba(255,255,255,.08)', stroke: i < lit ? '#c9a320' : 'rgba(255,255,255,.4)' }; });
      return { name: name, houses: houses, status: lit === 4 ? L.allLit : fill(L.lit, { n: lit }), bg: look.bg, border: lit === 4 ? '#38e1a0' : look.border, ink: look.ink, ok: lit === 4 };
    }
    var scenarios = [
      scen(L.sunnyDay, E.day, { bg: 'rgba(127,231,255,.14)', border: 'rgba(127,231,255,.35)', ink: '#eaf8ff' }),
      scen(L.windyNight, E.windy, { bg: 'rgba(80,70,180,.25)', border: 'rgba(160,150,255,.35)', ink: '#ece9ff' }),
      scen(L.calmNight, E.calm, { bg: 'rgba(20,20,60,.6)', border: 'rgba(255,255,255,.18)', ink: '#e6e9ff' })
    ];
    var allOk = scenarios.every(function (x) { return x.ok; });
    if (allOk && !s.badgeTown) setTimeout(function () { self.setState({ badgeTown: true }); }, 0);
    var gameMsg = spent === 0 ? L.tipStart : allOk ? L.win : !scenarios[0].ok ? L.tipDay : L.tipCalm;
    // build
    var picks = { place: s.place, problem: s.problem, helper: s.helper };
    var labels = { place: L.place, problem: L.problem, helper: L.helper };
    var groups = ['place', 'problem', 'helper'].map(function (g) {
      return { label: labels[g], items: KIDS.build[g].map(function (it, i) {
        var u = {}; u[g] = i;
        return { text: cap(it.t[lang]), ic: ICON[it.k], on: picks[g] === i, cls: picks[g] === i ? 'on' : '', pick: function () { self.setState(u); } };
      }) };
    });
    var complete = s.place >= 0 && s.problem >= 0 && s.helper >= 0;
    var cardText = complete ? fill(KIDS.build.sentence[lang], { place: KIDS.build.place[s.place].t[lang], problem: KIDS.build.problem[s.problem].t[lang], helper: KIDS.build.helper[s.helper].t[lang] }) : L.pickAll;
    var eq = KIDS.build.ethan[lang];
    var cardIcons = ['place', 'problem', 'helper'].map(function (g) { return { ic: picks[g] >= 0 ? ICON[KIDS.build[g][picks[g]].k] : 'M12 8v.01M12 11v5' }; });
    var badges = [];
    if (s.badgeSun) badges.push(L.sun);
    if (s.badgeTown) badges.push(L.town);
    return {
      L: L, nav: nav, langs: langs, langName: KIDS.langs[lang], domains: domains, domainName: KIDS.domains[0].name[lang],
      isHome: s.screen === 'home', isEp: s.screen === 'ep', isQuiz: s.screen === 'quiz', isGame: s.screen === 'game', isBuild: s.screen === 'build', isAdults: s.screen === 'adults',
      goHome: function () { self.go('home'); }, goEp: function () { self.setState({ screen: 'ep', scene: 0, epDone: false, playing: true }); },
      goQuiz: function () { self.go('quiz'); }, goGame: function () { self.go('game'); }, goBuild: function () { self.go('build'); },
      voiceOn: s.voiceOn, toggleVoice: function () { self.setState({ voiceOn: !s.voiceOn }); }, voiceIcon: s.voiceOn ? 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11' : 'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6',
      scene: scene, dots: dots, sceneCounter: (s.scene + 1) + ' / ' + KIDS.scenes.length, playing: s.playing, notPlaying: !s.playing, playLabel: s.playing ? L.pauseBtn : L.playBtn, epDone: s.epDone,
      togglePlay: function () { if (s.epDone || s.scene >= KIDS.scenes.length - 1) self.setState({ scene: 0, epDone: false, playing: true }); else self.setState({ playing: !s.playing }); },
      prevScene: function () { self.setState({ scene: Math.max(0, s.scene - 1), playing: false }); },
      nextScene: function () { if (s.scene >= KIDS.scenes.length - 1) self.setState({ epDone: true, playing: false }); else self.setState({ scene: s.scene + 1, playing: false }); },
      quizRunning: !s.quizDone, quizDone: s.quizDone, quizKey: 'q' + s.qi, quizCounter: (s.qi + 1) + ' / ' + KIDS.quiz.length,
      qText: Q.q[lang], qOpts: qOpts, qChecked: s.checked, qVerdict: isRight ? L.right : L.wrongV, qVerdictColor: isRight ? '#38e1a0' : '#ff8a8a', qWhy: Q.why[lang],
      qAction: qAction, qActionDisabled: !s.checked && s.picked < 0, qActionLabel: !s.checked ? L.check : (lastQ ? L.finish : L.nextQ),
      quizScore: fill(L.score, { n: s.score, t: KIDS.quiz.length }), quizRestart: function () { self.setState({ qi: 0, picked: -1, checked: false, score: 0, quizDone: false }); },
      gameIntro: fill(L.gameIntro, { b: BUDGET }), shop: shop, coinsLeft: left, scenarios: scenarios, gameMsg: gameMsg, gameMsgKey: gameMsg, gameMsgBg: allOk ? 'rgba(56,225,160,.18)' : 'rgba(255,255,255,.07)', gameMsgAvatar: allOk ? IMG.dali : IMG.ethan,
      groups: groups, cardText: cardText, cardKey: cardText, cardIcons: cardIcons, ethanQ: complete ? eq[(s.place + s.problem + s.helper) % eq.length] : eq[0], printCard: function () { try { window.print(); } catch (e) {} },
      promiseItems: L.promiseItems, teacherItems: L.teachersItems, badgeText: badges.length ? badges.join(' · ') : L.none
    };
  }
}

;return Component;
})();
