import { QueryResult, useQuery } from 'react-query';
import { useAppEnv } from './useAppEnv';
import { Integration } from '../model/Integration';
import { SDKError } from '../model/SDKErrors';
import { getIntegrationById } from '../utils/IntegrationsAPI';

export const useIntegrationById = (
  integrationId: number
): QueryResult<Integration, SDKError> => {
  const { project } = useAppEnv();
  return useQuery<Integration, SDKError>(
    ['integration', integrationId, project],
    getIntegrationById
  );
};
