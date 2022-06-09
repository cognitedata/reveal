import { FetchHeaders, fetchGet } from 'utils/fetch';

import { User } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

export const getAdminUsers = async (headers: FetchHeaders, tenant: string) =>
  fetchGet<User[] | undefined>(
    `${SIDECAR.discoverApiBaseUrl}/${tenant}/users/admin`,
    { headers }
  );
