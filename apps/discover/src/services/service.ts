import { feedback } from 'domain/feedback/service/network/service';

import { getDefaultHeader, getAuthHeaders } from '@cognite/react-container';

import { useIdToken as useIdTokenHook } from 'hooks/useIdToken';

import { projectConfig } from './projectConfig';
import { savedSearches } from './savedSearches';
import { searchHistory } from './searchHistory';
import { seismic } from './seismic';
import { stats } from './stats';
import { user } from './user';
import { well } from './well';

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
  feedback,
  projectConfig,
  savedSearches,
  searchHistory,
  seismic,
  stats,
  user,
  well,
};
