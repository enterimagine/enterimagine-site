import { characters, technologies, episodes } from './content.js';

// Editorial classifications apply to a named capability, never an entire field.
export const maturityLevels = [
  { id:'established', label:'Established', description:'Technology already widely deployed or operational.' },
  { id:'emerging', label:'Emerging', description:'Real systems and deployments exist, but capability or adoption is still developing.' },
  { id:'experimental', label:'Experimental', description:'Active research and prototypes exist, but practical utility remains uncertain or limited.' },
  { id:'imagined', label:'Imagined', description:'A speculative future scenario used by EnterImagine to explore what could become possible.' }
];
const capability = (status, scope, note) => ({status, scope, note});
export const capabilityProfiles = {
  'ai-data': [
    capability('established','GPUs for AI','GPU computing is used for AI training and inference; individual models still need evaluation.'),
    capability('imagined','AI as a dependable discovery partner','The broader future role explored here depends on reliable results and human oversight.')
  ],
  'quantum-computing': [
    capability('experimental','Useful quantum computation on selected problems','Research hardware and algorithms exist; practical advantage must be demonstrated for the specific task.'),
    capability('imagined','Transformative quantum-assisted discovery','Future breakthroughs are questions to explore, not established outcomes.')
  ],
  energy: [
    capability('emerging','Coordinated storage and smart-grid integration','Real systems exist; adoption, resilience and performance depend on the location and design.'),
    capability('imagined','Seamlessly adaptive clean-energy networks','A systems-level future scenario, not a claim that every grid operates this way.')
  ],
  'smart-mobility': [
    capability('established','Driver-assistance features','Available features assist drivers; they do not establish fully autonomous operation.'),
    capability('imagined','Seamless citywide autonomous mobility','A future scenario requiring validated safety, infrastructure and responsible adoption.')
  ],
  'smart-cities': [
    capability('emerging','Connected monitoring of urban infrastructure','Real deployments support selected services; capability and integration vary by city.'),
    capability('imagined','A city operating as one adaptive system','The coordinated future explored here requires governance, privacy and community participation.')
  ],
  biotech: [
    capability('experimental','New molecular treatment approaches under investigation','Research and clinical development are application-specific; safety and benefit require evidence.'),
    capability('imagined','Broad gains in healthy human longevity','An aspirational future scenario, not a demonstrated promise to reverse ageing.')
  ],
  robotics: [
    capability('established','Automation of defined industrial tasks','Robots operate in structured settings; this does not imply general physical intelligence.'),
    capability('imagined','Adaptable assistance across everyday environments','The wider collaboration imagined here depends on safe, dependable operation.')
  ],
  space: [
    capability('established','Satellite Earth observation','Operational observations support science and decisions on Earth.'),
    capability('imagined','Self-sustaining off-world habitats','A long-term exploration scenario with major engineering and resource constraints.')
  ],
  innovation: [
    capability('experimental','Cross-domain prototypes being evaluated','This label applies to early prototypes, not all innovation or a prediction of success.'),
    capability('imagined','Transformative cross-domain breakthroughs','New connections may open possibilities; their benefit must be tested.')
  ]
};
export const episodeCapabilities = {
  'when-gpus-meet-quantum-computing': [
    capability('established','GPUs for AI and scientific computing','Classical GPU workloads are already operational.'),
    capability('experimental','Large-scale useful GPU + quantum workflows','Tools and research exist; repeatable practical advantage is not assumed.'),
    capability('imagined','Transformative discovery breakthroughs','The potential applications in this episode remain possibilities to explore.')
  ],
  'when-mobility-meets-energy': [
    capability('established','Electric mobility and compatible battery swapping','Operating systems exist; compatibility and local infrastructure matter.'),
    capability('emerging','Coordinated storage and smart charging','Capabilities differ between installations.'),
    capability('experimental','Bidirectional grid services from swap stations','Equipment, permissions and operating conditions determine availability.'),
    capability('imagined','Networks balancing transport and grid needs together','An exploration, not a guaranteed outcome.')
  ],
  'when-stations-become-a-network': [
    capability('established','Battery-swap stations serving drivers','Operating networks exist in some regions; compatibility matters.'),
    capability('emerging','Swap stations providing grid services','Pilots and markets exist in parts of China; rules differ by country.'),
    capability('experimental','Coordinated station networks as virtual power plants','Scale, standards and permissions determine what is possible.'),
    capability('imagined','Energy Ports balancing cities, data centers and mobility','A concept, not an existing product.')
  ],
  'when-parking-goes-underground': [
    capability('established','Automated and mechanical parking systems','Operating in cities today; designs and capacity vary.'),
    capability('established','License plate recognition at parking garages','Standard at many garages; privacy rules differ by country.'),
    capability('imagined','A self-moving underground loop that charges while it rotates','An IMAGINE concept, not an existing product; digging, groundwater, fire safety and rescue access are real challenges.')
  ]
};

// Curated intersections are editorial paths; they do not assert equal maturity or advantage.
export const intersections = [
  { technology:'ai-data', related:['quantum-computing','robotics'], context:'Different computing approaches and physical intelligence; useful hybrid quantum advantage remains a research question.' },
  { technology:'energy', related:['smart-mobility','smart-cities'], context:'Power, charging and urban infrastructure already intersect; deeper coordination varies by system.' },
  { technology:'biotech', related:['ai-data','quantum-computing'], context:'Data tools support biological research; quantum-assisted discovery is an experimental direction.' },
  { technology:'space', related:['robotics','energy'], context:'Exploration depends on autonomous tools and dependable power; off-world systems face distinct constraints.' },
  { technology:'innovation', related:technologies.filter(t=>t.id!=='innovation').map(t=>t.id), context:'An editorial lens across every domain. Each idea needs its own evidence and implementation path.' }
];
export const futureEpisodeCategories = ['energy','biotech','smart-mobility','robotics','space'];
export const hubDefinitions = [
  { kind:'hubs', entity:{id:'minds',name:'Meet the Minds',path:'/minds/',description:'Five minds. Five perspectives. One shared curiosity about where technology could take us.'} },
  { kind:'hubs', entity:{id:'explore',name:'Explore the Universe',path:'/explore/',description:'Nine technology domains. Countless human possibilities. Discover the connections that could shape what comes next.'} },
  { kind:'hubs', entity:{id:'episodes',name:'Episodes',path:'/episodes/',description:'What If? explorations where technology, imagination and human possibility meet.'} }
];
export function universeConnections(kind, entity) {
  let mindIds=[], technologyIds=[], episodeIds=[];
  if (kind==='characters') {
    technologyIds=entity.technologies;
    episodeIds=entity.episodes;
    mindIds=episodes.filter(ep=>episodeIds.includes(ep.id)).flatMap(ep=>[...ep.characters,...ep.supportingCharacters]);
  } else if (kind==='technologies') {
    episodeIds=entity.episodes;
    technologyIds=entity.relatedTechnologies;
    mindIds=[...entity.characters,...episodes.filter(ep=>episodeIds.includes(ep.id)).flatMap(ep=>[...ep.characters,...ep.supportingCharacters])];
  } else if (kind==='episodes') {
    mindIds=[...entity.characters,...entity.supportingCharacters];
    technologyIds=entity.technologies;
    episodeIds=entity.relatedEpisodes;
  }
  const pick=(collection, ids, limit)=>[...new Set(ids)].filter(id=>id!==entity.id).slice(0,limit).map(id=>collection.find(item=>item.id===id));
  return {characters:pick(characters,mindIds,3),technologies:pick(technologies,technologyIds,3),episodes:pick(episodes,episodeIds,1)};
}
