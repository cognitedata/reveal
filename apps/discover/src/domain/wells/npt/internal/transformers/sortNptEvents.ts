import head from 'lodash/head';
import { sortObjectsAscending, sortObjectsDecending } from 'utils/sort';

import { NptInternal } from '../types';

export type SortBy = {
  id: string;
  desc: boolean;
};

export const sortNptEvents = <T extends NptInternal>(
  events: T[],
  sortBy: SortBy[]
) => {
  const sortConfig = head(sortBy);

  if (!sortConfig) {
    return events;
  }

  const { id: accessor, desc } = sortConfig;

  if (desc) {
    return sortObjectsDecending(events, accessor as DeepKeyOf<T>);
  }

  return sortObjectsAscending(events, accessor as DeepKeyOf<T>);
};
