import { useMemo } from 'react';
import { useAssetsListQuery } from 'domain/assets/service/queries/useAssetsListQuery';
import { mapFiltersToAssetsAdvancedFilters } from '../transformers/mapFiltersToAssetsAdvancedFilters';
import { mapInternalFilterToAssetFilter } from '../transformers/mapInternalFilterToAssetFilter';
import { mapTableSortByToAssetSortFields } from '../transformers/mapTableSortByToAssetSortFields';
import { InternalAssetFilters } from '../types';
import { TableSortBy } from 'components/ReactTable/V2';

export const useAssetsFilteredListQuery = ({
  assetFilter,
  sortBy,
}: {
  query?: string;
  assetFilter: InternalAssetFilters;
  sortBy: TableSortBy[];
}) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetFilter),
    [assetFilter]
  );

  const filter = mapInternalFilterToAssetFilter(assetFilter);

  const sort = useMemo(() => mapTableSortByToAssetSortFields(sortBy), [sortBy]);

  return useAssetsListQuery({
    filter,
    advancedFilter,
    sortBy: sort,
    limit: 25,
  });
};
