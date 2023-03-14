import { useSDK } from '@cognite/sdk-provider';
import { AssetFilterProps } from '@cognite/sdk';
import { AssetsProperties } from '@data-exploration-lib/domain-layer';
import { AdvancedFilter } from '@data-exploration-lib/domain-layer';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { InternalSortBy } from '@data-exploration-lib/domain-layer';
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
