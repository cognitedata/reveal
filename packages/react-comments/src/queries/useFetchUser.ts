import axios from 'axios';
import { useQuery } from 'react-query';
import { UMSUser } from '@cognite/user-management-service-types';
import {
  AuthHeaders,
  getAuthHeaders,
  useAuthContext,
} from '@cognite/react-container';

import { userKeys } from './useFindUsers';

interface Props {
  userManagementServiceBaseUrl: string;
  fasAppId?: string;
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
  fasAppId,
}: Props) => {
  const headers = { ...getAuthHeaders({ useIdToken: true }), fasAppId };
  const { authState } = useAuthContext();

  return useQuery(
    userKeys.usersGet([authState?.id || '']),
    () =>
      doFetchUser({
        userManagementServiceBaseUrl,
        headers,
      }),
    {
      enabled: !!authState?.id,
    }
  );
};
