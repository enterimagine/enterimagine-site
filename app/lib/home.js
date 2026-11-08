/* IMAGINE Kids home: language switch for the tiles. Nothing is stored; the
   chosen language travels in the link (#lang=fr) to the section you open. */
(function () {
  var T = {
    en: { tag: 'Technology education for young minds', grownline: 'Today’s lessons, tomorrow’s technology.', kids: 'Explore, play and practise', grown: 'For parents and teachers', hello: 'Pick a world to start.',
      t: { energy: ['Energy world', 'Watch Sunny, take the quiz and build your own power town'], episodes: ['Episodes', 'New episodes every day: from AI and space to smart cities and inventions'], subjects: ['School subjects', 'Tables, sums, subtraction, spelling, dictation and reading'], logic: ['Logic games', 'Patterns, turning shapes, sudoku and difficult challenges'], puzzles: ['Puzzle lab', 'Mirror images, counting cubes and mazes'],
        parents: ['Parent dashboard', 'Preview of the family plan'], school: ['School view', 'Preview for teachers'], family: ['Free and family plan', 'What a family plan adds'], story: ['How the videos are made', 'Storyboard of episode 1'], privacy: ['Privacy', 'No accounts, no cookies, nothing sent'] } },
    fr: { tag: 'L’éducation technologique pour les jeunes esprits', grownline: 'Les leçons d’aujourd’hui, la technologie de demain.', kids: 'Explorer, jouer et s’entraîner', grown: 'Pour les parents et les enseignants', hello: 'Choisis un monde pour commencer.',
      t: { energy: ['Monde de l’énergie', 'Regarde Sunny, fais le quiz et construis ta ville'], episodes: ['Épisodes', 'De nouveaux épisodes chaque jour : de l’IA et l’espace aux villes intelligentes et aux inventions'], subjects: ['Matières scolaires', 'Tables, calcul, soustraction, orthographe, dictée et lecture'], logic: ['Jeux de logique', 'Suites, formes qui tournent, sudoku et défis difficiles'], puzzles: ['Labo des énigmes', 'Images miroir, cubes à compter et labyrinthes'],
        parents: ['Tableau des parents', 'Aperçu de la formule famille'], school: ['Vue école', 'Aperçu pour les enseignants'], family: ['Gratuit et formule famille', 'Ce que la formule famille ajoute'], story: ['Comment on fait les vidéos', 'Storyboard de l’épisode 1'], privacy: ['Confidentialité', 'Pas de compte, pas de cookies, rien n’est envoyé'] } },
    nl: { tag: 'Technologieonderwijs voor jonge denkers', grownline: 'De lessen van vandaag, de technologie van morgen.', kids: 'Ontdekken, spelen en oefenen', grown: 'Voor ouders en leerkrachten', hello: 'Kies een wereld om te starten.',
      t: { energy: ['Energiewereld', 'Kijk naar Sunny, doe de quiz en bouw je eigen stroomstad'], episodes: ['Afleveringen', 'Elke dag nieuwe afleveringen: van AI en de ruimte tot slimme steden en uitvindingen'], subjects: ['Schoolvakken', 'Tafels, rekenen, aftrekken, spelling, dictee en lezen'], logic: ['Logische spelletjes', 'Reeksen, draaiende vormen, sudoku en moeilijke uitdagingen'], puzzles: ['Puzzellab', 'Spiegelbeelden, blokjes tellen en doolhoven'],
        parents: ['Overzicht voor ouders', 'Voorproefje van het gezinsabonnement'], school: ['Schoolweergave', 'Voorproefje voor leerkrachten'], family: ['Gratis en gezinsabonnement', 'Wat een gezinsabonnement toevoegt'], story: ['Zo maken we de video’s', 'Storyboard van aflevering 1'], privacy: ['Privacy', 'Geen accounts, geen cookies, niets verstuurd'] } }
  };
  function set(lang) {
    var L = T[lang]; document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = L[el.getAttribute('data-t')]; });
    document.querySelectorAll('[data-tile]').forEach(function (a) {
      var k = a.getAttribute('data-tile'), v = L.t[k];
      a.querySelector('.tt').textContent = v[0]; a.querySelector('.ts').textContent = v[1];
      a.setAttribute('href', a.getAttribute('data-href') + '#lang=' + lang);
    });
    document.querySelectorAll('[data-set]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set') === lang ? 'true' : 'false'); });
  }
  document.querySelectorAll('[data-set]').forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-set')); history.replaceState(null, '', '#lang=' + b.getAttribute('data-set')); }); });
  var m = /lang=(en|fr|nl)/.exec(location.hash);
  set(m ? m[1] : 'en');
})();
