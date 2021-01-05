import { useQuery, useQueryClient } from 'react-query';
import { getIntegrations } from '../utils/IntegrationsAPI';
import { useAppEnv } from './useAppEnv';
import { Integration } from '../model/Integration';
import { SDKError } from '../model/SDKErrors';

export const useIntegrations = () => {
  const { project } = useAppEnv();
  const queryClient = useQueryClient();
  return useQuery<Integration[], SDKError>(
    ['integrations', project],
    (ctx) => {
      return getIntegrations(ctx.queryKey[1]);
    },
    {
      onSuccess: (data) => {
        data.forEach((d) => {
          queryClient.setQueryData<Integration>(
            ['integration', d.id, project],
            (old) => {
              return { ...old, ...d };
            }
          );
        });
      },
    }
  );
};
