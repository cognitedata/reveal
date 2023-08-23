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
