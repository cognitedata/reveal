import { fetchPost, FetchHeaders, fetchGet, fetchPatch } from '_helpers/fetch';
import { SIDECAR } from 'constants/app';
import { AuthModes, User } from 'modules/user/types';

import { UserProfileUpdateQueryData } from './types';

export const user = {
  sync: async (headers: FetchHeaders, tenant: string, token?: string) =>
    fetchPost(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/user/sync`,
      {
        token,
      },
      { headers }
    ),
  getUser: async (headers: FetchHeaders, tenant: string) =>
    fetchGet<User | undefined>(`${SIDECAR.discoverApiBaseUrl}/${tenant}/user`, {
      headers,
    }),
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
  updateUser: async (
    payload: UserProfileUpdateQueryData,
    headers: FetchHeaders,
    tenant: string
  ) =>
    fetchPatch(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/user`,
      payload.payload,
      {
        headers,
      }
    ),
};
