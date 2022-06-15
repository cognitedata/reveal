import { useQuery, UseQueryResult } from 'react-query';

import { ProjectConfig } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { showErrorMessage } from 'components/Toast';
import { PROJECT_CONFIG_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { LOGIN_ERROR, THRESHOLD } from '../../constants';
import { getProjectConfig } from '../../service/network/getProjectConfig';

export function useProjectConfigGetQuery(): UseQueryResult<ProjectConfig> {
  const headers = useJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(
    PROJECT_CONFIG_QUERY_KEY.CONFIG,
    () => getProjectConfig(headers, project),
    {
      enabled: Boolean(project),
      retry: (failureCount) => {
        if (failureCount <= THRESHOLD) return true;

        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 2500);

        showErrorMessage(LOGIN_ERROR);
        return false;
      },
    }
  );
}
