import { useDocumentSearchResultQuery } from 'domain/documents/service/queries/useDocumentSearchResultQuery';

import { useDeepMemo } from 'hooks/useDeep';

export const useDocumentResultHits = () => {
  const { results } = useDocumentSearchResultQuery();
  return useDeepMemo(() => results.hits, [results.hits]);
};
