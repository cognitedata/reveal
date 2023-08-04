import { CogniteError } from '@cognite/sdk';

export type TransformationRead = {
  id: number;
  name: string;
  query: string;
  destination: Destination;
  conflictMode: ConflictMode;
  isPublic: boolean;
  createdTime: number;
  lastUpdatedTime: number;
  owner: Owner;
  ownerIsCurrentUser: boolean;
  hasSourceApiKey: boolean;
  hasDestinationApiKey: boolean;
  hasSourceOidcCredentials: boolean;
  hasDestinationOidcCredentials: boolean;
  externalId: string;
  ignoreNullFields: boolean;
  blocked?: BlockedInfo;
  lastFinishedJob?: Job;
  runningJob?: Job;
  schedule?: Schedule;
  dataSetId?: number;
  destinationSession?: SessionInfo;
  sourceSession?: SessionInfo;
};

export type SessionInfo = {
  clientId: string;
  sessionId: number;
  projectName: string;
};

export type SessionCredentials = {
  sessionId: number;
  cdfProjectName: string;
  nonce: string;
  clientId?: string;
};

export type TransformationReadProperty = keyof TransformationRead;

export type ManifestTransformationRead = {
  externalId: string | undefined;
  name: string | undefined;
  query: string | undefined;
  destination: Destination | undefined;
  ignoreNullFields: boolean | undefined;
  shared: boolean | undefined;
  action: ConflictMode | undefined;
  schedule?: ManifestSchedule;
  notifications?: string[];
} & (
  | { dataSetId?: number; dataSetExternalId?: never }
  | { dataSetId?: never; dataSetExternalId?: string }
);

interface ApiTransformationCreateError extends CogniteError {
  missing?: any[];
  duplicated?: any[];
}

export interface NetworkError {
  message: string;
  status: undefined;
  errorMessage: undefined;
  missing: undefined;
  duplicated: undefined;
  requestId: undefined;
}

export type TransformationCreateError =
  | ApiTransformationCreateError
  | NetworkError;

export type TransformationCreate = Required<
  Pick<TransformationRead, 'name' | 'externalId'>
> &
  Partial<
    Pick<
      TransformationRead,
      | 'query'
      | 'destination'
      | 'conflictMode'
      | 'isPublic'
      | 'dataSetId'
      | 'ignoreNullFields'
    >
  > & {
    sourceApiKey?: string;
    destinationApiKey?: string;
    sourceOidcCredentials?: OidcCredentials;
    destinationOidcCredentials?: OidcCredentials;
    sourceNonce?: SessionCredentials;
    destinationNonce?: SessionCredentials;
  };

export type TransformationUpdate = Partial<
  Pick<
    TransformationCreate,
    | 'name'
    | 'externalId'
    | 'destination'
    | 'conflictMode'
    | 'query'
    | 'sourceOidcCredentials'
    | 'destinationOidcCredentials'
    | 'sourceNonce'
    | 'destinationNonce'
    | 'sourceApiKey'
    | 'destinationApiKey'
    | 'isPublic'
    | 'ignoreNullFields'
    | 'dataSetId'
  >
>;

export const RESOURCE_TYPE = {
  assets: 'assets',
  asset_hierarchy: 'asset hierarchy',
  events: 'events',
  files: 'files',
  raw: 'RAW rows',
  sequences: 'sequences',
  sequence_rows: 'sequence rows',
  timeseries: 'time series',
  datapoints: 'numeric datapoints',
  string_datapoints: 'string datapoints',
  labels: 'labels',
  relationships: 'relationships',
  data_sets: 'datasets',
} as const;

export type ResourceType = keyof typeof RESOURCE_TYPE;

export type Destination =
  | { type: Exclude<ResourceType, 'sequence_rows' | 'raw'> }
  | {
      type: 'sequence_rows';
      externalId: string;
    }
  | {
      type: 'raw';
      database: string;
      table: string;
    };

export const CONFLICT_MODE = {
  abort: 'Create',
  delete: 'Delete',
  update: 'Update',
  upsert: 'Create or update',
} as const;

export type ConflictMode = keyof typeof CONFLICT_MODE;

export type Owner = { user: string };

export type BlockedInfo = {
  reason: string;
  createdTime: number;
};

export type OidcCredentials = {
  clientId: string;
  clientSecret: string;
};

export type Schema = {
  name: string;
  sqlType: string;
  nullable: boolean;
  type: string | { type: string };
};

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

export const JOB_ACTIONS = ['created', 'read', 'updated', 'deleted'] as const;

export type JobAction = typeof JOB_ACTIONS[number];

export type MetricNameActions = {
  [key in ConflictMode]: JobAction;
};

export const MetricNameActions: MetricNameActions = {
  abort: 'created',
  update: 'updated',
  upsert: 'created',
  delete: 'deleted',
};
export type Schedule = {
  id: number;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  interval: string;
  isPaused: boolean;
};

export type ManifestSchedule = {
  interval: string;
  isPaused: boolean;
};
