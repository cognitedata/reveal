// import { getFlow } from '@cognite/auth-utils';
import { getAuthHeaders } from '@cognite/react-container';

import { useIdToken as useIdTokenHook } from 'hooks/useIdToken';

import { documents } from './documents';
import { favorites } from './favorites';
import { feedback } from './feedback';
import { geospatial } from './geospatial';
import { projectConfig } from './projectConfig';
import { savedSearches } from './savedSearches';
import { searchHistory } from './searchHistory';
import { seismic } from './seismic';
import { stats } from './stats';
import { user } from './user';
import { well } from './well';

export const getDefaultHeader = () => ({
  'Content-Type': 'application/json',
});

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
  documents,
  favorites,
  feedback,
  geospatial,
  projectConfig,
  savedSearches,
  searchHistory,
  seismic,
  stats,
  user,
  well,
};
