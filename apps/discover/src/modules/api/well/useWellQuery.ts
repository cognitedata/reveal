import { useQuery } from 'react-query';

import { WellGeometryListResponse } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { WELLS_DISCOVER_QUERY_KEY } from 'constants/react-query';

import { discoverAPI, useJsonHeaders } from '../service';

export const useWellAllGeometryQuery = () => {
  const headers = useJsonHeaders();
  const [project] = getTenantInfo();

  return useQuery<WellGeometryListResponse>(
    WELLS_DISCOVER_QUERY_KEY.GEOMETRY,
    () => discoverAPI.well.get({ headers, project })
  );
};

export const useWellGroupsQuery = () => {
  const headers = useJsonHeaders();
  const [project] = getTenantInfo();

  return useQuery(WELLS_DISCOVER_QUERY_KEY.GROUPS, () =>
    discoverAPI.well.getGroups({ headers, project })
  );
};
