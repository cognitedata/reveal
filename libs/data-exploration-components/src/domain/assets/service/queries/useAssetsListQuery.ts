import { useSDK } from '@cognite/sdk-provider';
import { AssetFilterProps } from '@cognite/sdk';
import { AssetsProperties } from '@data-exploration-components/domain/assets/internal/transformers/mapFiltersToAssetsAdvancedFilters';
import { AdvancedFilter } from '@data-exploration-components/domain/builders';
import { queryKeys } from '@data-exploration-components/domain/queryKeys';
import { InternalSortBy } from '@data-exploration-components/domain/types';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getAssetsList } from '../network';

export const useAssetsListQuery = (
  {
    filter,
    advancedFilter,
    sort,
    limit,
  }: {
    filter?: AssetFilterProps;
    advancedFilter?: AdvancedFilter<AssetsProperties>;
    sort?: InternalSortBy[];
    limit?: number;
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listAssets([advancedFilter, filter, limit, sort]),
    ({ pageParam }) => {
      return getAssetsList(sdk, {
        cursor: pageParam,
        filter,
        advancedFilter,
        sort,
        limit,
      });
    },
    {
      getNextPageParam: (param) => param.nextCursor,
      ...(options as any),
    }
  );

  const flattenData = useMemo(
    () => (data?.pages || []).flatMap(({ items }) => items),
    [data?.pages]
  );

  return { data: flattenData, ...rest };
};
