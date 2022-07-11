import { useQuery, UseQueryResult } from 'react-query';

import { getProjectInfo } from '@cognite/react-container';

import { PROJECT_CONFIG_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { getProjectConfigMetadata } from '../../service/network/getProjectConfigMetadata';
import { Metadata } from '../../types';

export function useProjectConfigMetadataGetQuery(): UseQueryResult<Metadata> {
  const headers = useJsonHeaders({}, true);
  const [project] = getProjectInfo();

  return useQuery(
    PROJECT_CONFIG_QUERY_KEY.METADATA,
    () => getProjectConfigMetadata(headers, project),
    {
      enabled: Boolean(project),
    }
  );
}
