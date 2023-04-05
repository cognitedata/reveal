import { IconType } from '@cognite/cogs.js';

import { SortDirection } from '../types';

type SortActionData = {
  icon: IconType;
  text: 'A-Z' | 'Z-A';
};

export const ASCENDING: SortActionData = {
  icon: 'SortAscending',
  text: 'A-Z',
};

export const DESCENDING: SortActionData = {
  icon: 'SortDescending',
  text: 'Z-A',
};

export const getSortActionData = (
  sortDirection?: SortDirection
): SortActionData => {
  if (!sortDirection || sortDirection === SortDirection.Ascending) {
    return ASCENDING;
  }

  return DESCENDING;
};
