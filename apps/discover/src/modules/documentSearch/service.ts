import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { mergeUniqueArray } from 'utils/merge';
import { handleServiceError } from 'utils/service/handleServiceError';

import {
  Document,
  DocumentsFilter,
  DocumentsSearch,
  ExternalDocumentsSearch,
} from '@cognite/sdk-playground';

import { aggregates } from 'modules/documentSearch/aggregates';
import { getDocumentSDKClient } from 'modules/documentSearch/sdk';
import {
  SearchQueryFull,
  DocumentResult,
  AggregateNames,
} from 'modules/documentSearch/types';
import { toDocument } from 'modules/documentSearch/utils';

import { processFacets } from './utils/processFacets';
import { getSearchQuery } from './utils/queryUtil';
import { toDocuments } from './utils/toDocuments';

const doSearch = (
  searchQuery: DocumentsSearch,
  filter: DocumentsFilter = {},
  sort: string[] = [],
  limit = 100
) => {
  return getDocumentSDKClient().documents.search({
    limit,
    sort: sort.length > 0 ? sort : undefined,
    filter,
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
      id: {
        equals: Number(documentId),
      },
    },
    [],
    1
  ).then((response) => toDocument(response.items[0]));
};

const search = (
  query: SearchQueryFull,
  options: { filters?: DocumentsFilter; sort: string[] },
  limit?: number
): Promise<DocumentResult> => {
  const queryInfo = getSearchQuery(query);
  return doSearch(
    queryInfo.query,
    mergeUniqueArray(queryInfo.filter, options.filters),
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
  return getDocumentSDKClient().documents.search({
    filter: {
      id: {
        in: documentIds,
      },
    },
  });
};

const getCategoriesByAssetIds = (filters: DocumentsFilter) => {
  return getDocumentSDKClient()
    .documents.search({
      limit: 0,
      filter: filters,
      aggregates,
    })
    .then((result) => processFacets(result));
};

const getCategoriesByQuery = (
  query: SearchQueryFull,
  filters: DocumentsFilter,
  category: AggregateNames
) => {
  const queryInfo = getSearchQuery(query);

  const searchBody: ExternalDocumentsSearch = {
    limit: 0,
    search: queryInfo.query,
    filter: mergeUniqueArray(queryInfo.filter, filters),
  };

  const filteredAggregates = aggregates.filter(
    (aggregate) => aggregate.name === category
  );
  if (filteredAggregates.length > 0) {
    searchBody.aggregates = filteredAggregates;
  }

  return getDocumentSDKClient()
    .documents.search(searchBody)
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
