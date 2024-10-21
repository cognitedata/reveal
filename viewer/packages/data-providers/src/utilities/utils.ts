/*!
 * Copyright 2024 Cognite AS
 */

import { TableExpressionEqualsFilterV3 } from '@cognite/sdk/dist/src';
import { StylableObject } from '../pointcloud-stylable-object-providers/StylableObject';
import {
  PointCloudVolumeMetadata,
  PointCloudObject,
  PointCloudVolumeDataModelProperties,
  PointCloudObjectMetadata
} from '../pointcloud-stylable-object-providers/types';

/**
 * Type guard to check if an object is of type PointCloudObjectMetadata
 * @param pointCloudObject - The object to check
 * @returns True if the object is of type PointCloudObjectMetadata, false otherwise
 */
export function isPointCloudObjectMetadata(
  pointCloudObject: PointCloudObject
): pointCloudObject is PointCloudObjectMetadata & { stylableObject: StylableObject } {
  return (
    (pointCloudObject as PointCloudObjectMetadata).annotationId !== undefined &&
    (pointCloudObject as PointCloudObjectMetadata).annotationId !== -1 &&
    (pointCloudObject as { stylableObject: StylableObject }).stylableObject !== undefined
  );
}

/**
 * Type guard to check if an object is of type PointCloudObjectMetadata
 * @param pointCloudObject - The object to check
 * @returns True if the object is of type PointCloudObjectMetadata, false otherwise
 */
export function isPointCloudVolumeMetadata(
  pointCloudObject: PointCloudVolumeMetadata
): pointCloudObject is PointCloudObjectMetadata {
  return (
    (pointCloudObject as PointCloudObjectMetadata).annotationId !== undefined &&
    (pointCloudObject as PointCloudObjectMetadata).annotationId !== -1
  );
}

/**
 * Type guard to check if an object is of type PointCloudObjectDataModelProperties
 * @param pointCloudObject - The object to check
 * @returns True if the object is of type PointCloudObjectDataModelProperties, false otherwise
 */
export function isPointCloudObjectDataModelProperties(
  pointCloudObject: PointCloudObject
): pointCloudObject is PointCloudVolumeDataModelProperties & { stylableObject: StylableObject } {
  return (
    (pointCloudObject as PointCloudVolumeDataModelProperties).instanceRef !== undefined &&
    (pointCloudObject as { stylableObject: StylableObject }).stylableObject !== undefined
  );
}

/**
 * Type guard to check if an object is of type PointCloudObjectDataModelProperties
 * @param pointCloudObject - The object to check
 * @returns True if the object is of type PointCloudObjectDataModelProperties, false otherwise
 */
export function isPointCloudVolumeMetadataDataModelProperties(
  pointCloudObject: PointCloudVolumeMetadata
): pointCloudObject is PointCloudVolumeDataModelProperties {
  return (pointCloudObject as PointCloudVolumeDataModelProperties).instanceRef !== undefined;
}

export function getNodeExternalIdEqualsFilter<T extends string>(externalId: T): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: ['node', 'externalId'],
      value: externalId
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}

export function getNodeSpaceEqualsFilter<T extends string>(space: T): TableExpressionEqualsFilterV3 {
  return {
    equals: {
      property: ['node', 'space'],
      value: space
    }
  } as const satisfies TableExpressionEqualsFilterV3;
}
