import { useMutation, useQueryClient } from 'react-query';

import isObject from 'lodash/isObject';
import noop from 'lodash/noop';

import { ProjectConfig } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import {
  LAYERS_QUERY_KEY,
  PROJECT_CONFIG_QUERY_KEY,
} from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { updateProjectConfig } from '../../service/network/updateProjectConfig';

export function useProjectConfigUpdateMutate({
  onSuccess = noop,
  onError = noop,
}: {
  onSuccess: () => void;
  onError: () => void;
}) {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [project] = getTenantInfo();

  return useMutation(
    (newProjectConfig: ProjectConfig) => {
      return updateProjectConfig(newProjectConfig, headers, project);
    },

    {
      onSuccess: (_config, data) => {
        const existing = queryClient.getQueryData(
          PROJECT_CONFIG_QUERY_KEY.CONFIG
        );
        if (isObject(existing)) {
          queryClient.setQueryData(PROJECT_CONFIG_QUERY_KEY.CONFIG, {
            ...existing,
            ...data,
          });
        }
        queryClient.invalidateQueries(PROJECT_CONFIG_QUERY_KEY.CONFIG);
        queryClient.invalidateQueries(LAYERS_QUERY_KEY.ALL); // reset the layers
        onSuccess();
      },
      onError: (_error) => {
        onError();
      },
    }
  );
}
