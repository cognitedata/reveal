import { getUserPreferences } from 'domain/userManagementService/service/network/getUserPreferences';

import { useQuery } from 'react-query';

import { getTenantInfo } from '@cognite/react-container';

import { USER_MANAGEMENT_SYSTEM_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export const useUserInfoQuery = () => {
  const [project] = getTenantInfo();
  const headers = useJsonHeaders({ 'x-cdp-project': project }, true);

  return useQuery(USER_MANAGEMENT_SYSTEM_KEY.ME, () =>
    getUserPreferences(headers)
  );
};
