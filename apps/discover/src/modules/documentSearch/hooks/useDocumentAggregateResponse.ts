import {
  BatchedDocumentsFilters,
  DocumentQueryFacets,
  SearchQueryFull,
} from '../types';

import { useDocumentsCategories } from './useDocumentsCategories';

export const useDocumentAggregateResponse = (
  searchQuery: SearchQueryFull,
  batchedDocumentsFilters?: BatchedDocumentsFilters
): Partial<DocumentQueryFacets> => {
  const { data: fileCategoryResponse } = useDocumentsCategories(
    searchQuery,
    'fileCategory',
    batchedDocumentsFilters
  );
  const { data: labelsResponse } = useDocumentsCategories(
    searchQuery,
    'labels',
    batchedDocumentsFilters
  );
  const { data: locationResponse } = useDocumentsCategories(
    searchQuery,
    'location',
    batchedDocumentsFilters
  );
  const { data: pageCountResponse } = useDocumentsCategories(
    searchQuery,
    'pageCount',
    batchedDocumentsFilters
  );

  return {
    fileCategory: fileCategoryResponse?.facets,
    labels: labelsResponse?.facets,
    location: locationResponse?.facets,
    pageCount: pageCountResponse?.facets,
  };
};
