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
import { PointCloudClassificationInfoWithSignedFiles, PointCloudMetadataWithSignedFiles } from './types';
import { EptJson } from './potree-three-loader/loading/EptJson';

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

/**
 * Type guard to check if a JSON data object is of type `MetadataWithSignedFiles`.
 * @param data - The data object to check.
 * @returns True if the object is of type `MetadataWithSignedFiles`, false otherwise.
 */
export function isPointCloudMetadataWithSignedFiles(data: unknown): data is PointCloudMetadataWithSignedFiles {
  return (
    data !== null &&
    typeof data === 'object' &&
    'type' in data &&
    data.type === 'pointCloudMetadata' &&
    hasSignedFiles(data) &&
    hasFileData(data)
  );
}

/**
 * Type guard to check if a JSON data object is of type `PointCloudClassificationInfoWithSignedFiles`.
 * @param data - The data object to check.
 * @returns True if the object is of type `PointCloudClassificationInfoWithSignedFiles`, false otherwise.
 */
export function isPointCloudClassificationInfoWithSignedFiles(
  data: unknown
): data is PointCloudClassificationInfoWithSignedFiles {
  return (
    data !== null &&
    typeof data === 'object' &&
    'type' in data &&
    data.type === 'classificationInfo' &&
    hasSignedFiles(data) &&
    hasFileData(data)
  );
}

export function hasFileData(data: unknown): boolean {
  return (
    data !== null &&
    typeof data === 'object' &&
    'fileData' in data &&
    data.fileData !== null &&
    typeof data.fileData === 'object'
  );
}

export function hasSignedFiles(
  data: unknown
): data is { signedFiles: { items: { fileName: string; signedUrl: string }[] } } {
  return (
    data !== null &&
    typeof data === 'object' &&
    'signedFiles' in data &&
    data.signedFiles !== null &&
    typeof data.signedFiles === 'object' &&
    'items' in data.signedFiles &&
    Array.isArray(data.signedFiles.items)
  );
}
