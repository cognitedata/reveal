import head from 'lodash/head';

import { SortBy } from 'pages/types';

import { sortObjectsAscending } from './sortObjectsAscending';
import { sortObjectsDecending } from './sortObjectsDecending';

export const sortTableData = <T>(data: T[], sortBy: SortBy[]) => {
  const sortByValue = head(sortBy);

  if (!sortByValue) {
    return data;
  }

  const { id: accessor, desc } = sortByValue;

  if (desc) {
    return sortObjectsDecending(data, accessor);
  }

  return sortObjectsAscending(data, accessor);
};
