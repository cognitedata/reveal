import { fetchGet, FetchHeaders } from 'utils/fetch';

import { CogniteCapability } from '@cognite/sdk';

import { SIDECAR } from 'constants/app';

export const tokenInspect = async (headers?: FetchHeaders) => {
  return fetchGet<{ capabilities: CogniteCapability }>(
    `${SIDECAR.cdfApiBaseUrl}/api/v1/token/inspect`,
    { headers }
  );
};
