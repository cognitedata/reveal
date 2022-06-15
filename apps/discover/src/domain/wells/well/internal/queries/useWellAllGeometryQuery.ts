import { useQuery } from 'react-query';

import { WellGeometryListResponse } from '@cognite/discover-api-types';
import { getProjectInfo } from '@cognite/react-container';

import { WELLS_DISCOVER_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { getWellGeometry } from '../../service/network/getWellGeometry';

export const useWellAllGeometryQuery = () => {
  const headers = useJsonHeaders();
  const [project] = getProjectInfo();
  const { data: wellConfig } = useWellConfig();

  return useQuery<WellGeometryListResponse>(
    WELLS_DISCOVER_QUERY_KEY.GEOMETRY,
    () => getWellGeometry({ headers, project }),
    { enabled: wellConfig?.disabled !== true }
  );
};
