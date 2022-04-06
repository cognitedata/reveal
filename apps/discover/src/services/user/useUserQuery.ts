import { UseQueryResult, useQuery } from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { AuthModes } from '@cognite/discover-api-types';
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
