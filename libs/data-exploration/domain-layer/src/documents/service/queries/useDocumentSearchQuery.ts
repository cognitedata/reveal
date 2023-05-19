import { useSDK } from '@cognite/sdk-provider';
import { DocumentFilter, DocumentSortItem } from '@cognite/sdk';

import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '@data-exploration-lib/domain-layer';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { search } from '../network/search';
import { queryKeys } from '../../../queryKeys';

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
    queryKeys.documentsSearch(filter, localLimit, sort),
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
