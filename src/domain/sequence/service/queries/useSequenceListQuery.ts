import { useSDK } from '@cognite/sdk-provider';
import { SequenceFilter } from '@cognite/sdk/dist/src';
import { queryKeys } from 'domain/queryKeys';
import { InternalSequenceSortBy } from 'domain/sequence';
import { getSequenceList } from 'domain/sequence';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

export const useSequenceListQuery = (
  {
    filter,
    limit,
    sort,
  }: {
    filter?: Required<SequenceFilter>['filter'];
    limit?: number;
    sort?: InternalSequenceSortBy[];
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();
  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listSequence([filter, limit, sort]),
    ({ pageParam }) => {
      return getSequenceList(sdk, {
        cursor: pageParam,
        filter,
        // advancedFilter,
        sort,
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
