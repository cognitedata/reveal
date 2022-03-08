import { fetchGet, FetchHeaders } from 'utils/fetch';

import {
  WellGeometryListResponse,
  WellGroupsResponse,
  WellFiltersSummaryCount,
  WellFiltersNptDurations,
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

  getNptDetailCodes: async ({
    headers,
    project,
  }: {
    headers: FetchHeaders;
    project: string;
  }) => {
    return fetchGet<WellFiltersSummaryCount[]>(
      `${SIDECAR.discoverApiBaseUrl}/${project}/${URL}/filters/nptDetailCodes`,
      {
        headers,
      }
    );
  },

  getNptCodes: async ({
    headers,
    project,
  }: {
    headers: FetchHeaders;
    project: string;
  }) => {
    return fetchGet<WellFiltersSummaryCount[]>(
      `${SIDECAR.discoverApiBaseUrl}/${project}/${URL}/filters/nptCodes`,
      {
        headers,
      }
    );
  },

  getNptDurations: async ({
    headers,
    project,
  }: {
    headers: FetchHeaders;
    project: string;
  }) => {
    return fetchGet<WellFiltersNptDurations>(
      `${SIDECAR.discoverApiBaseUrl}/${project}/${URL}/filters/nptDurations`,
      {
        headers,
      }
    );
  },
};
