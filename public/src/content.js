import { daliVisual } from './character-assets.js';
// Local, self-hosted assets (no third-party image hosts).
export const assets = {
  hero: daliVisual.hero,
  dali: daliVisual.portrait,
  sofia: '/assets/minds/sofia.webp',
  leo: '/assets/minds/leo.webp',
  maya: '/assets/minds/maya.webp',
  ethan: '/assets/minds/ethan.webp',
  'ai-data': '/assets/technology/ai-data.webp',
  'quantum-computing': '/assets/technology/quantum-computing.webp',
  energy: '/assets/technology/energy.webp',
  'smart-mobility': '/assets/technology/smart-mobility.webp',
  'smart-cities': '/assets/technology/smart-cities.webp',
  biotech: '/assets/technology/biotech.webp',
  robotics: '/assets/technology/robotics.webp',
  space: '/assets/technology/space.webp',
  innovation: '/assets/technology/innovation.webp'
};
const episodeId = 'when-gpus-meet-quantum-computing';
export const characters = [
  { id: 'dali', name: 'Dali', role: 'The Systems Thinker', tagline: 'Connects the systems.', focus: ['Smart Mobility', 'Energy', 'Future Systems'], description: 'Connects technology, infrastructure and human needs to see the bigger picture.', perspective: 'What happens when technologies stop evolving separately and start working as one system?', technologies: ['smart-mobility', 'energy', 'smart-cities'], episodes: ['when-mobility-meets-energy', 'when-stations-become-a-network', 'when-parking-goes-underground'] },
  { id: 'sofia', name: 'Sofia', role: 'The Intelligence Architect', tagline: 'Explores intelligence.', focus: ['AI', 'Data', 'Digital Intelligence'], description: 'Explores how intelligence, data and human creativity can work together to expand what is possible.', perspective: 'What happens when AI stops being just a tool and becomes a partner in how we think, create and solve problems?', technologies: ['ai-data', 'robotics', 'innovation'], episodes: [episodeId] },
  { id: 'leo', name: 'Leo', role: 'The Quantum Explorer', tagline: 'Tests the science.', focus: ['Quantum Computing', 'Advanced Science', 'Future Computing'], description: 'Looks beyond the limits of classical computing to explore entirely new ways of solving the impossible.', perspective: 'What becomes possible when computing is no longer limited by the rules we know today?', technologies: ['quantum-computing', 'space'], episodes: [episodeId] },
  { id: 'maya', name: 'Maya', role: 'The Life Innovator', tagline: 'Considers life and humanity.', focus: ['Biotech', 'Health', 'Human Longevity'], description: 'Explores how science and technology can help us live longer, healthier lives while working with nature rather than against it.', perspective: 'What happens when we learn not only to treat disease, but to understand and redesign the biology of life itself?', technologies: ['biotech'], episodes: [] },
  { id: 'ethan', name: 'Ethan', role: 'The Challenger', tagline: 'Challenges the assumptions.', focus: ['Risk & Ethics', 'Economics & Scalability', 'Technology Adoption', 'Critical Thinking'], description: 'Challenges assumptions and brings a practical perspective to ambitious ideas. He questions assumptions, exposes trade-offs and tests whether an idea can work responsibly in the real world.', perspective: 'But what are we missing?', technologies: ['innovation'], episodes: [episodeId, 'when-mobility-meets-energy', 'when-stations-become-a-network', 'when-parking-goes-underground'] }
].map(character => ({ ...character, portrait: assets[character.id], path: '/minds/' + character.id + '/' }));

