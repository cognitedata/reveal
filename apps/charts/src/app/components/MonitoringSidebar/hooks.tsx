import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { SessionAPIResponse } from '../../domain/chart/internal/types';
import { EMPTY_ARRAY } from '../../domain/constants';

import {
  AlertResponsePayload,
  CreateMonitoringJobPayload,
  MonitoringFolderJobs,
  MonitoringSubscriptionPayload,
  MonitoringSubscriptionResponse,
  MonitoringSubscriptionsListResponse,
  CreateMonitoringJobAPIResponse,
} from './types';

/**
 * Create a Monitoring Job
 * ===================================
 *
 * This method creates a monitoring job using the AIR API middleware
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param CreateMonitoringJobPayload                     - An object of the CreateMonitoringJobPayload
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useCreateMonitoringJob = () => {
  const sdk = useSDK();
  const cache = useQueryClient();

  return useMutation(
    async (payload: CreateMonitoringJobPayload) => {
      const response = await sdk
        .post<CreateMonitoringJobAPIResponse>(
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
      onSuccess: () => {
        cache.invalidateQueries(['monitoring-folders-jobs-monitoring-sidebar']);
      },
    }
  );
};

/**
 * List Monitoring folders with jobs
 * ===================================
 *
 * Lists monitoring folders with their respective jobs
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseQueryResult                             - Returns UseQueryResult
 */
export const useMonitoringFoldersWithJobs = (
  hookId: string,
  filters?: {
    timeseriesIds?: number[];
    timeseriesExternalIds?: string[];
    subscribed?: boolean;
    currentChart?: boolean;
  }
) => {
  const sdk = useSDK();
  const userInfo = useUserInfo();
  const userAuthId = userInfo.data?.id;
  const { subscribed, timeseriesIds, timeseriesExternalIds, currentChart } =
    filters || {};
  const hookConfig: any = {
    enabled:
      userAuthId !== undefined &&
      (!currentChart ||
        Boolean(timeseriesIds?.length || timeseriesExternalIds?.length)),
  };
  if (hookId === 'indicator') {
    hookConfig.refetchInterval = 10000;
  }

  return useQuery(
    [
      `monitoring-folders-jobs-${hookId}`,
      Boolean(subscribed),
      Boolean(currentChart),
      timeseriesIds || EMPTY_ARRAY,
      timeseriesExternalIds || EMPTY_ARRAY,
    ],
    () =>
      sdk
        .post<MonitoringFolderJobs[]>(
          `apps/v1/projects/${sdk.project}/charts/monitoring/folders/filter`,
          {
            data: {
              timeseriesIds: timeseriesIds || EMPTY_ARRAY,
              timeseriesExternalIds: timeseriesExternalIds || EMPTY_ARRAY,
              subscribed,
            },
            params: {
              listJobs: true,
              userAuthId,
            },
          }
        )
        .then(({ data }) => {
          /**
           * This adapts the responses by removing the first 11 characters
           * which is the id from the externalId field, the rest of the characters
           * represents the name
           */
          return data.map((folder) => ({
            ...folder,
            tasks: folder.tasks.map((task) => ({
              ...task,
              externalId: task.externalId.substring(
                0,
                task.externalId.length - 21
              ),
            })),
          }));
        }),
    hookConfig
  );
};

/**
 * Delete a Monitoring job
 * ===================================
 *
 * This method deletes a monitoring job
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param   jobId                                         - Id of the monitoring job to delete
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useMonitoringJobsDelete = () => {
  const sdk = useSDK();
  const cache = useQueryClient();

  return useMutation(
    async (jobId: string) => {
      const response = await sdk
        .delete<SessionAPIResponse>(
          `apps/v1/projects/${sdk.project}/charts/monitoring/monitoringTasks/${jobId}`
        )
        .then(({ data }) => {
          return data;
        });
      return response;
    },
    {
      onSuccess: () => {
        cache.invalidateQueries(['monitoring-folders-jobs-monitoring-sidebar']);
        cache.invalidateQueries(['monitoring-folders']);
      },
    }
  );
};

/**
 * Create Subscription
 * ===================================
 *
 * This method allows the user to Subscribe to a monitoring job
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param   MonitoringSubscriptionPayload                 - MonitoringSubscriptionPayload
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useMonitoringSubscriptionCreate = () => {
  const sdk = useSDK();
  const cache = useQueryClient();

  return useMutation(
    async (input: MonitoringSubscriptionPayload) => {
      const response = await sdk
        .post<MonitoringSubscriptionResponse[]>(
          `apps/v1/projects/${sdk.project}/charts/monitoring/subscribe`,
          {
            data: input,
          }
        )
        .then(({ data }) => {
          return data;
        });
      return response;
    },
    {
      onSuccess: (_data, payload) => {
        const ids = [payload.channelID].join(',');
        cache.invalidateQueries([`monitoring-subscriptions-list-${ids}`]);
        cache.invalidateQueries([`monitoring-folders-jobs-indicator`]);
        cache.invalidateQueries([`monitoring-folders-jobs-monitoring-sidebar`]);
      },
    }
  );
};

/**
 * Delete Subscription
 * ===================================
 *
 * This method allows the user to unsubscribe to a monitoring job
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @param   MonitoringSubscriptionPayload                 - MonitoringSubscriptionPayload
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useMonitoringSubscriptionDelete = () => {
  const sdk = useSDK();
  const cache = useQueryClient();

  return useMutation(
    async (input: MonitoringSubscriptionPayload) => {
      const response = await sdk
        .delete<MonitoringSubscriptionResponse[]>(
          `apps/v1/projects/${sdk.project}/charts/monitoring/subscribe`,
          {
            data: input,
          }
        )
        .then(({ data }) => {
          return data;
        });
      return response;
    },
    {
      onSuccess: (_data, payload) => {
        const ids = [payload.channelID].join(',');
        const queryToInvalidate = `monitoring-subscriptions-list-${ids}`;
        cache.invalidateQueries([queryToInvalidate]);
        cache.invalidateQueries([`monitoring-folders-jobs-indicator`]);
        cache.invalidateQueries([`monitoring-folders-jobs-monitoring-sidebar`]);
      },
    }
  );
};

/**
 * List subscriptions
 * ===================================
 *
 * Lists subscriptions
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseQueryResult                             - Returns UseQueryResult
 */
export const useMonitoringSubscripitionList = (
  monitoringTaskIds: number[],
  channelIds: number[], // used for query cache invalidation
  userAuthId: string
) => {
  const sdk = useSDK();
  const ids = channelIds.join(',');
  return useQuery([`monitoring-subscriptions-list-${ids}`], () =>
    sdk
      .post<MonitoringSubscriptionsListResponse>(
        `apps/v1/projects/${sdk.project}/charts/monitoring/subscriptions`,
        {
          data: {
            monitoringTaskIDs: monitoringTaskIds,
            userAuthId,
          },
        }
      )
      .then(({ data }) => data)
  );
};

/**
 * List Alerts
 * ===================================
 *
 * This method lists alerts from the monitoring api
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useListAlerts = (jobId: string, enabled = true) => {
  const sdk = useSDK();
  return useQuery(
    [`monitoring-list-alerts-${jobId}`],
    () =>
      sdk
        .get<AlertResponsePayload>(
          `apps/v1/projects/${sdk.project}/charts/monitoring/${jobId}/alerts`
        )
        .then(({ data }) => {
          return data.items;
        }),
    {
      enabled,
    }
  );
};
