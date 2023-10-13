import { ChartTimeSeries, ScheduledCalculation } from '@cognite/charts-lib';
import { CogniteExternalId, CogniteInternalId, Metadata } from '@cognite/sdk';

import { UserProfile } from '../../common/providers/useUserProfileQuery';
import { AlertResponse } from '../MonitoringAlert/types';

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
  subscribers: Pick<UserProfile, 'userIdentifier' | 'email'>[];
  sourceId: CogniteExternalId;
  source: 'CHARTS';
};

export type ScheduleDurationType = { label: string; value: string };
type AlertThresholdType =
  | undefined
  | { label: 'Above'; value: 'upper_threshold' }
  | { label: 'Below'; value: 'lower_threshold' };

export type CreateMonitoringJobFormData = {
  name: string;
  source: ChartTimeSeries | ScheduledCalculation | undefined;
  alertThreshold: number;
  alertThresholdType: AlertThresholdType;
  schedule: undefined | { label: string; value: number };
  scheduleDurationType: ScheduleDurationType;
  minimumDuration: number;
  cdfCredsMode: 'USER_CREDS' | 'CLIENT_SECRET';
  clientSecret: string;
  clientId: string;
  folder: undefined | { label: string; value: string };
  subscribers: UserProfile[];
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

export type MonitoringJobsEmptyResponse = {
  items: [];
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
  subscribers: Pick<UserProfile, 'userIdentifier' | 'email'>[];
};

export type MonitoringSubscriptionsListResponse = { [key: string]: boolean };

export type CreateMonitoringJobAPIResponse = MonitoringJob[];

export type AlertResponsePayload = {
  items: Array<AlertResponse>;
};

export type AlertPayload = {};