import axios from 'axios';
import { useQuery } from 'react-query';
import { UMSUser } from '@cognite/user-management-service-types';
import { AuthHeaders, useAuthContext } from '@cognite/react-container';
import { getHeaders } from 'utils/getHeaders';

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
  fasAppId,
  idToken,
}: Props) => {
  const headers = getHeaders(fasAppId, idToken);
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
