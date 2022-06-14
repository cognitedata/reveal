import { useQuery, UseQueryResult } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { PROJECT_CONFIG_QUERY_KEY } from 'constants/react-query';
import { Metadata } from 'pages/authorized/admin/projectConfig';

import { getProjectConfigMetadata } from '../../service/network/getProjectConfigMetadata';

export function useProjectConfigMetadataGetQuery(): UseQueryResult<Metadata> {
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(
    PROJECT_CONFIG_QUERY_KEY.METADATA,
    () => getProjectConfigMetadata(headers, project),
    {
      enabled: Boolean(project),
    }
  );
}
