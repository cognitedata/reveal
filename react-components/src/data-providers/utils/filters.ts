/*!
 * Copyright 2024 Cognite AS
 */

import {
  type HasExistingDataFilterV3,
  type TableExpressionContainsAnyFilterV3,
  type TableExpressionEqualsFilterV3
} from '@cognite/sdk';
import {
  COGNITE_POINT_CLOUD_VOLUME_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from '../core-dm-provider/dataModels';
import { type DmsUniqueIdentifier } from '../FdmSDK';

export type AssetProperties = {
  object3D: DmsUniqueIdentifier;
  name: string;
  description: string;
};

export const ASSET_PROPERTIES_LIST = ['name', 'description', 'object3D'] as const satisfies Array<
  keyof AssetProperties
>;

export const isPointCloudVolumeFilter = {
  hasData: [COGNITE_POINT_CLOUD_VOLUME_SOURCE]
} as const satisfies HasExistingDataFilterV3;

export const POINT_CLOUD_VOLUME_MODEL_REFERENCE = ['model3D'] as const satisfies Array<
  keyof PointCloudVolumeModelProperties
>;

export const POINT_CLOUD_VOLUME_REVISIONS_REFERENCE = [
  ...POINT_CLOUD_VOLUME_MODEL_REFERENCE,
  'revisions',
  'volumeReferences'
] as const satisfies Array<keyof PointCloudVolumeRevisionProperties>;

export const POINT_CLOUD_VOLUME_REVISIONS_PROPERTIES_LIST = [
  ...POINT_CLOUD_VOLUME_REVISIONS_REFERENCE,
  'volumeType',
  'volume'
] as const satisfies Array<keyof PointCloudVolumeRevisionVolumeProperties>;

export const POINT_CLOUD_VOLUME_REVISIONS_OBJECT3D_PROPERTIES_LIST = [
  ...POINT_CLOUD_VOLUME_REVISIONS_PROPERTIES_LIST,
  'object3D'
] as const satisfies Array<keyof PointCloudVolumeObject3DProperties>;

export type PointCloudVolumeModelProperties = {
  model3D: DmsUniqueIdentifier;
};

export type PointCloudVolumeRevisionProperties = PointCloudVolumeModelProperties & {
  revisions: DmsUniqueIdentifier[];
  volumeReferences: string[];
};

export type PointCloudVolumeRevisionVolumeProperties = PointCloudVolumeRevisionProperties & {
  volumeType: string;
  volume: number[];
};

export type PointCloudVolumeObject3DProperties = PointCloudVolumeRevisionVolumeProperties & {
  object3D: DmsUniqueIdentifier;
};

export function getModelEqualsFilter(
  model3DReference: DmsUniqueIdentifier
): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: [
        CORE_DM_3D_CONTAINER_SPACE,
        COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
        'model3D'
      ],
      value: model3DReference
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}

export function getRevisionContainsAnyFilter(
  revisionReferences: DmsUniqueIdentifier[]
): TableExpressionContainsAnyFilterV3 {
  return {
    containsAny: {
      property: [
        CORE_DM_3D_CONTAINER_SPACE,
        COGNITE_POINT_CLOUD_VOLUME_SOURCE.externalId,
        'revisions'
      ],
      values: revisionReferences
    }
  } as const satisfies TableExpressionContainsAnyFilterV3;
}
