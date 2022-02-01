import { DocumentsFilter } from '@cognite/sdk-playground';

import { documentFacetsStructure as emptyFacets } from 'modules/api/documents/structure';
import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useSavedSearchQuery';
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
