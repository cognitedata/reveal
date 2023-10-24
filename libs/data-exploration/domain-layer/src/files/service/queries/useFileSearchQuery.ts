import { useInfiniteQuery } from '@tanstack/react-query';
import { UseInfiniteQueryOptions } from '@tanstack/react-query/src/types';

import { FileRequestFilter } from '@cognite/sdk';
import { FileInfo } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { listFiles } from '../network';

export const useFileSearchQuery = (
  filter: FileRequestFilter,
  options: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();
  const response = useInfiniteQuery(
    ['files', 'search', filter],
    ({ pageParam }) => {
      return listFiles(
        {
          ...filter,
          cursor: pageParam,
        },
        sdk
      );
    },
    {
      ...(options as any),
      getNextPageParam: ({ nextCursor }) => nextCursor,
    }
  );

  const results = response?.data
    ? response.data?.pages.reduce((result: FileInfo[], { items }) => {
        return [...result, ...items];
      }, [])
    : [];

  return {
    ...response,
    results,
  };
};
