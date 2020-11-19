export interface RunsAPIResponse {
  items: RunResponse[];
}

export interface RunResponse {
  createdTime: number;
  lastUpdatedTime: number;
  externalId: string;
  statuses: Status[];
  id: number;
}

export interface Status {
  timestamp: number;
  status: string;
}

export interface RunRow extends Run {
  subRows: Run[];
}

export interface Run {
  timestamp: number;
  status: string;
  statusSeen: string;
}
