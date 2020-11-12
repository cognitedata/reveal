import { QueryResult, useQuery } from 'react-query';
import { getIntegrations } from '../utils/IntegrationsAPI';
import { useAppEnv } from './useAppEnv';
import { Integration } from '../model/Integration';
import { SdkError } from '../model/SdkError';

export const useIntegrations = (): QueryResult<Integration[], SdkError> => {
  const { project } = useAppEnv();
  return useQuery<Integration[], SdkError>([project], getIntegrations, {
    retry: false,
  });
};
