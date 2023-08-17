import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

import { DocumentFilter, DocumentSortItem } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '../../../constants';
import { queryKeys } from '../../../queryKeys';
import { search } from '../network/search';

export const useDocumentSearchQuery = (
  {
    filter,
    limit,
    sort,
    highlight = true,
  }: {
    filter?: DocumentFilter;
    limit?: number;
    sort?: DocumentSortItem[];
    highlight?: boolean;
  } = {},
  options: UseInfiniteQueryOptions = {}
) => {
  const sdk = useSDK();

  const localLimit = limit || DEFAULT_GLOBAL_TABLE_RESULT_LIMIT;

  return useInfiniteQuery(
    queryKeys.documentsSearch(filter, localLimit, sort, options),
    ({ pageParam }) =>
      search(
        {
          limit: localLimit,
          filter,
          sort,
          highlight,
          cursor: pageParam,
        },
        sdk
      ),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
      ...(options as any),
    }
  );
};
