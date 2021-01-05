import { useMutation, useQueryClient } from 'react-query';
import { Integration } from '../../model/Integration';
import { SDKError } from '../../model/SDKErrors';
import { IntegrationUpdateSpec, saveUpdate } from '../../utils/IntegrationsAPI';

export const useDetailsUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Integration,
    SDKError,
    { project: string; items: IntegrationUpdateSpec[]; id: number }
  >(
    ({ project, items }) => {
      return saveUpdate(project, items);
    },
    {
      onMutate: (vars) => {
        queryClient.cancelQueries(['integration', vars.id, vars.project]);
        const previous = queryClient.getQueryData([
          'integration',
          vars.id,
          vars.project,
        ]);
        return previous;
      },
      onError: (_, vars, previous) => {
        queryClient.setQueryData(
          ['integration', vars.id, vars.project],
          previous
        );
      },
      onSettled: (_, __, vars) => {
        queryClient.invalidateQueries(['integration', vars.id, vars.project]);
      },
    }
  );
};
