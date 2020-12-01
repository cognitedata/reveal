import { Status } from '../model/Status';

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
}
