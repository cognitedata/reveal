import { CogniteExternalId, CogniteInternalId, Metadata } from '@cognite/sdk';
import { AlertResponse } from 'components/MonitoringAlert/types';

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

export type SessionAPIResponseItem = {
  id: number;
  type: string;
  status:
    | 'READY'
    | 'ACTIVE'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'REVOKED'
    | 'ACCESS_LOST';
  nonce: string;
  clientId: string;
};

export type SessionAPIResponse = {
  items: SessionAPIResponseItem[];
};

export type SessionAPIPayloadCredentials = {
  clientId: string;
  clientSecret: string;
};

export type SessionAPIPayloadTokenExchange = {
  tokenExchange: boolean;
};

export type SessionAPIPayload = {
  items: SessionAPIPayloadCredentials[] | SessionAPIPayloadTokenExchange[];
};

export type CreateMonitoringJobPayload = {
  monitoringTaskExternalID: string;
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
  source: undefined | { label: string; value: string };
  alertThreshold: number;
  alertThresholdType: undefined | { label: string; value: string };
  evaluateEveryType: undefined | { label: string; value: string };
  evaluateEvery: number;
  minimumDurationType: { label: string; value: string };
  minimumDuration: number;
  useCdfCredentials: boolean;
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
    threshold: number;
    timeseriesId: number;
  };
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
  subscriptionExternalId?: string;
};

export type MonitoringSubscriptionsListResponse = { [key: string]: boolean };

export type CreateMonitoringJobAPIResponse = MonitoringJob[];

export type AlertResponsePayload = {
  items: Array<AlertResponse>;
};

export type AlertPayload = {};
