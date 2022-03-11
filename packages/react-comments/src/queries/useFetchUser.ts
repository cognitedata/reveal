import axios from 'axios';
import { useQuery } from 'react-query';
import { UMSUser } from '@cognite/user-management-service-types';
import { AuthHeaders } from '@cognite/react-container';

import { getHeaders } from '../utils/getHeaders';

import { userKeys } from './useFindUsers';

interface Props {
  userManagementServiceBaseUrl: string;
  fasAppId?: string;
  idToken?: string;
}
const doFetchUser = ({
  userManagementServiceBaseUrl,
  headers,
}: { headers: AuthHeaders | { fasAppId?: string } } & Props) => {
  return axios
    .get<UMSUser>(`${userManagementServiceBaseUrl}/user/me`, {
      headers,
    })
    .then((result) => {
      return result.data;
    });
};

export const useFetchUser = ({
  userManagementServiceBaseUrl,
  userId,
  fasAppId,
  idToken,
}: { userId: string } & Props) => {
  const headers = getHeaders(fasAppId, idToken);

  return useQuery(
    userKeys.usersGet([userId]),
    () =>
      doFetchUser({
        userManagementServiceBaseUrl,
        headers,
      }),
    {
      enabled: !!userId,
    }
  );
};
