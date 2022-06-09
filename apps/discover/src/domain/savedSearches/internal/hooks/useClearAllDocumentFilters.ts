import { documentFacetsStructure as facets } from 'domain/documents/internal/types';
import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { normalizeSavedSearch } from '../transformers/normalizeSavedSearch';

export const useClearAllDocumentFilters = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return () => {
    return mutateAsync(
      normalizeSavedSearch({
        query: '',
        geoJson: [],
        filters: {
          documents: { facets, extraDocumentFilters: undefined },
          extraGeoJsonFilters: [],
        },
      })
    );
  };
};
