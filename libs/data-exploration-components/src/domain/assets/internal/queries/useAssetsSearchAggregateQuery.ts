import { useMemo } from 'react';
import {
  InternalAssetFilters,
  mapFiltersToAssetsAdvancedFilters,
  mapInternalFilterToAssetFilter,
  // useAssetsSearchQueryMetadataKeysQuery,
  useAssetsAggregateQuery,
} from 'domain/assets';
import { UseQueryOptions } from 'react-query';

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
  // const searchQueryMetadataKeys = useAssetsSearchQueryMetadataKeysQuery(
  //   query,
  //   assetsFilters
  // );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToAssetsAdvancedFilters(
        assetsFilters,
        // searchQueryMetadataKeys,
        query
      ),
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
    { ...options, keepPreviousData: true }
  );
};
