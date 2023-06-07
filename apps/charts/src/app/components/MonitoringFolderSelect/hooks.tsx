import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  MonitoringFolderCreatePayload,
  MonitoringFolder,
  MonitoringFolderListPayload,
} from './types';

/**
 * Create Monitoring Folder
 * ===================================
 * This method returns a mutation which can be used to create Monitoring folders
 * in the AIR API.
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param MonitoringFolderCreatePayload                   - Param Object with properties of new Folder
 * @returns UseMutationResult                             - Returns UseMutationResult
 */
export const useCreateMonitoringFolder = () => {
  const cache = useQueryClient();
  const sdk = useSDK();

  return useMutation(
    async (payload: MonitoringFolderCreatePayload) => {
      const response = await sdk
        .post<MonitoringFolder[]>(
          `apps/v1/projects/${sdk.project}/charts/monitoring/folders`,
          { data: payload }
        )
        .then(({ data }) => {
          return data;
        });
      return response;
    },
    {
      onSuccess: () => {
        cache.invalidateQueries(['monitoring-folders']);
        cache.removeQueries(['monitoring-folders']);
      },
    }
  );
};

/**
 * List Monitoring Folders
 * ===================================
 *
 * This method returns a list of the monitoring folders from the AIR API
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useMonitoringFolders = () => {
  const sdk = useSDK();

  return useQuery<MonitoringFolder[]>(`monitoring-folders`, () =>
    sdk
      .get<MonitoringFolderListPayload>(
        `apps/v1/projects/${sdk.project}/charts/monitoring/folders`
      )
      .then(({ data }) => {
        return data.items;
      })
  );
};
