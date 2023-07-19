import { CogniteError } from '@cognite/sdk';

import { Job, ManifestSchedule, Schedule } from './';

export type TransformationRead = {
  dataModel: string;
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
  sourceSession?: Pick<SessionInfo, 'projectName' | 'sessionId'>;
};

export type SessionInfo = {
  clientId: string;
  sessionId: number;
  projectName: string;
};

export type SessionCredentials = {
  sessionId: number;
  cdfProjectName: string | undefined;
  nonce: string;
  clientId?: string;
};

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
  Pick<
    TransformationRead,
    'name' | 'externalId' | 'destination' | 'conflictMode'
  >
> &
  Partial<
    Pick<
      TransformationRead,
      'query' | 'isPublic' | 'dataSetId' | 'ignoreNullFields'
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

export const CLEAN_RESOURCE_TYPE_MAPPING = {
  assets: 'assets',
  asset_hierarchy: 'asset hierarchy',
  events: 'events',
  files: 'files',
  sequences: 'sequences',
  sequence_rows: 'sequence rows',
  timeseries: 'time series',
  datapoints: 'numeric datapoints',
  string_datapoints: 'string datapoints',
  labels: 'labels',
  relationships: 'relationships',
  data_sets: 'datasets',
  well_data_layer: 'well data layer',
} as const;
export const CLEAN_RESOURCE_TYPES = [
  'assets',
  'asset_hierarchy',
  'events',
  'files',
  'sequences',
  'sequence_rows',
  'timeseries',
  'datapoints',
  'string_datapoints',
  'labels',
  'relationships',
  'data_sets',
  'well_data_layer',
] as const;
export type CleanResourceType = (typeof CLEAN_RESOURCE_TYPES)[number];
export const WELL_DATA_TYPES = {
  Source: 'Sources',
  WellSource: 'Well sources',
  WellboreSource: 'Wellbore sources',
  DepthMeasurementIngestion: 'Depth measurements',
  TimeMeasurement: 'Time measurements',
  RigOperationIngestion: 'Rig operations',
  HoleSectionGroupIngestion: 'Hole section groups',
  WellTopsIngestion: 'Well top groups',
  NptIngestion: 'NPT events',
  NdsIngestion: 'NDS events',
  CasingSchematicIngestion: 'Casing schematics',
  TrajectoryIngestion: 'Trajectories',
} as const;
export type WellDataType = keyof typeof WELL_DATA_TYPES;
export type CleanDestination =
  | {
      type: Exclude<CleanResourceType, 'sequence_rows' | 'well_data_layer'>;
    }
  | {
      type: Extract<CleanResourceType, 'sequence_rows'>;
      externalId: string;
    }
  | {
      type: Extract<CleanResourceType, 'well_data_layer'>;
      wdlDataType: WellDataType;
    };
export const isCleanResourceType = (
  t?: ResourceType
): t is CleanResourceType => {
  return !!t && CLEAN_RESOURCE_TYPES.includes(t as CleanResourceType);
};
export const isCleanDestination = (d: Destination): d is CleanDestination => {
  return isCleanResourceType(d.type);
};

export const RAW_RESOURCE_TYPE_MAPPING = {
  raw: 'RAW rows',
} as const;
export const RAW_RESOURCE_TYPES = ['raw'] as const;
export type RAWResourceType = (typeof RAW_RESOURCE_TYPES)[number];
export type RAWDestination = {
  type: RAWResourceType;
  database: string;
  table: string;
};
export const isRAWResourceType = (t?: ResourceType): t is RAWResourceType => {
  return !!t && RAW_RESOURCE_TYPES.includes(t as RAWResourceType);
};
export const isRAWDestination = (d: Destination): d is RAWDestination => {
  return isRAWResourceType(d.type);
};

export const FDM_RESOURCE_TYPES = ['nodes', 'edges', 'instances'] as const;
export type FDMResourceType = (typeof FDM_RESOURCE_TYPES)[number];
export const FDM_RESOURCE_TYPE_MAPPING: Record<FDMResourceType, string> = {
  nodes: 'nodes',
  edges: 'edges',
  instances: 'instances',
} as const;
export const isFDMResourceType = (t?: ResourceType): t is FDMResourceType => {
  return !!t && FDM_RESOURCE_TYPES.includes(t as FDMResourceType);
};
export const isFDMDestination = (d: Destination): d is FDMDestination => {
  return isFDMResourceType(d.type);
};
export const isViewCentric = (
  d: Destination
): d is FDMViewCentricDestination => {
  return d.type === 'nodes' || d.type === 'edges';
};
export const isDataModelCentric = (
  d: Destination
): d is FDMDataModelCentricDestination => {
  return d.type === 'instances';
};

export type FDMDestinationView = {
  space: string;
  externalId: string;
  version: string;
};

export type FDMDestinationEdgeType = {
  space: string;
  externalId: string;
};

export type FDMDestinationBase<T extends FDMResourceType> = {
  type: T;
  instanceSpace?: string;
};

export type FDMDestinationNode = FDMDestinationBase<'nodes'> & {
  view?: FDMDestinationView;
};

export type FDMDestinationEdge = FDMDestinationBase<'edges'> & {
  view?: FDMDestinationView;
  edgeType: FDMDestinationEdgeType;
};

export type FDMViewCentricDestination = FDMDestinationNode | FDMDestinationEdge;

export type FDMDestinationInstances = FDMDestinationBase<'instances'> & {
  dataModel: {
    space: string;
    externalId: string;
    version: string;
    destinationType: string;
    destinationRelationshipFromType?: string;
  };
};

export type FDMDataModelCentricDestination = FDMDestinationInstances;

export type FDMDestination =
  | FDMViewCentricDestination
  | FDMDataModelCentricDestination;

export const RESOURCE_TYPES = [
  ...CLEAN_RESOURCE_TYPES,
  ...RAW_RESOURCE_TYPES,
  ...FDM_RESOURCE_TYPES,
];

export const RESOURCE_TYPE_MAPPING = {
  ...CLEAN_RESOURCE_TYPE_MAPPING,
  ...RAW_RESOURCE_TYPE_MAPPING,
  ...FDM_RESOURCE_TYPE_MAPPING,
};

export type ResourceType =
  | CleanResourceType
  | RAWResourceType
  | FDMResourceType;

export type Destination = CleanDestination | RAWDestination | FDMDestination;

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
