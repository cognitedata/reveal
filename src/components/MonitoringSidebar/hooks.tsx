import { useMutation } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  CreateMonitoringTaskPayload,
  SessionAPIPayload,
  SessionAPIResponse,
} from './types';

/**
 * Create Session Nonce
 * ===================================
 *
 * This method creates a nOnce using the sessions API
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useCreateSessionNonce = () => {
  const sdk = useSDK();
  return useMutation(
    async (payload: SessionAPIPayload) => {
      await sdk.get('/api/v1/token/inspect');

      const response = await sdk
        .post<SessionAPIResponse>(`api/v1/projects/${sdk.project}/sessions`, {
          data: payload,
        })
        .then(({ data }) => {
          return data;
        });
      return response;
    },
    {
      onSuccess: () => {},
    }
  );
};

/**
 * Create a Monitoring Job
 * ===================================
 *
 * This method creates a monitoring job using the AIR API middleware
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param CreateMonitoringTaskPayload                     - An object of the CreateMonitoringTaskPayload
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useCreateMonitoringJob = () => {
  const sdk = useSDK();
  return useMutation(
    async (payload: CreateMonitoringTaskPayload) => {
      await sdk.get('/api/v1/token/inspect');
      const response = await sdk
        .post<SessionAPIResponse>(
          `apps/v1/projects/${sdk.project}/charts/monitoring/monitoringTasks`,
          {
            data: payload,
          }
        )
        .then(({ data }) => {
          return data;
        });

      return response;
    },
    {
      onSuccess: () => {},
    }
  );
};
