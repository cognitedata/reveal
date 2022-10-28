import { useAssetsListQuery } from 'domain/assets/service/queries/useAssetsListQuery';
import { useMemo } from 'react';
import { mapFiltersToAssetsAdvancedFilters } from '../transformers/mapFiltersToAssetsAdvancedFilters';
import { mapInternalFilterToAssetFilter } from '../transformers/mapInternalFilterToAssetFilter';
import { InternalAssetFilters } from '../types';

export const useAssetsFilteredListQuery = ({
  assetFilter,
}: {
  query?: string;
  assetFilter: InternalAssetFilters;
}) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetFilter),
    [assetFilter]
  );

  const filter = mapInternalFilterToAssetFilter(assetFilter);

  return useAssetsListQuery({ filter, advancedFilter, limit: 25 });
};