// Broad editorial labels, not predictions of deployment dates.
const domain = (id, name, shortDescription, characters, relatedTechnologies, maturity, horizon) => ({
  id, name, shortDescription, description: shortDescription, image: assets[id],
  characters, relatedTechnologies, maturity, horizon,
  episodes: ['ai-data', 'quantum-computing'].includes(id) ? [episodeId] : id === 'energy' ? ['when-mobility-meets-energy', 'when-stations-become-a-network'] : id === 'smart-mobility' ? ['when-mobility-meets-energy', 'when-parking-goes-underground'] : id === 'smart-cities' ? ['when-stations-become-a-network', 'when-parking-goes-underground'] : [],
  path: '/explore/' + id + '/'
});
export const technologies = [
  domain('ai-data', 'AI & Data', 'Intelligence, creativity and new ways to solve problems.', ['sofia'], ['quantum-computing', 'robotics', 'innovation'], 'Established tools; evolving capabilities', 'Today and beyond'),
  domain('quantum-computing', 'Quantum Computing', 'Exploring a different way to compute the seemingly impossible.', ['leo'], ['ai-data', 'biotech', 'energy'], 'Emerging research', 'Experimental and longer term'),
  domain('energy', 'Energy', 'Cleaner power and the systems that could sustain our future.', ['dali'], ['smart-cities', 'smart-mobility'], 'Deployed and developing systems', 'Today and beyond'),
  domain('smart-mobility', 'Smart Mobility', 'Connecting people and places with more thoughtful movement.', ['dali'], ['energy', 'smart-cities'], 'Deployed and developing systems', 'Today and beyond'),
  domain('smart-cities', 'Smart Cities', 'Technology working together for more livable places.', ['dali'], ['energy', 'smart-mobility', 'ai-data'], 'Varies by city and system', 'Today and beyond'),
  domain('biotech', 'Biotech', 'Understanding life to imagine healthier human futures.', ['maya'], ['ai-data', 'quantum-computing'], 'Established science; emerging applications', 'Today and longer term'),
  domain('robotics', 'Robotics', 'Exploring how people and machines could work together.', ['sofia'], ['ai-data', 'smart-mobility'], 'Deployed tools; emerging capabilities', 'Today and beyond'),
  domain('space', 'Space', 'New horizons for discovery, science and human possibility.', ['leo'], ['robotics', 'energy'], 'Active exploration; speculative habitats', 'Today and longer term'),
  domain('innovation', 'Innovation', 'Connecting bold ideas with responsible real-world possibilities.', ['sofia', 'ethan'], ['ai-data', 'biotech', 'energy'], 'Varies by idea', 'Today and beyond')
];
export const episodes = [{
  id: episodeId, slug: episodeId, title: 'When GPUs Meet Quantum Computing',
  hook: 'What could become possible when two different ways of computing work together?',
  summary: 'Explore what could become possible when GPU-driven classical computing and emerging quantum computing are combined in hybrid systems.',
  number: 1, videoUrl: 'https://youtu.be/xQNSC8A-gUE', videoId: 'xQNSC8A-gUE', videoProvider: 'youtube',
  status: 'Published on YouTube',
  musicCredit: { attribution: '“Discovery” by Scott Buckley — released under CC BY 4.0.',
    website: 'https://www.scottbuckley.com.au', trackUrl: 'https://www.scottbuckley.com.au/library/discovery/',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    adaptation: 'Music excerpt edited, ducked beneath narration, and faded.' }, technologies: ['ai-data', 'quantum-computing'],
  characters: ['sofia', 'leo'], supportingCharacters: ['ethan'],
  classification: { maturity: 'Emerging research', horizon: 'Near-term experiments; longer-term possibilities' },
  applications: ['Drug discovery', 'Materials science', 'Optimization', 'Energy systems', 'Climate modeling', 'AI / scientific discovery'],
  currentReality: 'GPUs support AI and scientific computing. Quantum computing remains an emerging field, and hybrid approaches are being explored.',
  futurePossibility: 'Could hybrid systems help us discover better medicines, new materials or more efficient energy systems?',
  realismNotes: 'Ethan asks: where would a quantum approach offer a useful advantage, and what would it cost? Error correction, scale, economics, adoption and ethics all matter. These applications are possibilities to explore, not promised breakthroughs.',
  whatIfQuestion: 'What if different ways of computing could open new possibilities for human wellbeing?',
  artwork: '/assets/episodes/when-gpus-meet-quantum-computing.webp',
  artworkAlt: 'Illustrative GPU server racks linked by streams of light to a quantum computer, from IMAGINE Episode 001',
  relatedEpisodes: [], path: '/episodes/' + episodeId + '/'
}, {
  "id": "when-mobility-meets-energy",
  "slug": "when-mobility-meets-energy",
  "number": 2,
  "title": "When Mobility Meets Energy",
  "hook": "What if mobility helped balance the grid?",
  "summary": "Electric mobility changes when and where we need electricity. Explore how battery swapping, storage and smart charging could connect reliable transport with a more flexible energy system.",
  "videoProvider": "youtube",
  "videoId": "P87-QVoEYeo",
  "videoUrl": "https://youtu.be/P87-QVoEYeo",
  "status": "Published on YouTube",
  "artwork": "/assets/episodes/when-mobility-meets-energy.webp",
  "artworkAlt": "Illustrative battery-swap station with rooftop solar and an electric car, from IMAGINE Episode 002",
  "perspectiveLabel": "Editorial perspectives",
  "characters": [
    "dali"
  ],
  "supportingCharacters": [
    "ethan"
  ],
  "technologies": [
    "smart-mobility",
    "energy"
  ],
  "classification": {
    "maturity": "Operating systems; emerging integration",
    "horizon": "Today and future possibilities"
  },
  "applications": [
    "Reliable electric transport",
    "Flexible battery charging",
    "Energy storage",
    "Coordinated infrastructure"
  ],
  "currentReality": "Electric vehicles, charging infrastructure and compatible battery-swapping systems already operate. The ability to provide grid services depends on each installation, its equipment and permissions.",
  "futurePossibility": "Could coordinated stations charge batteries when supply is available and support the grid while keeping enough packs ready for drivers?",
  "realismNotes": "A battery cannot serve every need at once. Ready packs, safety, battery wear, cost and grid permissions determine whether a combined system is useful. Smart charging is another source of flexibility.",
  "whatIfQuestion": "What if keeping us moving could also help balance the grid?",
  "musicCredit": {
    "attribution": "“Discovery” by Scott Buckley. Released under Creative Commons Attribution 4.0 International (CC BY 4.0).",
    "website": "https://www.scottbuckley.com.au/",
    "trackUrl": "https://www.scottbuckley.com.au/library/discovery/",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "adaptation": "Music excerpt edited, ducked beneath narration, and faded."
  },
  "relatedEpisodes": [
    "when-gpus-meet-quantum-computing"
  ],
  "path": "/episodes/when-mobility-meets-energy/"
}, {
  "id": "when-stations-become-a-network",
  "slug": "when-stations-become-a-network",
  "number": 3,
  "title": "When Stations Become a Network",
  "hook": "What if stations could work together?",
  "summary": "One battery-swap station can store energy and give some back. Episode 003 asks what happens when many stations act as one: a network that keeps drivers moving while helping a grid under new pressure from AI and renewable power.",
  "videoProvider": "youtube",
  "videoId": "VZLM67NbZdQ",
  "videoUrl": "https://youtu.be/VZLM67NbZdQ",
  "status": "Published on YouTube",
  "artwork": "/assets/episodes/when-stations-become-a-network.webp",
  "artworkAlt": "Illustrative network of connected Energy Ports at night, from IMAGINE Episode 003",
  "perspectiveLabel": "Editorial perspectives",
  "characters": [
    "dali"
  ],
  "supportingCharacters": [
    "ethan"
  ],
  "technologies": [
    "energy",
    "smart-cities"
  ],
  "classification": {
    "maturity": "Operating pilots; emerging networks",
    "horizon": "Today and future possibilities"
  },
  "applications": [
    "Grid balancing",
    "Virtual power plants",
    "Local renewable storage",
    "Battery health and recycling"
  ],
  "currentReality": "Networks of battery-swap stations already take part in grid services in parts of China, responding to dispatch signals within seconds while continuing to serve drivers.",
  "futurePossibility": "Could coordinated stations become a distributed power reserve for cities, absorbing surplus solar and wind and smoothing sudden swings in demand?",
  "realismNotes": "Energy Ports are a concept, not an existing product. Grid rules, open battery standards, safety, battery wear and cost decide whether such networks can grow beyond pilots.",
  "whatIfQuestion": "What if thousands of small stations could act together as one power plant?",
  "relatedEpisodes": [
    "when-mobility-meets-energy"
  ],
  "path": "/episodes/when-stations-become-a-network/"
}, {
  "id": "when-parking-goes-underground",
  "slug": "when-parking-goes-underground",
  "number": 4,
  "title": "When Parking Goes Underground",
  "hook": "What if the best parking space is the one you never see?",
  "summary": "Surface parking takes up some of the most valuable land in our cities. Episode 004 imagines a glass pavilion on a city square: you drive in, step out, and the whole bay sinks below the street. Underground, a loop of ten self-moving bays keeps charging and brings your car back up, already facing the exit.",
  "videoProvider": "youtube",
  "videoId": "1jCs3TcN6uo",
  "videoUrl": "https://youtu.be/1jCs3TcN6uo",
  "status": "Published on YouTube",
  "artwork": "/assets/episodes/when-parking-goes-underground.webp",
  "artworkAlt": "Illustrative glass parking pavilion with an underground loop of car bays, from IMAGINE Episode 004",
  "perspectiveLabel": "Editorial perspectives",
  "characters": [
    "dali"
  ],
  "supportingCharacters": [
    "ethan"
  ],
  "technologies": [
    "smart-cities",
    "smart-mobility"
  ],
  "classification": {
    "maturity": "Automated parking operating; loop pavilion is a concept",
    "horizon": "Today and future possibilities"
  },
  "applications": [
    "Automated and mechanical parking",
    "License plate recognition",
    "Charging while parked",
    "Streets and squares returned to people"
  ],
  "currentReality": "Automated and mechanical parking systems already operate in cities today, and license plate recognition is standard at many parking garages.",
  "futurePossibility": "Could a drive-in, walk-away pavilion with a self-moving underground loop free city squares for trees, walkways and people while cars keep charging below?",
  "realismNotes": "The self-moving loop pavilion, its charging rail and the space figures shown are an IMAGINE concept, not an existing product. Digging costs, groundwater, fire safety and rescue access are real challenges that would need to be solved.",
  "whatIfQuestion": "What if the best parking space is the one you never see?",
  "relatedEpisodes": [
    "when-stations-become-a-network",
    "when-mobility-meets-energy"
  ],
  "path": "/episodes/when-parking-goes-underground/"
}];
export const characterById = Object.fromEntries(characters.map(item => [item.id, item]));
export const technologyById = Object.fromEntries(technologies.map(item => [item.id, item]));
