import { useQuery, UseQueryResult } from 'react-query';

import { useDocumentSearchConfig } from '../providers';
import { mergeUniqueArray } from '../utils/merge';
import { getCategoriesByQuery } from '../api/documentSearch';
import {
  AggregateNames,
  BatchedDocumentsFilters,
  CategoryResponse,
  SearchQueryFull,
} from '../utils/types';

export const DOCUMENTS_AGGREGATES = {
  labels: 'DOCUMENTS_LABELS_AGGREGATE',
  fileCategory: 'DOCUMENTS_FILE_TYPE_AGGREGATE',
  location: 'DOCUMENTS_LOCATION_AGGREGATE',
  lastcreated: 'DOCUMENTS_LASTCREATED_AGGREGATE',
  total: 'DOCUMENTS_TOTAL_AGGREGATE',
  pageCount: 'DOCUMENTS_PAGE_COUNT_AGGREGATE',
};

export const useDocumentsCategories = (
  searchQuery: SearchQueryFull,
  category: AggregateNames,
  batchedDocumentsFilters?: BatchedDocumentsFilters
): UseQueryResult<CategoryResponse> => {
  const { cogniteClient } = useDocumentSearchConfig();
  const query = {
    ...searchQuery,
    facets: {
      ...searchQuery.facets,
      [category]: [],
    },
  };

  const batchedFilters = batchedDocumentsFilters || [];

  return useQuery<CategoryResponse>(
    [DOCUMENTS_AGGREGATES[category], query, ...batchedFilters],
    async () => {
      const results = await Promise.all(
        batchedFilters.map(({ filters }) => {
          return getCategoriesByQuery({
            sdk: cogniteClient!,
            query,
            filters: { ...filters },
            category,
          });
        })
      );

      return results.reduce(mergeUniqueArray, {} as CategoryResponse);
    }
  );
};
