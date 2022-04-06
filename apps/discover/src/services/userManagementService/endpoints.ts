import { fetchGet, FetchHeaders, fetchPatch, fetchPost } from 'utils/fetch';

import {
  UMSUser,
  UMSUserProfile,
  UMSUserProfilePreferences,
} from '@cognite/user-management-service-types';

import { SIDECAR } from 'constants/app';

const getUserManagementEndpoint = (action: string) =>
  `${SIDECAR.userManagementServiceBaseUrl}/user/${action}`;

export const userPreferences = (headers: FetchHeaders) => {
  const get = () =>
    fetchGet<UMSUserProfile>(getUserManagementEndpoint('me'), {
      headers,
    });

  const update = (payload: Partial<UMSUserProfilePreferences>) =>
    fetchPatch<UMSUserProfile>(getUserManagementEndpoint('me'), payload, {
      headers,
    });

  return {
    get,
    update,
  };
};

export const userManagement = (headers: FetchHeaders) => {
  const search = (query: string, onlyAdmins = false, limit = 5) => {
    return fetchPost<UMSUser[]>(
      getUserManagementEndpoint('search'),
      {
        query,
        onlyAdmins,
        limit,
      },
      { headers }
    );
  };

  return {
    search,
  };
};
