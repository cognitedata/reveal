import { useDocumentSearchResultQuery } from 'services/documentSearch/queries/useDocumentSearchResultQuery';

import { useDeepMemo } from 'hooks/useDeep';

export const useDocumentResultHits = () => {
  const { results } = useDocumentSearchResultQuery();
  return useDeepMemo(() => results.hits, [results.hits]);
};
