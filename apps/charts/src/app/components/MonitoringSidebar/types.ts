import { AlertResponse } from '@charts-app/components/MonitoringAlert/types';
import { ChartTimeSeries } from '@charts-app/models/chart/types';

import { CogniteExternalId, CogniteInternalId, Metadata } from '@cognite/sdk';

export type MonitoringChannel = {
  name: string;
  id: string;
  monitoringTasks: number;
  granularity: number;
};

export type CreateMonitoringJobStates =
  | 'READY'
  | 'NONCE_CREATING'
  | 'NONCE_CREATED'
  | 'NONCE_CREATED_DATA_SUBMITTED';

export type CreateMonitoringJobPayload = {
  monitoringTaskName: string;
  FolderId: string | undefined;
  evaluateEvery: number;
  modelExternalId: string;
  activationInterval: string; // not used by the middleware right now, but will use it in future
  threshold: number;
  timeSeriesExternalId: string;
  nonce: string;
  subscriptionExternalId: string;
  userAuthId: string;
  userEmail: string;
};

export type CreateMonitoringJobFormData = {
  name: string;
  source: ChartTimeSeries | undefined;
  alertThreshold: number;
  alertThresholdType:
    | undefined
    | { label: 'Above'; value: 'upper_threshold' }
    | { label: 'Below'; value: 'lower_threshold' };
  schedule: undefined | { label: string; value: number };
  scheduleDurationType: { label: string; value: string };
  minimumDuration: number;
  cdfCredsMode: 'USER_CREDS' | 'CLIENT_SECRET';
  clientSecret: string;
  clientId: string;
  folder: undefined | { label: string; value: string };
};

export type MonitoringJob = {
  id: number;
  externalId: string;
  channelId: number;
  interval: number;
  overlap: number;
  model: {
    externalId: string;
    granularity: string;
    threshold?: number;
    timeseriesId: number;
    timeseriesExternalId: string;
    upperThreshold?: number;
    lowerThreshold?: number;
  };
  channel: {
    id: number;
    parentId: number;
    externalId: string;
    parentExternalId: string;
    name: string;
    description: string;
    metadata: { [key: string]: string };
    alertRules: {
      deduplication: {
        mergeInterval: string;
        activationInterval: string;
      };
    };
  };
  alertCount: number;
  subscribed: boolean;
};

export type MonitoringFolderJobs = {
  folderExtID: string;
  tasks: MonitoringJob[];
  count: number;
};

export type MonitoringSubscriptionsListPayload = {
  monitoringTaskIDs: number[];
  userAuthId: string;
};

export type MonitoringSubscriptionResponse = {
  externalId?: CogniteExternalId;
  channelId: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  subscriberId: CogniteInternalId;
  subscriberExternalId?: CogniteExternalId;
  metadata?: Metadata;
};

export type MonitoringSubscriptionPayload = {
  channelID: number;
  userAuthId: string;
  userEmail: string;
  subscriptionExternalId?: string;
};

export type MonitoringSubscriptionsListResponse = { [key: string]: boolean };

export type CreateMonitoringJobAPIResponse = MonitoringJob[];

export type AlertResponsePayload = {
  items: Array<AlertResponse>;
};

export type AlertPayload = {};
