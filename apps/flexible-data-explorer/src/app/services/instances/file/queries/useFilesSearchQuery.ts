import { useMemo } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { DocumentFilter } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';

export const useFilesSearchQuery = (
  query: string,
  filter?: DocumentFilter,
  limit?: number
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.searchFiles(query, filter, limit),
    async ({ pageParam }) => {
      const response = await sdk.documents.search({
        search: {
          query,
        },
        filter,
        limit,
        cursor: pageParam,
      });

      return response;
    },
    {
      enabled: query !== undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const flattenData = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data]
  );

  return {
    data: flattenData,
    ...rest,
  };
};
