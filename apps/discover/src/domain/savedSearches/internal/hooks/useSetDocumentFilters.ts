import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { DocumentFilter } from '@cognite/sdk';

import { DocumentsFacets } from 'modules/documentSearch/types';

export const useSetDocumentFilters = () => {
  const { mutateAsync } = usePatchSavedSearchMutate();
  return (facets: DocumentsFacets, extraDocumentFilters?: DocumentFilter) => {
    return mutateAsync({
      filters: {
        documents: { facets, extraDocumentFilters },
      },
    });
  };
};
