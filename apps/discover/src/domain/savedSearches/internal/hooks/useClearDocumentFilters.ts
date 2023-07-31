import { documentFacetsStructure as emptyFacets } from 'domain/documents/internal/types';
import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

export const useClearDocumentFilters = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return () => {
    return mutateAsync({
      filters: { documents: { facets: emptyFacets } },
    });
  };
};
