import { normalize } from 'domain/documents';
import { useSDK } from '@cognite/sdk-provider';
import { DocumentSearchItem } from '@cognite/sdk';
import { InternalDocumentFilter } from 'domain/index';
import { InternalSortBy } from 'domain/types';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT, queryKeys } from 'index';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

export const useDocumentSearchQuery = (
  {
    filter = {},
    limit,
    search,
    sort,
  }: {
    filter?: InternalDocumentFilter;
    search?: string;
    limit?: number;
    sort?: InternalSortBy[];
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const localLimit = limit || DEFAULT_GLOBAL_TABLE_RESULT_LIMIT;

  const response = useInfiniteQuery(
    queryKeys.documentsSearch(filter, localLimit),
    ({ pageParam }) => {
      return sdk.documents.search({
        ...filter,
        limit,
        sort,
        search: { query: search || '', highlight: true },
        cursor: pageParam,
      });
    },
    ...(options as any)
  );
  const results = response?.data
    ? response.data?.pages.reduce((result: DocumentSearchItem[], page) => {
        return [...result, ...page.items];
      }, [])
    : [];

  return {
    ...response,
    results: normalize(results),
  };
};
