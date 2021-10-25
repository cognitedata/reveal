import { ConflictMode } from './DataSource';

export type JobDetails = {
  uuid: string;
  sourceProject: string;
  destinationProject: string;
  destinationType: string;
  destinationDatabase: string | null;
  destinationTable: string | null;
  conflictMode: ConflictMode;
  rawQuery: string;
  createdTime: number;
  startedTime: number | null;
  finishedTime: number | null;
  lastSeenTime: number | null;
  error: string | null;
};
