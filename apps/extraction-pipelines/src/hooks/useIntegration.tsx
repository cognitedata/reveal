import { useQuery } from 'react-query';
import { useAppEnv } from 'hooks/useAppEnv';
import { getIntegrationById } from 'utils/IntegrationsAPI';
import { Integration } from 'model/Integration';
import { SDKError } from 'model/SDKErrors';

export const useIntegrationById = (integrationId?: number) => {
  const { project } = useAppEnv();
  return useQuery<Integration, SDKError>(
    ['integration', integrationId, project],
    (ctx) => {
      return getIntegrationById(ctx.queryKey[1], ctx.queryKey[2]);
    },
    {
      enabled: !!integrationId,
    }
  );
};
