/*!
 * Copyright 2024 Cognite AS
 */

import { TableExpressionEqualsFilterV3 } from '@cognite/sdk/dist/src';
import { PointCloudObject, PointCloudObjectMetadata } from '../pointcloud-stylable-object-providers/types';
import { StylableObject } from '../pointcloud-stylable-object-providers/StylableObject';
import { ClassicDataSourceType, DataSourceType, DMDataSourceType } from '../DataSourceType';

// /**
//  * Type guard to check if a point cloud object contains data type DMPointCloudDataType
//  * @param pointCloudObject - The object to check
//  * @returns True if the object is of type PointCloudObject<DMPointCloudDataType>, false otherwise
//  */
export function isDMPointCloudDataTypeObject(
  pointCloudObject: PointCloudObject<DataSourceType>
): pointCloudObject is PointCloudObject<DMDataSourceType> {
  return isDMPointCloudDataType(pointCloudObject) && hasStylableObject(pointCloudObject);
}

// /**
//  * Type guard to check if a point cloud object contains data type ClassicPointCloudDataType
//  * @param pointCloudObject - The object to check
//  * @returns True if the object is of type PointCloudObject<ClassicPointCloudDataType>, false otherwise
//  */
export function isClassicPointCloudDataTypeObject(
  pointCloudObject: PointCloudObject<DataSourceType>
): pointCloudObject is PointCloudObject<ClassicDataSourceType> {
  return isClassicPointCloudDataType(pointCloudObject) && hasStylableObject(pointCloudObject);
}

// /**
//  * Type guard to check if the point cloud metadata is of type DMPointCloudDataType
//  * @param pointCloudMetadata - The metadata object to check
//  * @returns True if the object is of type PointCloudObjectMetadata<DMPointCloudDataType>, false otherwise
//  */
export function isDMPointCloudDataType(
  pointCloudMetadata: PointCloudObjectMetadata<DataSourceType>
): pointCloudMetadata is PointCloudObjectMetadata<DMDataSourceType> {
  const dmPointCloudObject = pointCloudMetadata as PointCloudObjectMetadata<DMDataSourceType>;
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
  pointCloudMetadata: PointCloudObjectMetadata<DataSourceType>
): pointCloudMetadata is PointCloudObjectMetadata<ClassicDataSourceType> {
  const annotation = pointCloudMetadata as PointCloudObjectMetadata<ClassicDataSourceType>;
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
  obj: PointCloudObject<DataSourceType>
): obj is PointCloudObject<DataSourceType> & { stylableObject: StylableObject } {
  return obj.stylableObject !== undefined;
}
