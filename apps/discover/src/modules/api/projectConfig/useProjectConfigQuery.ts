import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import merge from 'lodash/merge';

import { getTenantInfo } from '@cognite/react-container';

import { PROJECT_CONFIG_QUERY_KEY } from 'constants/react-query';
import { discoverAPI, getJsonHeaders } from 'modules/api/service';

export function useProjectConfigUpdateMutate() {
  const headers = getJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [project] = getTenantInfo();

  return useMutation(
    (newProjectConfig: any) => {
      // optimistic update
      const oldProjectConfig = queryClient.getQueryData(
        PROJECT_CONFIG_QUERY_KEY.CONFIG
      );

      if (oldProjectConfig) {
        queryClient.setQueryData(PROJECT_CONFIG_QUERY_KEY.CONFIG, [
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
        return queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
      },
      onError: (_error) => {
        return queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
      },
    }
  );
}

export function useProjectConfigGetQuery(): UseQueryResult<any> {
  const headers = getJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(PROJECT_CONFIG_QUERY_KEY.CONFIG, () =>
    discoverAPI.projectConfig.getConfig(headers, project)
  );
}

export function useProjectConfigMetadataGetQuery(): UseQueryResult<any> {
  const headers = getJsonHeaders({}, true);
  const [project] = getTenantInfo();

  return useQuery(PROJECT_CONFIG_QUERY_KEY.METADATA, () =>
    discoverAPI.projectConfig.getMetadata(headers, project)
  );
}

export function useProjectConfigDeleteQuery() {
  const headers = getJsonHeaders({}, true);
  const [project] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      return discoverAPI.projectConfig.delete(headers, project);
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
      },
      onError: (_error) => {
        return queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
      },
    }
  );
}
