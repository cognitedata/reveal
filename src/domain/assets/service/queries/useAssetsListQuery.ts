import { useSDK } from '@cognite/sdk-provider';
import { AssetsProperties } from 'domain/assets/internal/transformers/mapFiltersToAssetsAdvancedFilters';
import { AdvancedFilter } from 'domain/builders';
import { queryKeys } from 'domain/queryKeys';
import { InternalSortBy } from 'domain/types';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getAssetsList } from '../network/getAssetsList';

export const useAssetsListQuery = (
  {
    filter,
    advancedFilter,
    sortBy,
    limit,
  }: {
    filter?: Record<string, any>;
    advancedFilter?: AdvancedFilter<AssetsProperties>;
    sortBy?: InternalSortBy[];
    limit?: number;
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listAssets([advancedFilter, limit, sortBy]),
    ({ pageParam }) => {
      return getAssetsList(sdk, {
        cursor: pageParam,
        filter,
        advancedFilter,
        sortBy,
        limit,
      });
    },
    {
      getNextPageParam: param => param.nextCursor,
      ...(options as any),
    }
  );

  const flattenData = useMemo(
    () => (data?.pages || []).flatMap(({ items }) => items),
    [data?.pages]
  );

  return { data: flattenData, ...rest };
};
