import isEmpty from 'lodash/isEmpty';
import { getDocumentSDKClient } from 'services/documentSearch/sdk';
import { searchDocument } from 'services/documentSearch/service/searchDocument';
import { getSearchQuery } from 'services/documentSearch/utils/getSearchQuery';
import { mergeUniqueArray } from 'utils/merge';

import {
  Document,
  DocumentSearch,
  DocumentFilter,
  DocumentSortItem,
  DocumentSearchResponse,
  DocumentSearchRequest,
} from '@cognite/sdk';

import { aggregates } from 'modules/documentSearch/aggregates';
import { SearchQueryFull, AggregateNames } from 'modules/documentSearch/types';
import { toDocument } from 'modules/documentSearch/utils';

import { processFacets } from './utils/processFacets';

/**
 * @deprecated, use documentsByIds instead (this is only used in components/Highlight.tsx)
 */
export const getDocument = (query: string, documentId: string) => {
  const doSearch = (
    searchQuery: DocumentSearch['search'],
    filter: DocumentFilter | undefined,
    sort?: DocumentSortItem[],
    limit = 100
  ): Promise<DocumentSearchResponse> => {
    return getDocumentSDKClient().search({
      limit,
      sort: sort && sort.length > 0 ? sort : undefined,
      filter: isEmpty(filter) ? undefined : filter,
      search: searchQuery,
      aggregates,
    });
  };
  return doSearch(
    { query, highlight: true },
    {
      equals: {
        property: ['id'],
        value: Number(documentId),
      },
    },
    [],
    1
  ).then((response) => toDocument(response.items[0]));
};

const documentsByIds = (documentIds: Document['id'][]) => {
  return getDocumentSDKClient().search({
    filter: {
      in: {
        property: ['id'],
        values: documentIds,
      },
    },
  });
};

const getCategoriesByAssetIds = (filters: DocumentFilter) => {
  return getDocumentSDKClient()
    .search({
      limit: 0,
      filter: isEmpty(filters) ? undefined : filters,
      aggregates,
    })
    .then((result) => processFacets(result));
};

const getCategoriesByQuery = ({
  query,
  filters,
  category,
}: {
  query: SearchQueryFull;
  filters: DocumentFilter | undefined;
  category: AggregateNames;
}) => {
  const queryInfo = getSearchQuery(query);

  const finalFilters = mergeUniqueArray<DocumentFilter | undefined>(
    queryInfo?.filter,
    filters
  );

  const searchBody: DocumentSearchRequest = {
    limit: 0,
    search: queryInfo.query,
    filter: isEmpty(finalFilters) ? undefined : finalFilters,
  };

  const filteredAggregates = aggregates.filter(
    (aggregate) => aggregate.name === category
  );
  if (filteredAggregates.length > 0) {
    searchBody.aggregates = filteredAggregates;
  }

  return getDocumentSDKClient()
    .search(searchBody)
    .then((result) => ({
      facets: processFacets(result)[category],
      total: result.aggregates ? result.aggregates[0].total : 0,
    }));
};

export const documentSearchService = {
  search: searchDocument,
  documentsByIds,
  getCategoriesByAssetIds,
  getCategoriesByQuery,
};
