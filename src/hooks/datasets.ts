import { useSDK } from '@cognite/sdk-provider';
import { CogniteError, DataSet } from '@cognite/sdk';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { useEffect } from 'react';

const useDataSetKey = (): QueryKey => ['datasets'];
export const useAllDataSets = (
  options?: UseInfiniteQueryOptions<
    { items: DataSet[]; nextCursor?: string },
    CogniteError
  >
) => {
  const sdk = useSDK();

  const q = useInfiniteQuery(
    useDataSetKey(),
    ({ pageParam }) => sdk.datasets.list({ limit: 1000, cursor: pageParam }),
    {
      getNextPageParam(page) {
        return page.nextCursor;
      },

      staleTime: 60000,
      ...options,
    }
  );
  useEffect(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) {
      q.fetchNextPage();
    }
  }, [q]);

  return q;
};
