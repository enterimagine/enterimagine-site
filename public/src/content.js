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
  { id: 'dali', name: 'Dali', role: 'The Systems Thinker', tagline: 'Connects the systems.', focus: ['Smart Mobility', 'Energy', 'Future Systems'], description: 'Connects technology, infrastructure and human needs to see the bigger picture.', perspective: 'What happens when technologies stop evolving separately and start working as one system?', technologies: ['smart-mobility', 'energy', 'smart-cities'], episodes: ['when-mobility-meets-energy', 'when-stations-become-a-network', 'when-parking-goes-underground', 'when-data-centers-heat-our-homes', 'when-the-city-breathes', 'when-nothing-goes-to-waste'] },
  { id: 'sofia', name: 'Sofia', role: 'The Intelligence Architect', tagline: 'Explores intelligence.', focus: ['AI', 'Data', 'Digital Intelligence'], description: 'Explores how intelligence, data and human creativity can work together to expand what is possible.', perspective: 'What happens when AI stops being just a tool and becomes a partner in how we think, create and solve problems?', technologies: ['ai-data', 'robotics', 'innovation'], episodes: [episodeId, 'when-data-centers-heat-our-homes', 'when-nothing-goes-to-waste'] },
  { id: 'leo', name: 'Leo', role: 'The Quantum Explorer', tagline: 'Tests the science.', focus: ['Quantum Computing', 'Advanced Science', 'Future Computing'], description: 'Looks beyond the limits of classical computing to explore entirely new ways of solving the impossible.', perspective: 'What becomes possible when computing is no longer limited by the rules we know today?', technologies: ['quantum-computing', 'space'], episodes: [episodeId] },
  { id: 'maya', name: 'Maya', role: 'The Life Innovator', tagline: 'Considers life and humanity.', focus: ['Biotech', 'Health', 'Human Longevity'], description: 'Explores how science and technology can help us live longer, healthier lives while working with nature rather than against it.', perspective: 'What happens when we learn not only to treat disease, but to understand and redesign the biology of life itself?', technologies: ['biotech'], episodes: ['when-the-city-breathes'] },
  { id: 'ethan', name: 'Ethan', role: 'The Challenger', tagline: 'Challenges the assumptions.', focus: ['Risk & Ethics', 'Economics & Scalability', 'Technology Adoption', 'Critical Thinking'], description: 'Challenges assumptions and brings a practical perspective to ambitious ideas. He questions assumptions, exposes trade-offs and tests whether an idea can work responsibly in the real world.', perspective: 'But what are we missing?', technologies: ['innovation'], episodes: [episodeId, 'when-mobility-meets-energy', 'when-stations-become-a-network', 'when-parking-goes-underground', 'when-data-centers-heat-our-homes', 'when-the-city-breathes', 'when-nothing-goes-to-waste'] }
].map(character => ({ ...character, portrait: assets[character.id], path: '/minds/' + character.id + '/' }));

