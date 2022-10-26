import { useAssetsListQuery } from 'domain/assets/service/queries/useAssetsListQuery';
import { useMemo } from 'react';
import { mapFiltersToAssetsAdvancedFilters } from '../transformers/mapFiltersToAssetsAdvancedFilters';
import { InternalAssetFilters } from '../types';

export const useAssetsFilteredListQuery = ({
  filter,
}: {
  query?: string;
  filter: InternalAssetFilters;
}) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(filter),
    [filter]
  );

  return useAssetsListQuery({ advancedFilter, limit: 25 });
};
