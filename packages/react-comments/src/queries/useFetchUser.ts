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
}
const doFetchUser = ({
  userManagementServiceBaseUrl,
  headers,
  id,
}: { headers: AuthHeaders; id: string } & Props) => {
  return axios
    .get<UMSUser>(`${userManagementServiceBaseUrl}/user/${id}`, { headers })
    .then((result) => {
      return result.data;
    });
};

export const useFetchUser = ({ userManagementServiceBaseUrl }: Props) => {
  const headers = getAuthHeaders({ useIdToken: true });
  const { authState } = useAuthContext();

  return useQuery(
    userKeys.usersGet([authState?.id || '']),
    () =>
      doFetchUser({
        id: authState?.id || '',
        userManagementServiceBaseUrl,
        headers,
      }),
    {
      enabled: !!authState?.id,
    }
  );
};
