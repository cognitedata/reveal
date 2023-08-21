import { useMemo } from 'react';

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

import { AssetFilterProps } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { InternalSortBy } from '../../../types';
import { AssetsProperties } from '../../internal';
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
    queryKeys.listAssets([advancedFilter, filter, limit, sort, options]),
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
