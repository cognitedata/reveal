import isEmpty from 'lodash/isEmpty';
import { getDocumentSDKClient } from 'services/documentSearch/sdk';
import { getSearchQuery } from 'services/documentSearch/utils/getSearchQuery';
import { handleServiceError } from 'utils/errors';
import { mergeUniqueArray } from 'utils/merge';

import { DocumentFilter, DocumentSortItem } from '@cognite/sdk';

import { EMPTY_ARRAY } from 'constants/empty';
import { aggregates } from 'modules/documentSearch/aggregates';
import { SearchQueryFull, DocumentResult } from 'modules/documentSearch/types';
import { processFacets } from 'modules/documentSearch/utils/processFacets';
import { toDocuments } from 'modules/documentSearch/utils/toDocuments';

export const searchDocument = (
  query: SearchQueryFull,
  options: {
    filters?: DocumentFilter;
    sort: DocumentSortItem[];
    cursor?: string;
  },
  limit = 25
): Promise<DocumentResult> => {
  const queryInfo = getSearchQuery(query);

  const filter = mergeUniqueArray<DocumentFilter | undefined>(
    queryInfo.filter,
    options.filters
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
      const safeErrorResponse = {
        count: 0,
        hits: EMPTY_ARRAY,
        facets: processFacets({
          items: EMPTY_ARRAY,
          aggregates: EMPTY_ARRAY,
        }),
      };

      return handleServiceError<DocumentResult>(error, safeErrorResponse);
    });
};
