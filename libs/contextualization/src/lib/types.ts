export enum JobStatus {
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
}

// api body type
export type MatchItem = {
  externalId: string;
  advancedJoinExternalId: string;
  originExternalId: string;
  linkedExternalId: string;
};

export type View = {
  space: string;
  externalId: string;
  version: string;
  createdTime: number;
};
