import { TableSortBy } from 'components/ReactTable/V2';
import { InternalTimeseriesSortBy } from 'domain/timeseries';

export const mapTableSortByToTimeseriesSortFields = (
  sortBy?: TableSortBy[]
): InternalTimeseriesSortBy[] | undefined => {
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
