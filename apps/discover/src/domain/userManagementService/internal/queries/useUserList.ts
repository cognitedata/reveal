import { getUmsUserList } from 'domain/userManagementService/service/network/getUmsUserList';

import { useQuery } from '@tanstack/react-query';

import { getProjectInfo } from '@cognite/react-container';
import { UMSUserListBody } from '@cognite/user-management-service-types';

import { USER_MANAGEMENT_SYSTEM_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

export const useUserList = (body: UMSUserListBody) => {
  const [project] = getProjectInfo();
  const headers = useJsonHeaders({ 'x-cdp-project': project }, true);

  return useQuery([USER_MANAGEMENT_SYSTEM_KEY.LIST, body.ids], () =>
    getUmsUserList(headers, body)
  );
};
