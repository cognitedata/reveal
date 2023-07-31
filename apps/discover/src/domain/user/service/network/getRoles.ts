import { FetchHeaders, fetchGet } from 'utils/fetch';

import { AuthModes } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

export const getRoles = async (headers: FetchHeaders, tenant: string) =>
  fetchGet<AuthModes | undefined>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/user/roles`,
    {
      headers,
    }
  );
