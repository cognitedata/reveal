/*!
 * Copyright 2024 Cognite AS
 */

import { TableExpressionEqualsFilterV3 } from '@cognite/sdk/dist/src';
import {
  ClassicPointCloudDataType,
  DMPointCloudDataType,
  PointCloudDataType,
  PointCloudObject,
  PointCloudObjectMetadata
} from '../pointcloud-stylable-object-providers/types';
import { StylableObject } from '../pointcloud-stylable-object-providers/StylableObject';

// /**
//  * Type guard to check if a point cloud object contains data type DMPointCloudDataType
//  * @param pointCloudObject - The object to check
//  * @returns True if the object is of type PointCloudObject<DMPointCloudDataType>, false otherwise
//  */
export function isDMPointCloudDataTypeObject(
  pointCloudObject: PointCloudObject<PointCloudDataType>
): pointCloudObject is PointCloudObject<DMPointCloudDataType> {
  return isDMPointCloudDataType(pointCloudObject) && hasStylableObject(pointCloudObject);
}

// /**
//  * Type guard to check if a point cloud object contains data type ClassicPointCloudDataType
//  * @param pointCloudObject - The object to check
//  * @returns True if the object is of type PointCloudObject<ClassicPointCloudDataType>, false otherwise
//  */
export function isClassicPointCloudDataTypeObject(
  pointCloudObject: PointCloudObject<PointCloudDataType>
): pointCloudObject is PointCloudObject<ClassicPointCloudDataType> {
  return isClassicPointCloudDataType(pointCloudObject) && hasStylableObject(pointCloudObject);
}

// /**
//  * Type guard to check if the point cloud metadata is of type DMPointCloudDataType
//  * @param pointCloudMetadata - The metadata object to check
//  * @returns True if the object is of type PointCloudObjectMetadata<DMPointCloudDataType>, false otherwise
//  */
export function isDMPointCloudDataType(
  pointCloudMetadata: PointCloudObjectMetadata<PointCloudDataType>
): pointCloudMetadata is PointCloudObjectMetadata<DMPointCloudDataType> {
  const dmPointCloudObject = pointCloudMetadata as PointCloudObjectMetadata<DMPointCloudDataType>;
  return (
    dmPointCloudObject.volumeInstanceRef !== undefined &&
    dmPointCloudObject.volumeInstanceRef.externalId !== undefined &&
    dmPointCloudObject.volumeInstanceRef.space !== undefined
  );
}

// /**
//  * Type guard to check if the point cloud metadata is of type ClassicPointCloudDataType
//  * @param pointCloudMetadata - The metadata object to check
//  * @returns True if the object is of type PointCloudObjectMetadata<ClassicPointCloudDataType>, false otherwise
//  */
export function isClassicPointCloudDataType(
  pointCloudMetadata: PointCloudObjectMetadata<PointCloudDataType>
): pointCloudMetadata is PointCloudObjectMetadata<ClassicPointCloudDataType> {
  const annotation = pointCloudMetadata as PointCloudObjectMetadata<ClassicPointCloudDataType>;
  return annotation.annotationId !== undefined;
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

function hasStylableObject(
  obj: PointCloudObject<PointCloudDataType>
): obj is PointCloudObject<PointCloudDataType> & { stylableObject: StylableObject } {
  return obj.stylableObject !== undefined;
}
