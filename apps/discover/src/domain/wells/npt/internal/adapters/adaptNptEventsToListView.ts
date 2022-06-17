import groupBy from 'lodash/groupBy';
import { sortDictionaryByValuesLength } from 'utils/sort/sortDictionaryByValuesLength';

import { NPTEvent } from 'modules/wellSearch/types';

export const adaptNptEventsToListView = (
  nptEvents: NPTEvent[]
): { [key: string]: number } => {
  const groupedEvents = groupBy(nptEvents, 'nptCode');

  return sortDictionaryByValuesLength(groupedEvents);
};
