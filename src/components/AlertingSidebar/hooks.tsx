import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  AlertResponsePayload,
  MonitoringJobsAlertsResponsePayload,
} from './types';

/**
 * List Monitoring tasks
 * ===================================
 *
 * This method lists monitoring tasks from the monitoring api
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useListMonitoringTasks = () => {
  const sdk = useSDK();
  return useQuery(`monitoring-list-tasks`, () =>
    sdk
      .get<MonitoringJobsAlertsResponsePayload>(
        `apps/v1/projects/${sdk.project}/charts/monitoring/alerts`
      )
      .then(({ data }) => {
        return data.items;
      })
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
export const useListAlerts = (taskId: string) => {
  const sdk = useSDK();
  return useQuery(`monitoring-list-alerts-${taskId}`, () =>
    sdk
      .get<AlertResponsePayload>(
        `apps/v1/projects/${sdk.project}/charts/monitoring/${taskId}/alerts`
      )
      .then(({ data }) => {
        return data.items;
      })
  );
};

/**
 * Show Alerts icon
 * ===================================
 *
 * This method shows the alerts icon from the monitoring api
 *
 * -----------------------------------------------------------------------------
 * Properties
 * -----------------------------------------------------------------------------
 * @returns UseMutationResult                             - Returns UseMutationResult
 * @returns
 */
export const useAlertingStatus = (taskId: string) => {
  const sdk = useSDK();
  return useQuery(`monitoring-list-alerts-${taskId}`, () =>
    sdk
      .post<AlertResponsePayload>(
        `apps/v1/projects/${sdk.project}/charts/monitoring/alerts`,
        { data: {} }
      )
      .then(({ data }) => {
        return data.items;
      })
  );
};
