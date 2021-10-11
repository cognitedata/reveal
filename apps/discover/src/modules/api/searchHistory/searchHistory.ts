import { SavedSearchContent } from 'modules/api/savedSearches/types';

import { fetchGet, FetchHeaders } from '../../../_helpers/fetch';
import { SIDECAR } from '../../../constants/app';

const getSearchHistoryEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/searchHistory`;

export const searchHistory = {
  list: async (headers: FetchHeaders, project: string) =>
    fetchGet<SavedSearchContent[]>(getSearchHistoryEndpoint(project), {
      headers,
    }),
};
