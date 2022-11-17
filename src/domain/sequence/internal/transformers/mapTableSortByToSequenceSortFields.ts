import { TableSortBy } from 'components/Table';
import { InternalSequenceSortBy } from 'domain/sequence';

export const mapTableSortByToSequenceSortFields = (
  sortBy?: TableSortBy[]
): InternalSequenceSortBy[] | undefined => {
  if (!sortBy || sortBy.length === 0) return undefined;

  if (sortBy.length > 0) {
    return sortBy.map(tableSort => {
      return {
        property: [tableSort.id],
        order: tableSort.desc ? 'desc' : 'asc',
      };
    });
  }

  return undefined;
};
