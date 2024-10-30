/*!
 * Copyright 2024 Cognite AS
 */
import { AnnotationModel, AnnotationsAssetRef } from '@cognite/sdk';
import { Image360DataModelIdentifier } from './image-360-data-providers/descriptor-providers/datamodels/Cdf360DataModelsDescriptorProvider';
import { DMInstanceRef } from './pointcloud-stylable-object-providers/types';
import { PointCloudAnnotationVolumeCollection, PointCloudDMVolumeCollection } from '@reveal/pointcloud-styling';

/**
 * Model identifier for classic CDF models, referenced by modelId and revisionId
 */
export type ClassicModelIdentifierType = { modelId: number; revisionId: number };

/**
 * Model identifier for DM-based models, referenced by externalId and space of the model revision
 */
export type DMModelIdentifierType = { revisionExternalId: string; revisionSpace: string };

export type LocalModelIdentifierType = { localPath: string };

/**
 * Data source type for classic models
 */
export type ClassicDataSourceType = {
  /**
   * The classic point cloud model identifier associated with the object which include modelId and revisionId.
   */
  modelIdentifier: ClassicModelIdentifierType;
  /**
   * The classic point cloud volume metadata containing reference associated with the object which includes annotationId
   * and asset reference if any.
   */
  pointCloudVolumeMetadata: { annotationId: number; assetRef?: AnnotationsAssetRef };

  /**
   * Point cloud volume collection type
   */
  pointCloudCollectionType: PointCloudAnnotationVolumeCollection;
  /**
   * Identifier type for Event- or DM-based 360 images
   */

  image360Identifier: { [key: string]: string } | Image360DataModelIdentifier;
  /**
   * Type of classic 360 annotations
   */

  image360AnnotationType: AnnotationModel;
  /**
   * Marker to make this type inconstructable
   */
  _never: never;
};

/**
 * Data source type for DM models
 */
export type DMDataSourceType = {
  /**
   * The CDF point cloud volume metadata containing reference associated with the object which includes externalId, space
   * and asset reference if any.
   */
  pointCloudVolumeMetadata: { volumeInstanceRef: DMInstanceRef; assetRef?: DMInstanceRef };
  /**
   * Point cloud volume collection type
   */
  pointCloudCollectionType: PointCloudDMVolumeCollection;
  /**
   * The DM point cloud model identifier associated with the object, consisting of revision externalId and revision space
   */
  modelIdentifier: DMModelIdentifierType;

  /**
   * Identifier type for DM 360 collections
   */
  image360Identifier: Image360DataModelIdentifier;
  /**
   * Type of CoreDM 360 image annotations (to be defined)
   */
  image360AnnotationType: never;
  /**
   * Marker to make this type inconstructable
   */
  _never: never;
};

/**
 * Data source type for local models
 */
export type LocalDataSourceType = {
  modelIdentifier: LocalModelIdentifierType;
  pointCloudVolumeMetadata: any;
  pointCloudCollectionType: any;
  _never: never;
};

/**
 * Common data source type
 */
export type DataSourceType = ClassicDataSourceType | DMDataSourceType;

/**
 * A DataSourceType used internally to allow for flexibility and generic testing
 */
export type GenericDataSourceType = {
  modelIdentifier: any;
  pointCloudVolumeMetadata: any;
  pointCloudCollectionType: any;
  image360Identifier: any;
  image360AnnotationType: any;
  _never: never;
};

/**
 * Internal model identifiers
 */
export type InternalModelIdentifier = ClassicModelIdentifierType | DMModelIdentifierType | LocalModelIdentifierType;

/**
 * Alias for internal + external data source types
 */
export type InternalDataSourceType = DataSourceType | LocalDataSourceType;

export function isClassicIdentifier(identifier: InternalModelIdentifier): identifier is ClassicModelIdentifierType {
  return (
    (identifier as ClassicModelIdentifierType).modelId !== undefined &&
    (identifier as ClassicModelIdentifierType).revisionId !== undefined
  );
}

export function isDMIdentifier(identifier: InternalModelIdentifier): identifier is DMModelIdentifierType {
  return (
    (identifier as DMModelIdentifierType).revisionExternalId !== undefined &&
    (identifier as DMModelIdentifierType).revisionSpace !== undefined
  );
}

export function isLocalIdentifier(identifier: InternalModelIdentifier): identifier is LocalModelIdentifierType {
  return (identifier as LocalModelIdentifierType).localPath !== undefined;
}
