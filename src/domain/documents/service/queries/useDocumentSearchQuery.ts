import { useSDK } from '@cognite/sdk-provider';
import { DocumentFilter, DocumentSortItem } from '@cognite/sdk';

import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT, queryKeys } from 'index';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { search } from '../network/search';

export const useDocumentSearchQuery = (
  {
    filter,
    limit,
    query,
    sort,
  }: {
    filter?: DocumentFilter;
    query?: string;
    limit?: number;
    sort?: DocumentSortItem[];
  } = {},
  options: UseInfiniteQueryOptions = {}
) => {
  const sdk = useSDK();

  const localLimit = limit || DEFAULT_GLOBAL_TABLE_RESULT_LIMIT;

  return useInfiniteQuery(
    queryKeys.documentsSearch(filter, query, localLimit, sort),
    ({ pageParam }) =>
      search(
        {
          limit: localLimit,
          filter,
          sort,
          search: { query: query || '', highlight: true },
          cursor: pageParam,
        },
        sdk
      ),
    {
      getNextPageParam: lastPage => {
        return lastPage?.nextCursor;
      },
      ...(options as any),
    }
  );
};
