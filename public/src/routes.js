// All complete canonical pages are published; future entities can retain Home fallbacks.
export const published = {
  characters: new Set(['dali', 'sofia', 'leo', 'maya', 'ethan']),
  technologies: new Set(['ai-data', 'quantum-computing', 'energy', 'smart-mobility', 'smart-cities', 'biotech', 'robotics', 'space', 'innovation']),
  episodes: new Set(['when-gpus-meet-quantum-computing', 'when-mobility-meets-energy', 'when-stations-become-a-network', 'when-parking-goes-underground'])
};
export const entityUrl = (kind, entity) => published[kind].has(entity.id)
  ? entity.path
  : '/#' + ({characters:'mind-',technologies:'technology-',episodes:''}[kind]) + (kind === 'episodes' ? 'episodes' : entity.id);
