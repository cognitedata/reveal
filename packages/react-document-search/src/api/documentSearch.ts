import isEmpty from 'lodash/isEmpty';
import {
  CogniteClient,
  DocumentFilter,
  DocumentSearchRequest,
} from '@cognite/sdk';

import { SearchQueryFull, DocumentResult } from '../utils/types';
import { toDocuments } from '../utils/toDocument';
import { processFacets } from '../utils/processFacets';
import { getSearchQuery } from '../utils/getSearchQuery';
import { aggregates } from '../utils/aggregates';
import { mergeUniqueArray } from '../utils/mergeUniqueArray';

export type SearchRequestOptions = Omit<
  DocumentSearchRequest,
  'search' | 'limit' | 'aggregates'
>;

const EMPTY_ARRAY = [] as any[];

// we should eventually change the params to a single one which is just DocumentSearchRequest
export const searchDocument = (
  sdk: () => CogniteClient,
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

  return sdk()
    .documents.search({
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
    .catch((_error) => {
      const safeErrorResponse = {
        count: 0,
        hits: EMPTY_ARRAY,
        facets: processFacets({
          items: EMPTY_ARRAY,
          aggregates: EMPTY_ARRAY,
        }),
      };

      return safeErrorResponse;
    });
};
