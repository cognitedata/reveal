import { useMemo } from 'react';

import get from 'lodash/get';

import { useAppliedDocumentFilters } from 'modules/sidebar/selectors';

export const useAppliedDocumentFiltersFacetsKeys = () => {
  const appliedDocumentFilters = useAppliedDocumentFilters();

  return useMemo(
    () =>
      Object.keys(appliedDocumentFilters).filter(
        (key) => get(appliedDocumentFilters, key).length
      ),
    [appliedDocumentFilters]
  );
};
