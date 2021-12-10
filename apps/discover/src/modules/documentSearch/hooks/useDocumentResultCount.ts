import { useDeepMemo } from 'hooks/useDeep';

import { useDocumentResultFacets } from './useDocumentResultFacets';

export const useDocumentResultCount = () => {
  const facets = useDocumentResultFacets();

  return useDeepMemo(
    () =>
      facets.lastUpdatedTime.reduce((result, value) => {
        return result + value.count;
      }, 0),
    [facets]
  );
};
