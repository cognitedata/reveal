import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import merge from 'lodash/merge';

import { getTenantInfo } from '@cognite/react-container';

import { PROJECT_CONFIG_KEY } from 'constants/react-query';
import { discoverAPI, getJsonHeaders } from 'modules/api/service';

export function useProjectConfigUpdateMutate() {
  const headers = getJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [project] = getTenantInfo();

  return useMutation(
    (newProjectConfig: any) => {
      // optimistic update
      const oldProjectConfig = queryClient.getQueryData(PROJECT_CONFIG_KEY);

      if (oldProjectConfig) {
        queryClient.setQueryData(PROJECT_CONFIG_KEY, [
          merge({}, oldProjectConfig, newProjectConfig),
        ]);
      }

      return discoverAPI.projectConfig.update(
        newProjectConfig,
        headers,
        project
      );
    },

    {
      onSuccess: () => {
        return queryClient.invalidateQueries(PROJECT_CONFIG_KEY);
      },
      onError: (_error) => {
        return queryClient.invalidateQueries(PROJECT_CONFIG_KEY);
      },
    }
  );
}

export function useProjectConfigGetQuery(): UseQueryResult<any> {
  const headers = getJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(PROJECT_CONFIG_KEY, () =>
    discoverAPI.projectConfig.getConfig(headers, project)
  );
}
