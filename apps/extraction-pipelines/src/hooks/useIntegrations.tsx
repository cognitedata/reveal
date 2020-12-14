import { QueryResult, useQuery, useQueryCache } from 'react-query';
import { getIntegrations } from '../utils/IntegrationsAPI';
import { useAppEnv } from './useAppEnv';
import { Integration } from '../model/Integration';
import { SDKError } from '../model/SDKErrors';

export const useIntegrations = (): QueryResult<Integration[], SDKError> => {
  const { project } = useAppEnv();
  const queryCache = useQueryCache();
  return useQuery<Integration[], SDKError>(
    ['integrations', project],
    getIntegrations,
    {
      onSuccess: (data) => {
        data.forEach((d) => {
          queryCache.setQueryData<Integration, SDKError>(
            ['integration', d.id, project],
            (old) => {
              return { ...old, ...d } as Integration;
            }
          );
        });
      },
    }
  );
};
