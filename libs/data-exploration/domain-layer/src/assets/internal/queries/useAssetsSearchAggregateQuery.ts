import { useMemo } from 'react';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapInternalFilterToAssetFilter,
  useAssetsAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { UseQueryOptions } from 'react-query';
import { InternalAssetFilters } from '@data-exploration-lib/core';

export const useAssetsSearchAggregateQuery = (
  {
    query,
    assetsFilters,
  }: {
    query?: string;
    assetsFilters: InternalAssetFilters;
  },
  options?: UseQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetsFilters, query),
    [assetsFilters, query]
  );

  const filter = useMemo(
    () => mapInternalFilterToAssetFilter(assetsFilters),
    [assetsFilters]
  );

  return useAssetsAggregateQuery(
    {
      filter,
      advancedFilter,
    },
    { ...options }
  );
};
