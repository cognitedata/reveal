import { documentFacetsStructure as facets } from 'domain/documents/service/types';

import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

import { normalizeSavedSearch } from '../normalizeSavedSearch';

export const useClearAllDocumentFilters = () => {
  const { mutateAsync } = useMutatePatchSavedSearch();
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
