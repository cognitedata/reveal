import { getUmsUsers } from 'domain/userManagementService/service/network/getUmsUsers';

import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { UMSUser } from '@cognite/user-management-service-types';

import {
  ONLY_FETCH_ONCE,
  USER_MANAGEMENT_SYSTEM_KEY,
} from 'constants/react-query';

import { MAXIMUM_NUMBER_OF_ADMINS } from '../../constants';

export const useAdminUsersQuery = (
  query = ''
): UseQueryResult<UMSUser[] | undefined> => {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();

  const search = getUmsUsers(headers);

  return useQuery<UMSUser[] | undefined>(
    USER_MANAGEMENT_SYSTEM_KEY.ADMIN_USERS,
    () => search(query, true, MAXIMUM_NUMBER_OF_ADMINS),
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
      onError: () => {
        queryClient.invalidateQueries(USER_MANAGEMENT_SYSTEM_KEY.ADMIN_USERS);
      },
    }
  );
};
