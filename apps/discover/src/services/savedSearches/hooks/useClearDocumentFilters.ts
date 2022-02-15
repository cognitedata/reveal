import { documentFacetsStructure as emptyFacets } from 'services/documents/structure';
import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { DocumentsFilter } from '@cognite/sdk-playground';

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
  return (facets: DocumentsFacets, extraDocumentFilters?: DocumentsFilter) => {
    return mutateAsync({
      filters: {
        documents: { facets, extraDocumentFilters },
      },
    });
  };
};
