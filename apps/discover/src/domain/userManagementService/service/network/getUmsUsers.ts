import { FetchHeaders, fetchPost } from 'utils/fetch';

import { UMSUser } from '@cognite/user-management-service-types';

import { getUserManagementEndpoint } from './getUserManagementEndpoint';

export const getUmsUsers = (headers: FetchHeaders) => {
  return (query: string, onlyAdmins = false, limit = 5) => {
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
};
