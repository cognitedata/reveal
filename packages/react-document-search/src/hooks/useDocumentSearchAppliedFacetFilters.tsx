import { DocumentsFacets } from 'utils/types';

import { useDocumentSearchState } from '../providers';

export const useDocumentSearchAppliedFacetFilters = (
  facet: keyof DocumentsFacets
) => {
  const { facets } = useDocumentSearchState();

  return facets[facet] || [];
};
