import { FetchHeaders, fetchPost } from 'utils/fetch';

import {
  UMSUser,
  UMSUserListBody,
} from '@cognite/user-management-service-types';

import { getUserManagementEndpoint } from './getUserManagementEndpoint';

export const getUmsUserList = (
  headers: FetchHeaders,
  body: UMSUserListBody
) => {
  if (body.ids.length === 0) {
    return Promise.resolve([]);
  }

  return fetchPost<UMSUser[]>(getUserManagementEndpoint('list'), body, {
    headers,
  });
};
