import { useQuery } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { getProjectInfo } from '@cognite/react-container';

import { WELLS_DISCOVER_QUERY_KEY } from 'constants/react-query';

import { getWellGroups } from '../../service/network/getWellGroups';

export const useWellGroupsQuery = () => {
  const headers = useJsonHeaders();
  const [project] = getProjectInfo();

  return useQuery(WELLS_DISCOVER_QUERY_KEY.GROUPS, () =>
    getWellGroups({ headers, project })
  );
};
