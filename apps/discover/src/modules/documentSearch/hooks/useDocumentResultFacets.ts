import { useDocumentSearchResultQuery } from 'services/documentSearch/queries/useDocumentSearchResultQuery';

import { useDeepMemo } from 'hooks/useDeep';

export const useDocumentResultFacets = () => {
  const { results } = useDocumentSearchResultQuery();
  return useDeepMemo(() => results.facets, [results.facets]);
};
