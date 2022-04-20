import { fetchGet, FetchHeaders } from 'utils/fetch';

import {
  WellGeometryListResponse,
  WellGroupsResponse,
  WellFiltersSummaryCount,
  WellFiltersNptDurations,
} from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

import { nptLegend } from './legend/npt/service';

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

  // This was temporarily used to fetch cached filters from discover-api. Leaving it for now in case we need to revert to this
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

  // This was temporarily used to fetch cached filters from discover-api. Leaving it for now in case we need to revert to this
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

  // This was temporarily used to fetch cached filters from discover-api. Leaving it for now in case we need to revert to this
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

  // Sub-endpoints of 'well' category (found inside of 'well' folder)
  nptLegend,
};
