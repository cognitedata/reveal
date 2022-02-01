import { useMemo } from 'react';

import { useQuerySavedSearchRelatedDocuments } from 'modules/api/savedSearches/useSavedSearchQuery';

import { getFilterQuery } from './utils';

export const useRelatedDocumentFilterQuery = () => {
  const { data } = useQuerySavedSearchRelatedDocuments();

  return useMemo(() => {
    if (data && 'error' in data) {
      return getFilterQuery();
    }
    return getFilterQuery(data);
  }, [data]);
};
