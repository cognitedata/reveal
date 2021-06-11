import { RunStatusUI } from './Status';

export interface RunsAPIResponse {
  items: RunApi[];
  nextCursor: string;
}

export interface RunApi {
  id: number;
  message?: string;
  createdTime: number;
  status: string;
}

export interface RunUI {
  id: number;
  message?: string;
  createdTime: number;
  status: RunStatusUI | null;
}
