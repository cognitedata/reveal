import { getTotalFromFacets } from 'domain/documents/internal/transformers//getTotalFromFacets';

import { useDeepMemo } from 'hooks/useDeep';

import { useDocumentResultFacets } from './useDocumentResultFacets';

export const useDocumentResultCount = () => {
  const facets = useDocumentResultFacets();

  return useDeepMemo(() => getTotalFromFacets(facets), [facets]);
};
