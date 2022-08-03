import { getSearchQuery } from 'domain/documents/internal/transformers/getSearchQuery';
import { getDocumentSDKClient } from 'domain/documents/service/utils/getDocumentSDKClient';

import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import { handleServiceError } from 'utils/errors';
import { mergeUniqueArray } from 'utils/merge';

import { DocumentFilter, DocumentSearchRequest } from '@cognite/sdk';

import { EMPTY_ARRAY } from 'constants/empty';
import { aggregates } from 'modules/documentSearch/aggregates';
import { SearchQueryFull, DocumentResult } from 'modules/documentSearch/types';
import { processFacets } from 'modules/documentSearch/utils/processFacets';
import { toDocuments } from 'modules/documentSearch/utils/toDocuments';

import {
  INVALID_POLYGON_SEARCH_MESSAGE,
  SMALLER_POLYGON_SEARCH_MESSAGE,
} from '../../constants';

export type SearchRequestOptions = Omit<
  DocumentSearchRequest,
  'search' | 'limit' | 'aggregates'
>;
// we should eventually change the params to a single one which is just DocumentSearchRequest
export const searchDocument = (
  query: SearchQueryFull,
  options: SearchRequestOptions,
  limit?: number
): Promise<DocumentResult> => {
  const queryInfo = getSearchQuery(query);

  const filter = mergeUniqueArray<DocumentFilter | undefined>(
    queryInfo.filter,
    options.filter
  );

  const { sort, cursor } = options;

  return getDocumentSDKClient()
    .search({
      limit,
      sort: sort && sort.length > 0 ? sort : undefined,
      filter: isEmpty(filter) ? undefined : filter,
      search: queryInfo.query,
      aggregates,
      cursor,
    })
    .then((result): DocumentResult => {
      return {
        count: result.items.length,
        hits: toDocuments(result),
        facets: processFacets(result),
        aggregates: result.aggregates,
        nextCursor: result.nextCursor,
      };
    })
    .catch((error) => {
      let possibleKnownError;

      const safeErrorResponse = {
        count: 0,
        hits: EMPTY_ARRAY,
        facets: processFacets({
          items: EMPTY_ARRAY,
          aggregates: EMPTY_ARRAY,
        }),
      };

      if (isString(error?.errorMessage)) {
        if (error?.errorMessage?.includes('Invalid coordinates for Polygon')) {
          possibleKnownError = INVALID_POLYGON_SEARCH_MESSAGE;
        }
        if (error?.errorMessage?.includes('exceeds coordinates size limit')) {
          possibleKnownError = SMALLER_POLYGON_SEARCH_MESSAGE;
        }
      }

      return handleServiceError<DocumentResult>(
        error,
        safeErrorResponse,
        possibleKnownError
      );
    });
};
