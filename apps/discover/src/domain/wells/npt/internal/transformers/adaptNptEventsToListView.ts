import { sortDictionaryByValuesLength } from 'utils/sort/sortDictionaryByValuesLength';

import { NptInternal } from '../types';

import { groupByNptCode } from './groupByNptCode';

export const adaptNptEventsToListView = (
  nptEvents: NptInternal[]
): { [key: string]: number } => {
  const groupedEvents = groupByNptCode(nptEvents);

  return sortDictionaryByValuesLength(groupedEvents);
};
