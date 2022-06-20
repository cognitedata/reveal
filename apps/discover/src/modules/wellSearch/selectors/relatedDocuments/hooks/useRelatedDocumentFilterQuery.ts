import { SavedSearchContent } from 'domain/savedSearches/types';

import { useMemo } from 'react';

import { SearchQueryFull } from 'modules/documentSearch/types';
import { getEmptyFacets } from 'modules/documentSearch/utils';
import { useRelatedDocumentsFilters } from 'modules/inspectTabs/selectors';

export const getFilterQuery = (searchOption?: SavedSearchContent) => ({
  phrase: searchOption?.query || '',
  geoFilter: [],
  facets: {
    ...getEmptyFacets(),
    ...(searchOption?.filters?.documents?.facets || {}),
  },
});

export const useRelatedDocumentFilterQuery = (): SearchQueryFull => {
  const data = useRelatedDocumentsFilters();

  return useMemo(() => getFilterQuery(data), [data]);
};
