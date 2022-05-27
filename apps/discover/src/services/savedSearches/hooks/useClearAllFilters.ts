import { documentFacetsStructure as facets } from 'domain/documents/internal/types';

import { useMutatePatchSavedSearch } from 'services/savedSearches/useSavedSearchQuery';

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
