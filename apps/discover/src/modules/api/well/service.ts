import { fetchGet, FetchHeaders } from 'utils/fetch';

import { WellGeometryListResponse } from '@cognite/discover-api-types';

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
    type tmp_type = {
      regions: Record<string, unknown>;
      fields: Record<string, { region?: string }>;
      blocks: Record<string, { region?: string; field?: string }>;
    };

    return fetchGet<tmp_type>(
      `${SIDECAR.discoverApiBaseUrl}/${project}/${URL}/groups`,
      {
        headers,
      }
    );
  },
};
