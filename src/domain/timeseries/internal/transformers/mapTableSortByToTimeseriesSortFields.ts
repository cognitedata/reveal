import { TableSortBy } from 'components/Table';
import { InternalSortBy } from 'domain/types';
import { METADATA_KEY_SEPARATOR } from '../../../../utils';

export const mapTableSortByToTimeseriesSortFields = (
  sortBy?: TableSortBy[]
): InternalSortBy[] | undefined => {
  if (!sortBy || sortBy.length === 0) return undefined;

  if (sortBy.length > 0) {
    return sortBy.map(tableSort => {
      const properties = tableSort.id.split(METADATA_KEY_SEPARATOR);

      return {
        property: properties,
        order: tableSort.desc ? 'desc' : 'asc',
      };
    });
  }

  return undefined;
};
