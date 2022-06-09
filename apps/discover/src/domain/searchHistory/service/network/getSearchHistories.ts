import { SearchHistoryResponse } from '@cognite/discover-api-types';

import { SIDECAR } from '../../../../constants/app';
import { fetchGet, FetchHeaders } from '../../../../utils/fetch';

const getSearchHistoriesForProjectUrl = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/searchHistory`;

export const getSearchHistories = {
  list: async (headers: FetchHeaders, project: string) =>
    fetchGet<SearchHistoryResponse[]>(
      getSearchHistoriesForProjectUrl(project),
      {
        headers,
      }
    ),
};
