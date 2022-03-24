import { fetchPost, FetchHeaders, fetchGet, fetchPatch } from 'utils/fetch';

import {
  AuthModes,
  User,
  UserProfileSyncResponse,
  UserProfileUpdateResponse,
} from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

import { UserProfileUpdateQueryData } from './types';

export const user = {
  sync: async (headers: FetchHeaders, tenant: string, accessToken?: string) =>
    fetchPost<UserProfileSyncResponse>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/user/sync`,
      {
        accessToken,
      },
      { headers }
    ),
  getUser: async (headers: FetchHeaders, tenant: string) =>
    fetchGet<User | undefined>(`${SIDECAR.discoverApiBaseUrl}/${tenant}/user`, {
      headers,
    }),

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
  updateUser: async (
    payload: UserProfileUpdateQueryData,
    headers: FetchHeaders,
    tenant: string
  ) =>
    fetchPatch<UserProfileUpdateResponse>(
      `${SIDECAR.discoverApiBaseUrl}/${tenant}/user`,
      payload.payload,
      {
        headers,
      }
    ),
};
