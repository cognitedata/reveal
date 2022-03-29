import { FetchHeaders, fetchGet } from 'utils/fetch';

import { AuthModes, User } from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

export const user = {
  getAdminUsers: async (headers: FetchHeaders, tenant: string) =>
    fetchGet<User[] | undefined>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/users/admin`,
      { headers }
    ),
  // from legacy
  getRolesLegacy: async (headers: FetchHeaders, tenant: string) =>
    fetchGet<AuthModes | undefined>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/user/roles/legacy`,
      {
        headers,
      }
    ),
  // from id token
  getRoles: async (headers: FetchHeaders, tenant: string) =>
    fetchGet<AuthModes | undefined>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/user/roles`,
      {
        headers,
      }
    ),
};
