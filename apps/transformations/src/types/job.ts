import { ConflictMode, Destination } from './';

export type Job = {
  id: number;
  uuid: string;
  transformationId: number;
  transformationExternalId: string;
  sourceProject: string;
  destinationProject: string;
  destination: Destination;
  conflictMode: ConflictMode;
  query: string;
  createdTime?: number;
  startedTime?: number;
  finishedTime?: number;
  lastSeenTime?: number;
  error?: string;
  ignoreNullFields: boolean;
  status: Status;
};

export type Status = 'Running' | 'Created' | 'Completed' | 'Failed';

export const JOB_ACTIONS = [
  'read',
  'created',
  'updated',
  'deleted',
  'upserted',
] as const;

export type JobAction = (typeof JOB_ACTIONS)[number];

export type MetricNameActions = {
  [key in ConflictMode]: JobAction;
};

export const MetricNameActions: MetricNameActions = {
  abort: 'created',
  update: 'updated',
  upsert: 'created',
  delete: 'deleted',
};
