import * as React from 'react';
import { useQuery } from 'react-query';

import { ProjectConfig } from '@cognite/discover-api-types';
import { getProjectInfo } from '@cognite/react-container';

import { PROJECT_CONFIG_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { getProjectConfig } from '../../service/network/getProjectConfig';

export const useProjectConfigByKey = <K extends keyof ProjectConfig>(
  key: K
) => {
  const headers = useJsonHeaders({}, true);
  const [project] = getProjectInfo();

  return useQuery(
    PROJECT_CONFIG_QUERY_KEY.CONFIG,
    () => getProjectConfig(headers, project),
    {
      enabled: Boolean(project),
      select: React.useCallback(
        (data) => {
          return data[key];
        },
        [key]
      ),
    }
  );
};
