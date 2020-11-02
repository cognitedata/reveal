import { IntegrationAPIResponse } from 'model/IntegrationAPIResponse';
import { QueryResult, useQuery } from 'react-query';
import { getIntegrations } from '../utils/IntegrationsAPI';
import { useAppEnv } from './useAppEnv';

export const useIntegrations = (): QueryResult<
  IntegrationAPIResponse,
  Error
> => {
  const { project } = useAppEnv();
  return useQuery<IntegrationAPIResponse, Error>([project], getIntegrations, {
    retry: false,
  });
};
