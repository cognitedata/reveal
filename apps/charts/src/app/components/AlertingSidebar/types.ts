import { MonitoringJob } from '@charts-app/components/MonitoringSidebar/types';

import {
  CogniteExternalId,
  CogniteInternalId,
  Metadata,
  Timestamp,
} from '@cognite/sdk';

export type AlertResponse = {
  id: number;
  externalId?: CogniteExternalId;
  timestamp?: Timestamp;
  channelId?: CogniteInternalId;
  channelExternalId?: CogniteExternalId;
  source: string;
  value?: string;
  level?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Metadata;
  acknowledged: false;
  closed: false;
  createdTime: Timestamp;
  lastTriggeredTime?: Timestamp;
  lastUpdatedTime?: Timestamp;
  status: string;
};

export type AlertResponsePayload = {
  items: Array<AlertResponse>;
};

export type MonitoringJobsAlertsResponsePayload = {
  items: Array<MonitoringJob>;
};

export type AlertPayload = {};
