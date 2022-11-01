import { TableSortBy } from 'components/ReactTable/V2';
import { InternalSortBy } from 'domain/types';

export const mapTableSortByToEventSortFields = (
  sortBy: TableSortBy[]
): InternalSortBy[] | undefined => {
  if (sortBy.length > 0) {
    return sortBy.map(tableSort => {
      return {
        property: tableSort.id,
        order: tableSort.desc ? 'desc' : 'asc',
      };
    });
  }

  return undefined;
};
