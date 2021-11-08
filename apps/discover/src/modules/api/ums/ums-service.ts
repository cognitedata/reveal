import { UMSUser } from '@cognite/user-management-service-types';

import { FetchHeaders, fetchPost } from '../../../_helpers/fetch';
import { SIDECAR } from '../../../constants/app';

export const UMSService = {
  search: (query: string, headers: FetchHeaders) => {
    return fetchPost<UMSUser[]>(
      `${SIDECAR.userManagementServiceBaseUrl}/user/search`,
      {
        query,
      },
      { headers }
    );
  },
};
