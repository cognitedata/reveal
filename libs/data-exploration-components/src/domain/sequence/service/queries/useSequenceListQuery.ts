import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { SequenceFilter } from '@cognite/sdk/dist/src';
import { AdvancedFilter } from '@data-exploration-components/domain/builders';
import { queryKeys } from '@data-exploration-components/domain/queryKeys';
import {
  SequenceProperties,
  getSequenceList,
} from '@data-exploration-components/domain/sequence';
import { InternalSortBy } from '@data-exploration-components/domain/types';

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
