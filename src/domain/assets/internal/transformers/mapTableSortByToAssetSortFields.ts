import { TableSortBy } from 'components/ReactTable/V2';
import { InternalSortBy } from 'domain/types';

export const mapTableSortByToAssetSortFields = (
  sortBy: TableSortBy[]
): InternalSortBy[] | undefined => {
  if (sortBy.length > 0) {
    const { id, desc } = sortBy[0];

    return [
      {
        property: id,
        order: desc ? 'desc' : 'asc',
      },
    ];
  }

  return undefined;
};
