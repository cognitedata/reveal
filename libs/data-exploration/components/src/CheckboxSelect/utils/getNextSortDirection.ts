import { SortDirection } from '../types';

export const getNextSortDirection = (
  sortDirection?: SortDirection
): SortDirection => {
  if (!sortDirection) {
    return SortDirection.Ascending;
  }

  if (sortDirection === SortDirection.Ascending) {
    return SortDirection.Descending;
  }

  return SortDirection.Ascending;
};
