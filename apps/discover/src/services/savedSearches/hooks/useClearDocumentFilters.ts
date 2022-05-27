import { documentFacetsStructure as emptyFacets } from 'domain/documents/internal/types';

import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { DocumentFilter } from '@cognite/sdk';

import { DocumentsFacets } from 'modules/documentSearch/types';

export const useClearDocumentFilters = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return () => {
    return mutateAsync({
      filters: { documents: { facets: emptyFacets } },
    });
  };
};

export const useSetDocumentFilters = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
  return (facets: DocumentsFacets, extraDocumentFilters?: DocumentFilter) => {
    return mutateAsync({
      filters: {
        documents: { facets, extraDocumentFilters },
      },
    });
  };
};
