import { fetchGet, FetchHeaders } from 'utils/fetch';

import { WellGroupsResponse } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

const URL = 'well';

export const getWellGroups = async ({
  headers,
  project,
}: {
  headers: FetchHeaders;
  project: string;
}) => {
  return fetchGet<WellGroupsResponse>(
    `${SIDECAR.discoverApiBaseUrl}/${project}/${URL}/groups`,
    {
      headers,
    }
  );
};
