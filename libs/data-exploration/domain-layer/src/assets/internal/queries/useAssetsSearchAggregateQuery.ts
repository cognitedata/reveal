import { useMemo } from 'react';

import { UseQueryOptions } from '@tanstack/react-query';
import {
  AssetConfigType,
  InternalAssetFilters,
} from '@data-exploration-lib/core';
import { useAssetsAggregateQuery } from '../../service';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapInternalFilterToAssetFilter,
} from '../transformers';

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
