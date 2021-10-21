import { DataSource } from './DataSource';
import { Schedule } from './Schedule';
import { JobDetails } from './JobDetails';

export type TransformBlockedInfo = { reason: string; time: string };

type TransformConfig = {
  id?: number;
  name: string;
  destination?: DataSource & { apiKey: string };
  conflictMode?: string;
  query?: string;
  created?: string;
  updated?: string;
  isPublic?: boolean;
  ignoreNullFields?: boolean;
  owner?: TransformConfigOwner;
  ownerIsCurrentUser?: boolean;
  hasSourceApiKey?: boolean;
  hasDestinationApiKey?: boolean;
  hasSourceOidcCredentials?: boolean;
  hasDestinationOidcCredentials?: boolean;
  lastFinishedJob?: JobDetails | null;
  blocked?: TransformBlockedInfo | null;
  runningJob?: JobDetails | null;
  schedule?: Schedule | null;
};

export type TransformConfigOwner = { user: string };

export default TransformConfig;
