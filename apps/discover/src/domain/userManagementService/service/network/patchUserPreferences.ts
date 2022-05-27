import { FetchHeaders, fetchPatch } from 'utils/fetch';

import {
  UMSUserProfile,
  UMSUserProfilePreferences,
} from '@cognite/user-management-service-types';

import { getUserManagementEndpoint } from './getUserManagementEndpoint';

export const patchUserPreferences = (
  headers: FetchHeaders,
  payload: Partial<UMSUserProfilePreferences>
) => {
  return fetchPatch<UMSUserProfile>(getUserManagementEndpoint('me'), payload, {
    headers,
  });
};
