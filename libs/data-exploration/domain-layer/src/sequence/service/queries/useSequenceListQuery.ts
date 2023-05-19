import { useMemo } from 'react';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { useSDK } from '@cognite/sdk-provider';
import { SequenceFilter } from '@cognite/sdk/dist/src';
import { AdvancedFilter } from '@data-exploration-lib/domain-layer';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import {
  SequenceProperties,
  getSequenceList,
} from '@data-exploration-lib/domain-layer';
import { InternalSortBy } from '@data-exploration-lib/domain-layer';

export const useSequenceListQuery = (
  {
    advancedFilter,
    filter,
    limit,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<SequenceProperties>;
    filter?: Required<SequenceFilter>['filter'];
    limit?: number;
    sort?: InternalSortBy[];
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();
  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listSequence([advancedFilter, filter, limit, sort]),
    ({ pageParam }) => {
      return getSequenceList(sdk, {
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
