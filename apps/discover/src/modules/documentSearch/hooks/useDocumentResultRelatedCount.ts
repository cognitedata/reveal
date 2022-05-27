import { getTotalFromFacets } from 'domain/documents/internal/transformers//getTotalFromFacets';
import { useDocumentSearchRelatedDocumentsQuery } from 'domain/documents/service/queries/useDocumentSearchRelatedDocumentsQuery';

import { useDeepMemo } from 'hooks/useDeep';

export const useDocumentResultRelatedCount = () => {
  const { results } = useDocumentSearchRelatedDocumentsQuery();
  const { facets } = results;

  return useDeepMemo(() => getTotalFromFacets(facets), [facets]);
};
