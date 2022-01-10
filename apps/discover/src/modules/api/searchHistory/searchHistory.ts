import { SavedSearchContent } from 'modules/api/savedSearches/types';

import { SIDECAR } from '../../../constants/app';
import { fetchGet, FetchHeaders } from '../../../utils/fetch';

const getSearchHistoryEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/searchHistory`;

export const searchHistory = {
  list: async (headers: FetchHeaders, project: string) =>
    fetchGet<SavedSearchContent[]>(getSearchHistoryEndpoint(project), {
      headers,
    }),
};
