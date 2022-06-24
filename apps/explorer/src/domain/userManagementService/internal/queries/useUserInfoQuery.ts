import { getUserPreferences } from 'domain/userManagementService/service/network/getUserPreferences';

import { useQuery } from 'react-query';
import { getProjectInfo } from '@cognite/react-container';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

const USER_MANAGEMENT_SYSTEM_KEY = 'USER_MANAGEMENT_ME';

export const useUserInfoQuery = () => {
  const [project] = getProjectInfo();
  const headers = useJsonHeaders({ 'x-cdp-project': project }, true);

  return useQuery(USER_MANAGEMENT_SYSTEM_KEY, () =>
    getUserPreferences(headers)
  );
};
