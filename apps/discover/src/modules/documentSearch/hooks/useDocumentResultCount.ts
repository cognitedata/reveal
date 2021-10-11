import { useMemo } from 'react';

import { useFacets } from 'modules/documentSearch/selectors';

export const useDocumentResultCount = () => {
  const facets = useFacets();

  return useMemo(
    () =>
      facets.lastUpdatedTime.reduce((result, value) => {
        return result + value.count;
      }, 0),
    [facets]
  );
};
