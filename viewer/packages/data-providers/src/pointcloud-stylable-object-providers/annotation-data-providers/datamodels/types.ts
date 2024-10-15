/*!
 * Copyright 2024 Cognite AS
 */

import { DirectRelationReference, HasExistingDataFilterV3, ViewReference } from '@cognite/sdk';

export const CORE_DM_SPACE = 'cdf_cdm';
export const CORE_DM_3D_CONTAINER_SPACE = 'cdf_cdm_3d';

export const COGNITE_POINT_CLOUD_VOLUME_SOURCE = {
  externalId: 'CognitePointCloudVolume',
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

export type AssetProperties = {
  object3D: DirectRelationReference;
  name: string;
  description: string;
};

export const ASSET_PROPERTIES_LIST = ['name', 'description', 'object3D'] as const satisfies Array<
  keyof AssetProperties
>;

export const pointCloudVolumeFilter = {
  hasData: [COGNITE_POINT_CLOUD_VOLUME_SOURCE]
} as const satisfies HasExistingDataFilterV3;

export const POINT_CLOUD_VOLUME_REVISIONS_REFERENCE = ['revisions', 'volumeReferences'] as const satisfies Array<
  keyof PointCloudVolumeRevisionProperties
>;

export const POINT_CLOUD_VOLUME_REVISIONS_PROPERTIES_LIST = [
  ...POINT_CLOUD_VOLUME_REVISIONS_REFERENCE,
  'volumeType',
  'volume'
] as const satisfies Array<keyof PointCloudVolumeRevisionVolumeProperties>;

export const POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST = [
  ...POINT_CLOUD_VOLUME_REVISIONS_PROPERTIES_LIST,
  'object3D'
] as const satisfies Array<keyof PointCloudVolumeObject3DProperties>;

export type PointCloudVolumeRevisionProperties = {
  revisions: DirectRelationReference[];
  volumeReferences: string[];
};

export type PointCloudVolumeRevisionVolumeProperties = PointCloudVolumeRevisionProperties & {
  volumeType: string;
  volume: number[];
};

export type PointCloudVolumeObject3DProperties = PointCloudVolumeRevisionVolumeProperties & {
  object3D: DirectRelationReference;
};
