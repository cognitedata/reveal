import axios from 'axios';
import { useQuery } from 'react-query';
import { UMSUser } from '@cognite/user-management-service-types';
import { AuthHeaders, getAuthHeaders } from '@cognite/react-container';

import { userKeys } from './useFindUsers';

interface Props {
  ids?: string[];
  userManagementServiceBaseUrl: string;
}

const doFetchUsers = ({
  userManagementServiceBaseUrl,
  headers,
  ids,
}: { headers: AuthHeaders } & Props) => {
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

export const useFetchUsers = ({ userManagementServiceBaseUrl, ids }: Props) => {
  const headers = getAuthHeaders({ useIdToken: true });

  return useQuery(
    userKeys.usersGet(ids || []),
    () => doFetchUsers({ ids, userManagementServiceBaseUrl, headers }),
    {
      enabled: ids && ids.length > 0,
    }
  );
};
