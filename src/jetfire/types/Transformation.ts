import { Job } from './Job';
import { DataSource } from './DataSource';
import { Schedule } from './Schedule';

export type TransformBlockedInfo = { reason: string; createdTime: number };

export type Transformation = {
  id?: number;
  externalId?: string;
  name: string;
  destination?: DataSource;
  conflictMode?: string;
  query?: string;
  createdTime?: number;
  lastUpdatedTime?: number;
  isPublic?: boolean;
  ignoreNullFields?: boolean;
  owner?: TransformConfigOwner;
  ownerIsCurrentUser?: boolean;
  hasSourceApiKey?: boolean;
  hasDestinationApiKey?: boolean;
  hasSourceOidcCredentials?: boolean;
  hasDestinationOidcCredentials?: boolean;
  lastFinishedJob?: Job | null;
  blocked?: TransformBlockedInfo | null;
  runningJob?: Job | null;
  schedule?: Schedule | null;
};

export type TransformConfigOwner = { user: string };
