export type MonitoringChannel = {
  name: string;
  id: string;
  monitoringTasks: number;
  granularity: number;
  frequency: number;
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

export type CreateMonitoringTaskPayload = {
  monitoringTaskExternalID: string;
  FolderId: string | undefined;
  evaluateEvery: number;
  modelExternalId: string;
  granularity: string;
  threshold: number;
  timeseriesExternalId: string;
  nonce: string;
  subscriptionExternalId: string;
  userAuthId: string;
  userEmail: string;
};

export type CreateMonitoringTaskFormData = {
  name: string;
  source: undefined | { label: string; value: string };
  alertThreshold: number;
  alertThresholdType: undefined | { label: string; value: string };
  evaluateEveryType: undefined | { label: string; value: string };
  evaluateEvery: number;
  minimumDurationType: { label: string; value: string };
  minimumDuration: number;
  useCdfCredentials: true;
  clientSecret: string;
  clientId: string;
  folder: undefined | { label: string; value: string };
};
