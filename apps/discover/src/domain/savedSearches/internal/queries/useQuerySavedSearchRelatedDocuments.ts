import { useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { RELATED_DOCUMENT_KEY } from 'constants/react-query';

// Need to keep separate query for related document filters
// This does not tie into 'current' filters

export const useQuerySavedSearchRelatedDocuments = () => {
  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();

  return useQuery(
    RELATED_DOCUMENT_KEY,
    () => discoverAPI.savedSearches.get(RELATED_DOCUMENT_KEY, headers, tenant),
    {
      enabled: true,
      retry: false,
    }
  );
};
