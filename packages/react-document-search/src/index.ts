import { useInfiniteQuery, UseInfiniteQueryResult } from 'react-query';
// import { useDocumentSearchQueryFull } from 'modules/documentSearch/hooks/useDocumentSearchQueryFull';
import { DocumentResult } from 'utils/types';
import { CogniteClient } from '@cognite/sdk';

import { mergeSearchResponsePages } from './utils/mergeSearchResponsePages';
import { SearchQueryFull } from './utils/types';
import { searchDocument, SearchRequestOptions } from './api/documentSearch';

// const documentSearchMetric = Metrics.create(LOG_DOCUMENT_SEARCH);

export type InifniteQueryResponse = UseInfiniteQueryResult<DocumentResult> & {
  results: DocumentResult;
};

const DOCUMENTS = 'documents';
export const DOCUMENTS_QUERY_KEY = {
  SEARCH: [DOCUMENTS, 'search'],
  SEARCH_ONE: [DOCUMENTS, 'one'],
  LABELS: [DOCUMENTS, 'labels'],
  LABELS_QUERY: (query: unknown) => [DOCUMENTS, 'labels', query],
};

export const DOCUMENT_SEARCH_PAGE_LIMIT = 20;

/**
 * Get document search results
 *
 * NOTE: this does not update aggregates and facets from cursors!
 *
 */
export const useDocumentSearchQuery = (
  sdk: () => CogniteClient,
  searchQuery: SearchQueryFull,
  options: SearchRequestOptions
): InifniteQueryResponse => {
  const queryResults = useInfiniteQuery(
    [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery, options],
    ({ pageParam }) => {
      return searchDocument(
        sdk,
        searchQuery,
        { ...options, cursor: pageParam },
        DOCUMENT_SEARCH_PAGE_LIMIT
      );
      // ).catch(handleDocumentSearchError);
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
    }
  );

  return mergeSearchResponsePages(queryResults);
};

// export const useDocumentSearchInvalidate = () => {
//   const searchQuery = useDocumentSearchQueryFull();
//   const queryClient = useQueryClient();
//   queryClient.invalidateQueries([DOCUMENTS_QUERY_KEY.SEARCH, searchQuery]);
// };
