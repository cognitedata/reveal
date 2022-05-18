import { sortObjectsAscending, sortObjectsDecending } from 'utils/sort';

import { SortBy } from 'pages/types';

import { NdsView } from '../types';

export const sortNdsEvents = (ndsEvents: NdsView[], sortBy: SortBy[]) => {
  const { id: accessor, desc } = sortBy[0];

  if (desc) {
    return sortObjectsDecending(ndsEvents, accessor);
  }

  return sortObjectsAscending(ndsEvents, accessor);
};
