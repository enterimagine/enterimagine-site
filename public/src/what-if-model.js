import { technologyById } from './content.js';
import { scenarios } from './what-if-data.js';

export const combinationKey = ids => [...ids].sort().join('|');
const byCombination = new Map(scenarios.map(scenario=>[combinationKey(scenario.technologies),scenario]));
export function validateSelection(ids) {
  if (!Array.isArray(ids) || ids.length>3 || new Set(ids).size!==ids.length || ids.some(id=>typeof id!=='string' || !Object.hasOwn(technologyById,id))) {
    return {valid:false,message:'Choose up to three different technologies from the universe.'};
  }
  return {valid:true,message:''};
}
export function toggleTechnology(ids, id) {
  if (!Object.hasOwn(technologyById,id) || !validateSelection(ids).valid) return {ids:[],message:'That selection is not available.'};
  if (ids.includes(id)) return {ids:ids.filter(item=>item!==id),message:''};
  if (ids.length===3) return {ids:[...ids],message:'Three technologies are selected. Remove one before adding another.'};
  return {ids:[...ids,id],message:''};
}
export function resolveSelection(ids) {
  const validation=validateSelection(ids);
  if (!validation.valid) return {kind:'invalid',selected:[],message:validation.message};
  const selected=[...ids].sort();
  if (selected.length<2) return {kind:'incomplete',selected};
  const lens=selected.includes('innovation');
  const base=lens ? selected.filter(id=>id!=='innovation') : selected;
  const scenario=byCombination.get(combinationKey(base));
  const minds=scenario ? [...new Set([...scenario.minds,...scenario.challenger])] :
    [...new Set(selected.flatMap(id=>technologyById[id].characters))];
  return {kind:scenario?'curated':lens && base.length===1?'lens':'unknown',selected,lens,scenario,minds};
}
export function selectionUrl(ids) {
  const selected=validateSelection(ids).valid ? [...ids].sort() : [];
  return '/what-if/' + (selected.length ? '?technologies='+selected.map(encodeURIComponent).join(',') : '');
}
export function parseSelection(search) {
  const raw=new URLSearchParams(search).get('technologies');
  const ids=raw ? raw.split(',') : [];
  const validation=validateSelection(ids);
  return {ids:validation.valid?ids:[],message:validation.message};
}
