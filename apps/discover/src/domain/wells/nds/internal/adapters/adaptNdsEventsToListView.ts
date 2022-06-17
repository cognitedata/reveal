import groupBy from 'lodash/groupBy';
import { sortDictionaryByValuesLength } from 'utils/sort/sortDictionaryByValuesLength';

import { NDSEvent } from 'modules/wellSearch/types';

export const adaptNdsEventsToListView = (
  ndsEvents: NDSEvent[]
): { [key: string]: number } => {
  const groupedEvents = groupBy(ndsEvents, 'riskType');

  return sortDictionaryByValuesLength(groupedEvents);
};
