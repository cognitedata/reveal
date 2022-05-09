import { UseInfiniteQueryResult } from 'react-query';

import add from 'lodash/add';

import { DocumentResult } from 'modules/documentSearch/types';
import { getEmptyDocumentResult } from 'modules/documentSearch/utils';

import { InifniteQueryResponse } from '../queries/types';

/**
 * The reason we add this new 'results' key is that react-query
 * adds an array of arrays in pages, and it's hard to deal with
 * this way we only have to do it once here and everyone using
 * this function is happy
 */
export const mergeSearchResponsePages = (
  queryResults: UseInfiniteQueryResult<DocumentResult>
): InifniteQueryResponse => {
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
        count: add(page?.count, result.count),
        hits: page?.hits ? [...result.hits, ...page.hits] : result.hits,
      };
    }),
  };
};
