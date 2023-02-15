import {
  CogniteExternalId,
  Timestamp,
  CogniteInternalId,
  Metadata,
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

export type AlertResolve = {
  id: number;
};

export type AlertResolvePayload = {
  items: AlertResolve[];
};
