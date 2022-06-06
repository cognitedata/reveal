import { mergeSearchResponsePages } from 'domain/documents/internal/transformers/mergeSearchResponsePages';
import {
  searchDocument,
  SearchRequestOptions,
} from 'domain/documents/service/network/searchDocument';

import { useInfiniteQuery, useQueryClient } from 'react-query';

import { Metrics } from '@cognite/metrics';

import {
  LOG_DOCUMENT_SEARCH,
  LOG_DOCUMENT_SEARCH_NAMESPACE,
} from 'constants/logging';
import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';
import { TimeLogStages } from 'hooks/useTimeLog';
import { DOCUMENT_SEARCH_PAGE_LIMIT } from 'modules/documentSearch/constants';
import { useDocumentSearchQueryFull } from 'modules/documentSearch/hooks/useDocumentSearchQueryFull';
import { SearchQueryFull } from 'modules/documentSearch/types';
import { handleDocumentSearchError } from 'modules/documentSearch/utils/documentSearch';

import { InifniteQueryResponse } from './types';

const documentSearchMetric = Metrics.create(LOG_DOCUMENT_SEARCH);

/**
 * Get document search results
 *
 * NOTE: this does not update aggregates and facets from cursors!
 *
 */
export const useDocumentSearchQuery = (
  searchQuery: SearchQueryFull,
  options: SearchRequestOptions
): InifniteQueryResponse => {
  const queryResults = useInfiniteQuery(
    [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery, options],
    ({ pageParam }) => {
      const timer = documentSearchMetric.start(LOG_DOCUMENT_SEARCH_NAMESPACE, {
        stage: TimeLogStages.Network,
      });
      return searchDocument(
        searchQuery,
        { ...options, cursor: pageParam },
        DOCUMENT_SEARCH_PAGE_LIMIT
      )
        .catch(handleDocumentSearchError)
        .finally(() => timer.stop());
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
    }
  );

  return mergeSearchResponsePages(queryResults);
};

export const useDocumentSearchInvalidate = () => {
  const searchQuery = useDocumentSearchQueryFull();
  const queryClient = useQueryClient();
  queryClient.invalidateQueries([DOCUMENTS_QUERY_KEY.SEARCH, searchQuery]);
};
