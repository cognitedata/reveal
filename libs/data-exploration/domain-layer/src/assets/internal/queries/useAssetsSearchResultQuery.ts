import { useAssetsListQuery } from '@data-exploration-lib/domain-layer';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '@data-exploration-lib/domain-layer';
import { useMemo } from 'react';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapInternalFilterToAssetFilter,
  mapTableSortByToAssetSortFields,
} from '../transformers';
import { TableSortBy } from '@data-exploration-lib/domain-layer';
import { UseInfiniteQueryOptions } from 'react-query';
import {
  AssetConfigType,
  InternalAssetFilters,
} from '@data-exploration-lib/core';

export const useAssetsSearchResultQuery = (
  {
    query,
    assetFilter = {},
    sortBy,
    limit = DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  }: {
    query?: string;
    assetFilter: InternalAssetFilters;
    sortBy?: TableSortBy[];
    limit?: number;
  },
  options?: UseInfiniteQueryOptions,
  searchConfig?: AssetConfigType
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetFilter, query, searchConfig),
    [assetFilter, query, searchConfig]
  );

  const filter = useMemo(
    () => mapInternalFilterToAssetFilter(assetFilter),
    [assetFilter]
  );

  const sort = useMemo(() => mapTableSortByToAssetSortFields(sortBy), [sortBy]);

  return useAssetsListQuery(
    {
      filter,
      advancedFilter,
      sort,
      limit,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
