import { documentFacetsStructure as facets } from 'modules/api/documents/structure';
import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useSavedSearchQuery';

import { normalizeSavedSearch } from '../normalizeSavedSearch';

export const useClearAllFilters = (doSearch = true) => {
  const { mutateAsync } = useMutatePatchSavedSearch(doSearch);
  return () =>
    mutateAsync(
      normalizeSavedSearch({
        filters: {
          wells: {},
          documents: {
            facets,
          },
        },
      })
    );
};
