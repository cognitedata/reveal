import { type Timestamp, type ViewReference } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../FdmSDK';

export const CORE_DM_SPACE = 'cdf_cdm';
export const CORE_DM_3D_CONTAINER_SPACE = 'cdf_cdm_3d';

export const COGNITE_DESCRIBABLE_SOURCE = {
  externalId: 'CogniteDescribable',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_3D_OBJECT_SOURCE = {
  externalId: 'Cognite3DObject',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_3D_MODEL_SOURCE = {
  externalId: 'Cognite3DModel',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_3D_REVISION_SOURCE = {
  externalId: 'Cognite3DRevision',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_CAD_REVISION_SOURCE = {
  externalId: 'CogniteCADRevision',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_CAD_NODE_SOURCE = {
  externalId: 'CogniteCADNode',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_ASSET_SOURCE = {
  externalId: 'CogniteAsset',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_VISUALIZABLE_SOURCE = {
  externalId: 'CogniteVisualizable',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_POINT_CLOUD_VOLUME_SOURCE = {
  externalId: 'CognitePointCloudVolume',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_IMAGE_360_SOURCE = {
  externalId: 'Cognite360Image',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_IMAGE_360_ANNOTATION_SOURCE = {
  externalId: 'Cognite360ImageAnnotation',
  space: CORE_DM_SPACE,
  version: 'v1',
  type: 'view'
} as const satisfies ViewReference;

export const COGNITE_IMAGE_360_COLLECTION_SOURCE = {
  type: 'view',
  space: CORE_DM_SPACE,
  externalId: 'Cognite360ImageCollection',
  version: 'v1'
} as const satisfies ViewReference;

export enum Cognite3DModel_type {
  CAD = 'CAD',
  PointCloud = 'PointCloud',
  Image360 = 'Image360'
}

export type Cognite3DModelProperties = {
  name: string;
  description: string;
  tags: string[];
  aliases: string[];
  type: Cognite3DModel_type;
  thumbnail: object;
};

export enum Cognite3DRevision_status {
  Queued = 'Queued',
  Processing = 'Processing',
  Done = 'Done',
  Failed = 'Failed'
}

export enum Cognite3DRevision_type {
  CAD = 'CAD',
  PointCloud = 'PointCloud',
  Image360 = 'Image360'
}

export type CogniteAssetProperties = {
  object3D: DmsUniqueIdentifier;
  name: string;
  description: string;
  tags: string[];
  aliases: string[];
  sourceId: string;
  sourceContext: string;
  source: DmsUniqueIdentifier;
  sourceCreatedTime: Timestamp;
  sourceUpdatedTime: Timestamp;
  sourceCreatedUser: string;
  sourceUpdatedUser: string;
  parent: DmsUniqueIdentifier;
  root: DmsUniqueIdentifier;
  path: DmsUniqueIdentifier[];
  pathLastUpdatedTime: Timestamp;
  equipment: DmsUniqueIdentifier;
  assetClass: DmsUniqueIdentifier;
  type: DmsUniqueIdentifier;
  files: DmsUniqueIdentifier[];
  children: DmsUniqueIdentifier[];
  activities: DmsUniqueIdentifier[];
  timeSeries: DmsUniqueIdentifier[];
};

export type CogniteVisualizableProperties = {
  object3D: DmsUniqueIdentifier;
};

export type CogniteCADRevisionProperties = {
  status: Cognite3DRevision_status;
  published: boolean;
  type: Cognite3DRevision_type;
  model3D: DmsUniqueIdentifier;
  revisionId: number;
};

export type CogniteCADNodeProperties = {
  name: string;
  description: string;
  tags: string[];
  aliases: string[];
  object3D: DmsUniqueIdentifier;
  model3D: DmsUniqueIdentifier;
  cadNodeReference: string;
  revisions: DmsUniqueIdentifier[];
  treeIndexes: number[];
  subTreeSizes: number[];
};

export type Cognite3DObjectProperties = {
  name: string;
  description: string;
  tags: string[];
  aliases: string[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
  asset?: DmsUniqueIdentifier[] | undefined;
  cadNodes?: DmsUniqueIdentifier[] | undefined;
  images360?: DmsUniqueIdentifier[] | undefined;
  pointCloudVolumes?: DmsUniqueIdentifier[] | undefined;
};

export const COGNITE_VISUALIZABLE_VIEW_VERSION_KEY =
  `${COGNITE_VISUALIZABLE_SOURCE.externalId}/${COGNITE_VISUALIZABLE_SOURCE.version}` as const;
export const COGNITE_ASSET_VIEW_VERSION_KEY =
  `${COGNITE_ASSET_SOURCE.externalId}/${COGNITE_ASSET_SOURCE.version}` as const;
export const COGNITE_CAD_NODE_VIEW_VERSION_KEY =
  `${COGNITE_CAD_NODE_SOURCE.externalId}/${COGNITE_CAD_NODE_SOURCE.version}` as const;
export const COGNITE_POINT_CLOUD_VOLUME_VIEW_VERSION_KEY =
  `${COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId}/${COGNITE_POINT_CLOUD_VOLUME_SOURCE.version}` as const;
export const COGNITE_IMAGE_360_VIEW_VERSION_KEY =
  `${COGNITE_IMAGE_360_SOURCE.externalId}/${COGNITE_IMAGE_360_SOURCE.version}` as const;
export const COGNITE_IMAGE_360_ANNOTATION_VIEW_VERSION_KEY =
  `${COGNITE_IMAGE_360_ANNOTATION_SOURCE.externalId}/${COGNITE_IMAGE_360_ANNOTATION_SOURCE.version}` as const;
