import { useQuery } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { CogniteCapability } from '@cognite/sdk';

import { TOKEN_INSPECT_QUERY_KEY } from 'constants/react-query';

import { tokenInspect } from './service';

export const useCapabilitiesQuery = () => {
  const headers = useJsonHeaders();

  return useQuery<{
    capabilities: CogniteCapability;
  }>(TOKEN_INSPECT_QUERY_KEY.lists(), () => tokenInspect(headers), {
    staleTime: Infinity,
    cacheTime: Infinity,
    select: (data) => ({ capabilities: data.capabilities }),
  });
};
