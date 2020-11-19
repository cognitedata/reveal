import { Status } from '../model/Status';

export interface RunsAPIResponse {
  items: RunResponse[];
}

export interface RunResponse {
  createdTime: number;
  lastUpdatedTime: number;
  externalId: string;
  statuses: StatusRow[];
  id: number;
}

export interface StatusRow {
  timestamp: number;
  status: string;
}

export interface RunRow extends Run {
  subRows: Run[];
}

export interface Run {
  timestamp: number;
  status: Status | null;
  statusSeen: string;
}
