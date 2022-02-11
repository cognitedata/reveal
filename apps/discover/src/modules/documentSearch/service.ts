import { getCogniteSDKClient, doReAuth } from 'utils/getCogniteSDKClient';
import { mergeUniqueArray } from 'utils/merge';

import { reportException } from '@cognite/react-errors';
import {
  DocumentsFilter,
  DocumentsSearch,
  ExternalDocumentsSearch,
} from '@cognite/sdk-playground';

import { showErrorMessage } from 'components/toast';
import { aggregates } from 'modules/documentSearch/aggregates';
import {
  SearchQueryFull,
  DocumentResult,
  AggregateNames,
} from 'modules/documentSearch/types';
import { toDocument } from 'modules/documentSearch/utils';

import { getDocumentSDKClient } from './sdk';
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

      if (error.status === 401) {
        doReAuth();
        showErrorMessage('There has been a service error, please try again');
        return safeErrorResponse;
      }

      if (error.status === 400 && error.extra && error.extra.validationError) {
        const validations = error.extra.validationError;

        Object.keys(validations).forEach((key) => {
          showErrorMessage(validations[key]);
        });
      } else {
        showErrorMessage('There has been a service error, please try again');
      }

      reportException(error);

      return safeErrorResponse;
    });
};

const documentsByIds = (documentIds: number[]) => {
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
