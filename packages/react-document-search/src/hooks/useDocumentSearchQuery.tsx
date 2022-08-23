import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from 'react-query';
import { DocumentResult } from 'utils/types';

import {
  useDocumentSearchConfig,
  useDocumentSearchState,
} from '../providers/DocumentSearchProvider';
import { mergeSearchResponsePages } from '../utils/mergeSearchResponsePages';
import { searchDocument, SearchRequestOptions } from '../api/documentSearch';

import { useDocumentSearchQueryFull } from './useDocumentSearchQueryFull';

export type InifniteQueryResponse = UseInfiniteQueryResult<DocumentResult> & {
  results: DocumentResult;
};

const DOCUMENTS = 'react-document-search';
export const DOCUMENTS_QUERY_KEY = {
  SEARCH: [DOCUMENTS, 'search'],
  SEARCH_ONE: [DOCUMENTS, 'one'],
  LABELS: [DOCUMENTS, 'labels'],
  LABELS_QUERY: (query: unknown) => [DOCUMENTS, 'labels', query],
};

/**
 * This is the recommended limit. Increasing the limit will have an effect on performance and search highlighting
 * */
export const DOCUMENT_SEARCH_PAGE_LIMIT = 20;

/**
 * Get document search results
 *
 * NOTE: this does not update aggregates and facets from cursors!
 *
 */
export const useDocumentSearchQuery = (
  options?: SearchRequestOptions
): InifniteQueryResponse => {
  const searchQuery = useDocumentSearchState();

  const { cogniteClient, config } = useDocumentSearchConfig();

  const queryResults = useInfiniteQuery(
    [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery, options],
    ({ pageParam }) => {
      return searchDocument(
        cogniteClient!,
        searchQuery,
        { ...options, cursor: pageParam },
        config?.limit || DOCUMENT_SEARCH_PAGE_LIMIT
      );
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
      enabled: Boolean(cogniteClient),
    }
  );

  return mergeSearchResponsePages(queryResults);
};

export const useDocumentSearchInvalidate = () => {
  const searchQuery = useDocumentSearchQueryFull();
  const queryClient = useQueryClient();
  queryClient.invalidateQueries([DOCUMENTS_QUERY_KEY.SEARCH, searchQuery]);
};
