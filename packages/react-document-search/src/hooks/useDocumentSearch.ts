import { useInfiniteQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { DocumentSearchItem } from '@cognite/sdk';

import { search } from '../api/search';
import { DocumentSearchContext } from '../providers';

import { useDocumentFilters } from './useDocumentFilters';

export const DOCUMENT_SEARCH_PAGE_LIMIT = 20;

export const useDocumentSearch = ({
  limit,
  keepPreviousData,
}: {
  limit?: number;
  keepPreviousData?: boolean;
} = {}) => {
  const { sdkClient } = useContext(DocumentSearchContext);
  const { appliedFilters } = useDocumentFilters();
  const localLimit = limit || DOCUMENT_SEARCH_PAGE_LIMIT;

  const response = useInfiniteQuery(
    ['documents', 'search', appliedFilters, localLimit],
    ({ pageParam }) => {
      return search(
        {
          ...appliedFilters,
          limit: localLimit,
          search: {
            query: appliedFilters.search?.query || '',
            highlight: true,
          },
          cursor: pageParam,
        },
        sdkClient!
      );
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
      enabled: Boolean(sdkClient),
      keepPreviousData,
    }
  );

  return {
    ...response,
    results: response?.data
      ? response.data?.pages.reduce((result: DocumentSearchItem[], page) => {
          return [...result, ...page.items];
        }, [])
      : [],
  };
};
