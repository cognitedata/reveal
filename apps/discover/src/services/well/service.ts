import { fetchGet, FetchHeaders } from 'utils/fetch';

import {
  WellGeometryListResponse,
  WellGroupsResponse,
} from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

const URL = 'well';

export const well = {
  get: async ({
    headers,
    project,
  }: {
    headers: FetchHeaders;
    project: string;
  }) => {
    return fetchGet<WellGeometryListResponse>(
      `${SIDECAR.discoverApiBaseUrl}/${project}/${URL}/geometry`,
      {
        headers,
      }
    );
  },
  getGroups: async ({
    headers,
    project,
  }: {
    headers: FetchHeaders;
    project: string;
  }) => {
    // type tmp_type = Record<string, Record<string, string[]>>;

    return fetchGet<WellGroupsResponse>(
      `${SIDECAR.discoverApiBaseUrl}/${project}/${URL}/groups`,
      {
        headers,
      }
    );
  },
};