// Broad editorial labels, not predictions of deployment dates.
const domain = (id, name, shortDescription, characters, relatedTechnologies, maturity, horizon) => ({
  id, name, shortDescription, description: shortDescription, image: assets[id],
  characters, relatedTechnologies, maturity, horizon,
  episodes: ({ 'ai-data': [episodeId, 'when-data-centers-heat-our-homes'], 'quantum-computing': [episodeId], energy: ['when-mobility-meets-energy', 'when-stations-become-a-network', 'when-data-centers-heat-our-homes', 'when-the-city-breathes'], 'smart-mobility': ['when-mobility-meets-energy', 'when-parking-goes-underground'], 'smart-cities': ['when-stations-become-a-network', 'when-parking-goes-underground', 'when-data-centers-heat-our-homes', 'when-the-city-breathes', 'when-nothing-goes-to-waste'], biotech: ['when-the-city-breathes'], robotics: ['when-nothing-goes-to-waste'], innovation: ['when-nothing-goes-to-waste'] })[id] || [],
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
}, {
  "id": "when-data-centers-heat-our-homes",
  "slug": "when-data-centers-heat-our-homes",
  "number": 5,
  "title": "When Data Centers Heat Our Homes",
  "hook": "What if the cloud kept you warm?",
  "summary": "Almost every watt a server uses ends up as heat. Most of it is blown into the sky while homes nearby burn gas to stay warm. Episode 005 follows the heat and imagines a neighborhood built around its own data center: servers on the lower floors, homes above and a warm-water loop to the blocks around it.",
  "videoProvider": "youtube",
  "videoId": "DrPa-LhUmhE",
  "videoUrl": "https://youtu.be/DrPa-LhUmhE",
  "status": "Published on YouTube",
  "artwork": "/assets/episodes/when-data-centers-heat-our-homes.webp",
  "artworkAlt": "Illustrative cutaway of a data tower with servers on the lower floors and warm homes above on a snowy square, from IMAGINE Episode 005",
  "perspectiveLabel": "Editorial perspectives",
  "characters": [
    "dali",
    "sofia"
  ],
  "supportingCharacters": [
    "ethan"
  ],
  "technologies": [
    "energy",
    "smart-cities",
    "ai-data"
  ],
  "classification": {
    "maturity": "Data-center heat reuse operating; data tower is a concept",
    "horizon": "Today and future possibilities"
  },
  "applications": [
    "Data-center heat reuse",
    "District heating networks",
    "Heat pumps",
    "Seasonal heat storage"
  ],
  "currentReality": "Data-center heat already warms homes through district heating in Denmark, Finland and Sweden. In Odense about 9,000 homes are heated this way. EU and German rules now push large data centers to reuse their heat.",
  "futurePossibility": "Could a neighborhood be designed around its own data center, with servers below, homes above, a warm-water loop to the blocks around it and summer heat stored under the square for winter?",
  "realismNotes": "The data tower, its warm-water loop, the seasonal heat store and the Energy Port backup are an IMAGINE concept, not an existing project. A strong grid connection, safe separation of servers, batteries and homes and a backup heat source if the data center leaves are real challenges.",
  "whatIfQuestion": "What if the cloud kept you warm?",
  "musicCredit": {
    "attribution": "“Discovery” by Scott Buckley. Released under Creative Commons Attribution 4.0 International (CC BY 4.0).",
    "website": "https://www.scottbuckley.com.au/",
    "trackUrl": "https://www.scottbuckley.com.au/library/discovery/",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "adaptation": "Music excerpt edited, ducked beneath narration, and faded."
  },
  "relatedEpisodes": [
    "when-the-city-breathes",
    "when-parking-goes-underground"
  ],
  "path": "/episodes/when-data-centers-heat-our-homes/"
}, {
  "id": "when-the-city-breathes",
  "slug": "when-the-city-breathes",
  "number": 6,
  "title": "When the City Breathes",
  "hook": "What if every building were alive?",
  "summary": "Heatwaves bake the streets and summer storms overflow the drains. Episode 006 brings three living buildings together in one neighborhood: algae panels and trees on the walls, every roof and square catching rain and a cistern under the square that waters the plants and cools the servers.",
  "videoProvider": "youtube",
  "videoId": "xO_9WemSmPA",
  "videoUrl": "https://youtu.be/xO_9WemSmPA",
  "status": "Published on YouTube",
  "artwork": "/assets/episodes/when-the-city-breathes.webp",
  "artworkAlt": "Illustrative aerial view at dusk of a green glass tower topped with trees beside a square with fountains, from IMAGINE Episode 006",
  "perspectiveLabel": "Editorial perspectives",
  "characters": [
    "dali",
    "maya"
  ],
  "supportingCharacters": [
    "ethan"
  ],
  "technologies": [
    "smart-cities",
    "energy",
    "biotech"
  ],
  "classification": {
    "maturity": "Algae façades, forest towers and water squares exist; the breathing district is a concept",
    "horizon": "Today and future possibilities"
  },
  "applications": [
    "Algae façades",
    "Trees on buildings",
    "Water squares",
    "Rainwater reuse"
  ],
  "currentReality": "In Hamburg an apartment building grows algae in its glass panels, in Milan two towers carry more than seven hundred trees and in Rotterdam a square holds up to 1.8 million liters of storm water. Each exists today, but separately.",
  "futurePossibility": "Could one neighborhood do all three at once: algae and trees on every wall, rain caught by every roof and square and stored water that cools the streets and the servers?",
  "realismNotes": "Algae façades are still expensive and delicate and the Hamburg building delivered about half of its design output. Trees on towers need cranes, watering and constant care. No building can make all its own water, so the city's pipes stay as backup. The breathing district is an IMAGINE concept, not an existing project.",
  "whatIfQuestion": "What if every building were alive?",
  "musicCredit": {
    "attribution": "“Discovery” by Scott Buckley. Released under Creative Commons Attribution 4.0 International (CC BY 4.0).",
    "website": "https://www.scottbuckley.com.au/",
    "trackUrl": "https://www.scottbuckley.com.au/library/discovery/",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "adaptation": "Music excerpt edited, ducked beneath narration, and faded."
  },
  "relatedEpisodes": [
    "when-data-centers-heat-our-homes",
    "when-nothing-goes-to-waste"
  ],
  "path": "/episodes/when-the-city-breathes/"
},
{
  "id": "when-nothing-goes-to-waste",
  "slug": "when-nothing-goes-to-waste",
  "number": 7,
  "title": "When Nothing Goes to Waste",
  "hook": "What if a city never threw anything away?",
  "summary": "Every week trucks haul our trash out of town and most of it is never used again. Episode 007 imagines one loop under the streets: robot pods deliver parcels to every building, carry waste and broken things back to a recovery hub and send materials back to the makers.",
  "videoProvider": "youtube",
  "videoId": "1UxO2BE_eug",
  "videoUrl": "https://youtu.be/1UxO2BE_eug",
  "status": "Published on YouTube",
  "artwork": "/assets/episodes/when-nothing-goes-to-waste.webp",
  "artworkAlt": "Illustrative evening street where people look down through a glowing glass panel in the pavement at robot pods in a tunnel below, from IMAGINE Episode 007",
  "perspectiveLabel": "Editorial perspectives",
  "characters": [
    "dali",
    "sofia"
  ],
  "supportingCharacters": [
    "ethan"
  ],
  "technologies": [
    "smart-cities",
    "robotics",
    "innovation"
  ],
  "classification": {
    "maturity": "Vacuum waste collection, recycling robots and CO₂-storing concrete exist; the robot loop is a concept",
    "horizon": "Today and future possibilities"
  },
  "applications": [
    "Underground waste collection",
    "Recycling robots",
    "Buildings as material banks",
    "CO₂-storing concrete"
  ],
  "currentReality": "In parts of Stockholm trash already travels underground through vacuum pipes. Apple's recycling robot Daisy can take apart about two hundred iPhones an hour. New concrete can lock captured carbon dioxide into stone.",
  "futurePossibility": "Could one loop under the streets deliver everything a building needs and bring back everything it no longer uses, so a town keeps its materials in use?",
  "realismNotes": "Tunnels are costly and far easier to build in a new district than under an old city; in Switzerland, planning for the Cargo sous terrain freight tunnels was paused in 2025 because its private funding was not secured. Most products are not yet designed to be taken apart and some waste will always leave town. The robot loop and recovery hub are an IMAGINE concept; zero waste is a direction, not a promise.",
  "whatIfQuestion": "What if a city never threw anything away?",
  "musicCredit": {
    "attribution": "“Discovery” by Scott Buckley. Released under Creative Commons Attribution 4.0 International (CC BY 4.0).",
    "website": "https://www.scottbuckley.com.au/",
    "trackUrl": "https://www.scottbuckley.com.au/library/discovery/",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "adaptation": "Music excerpt edited, ducked beneath narration, and faded."
  },
  "relatedEpisodes": [
    "when-the-city-breathes",
    "when-parking-goes-underground"
  ],
  "path": "/episodes/when-nothing-goes-to-waste/"
}];
export const characterById = Object.fromEntries(characters.map(item => [item.id, item]));
export const technologyById = Object.fromEntries(technologies.map(item => [item.id, item]));
