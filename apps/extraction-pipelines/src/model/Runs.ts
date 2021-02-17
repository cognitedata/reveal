import { Status } from './Status';

export interface RunsAPIResponse {
  items: StatusRow[];
}

export interface StatusRow {
  id: number;
  message?: string;
  createdTime: number;
  status: string;
}

export interface StatusRun {
  id: number;
  message?: string;
  createdTime: number;
  status: Status | null;
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
