import { getUmsUsers } from 'domain/userManagementService/service/network/getUmsUsers';

import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { UMSUser } from '@cognite/user-management-service-types';

import {
  ONLY_FETCH_ONCE,
  USER_MANAGEMENT_SYSTEM_KEY,
} from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { ADMIN_USER_ROLE, MAXIMUM_NUMBER_OF_ADMINS } from '../../constants';

export const useAdminUsersQuery = (
  query = ''
): UseQueryResult<UMSUser[] | undefined> => {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();

  const search = getUmsUsers(headers);

  return useQuery<UMSUser[] | undefined>(
    USER_MANAGEMENT_SYSTEM_KEY.ADMIN_USERS,
    () => search(query, [ADMIN_USER_ROLE], MAXIMUM_NUMBER_OF_ADMINS),
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
      onError: () => {
        queryClient.invalidateQueries(USER_MANAGEMENT_SYSTEM_KEY.ADMIN_USERS);
      },
    }
  );
};
