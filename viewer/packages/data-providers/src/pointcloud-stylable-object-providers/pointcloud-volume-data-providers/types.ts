/*!
 * Copyright 2024 Cognite AS
 */

import { HasExistingDataFilterV3 } from '@cognite/sdk';
import { COGNITE_POINT_CLOUD_VOLUME_SOURCE } from '../../utilities/constants';
import { DMInstanceRef } from '@reveal/utilities';

export type AssetProperties = {
  object3D: DMInstanceRef;
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
  revisions: DMInstanceRef[];
  volumeReferences: string[];
};

export type PointCloudVolumeRevisionVolumeProperties = PointCloudVolumeRevisionProperties & {
  volumeType: string;
  volume: number[];
};

export type PointCloudVolumeObject3DProperties = PointCloudVolumeRevisionVolumeProperties & {
  object3D: DMInstanceRef;
};
