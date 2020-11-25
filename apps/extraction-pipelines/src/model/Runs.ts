import { Status } from '../model/Status';

export interface RunsAPIResponse {
  items: StatusRow[];
}

export interface StatusRow {
  createdTime: number;
  status: string;
  externalId: string;
}

export interface RunRow extends Run {
  subRows: Run[];
}

export interface Run {
  timestamp: number;
  status: Status | undefined;
  statusSeen: Status;
}
