import axios from 'axios';
import { useQuery } from 'react-query';
import { UMSUser } from '@cognite/user-management-service-types';
import { AuthHeaders, getAuthHeaders } from '@cognite/react-container';

import { userKeys } from './useFindUsers';

interface Props {
  ids?: string[];
  userManagementServiceBaseUrl: string;
  fasAppId?: string;
}

const doFetchUsers = ({
  userManagementServiceBaseUrl,
  headers,
  ids,
}: { headers: AuthHeaders | { fasAppId?: string } } & Props) => {
  return axios
    .post<Record<string, UMSUser>>(
      `${userManagementServiceBaseUrl}/user`,
      { uids: ids },
      { headers }
    )
    .then((result) => {
      return result.data;
    });
};

export const useFetchUsers = ({
  userManagementServiceBaseUrl,
  ids,
  fasAppId,
}: Props) => {
  const headers = { ...getAuthHeaders({ useIdToken: true }), fasAppId };

  return useQuery(
    userKeys.usersGet(ids || []),
    () =>
      doFetchUsers({ ids, userManagementServiceBaseUrl, headers, fasAppId }),
    {
      enabled: ids && ids.length > 0,
    }
  );
};
