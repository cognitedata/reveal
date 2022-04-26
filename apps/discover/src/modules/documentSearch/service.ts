import isEmpty from 'lodash/isEmpty';
import { getDocumentSDKClient } from 'services/documentSearch/sdk';
import { handleServiceError } from 'utils/errors';
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
import {
  SearchQueryFull,
  DocumentResult,
  AggregateNames,
} from 'modules/documentSearch/types';
import { toDocument } from 'modules/documentSearch/utils';

import { getCogniteSDKClient } from '../../utils/getCogniteSDKClient';

import { processFacets } from './utils/processFacets';
import { getSearchQuery } from './utils/queryUtil';
import { toDocuments } from './utils/toDocuments';

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

export const getLabels = () => {
  return getCogniteSDKClient().labels.list({
    filter: {},
  });
};

// @deprecated, use documentsByIds instead (this is only used in components/Highlight.tsx)
export const getDocument = (query: string, documentId: string) => {
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

const search = (
  query: SearchQueryFull,
  options: { filters?: DocumentFilter; sort: DocumentSortItem[] },
  limit?: number
): Promise<DocumentResult> => {
  const queryInfo = getSearchQuery(query);
  return doSearch(
    queryInfo.query,
    mergeUniqueArray<DocumentFilter | undefined>(
      queryInfo.filter,
      options.filters
    ),
    options.sort,
    limit
  )
    .then((result): DocumentResult => {
      return {
        count: result.items.length,
        hits: toDocuments(result),
        facets: processFacets(result),
        aggregates: result.aggregates,
      };
    })
    .catch((error) => {
      const safeErrorResponse = {
        count: 0,
        hits: [],
        facets: processFacets({
          items: [],
          aggregates: [],
        }),
      };

      return handleServiceError<DocumentResult>(error, safeErrorResponse);
    });
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
  search,
  documentsByIds,
  getCategoriesByAssetIds,
  getCategoriesByQuery,
};
