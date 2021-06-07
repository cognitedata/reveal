import { RunStatusUI } from './Status';

export interface RunsAPIResponse {
  items: StatusRow[];
  nextCursor: string;
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
  status: RunStatusUI | null;
}
