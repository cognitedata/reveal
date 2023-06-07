import { useMutation, useQueryClient } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { AlertResolvePayload } from './types';

/**
 * Resolve a Alert
 * ===================================
 *
 * This method allows the user to resolve an alert
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param   jobId                                         - MonitoringJobId
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useAlertsResolveCreate = (jobId: string) => {
  const sdk = useSDK();
  const cache = useQueryClient();

  return useMutation(
    async (input: AlertResolvePayload) => {
      const response = await sdk
        .post<object>(`api/v1/projects/${sdk.project}/alerts/close`, {
          data: input,
          headers: {
            'cdf-version': 'alpha',
          },
        })
        .then(({ data }) => {
          return data;
        });
      return response;
    },
    {
      onSuccess: () => {
        cache.invalidateQueries([`monitoring-list-alerts-${jobId}`]);
      },
    }
  );
};
