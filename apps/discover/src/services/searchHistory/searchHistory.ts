import { SearchHistoryResponse } from '@cognite/discover-api-types';

import { SIDECAR } from '../../constants/app';
import { fetchGet, FetchHeaders } from '../../utils/fetch';

const getSearchHistoryEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/searchHistory`;

export const searchHistory = {
  list: async (headers: FetchHeaders, project: string) =>
    fetchGet<SearchHistoryResponse[]>(getSearchHistoryEndpoint(project), {
      headers,
    }),
};
