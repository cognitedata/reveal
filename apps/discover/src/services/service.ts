import { stats } from 'domain/stats/service/network/stats';

import { getDefaultHeader, getAuthHeaders } from '@cognite/react-container';

import { useIdToken as useIdTokenHook } from 'hooks/useIdToken';

import { projectConfig } from './projectConfig';

export const useJsonHeaders = (
  extras: Record<string, string> = {},
  useIdToken = false
) => {
  const idToken = useIdTokenHook(useIdToken);

  return {
    ...getDefaultHeader(),
    ...getAuthHeaders({
      useIdToken: idToken,
    }),
    ...extras,
  };
};

export const discoverAPI = {
  projectConfig,
  stats,
};
