import { DataSource, ConflictMode } from './DataSource';

export type Job = {
  id: number;
  uuid: string;
  transformationId: number;
  transformationExternalId?: string;
  sourceProject: string;
  destinationProject: string;
  destination: DataSource;
  conflictMode: ConflictMode;
  query: string;
  createdTime: number;
  startedTime: number | null;
  finishedTime: number | null;
  lastSeenTime: number | null;
  error: string | null;
  ignoreNullFields: boolean;
  status: string;
};
