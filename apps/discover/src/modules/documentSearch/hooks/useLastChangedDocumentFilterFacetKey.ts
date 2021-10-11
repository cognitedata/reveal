import { useEffect, useMemo, useState } from 'react';

import get from 'lodash/get';

import { DocumentsFacets } from 'modules/documentSearch/types';
import { getEmptyFacets } from 'modules/documentSearch/utils';
import { useAppliedDocumentFilters } from 'modules/sidebar/selectors';

export const useLastChangedDocumentFilterFacetKey = () => {
  const [documentResultsFacets, setDocumentResultsFacets] =
    useState<DocumentsFacets>(getEmptyFacets());
  const [
    lastChangedDocumentFilterFacetKey,
    setLastChangedDocumentFilterFacetKey,
  ] = useState<string>();

  const appliedDocumentFilters = useAppliedDocumentFilters();

  useEffect(() => {
    Object.keys(appliedDocumentFilters).forEach((key) => {
      if (
        get(appliedDocumentFilters, key).length !==
        get(documentResultsFacets, key).length
      ) {
        setLastChangedDocumentFilterFacetKey(key);
      }
    });
    setDocumentResultsFacets(appliedDocumentFilters);
  }, [appliedDocumentFilters]);

  return useMemo(
    () => lastChangedDocumentFilterFacetKey,
    [lastChangedDocumentFilterFacetKey]
  );
};
