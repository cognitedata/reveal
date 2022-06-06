import { fetchGet, FetchHeaders } from 'utils/fetch';

import { WellGeometryListResponse } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

const URL = 'well';

export const getWellGeometry = async ({
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
};
