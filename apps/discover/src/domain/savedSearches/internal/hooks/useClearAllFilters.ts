import { documentFacetsStructure as facets } from 'domain/documents/internal/types';
import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { normalizeSavedSearch } from '../transformers/normalizeSavedSearch';

export const useClearAllFilters = (doSearch = true) => {
  const { mutateAsync } = usePatchSavedSearchMutate(doSearch);
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
