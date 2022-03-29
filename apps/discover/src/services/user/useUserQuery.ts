import { UseQueryResult, useQuery, useQueryClient } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { AuthModes, User } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { ONLY_FETCH_ONCE, USER_KEY } from 'constants/react-query';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';

export function useUserRoles(): UseQueryResult<AuthModes | undefined> {
  const idHeaders = useJsonHeaders({}, true);
  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();
  const { data: azureConfig } = useProjectConfigByKey('azureConfig');

  return useQuery<AuthModes | undefined>(
    USER_KEY.ROLES,
    () => {
      if (azureConfig && azureConfig?.enabled) {
        return discoverAPI.user.getRoles(idHeaders, tenant);
      }

      return discoverAPI.user.getRolesLegacy(headers, tenant);
    },
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
    }
  );
}

// TODO(PP-2319): use this hook to fetch admin users.
// Currently, this giving all users.
export const useAdminUsers = (): UseQueryResult<User[] | undefined> => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useQuery<User[] | undefined>(
    [...USER_KEY.ADMIN_USERS],
    () => discoverAPI.user.getAdminUsers(headers, tenant),
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
      onError: () => {
        queryClient.invalidateQueries([...USER_KEY.ADMIN_USERS]);
      },
    }
  );
};
