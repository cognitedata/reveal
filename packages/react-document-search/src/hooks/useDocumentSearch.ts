import { useInfiniteQuery } from 'react-query';
import { useContext } from 'react';
import { DocumentSearchItem } from '@cognite/sdk';

import { search } from '../api/search';
import { DocumentSearchContext } from '../providers';

import { useDocumentFilters } from './useDocumentFilters';

export const DOCUMENT_SEARCH_PAGE_LIMIT = 20;

export const useDocumentSearch = () => {
  const { sdkClient } = useContext(DocumentSearchContext);
  const { appliedFilters } = useDocumentFilters();
  const limit = appliedFilters?.limit || DOCUMENT_SEARCH_PAGE_LIMIT;

  const response = useInfiniteQuery(
    ['documents', 'search', appliedFilters],
    () => {
      return search(
        {
          ...appliedFilters,
          limit,
          search: {
            query: appliedFilters.search?.query || '',
            highlight: true,
          },
        },
        sdkClient!
      );
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
      enabled: Boolean(sdkClient),
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
