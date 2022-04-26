import { useDeepMemo } from 'hooks/useDeep';

import { useDocumentSearchResultQuery } from '../../../services/documentSearch/useDocumentSearchResultQuery';

export const useDocumentResultHits = () => {
  const { data: documentResult } = useDocumentSearchResultQuery();
  return useDeepMemo(() => documentResult.hits, [documentResult.hits]);
};
