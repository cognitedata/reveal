import { useQuery } from 'react-query';
import { useAppEnv } from 'hooks/useAppEnv';
import { getIntegrationById } from 'utils/IntegrationsAPI';
import { Integration } from 'model/Integration';
import { SDKError } from 'model/SDKErrors';

export const useIntegrationById = (integrationId?: number) => {
  const { project } = useAppEnv();
  return useQuery<Integration, SDKError>(
    ['integration', integrationId, project],
    () => {
      return getIntegrationById(integrationId!, project ?? '');
    },
    {
      enabled: !!integrationId,
    }
  );
};
