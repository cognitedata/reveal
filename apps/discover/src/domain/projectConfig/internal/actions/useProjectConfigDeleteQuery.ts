import { useMutation, useQueryClient } from 'react-query';

import { getProjectInfo } from '@cognite/react-container';

import { PROJECT_CONFIG_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { deleteProjectConfig } from '../../service/network/deleteProjectConfig';

export function useProjectConfigDeleteQuery() {
  const headers = useJsonHeaders({}, true);
  const [project] = getProjectInfo();
  const queryClient = useQueryClient();

  return useMutation(
    () => {
      return deleteProjectConfig(headers, project);
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
