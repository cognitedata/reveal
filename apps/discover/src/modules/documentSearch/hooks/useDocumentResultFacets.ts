import { useDeepMemo } from 'hooks/useDeep';

import { useDocumentSearchResultQuery } from '../../../services/documentSearch/useDocumentSearchResultQuery';

export const useDocumentResultFacets = () => {
  const { data: documentResult } = useDocumentSearchResultQuery();
  return useDeepMemo(() => documentResult.facets, [documentResult.facets]);
};
