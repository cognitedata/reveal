/*!
 * Copyright 2024 Cognite AS
 */

import {
  TableExpressionDataModelsBoolFilter,
  TableExpressionEqualsFilterV3,
  TableExpressionInFilterV3
} from '@cognite/sdk';
import { PointCloudObject, PointCloudObjectMetadata } from '../pointcloud-stylable-object-providers/types';
import { StylableObject } from '../pointcloud-stylable-object-providers/StylableObject';
import { ClassicDataSourceType, CoreDMDataSourceType, DataSourceType } from '../DataSourceType';
import { DMInstanceRef } from '@reveal/utilities';

/**
 * Type guard to check if a point cloud object contains data type DMDataSourceType
 * @param pointCloudObject - The object to check
 * @returns True if the object is of type `PointCloudObject<DMDataSourceType>`, false otherwise
 */
export function isDMPointCloudVolumeObject(
  pointCloudObject: PointCloudObject<DataSourceType>
): pointCloudObject is PointCloudObject<CoreDMDataSourceType> {
  return isDMPointCloudVolume(pointCloudObject) && hasStylableObject(pointCloudObject);
}

/**
 * Type guard to check if a point cloud object contains data type ClassicDataSourceType
 * @param pointCloudObject - The object to check
 * @returns True if the object is of type `PointCloudObject<ClassicDataSourceType>`, false otherwise
 */
export function isClassicPointCloudVolumeObject(
  pointCloudObject: PointCloudObject<DataSourceType>
): pointCloudObject is PointCloudObject<ClassicDataSourceType> {
  return isClassicPointCloudVolume(pointCloudObject) && hasStylableObject(pointCloudObject);
}

/**
 * Type guard to check if the point cloud metadata is of type DMDataSourceType
 * @param pointCloudMetadata - The metadata object to check
 * @returns True if the object is of type `PointCloudObjectMetadata<DMDataSourceType>`, false otherwise
 */
export function isDMPointCloudVolume(
  pointCloudMetadata: DataSourceType['pointCloudVolumeMetadata']
): pointCloudMetadata is CoreDMDataSourceType['pointCloudVolumeMetadata'] {
  const dmPointCloudObject = pointCloudMetadata as PointCloudObjectMetadata<CoreDMDataSourceType>;
  return (
    dmPointCloudObject.volumeInstanceRef !== undefined &&
    dmPointCloudObject.volumeInstanceRef.externalId !== undefined &&
    dmPointCloudObject.volumeInstanceRef.space !== undefined
  );
}

/**
 * Type guard to check if the point cloud metadata is of type ClassicDataSourceType
 * @param pointCloudMetadata - The metadata object to check
 * @returns True if the object is of type `PointCloudObjectMetadata<ClassicDataSourceType>`, false otherwise
 */
export function isClassicPointCloudVolume(
  pointCloudMetadata: DataSourceType['pointCloudVolumeMetadata']
): pointCloudMetadata is ClassicDataSourceType['pointCloudVolumeMetadata'] {
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

export function getInParameterListFilter(property: string[], parameter: string): TableExpressionInFilterV3 {
  return {
    in: {
      property,
      values: { parameter }
    }
  } as const satisfies TableExpressionInFilterV3;
}

export function getIdInListFilter(parameters: DMInstanceRef[]): TableExpressionDataModelsBoolFilter {
  return {
    or: parameters.map(param => ({
      and: [
        {
          equals: {
            property: ['node', 'externalId'],
            value: param.externalId
          }
        },
        {
          equals: {
            property: ['node', 'space'],
            value: param.space
          }
        }
      ]
    }))
  };
}

function hasStylableObject(
  obj: PointCloudObject<DataSourceType>
): obj is PointCloudObject<DataSourceType> & { stylableObject: StylableObject } {
  return obj.stylableObject !== undefined;
}
