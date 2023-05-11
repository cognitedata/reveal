import { useMemo } from 'react';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapInternalFilterToAssetFilter,
  useAssetsAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { UseQueryOptions } from 'react-query';
import {
  AssetConfigType,
  InternalAssetFilters,
} from '@data-exploration-lib/core';

export const useAssetsSearchAggregateQuery = (
  {
    query,
    assetsFilters,
  }: {
    query?: string;
    assetsFilters: InternalAssetFilters;
  },
  searchConfig?: AssetConfigType,
  options?: UseQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetsFilters, query, searchConfig),
    [assetsFilters, query, searchConfig]
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
