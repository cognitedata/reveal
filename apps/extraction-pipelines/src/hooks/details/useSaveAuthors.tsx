import { useMutation, useQueryCache } from 'react-query';
import { Integration } from '../../model/Integration';
import { SDKError } from '../../model/SDKErrors';
import { IntegrationUpdateSpec, saveUpdate } from '../../utils/IntegrationsAPI';

export const useSaveAuthors = () => {
  const queryCache = useQueryCache();
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
        queryCache.cancelQueries(['integration', vars.id, vars.project]);
        const previous = queryCache.getQueryData([
          'integration',
          vars.id,
          vars.project,
        ]);
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
