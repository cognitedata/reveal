import { useInfiniteQuery } from '@tanstack/react-query';
import { UseInfiniteQueryOptions } from '@tanstack/react-query/src/types';

import { FilesSearchFilter } from '@cognite/sdk';
import { FileInfo } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { searchFiles } from '../network/searchFiles';

export const useFileSearchQuery = (
  request: FilesSearchFilter,
  options: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();
  const response = useInfiniteQuery(
    ['files', 'search', request],
    () => {
      return searchFiles(request, sdk);
    },
    options as any
  );

  const results = response?.data
    ? response.data?.pages.reduce((result: FileInfo[], page) => {
        return [...result, ...page];
      }, [])
    : [];

  return {
    ...response,
    results,
  };
};
