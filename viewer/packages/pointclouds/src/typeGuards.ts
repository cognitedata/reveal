/*!
 * Copyright 2024 Cognite AS
 */
import {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  isClassicIdentifier,
  isDMIdentifier
} from '@reveal/data-providers';
import { CognitePointCloudModel } from './CognitePointCloudModel';

/**
 * Type guard to check if a point cloud model is DMDataSourceType type.
 * @param model - The object to check.
 * @returns True if the object is of type `CognitePointCloudModel<DMDataSourceType>`, false otherwise.
 */
export function isDMPointCloudModel(
  model: CognitePointCloudModel<DataSourceType>
): model is CognitePointCloudModel<DMDataSourceType> {
  return isDMIdentifier(model.modelIdentifier);
}

/**
 * Type guard to check if a point cloud model is ClassicDataSourceType type.
 * @param model - The object to check.
 * @returns True if the object is of type `CognitePointCloudModel<ClassicDataSourceType>`, false otherwise.
 */
export function isClassicPointCloudModel(
  model: CognitePointCloudModel<DataSourceType>
): model is CognitePointCloudModel<ClassicDataSourceType> {
  return isClassicIdentifier(model.modelIdentifier);
}
