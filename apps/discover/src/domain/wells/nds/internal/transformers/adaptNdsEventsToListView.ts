import { sortDictionaryByValuesLength } from 'utils/sort/sortDictionaryByValuesLength';

import { NdsInternal } from '../types';

import { groupByRiskType } from './groupByRiskType';

export const adaptNdsEventsToListView = (
  ndsEvents: NdsInternal[]
): { [key: string]: number } => {
  const groupedEvents = groupByRiskType(ndsEvents);

  return sortDictionaryByValuesLength(groupedEvents);
};
