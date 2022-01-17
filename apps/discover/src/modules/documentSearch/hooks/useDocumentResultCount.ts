import { useDeepMemo } from 'hooks/useDeep';

import { useDocumentResultFacets } from './useDocumentResultFacets';

export const useDocumentResultCount = () => {
  const facets = useDocumentResultFacets();

  return useDeepMemo(
    () =>
      facets.total.reduce((result, value) => {
        return result + value.count;
      }, 0),
    [facets]
  );
};
