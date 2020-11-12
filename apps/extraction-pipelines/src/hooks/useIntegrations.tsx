import { QueryResult, useQuery } from 'react-query';
import { getIntegrations } from '../utils/IntegrationsAPI';
import { useAppEnv } from './useAppEnv';
import { Integration } from '../model/Integration';
import { SDKError } from '../model/SDKErrors';

export const useIntegrations = (): QueryResult<Integration[], SDKError> => {
  const { project } = useAppEnv();
  return useQuery<Integration[], SDKError>([project], getIntegrations, {
    retry: false,
  });
};
