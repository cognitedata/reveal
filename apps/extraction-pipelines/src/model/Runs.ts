export interface RunsAPIResponse {
  items: RunApi[];
  nextCursor: string;
}

export interface CreateRunsAPIResponse {
  items: RunApi[];
}

export interface RunApi {
  id: number;
  message?: string;
  createdTime: number;
  status: RunStatus;
  externalId: string;
}

export interface CreateRunRequest {
  externalId: string;
  message?: string;
  createdTime?: number;
  status: RunStatus;
}

export interface GetRunsRequest {
  filter: {
    externalId: string;
    status?: RunStatus;
    message?: {
      substring?: string;
    };
    createdTime?: { min: number; max: number };
  };
  limit: number;
  cursor?: string;
}

export type RunStatus = 'success' | 'failure' | 'seen';
