import { Status } from './Status';

export interface RunsAPIResponse {
  items: RunResponse[];
}

export interface RunResponse {
  createdTime: number;
  lastUpdatedTime: number;
  externalId: string;
  statuses: StatusRow[];
}

export interface StatusRow {
  id: number;
  message?: string;
  createdTime: number;
  status: string;
}

export interface RunRow extends Run {
  subRows: Run[];
}

export interface Run {
  timestamp: number;
  status: Status | undefined;
  statusSeen: Status;
  message?: string;
}
