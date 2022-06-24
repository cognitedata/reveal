import { fetchGet, FetchHeaders } from 'utils/fetchGet';
import { UMSUserProfile } from '@cognite/user-management-service-types';

import { getUserManagementEndpoint } from '../getUserManagementEndpoint';

export const getUserPreferences = (headers: FetchHeaders) => {
  return fetchGet<UMSUserProfile>(getUserManagementEndpoint('me'), {
    headers,
  });
};
