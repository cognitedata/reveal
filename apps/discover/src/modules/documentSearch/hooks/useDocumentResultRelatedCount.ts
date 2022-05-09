import { useDocumentSearchRelatedDocumentsQuery } from 'services/documentSearch/queries/useDocumentSearchRelatedDocumentsQuery';
import { getTotalFromFacets } from 'services/documentSearch/utils/getTotalFromFacets';

import { useDeepMemo } from 'hooks/useDeep';

export const useDocumentResultRelatedCount = () => {
  const { results } = useDocumentSearchRelatedDocumentsQuery();
  const { facets } = results;

  return useDeepMemo(() => getTotalFromFacets(facets), [facets]);
};
