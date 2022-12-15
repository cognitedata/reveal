import { useAssetsListQuery } from 'domain/assets/service/queries/useAssetsListQuery';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { useMemo } from 'react';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapInternalFilterToAssetFilter,
  mapTableSortByToAssetSortFields,
} from '../transformers';
import { InternalAssetFilters } from '../types';
import { TableSortBy } from 'components/Table';
import { UseInfiniteQueryOptions } from 'react-query';
// import { useAssetsSearchQueryMetadataKeysQuery } from './useAssetsMetadataKeysQuery';

export const useAssetsSearchResultQuery = (
  {
    query,
    assetFilter = {},
    sortBy,
  }: {
    query?: string;
    assetFilter: InternalAssetFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  // const searchQueryMetadataKeys = useAssetsSearchQueryMetadataKeysQuery(
  //   query,
  //   assetFilter
  // );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToAssetsAdvancedFilters(
        assetFilter,
        // searchQueryMetadataKeys,
        query
      ),
    [assetFilter, query]
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
      limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
