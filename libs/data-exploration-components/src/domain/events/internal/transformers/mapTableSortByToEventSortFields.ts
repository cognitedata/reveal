import { TableSortBy } from 'components/Table';
import { InternalSortBy } from 'domain/types';
import { METADATA_KEY_SEPARATOR } from '../../../../utils';

export const mapTableSortByToEventSortFields = (
  sortBy?: TableSortBy[]
): InternalSortBy[] | undefined => {
  if (!sortBy || sortBy.length === 0) return undefined;
  return sortBy.map(tableSort => {
    const properties = tableSort.id.split(METADATA_KEY_SEPARATOR);
    return {
      property: properties,
      order: tableSort.desc ? 'desc' : 'asc',
      nulls: tableSort.desc ? 'last' : 'first', // When ascending undefined(null) comes first and last for descending
    };
  });
};
