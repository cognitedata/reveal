import { useMemo } from 'react';

import { useQuerySavedSearchRelatedDocuments } from 'services/savedSearches/useSavedSearchQuery';

import { SearchQueryFull } from 'modules/documentSearch/types';

import { getFilterQuery } from '../utils';

export const useRelatedDocumentFilterQuery = (): SearchQueryFull => {
  const { data } = useQuerySavedSearchRelatedDocuments();

  return useMemo(() => {
    if (data && 'error' in data) {
      return getFilterQuery();
    }
    return getFilterQuery(data);
  }, [data]);
};
