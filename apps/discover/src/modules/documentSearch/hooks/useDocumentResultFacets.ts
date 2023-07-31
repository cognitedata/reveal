import { useDocumentSearchResultQuery } from 'domain/documents/service/queries/useDocumentSearchResultQuery';

import { useDeepMemo } from 'hooks/useDeep';

export const useDocumentResultFacets = () => {
  const { results } = useDocumentSearchResultQuery();
  return useDeepMemo(() => results.facets, [results.facets]);
};
