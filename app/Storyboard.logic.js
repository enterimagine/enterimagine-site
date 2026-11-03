window.__Component = (function () {

var IMG = { hero: 'assets/img_hero.webp', solar: 'assets/img_solar.webp', wind: 'assets/img_wind.webp', night: 'assets/img_night.webp', dali: 'assets/img_sunny.webp', ethan: 'assets/img_ethan.webp' };
var SCENES = [
  { img: 'hero', who: 'Sunny', time: '0:00', alt: 'Sunrise city', shot: 'Slow zoom over the sunrise city; title card.', en: 'Hi, I’m Sunny! Every lamp, tablet and fridge needs energy. But where does it come from?', fr: 'Salut, je suis Sunny ! Chaque lampe, tablette et frigo a besoin d’énergie. Mais d’où vient-elle ?', nl: 'Hoi, ik ben Sunny! Elke lamp, tablet en koelkast heeft energie nodig. Maar waar komt die vandaan?' },
  { img: 'solar', who: 'Sunny', time: '0:40', alt: 'Solar school', shot: 'Sunbeams flow into the roof panels; classroom lamps switch on.', en: 'Look up! The Sun sends us light. Solar panels catch that light and turn it into electricity.', fr: 'Regarde en l’air ! Le Soleil nous envoie de la lumière. Les panneaux solaires l’attrapent et la transforment en électricité.', nl: 'Kijk omhoog! De zon stuurt ons licht. Zonnepanelen vangen dat licht en maken er elektriciteit van.' },
  { img: 'wind', who: 'Sunny', time: '1:20', alt: 'Wind turbines', shot: 'Wind ribbons turn the blades; a glowing line runs to the town.', en: 'Wind can help too. It spins the blades of a wind turbine, and a generator inside makes electricity.', fr: 'Le vent peut aussi aider. Il fait tourner les pales d’une éolienne, et un générateur à l’intérieur produit de l’électricité.', nl: 'De wind helpt ook. Hij draait de wieken van een windmolen rond, en een generator binnenin maakt elektriciteit.' },
  { img: 'night', who: 'Sunny', time: '2:00', alt: 'Battery town at night', shot: 'Day fades to night; the big battery lights the houses.', en: 'But at night the Sun is gone, and some nights there is no wind. So we store energy in big batteries for later.', fr: 'Mais la nuit, il n’y a plus de soleil, et parfois pas de vent. Alors on garde l’énergie dans de grosses batteries pour plus tard.', nl: 'Maar ’s nachts is de zon weg, en soms waait het niet. Daarom bewaren we energie in grote batterijen voor later.' },
  { img: 'night', who: 'Whyzz', time: '2:45', alt: 'Explorer kids at night', shot: 'Whyzz steps in; dinner-table animation of energy being shared.', en: '“What if everyone switches everything on at once?” Then the grid has to share energy smartly, like passing plates at a big dinner.', fr: '« Et si tout le monde allume tout en même temps ? » Alors le réseau doit partager l’énergie intelligemment, comme on fait passer les plats à un grand repas.', nl: '“En als iedereen alles tegelijk aanzet?” Dan moet het net de energie slim verdelen, zoals je schalen doorgeeft aan een grote tafel.' },
  { img: 'hero', who: 'Sunny', time: '3:30', alt: 'Sunrise city', shot: 'Back to the city; buttons for Quiz, Play and Build appear.', en: 'Now you know! What would YOU power with sunshine and wind? Let’s build your idea.', fr: 'Maintenant tu sais ! Qu’est-ce que TOI tu alimenterais avec le soleil et le vent ? Invente ton idée.', nl: 'Nu weet je het! Wat zou JIJ laten werken op zon en wind? Bouw je eigen idee.' }
];
class Component extends DCLogic {
  renderVals() {
    return { scenes: SCENES.map(function (s, i) { return { n: 'Scene ' + (i + 1), time: s.time, img: IMG[s.img], alt: s.alt, who: s.who, avatar: s.who === 'Whyzz' ? IMG.ethan : IMG.dali, ring: s.who === 'Whyzz' ? '#ff8a8a' : '#38e1a0', en: s.en, fr: s.fr, nl: s.nl, shot: s.shot }; }) };
  }
}

;return Component;
})();
