import { documentFacetsStructure as facets } from 'modules/api/documents/structure';
import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useQuery';

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
