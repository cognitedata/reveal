import { Integration } from 'model/Integration';
import { useMutation, useQueryCache } from 'react-query';
import { SDKError } from '../model/SDKErrors';
import { updateIntegration } from '../utils/IntegrationsAPI';
import { CreateUpdateIntegrationObjArgs } from '../utils/integrationUtils';

export interface UseUpdateIntegrationVariables
  extends CreateUpdateIntegrationObjArgs {
  project: string;
}

export const useUpdateIntegration = () => {
  const queryCache = useQueryCache();
  return useMutation<Integration, SDKError, UseUpdateIntegrationVariables>(
    ({ project, data, id }) => {
      return updateIntegration(project, { data, id });
    },
    {
      onMutate: (vars) => {
        queryCache.cancelQueries(['integration', vars.id, vars.project]);
        const previous = queryCache.getQueryData([
          'integration',
          vars.id,
          vars.project,
        ]);
        queryCache.setQueryData<Integration, SDKError>(
          ['integration', vars.id, vars.project],
          (old) => {
            const key = vars.data.label;
            const { value } = vars.data;
            const update = { [key]: value };
            return { ...old, ...update } as Integration;
          }
        );
        return previous;
      },
      onError: (_, vars, previous) => {
        queryCache.setQueryData(
          ['integration', vars.id, vars.project],
          previous
        );
      },
      onSettled: (_, __, vars) => {
        queryCache.invalidateQueries(['integration', vars.id, vars.project]);
      },
    }
  );
};
