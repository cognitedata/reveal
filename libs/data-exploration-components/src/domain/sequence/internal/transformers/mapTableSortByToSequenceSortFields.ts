import { TableSortBy } from '@data-exploration-components/components/Table';
import { InternalSortBy } from '@data-exploration-components/domain/types';
import { METADATA_KEY_SEPARATOR } from '../../../../utils';

export const mapTableSortByToSequenceSortFields = (
  sortBy?: TableSortBy[]
): InternalSortBy[] | undefined => {
  if (!sortBy || sortBy.length === 0) return undefined;

  if (sortBy.length > 0) {
    return sortBy.map((tableSort) => {
      const properties = tableSort.id.split(METADATA_KEY_SEPARATOR);

      return {
        property: properties,
        order: tableSort.desc ? 'desc' : 'asc',
        // Waiting implentation from timelords
        // nulls: tableSort.desc ? 'last' : 'first', // When ascending undefined(null) comes first and last for descending
      };
    });
  }

  return undefined;
};
