import { getSavedSearch } from 'domain/savedSearches/service/network/getSavedSearch';

import { useQuery } from 'react-query';

import { getProjectInfo } from '@cognite/react-container';

import { RELATED_DOCUMENT_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

// Need to keep separate query for related document filters
// This does not tie into 'current' filters

export const useQuerySavedSearchRelatedDocuments = () => {
  const headers = useJsonHeaders();
  const [tenant] = getProjectInfo();

  return useQuery(
    RELATED_DOCUMENT_KEY,
    () => getSavedSearch(RELATED_DOCUMENT_KEY, headers, tenant),
    {
      enabled: true,
      retry: false,
    }
  );
};
