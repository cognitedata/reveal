import { useQuerySavedSearchRelatedDocuments } from 'domain/savedSearches/internal/queries/useQuerySavedSearchRelatedDocuments';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { useMemo } from 'react';

import { SearchQueryFull } from 'modules/documentSearch/types';

export const getFilterQuery = (searchOption?: SavedSearchContent) => ({
  phrase: searchOption?.query || '',
  geoFilter: [],
  facets: {
    fileCategory: searchOption?.filters?.documents?.facets?.fileCategory || [],
    labels: searchOption?.filters?.documents?.facets?.labels || [],
    lastcreated: searchOption?.filters?.documents?.facets?.lastcreated || [],
    lastmodified: searchOption?.filters?.documents?.facets?.lastmodified || [],
    location: searchOption?.filters?.documents?.facets?.location || [],
    pageCount: searchOption?.filters?.documents?.facets?.pageCount || [],
  },
});

export const useRelatedDocumentFilterQuery = (): SearchQueryFull => {
  const { data } = useQuerySavedSearchRelatedDocuments();

  return useMemo(() => {
    if (data && 'error' in data) {
      return getFilterQuery();
    }
    return getFilterQuery(data);
  }, [data]);
};
