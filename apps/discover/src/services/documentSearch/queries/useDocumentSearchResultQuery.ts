import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from 'react-query';

import { Metrics } from '@cognite/metrics';

import {
  LOG_DOCUMENT_SEARCH,
  LOG_DOCUMENT_SEARCH_NAMESPACE,
} from 'constants/logging';
import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';
import { TimeLogStages } from 'hooks/useTimeLog';
import { DOCUMENT_SEARCH_PAGE_LIMIT } from 'modules/documentSearch/constants';
import { useDocumentSearchOptions } from 'modules/documentSearch/hooks/useDocumentSearchOptions';
import { useDocumentSearchQueryFull } from 'modules/documentSearch/hooks/useDocumentSearchQueryFull';
import { documentSearchService } from 'modules/documentSearch/service';
import { DocumentResult } from 'modules/documentSearch/types';
import { getEmptyDocumentResult } from 'modules/documentSearch/utils';
import { handleDocumentSearchError } from 'modules/documentSearch/utils/documentSearch';

const documentSearchMetric = Metrics.create(LOG_DOCUMENT_SEARCH);
type QueryResponse = UseInfiniteQueryResult<DocumentResult> & {
  results: DocumentResult;
};
/**
 * The reason we add this new 'results' key is that react-query
 * adds an array of arrays in pages, and it's hard to deal with
 * this way we only have to do it once here and everyone using
 * this function is happy
 */
const mergePages = (
  queryResults: UseInfiniteQueryResult<DocumentResult>
): QueryResponse => {
  if (!queryResults.data || queryResults.isLoading) {
    return {
      ...queryResults,
      results: getEmptyDocumentResult(),
    };
  }

  return {
    ...queryResults,
    results: queryResults.data?.pages.reduce((result, page) => {
      return {
        ...result,
        ...page,
        count: page?.count ? page.count + result.count : result.count,
        hits: page?.hits ? [...result.hits, ...page.hits] : result.hits,
      };
    }),
  };
};

/**
 * Get document search results
 *
 * NOTE: this does not update aggregates and facets from cursors!
 *
 */
export const useDocumentSearchResultQuery = (): QueryResponse => {
  const searchQuery = useDocumentSearchQueryFull();
  const options = useDocumentSearchOptions();

  const queryResults = useInfiniteQuery(
    [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery, options],
    ({ pageParam }) => {
      const timer = documentSearchMetric.start(LOG_DOCUMENT_SEARCH_NAMESPACE, {
        stage: TimeLogStages.Network,
      });
      return documentSearchService
        .search(
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

  return mergePages(queryResults);
};

export const useDocumentSearchResultInvalidate = () => {
  const searchQuery = useDocumentSearchQueryFull();
  const queryClient = useQueryClient();
  queryClient.invalidateQueries([DOCUMENTS_QUERY_KEY.SEARCH, searchQuery]);
};
