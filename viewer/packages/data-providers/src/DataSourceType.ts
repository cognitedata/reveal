/*!
 * Copyright 2024 Cognite AS
 */
import { AnnotationModel, AnnotationsAssetRef } from '@cognite/sdk';
import { Image360DataModelIdentifier } from './image-360-data-providers/descriptor-providers/datamodels/system-space/Cdf360DataModelsDescriptorProvider';
import { PointCloudAnnotationVolumeCollection, PointCloudDMVolumeCollection } from '@reveal/pointcloud-styling';
import { CoreDmImage360Annotation } from './image-360-data-providers/cdm/types';
import { DMInstanceRef } from '@reveal/utilities';

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
 * Data source type for Classic models
 */
export type ClassicDataSourceType = ClassicCadAndPointCloudDataSourceType & ClassicImage360DataSourceType;

/**
 * Data source type for classic CAD and Point cloud models
 */
export type ClassicCadAndPointCloudDataSourceType = {
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
};

/**
 * Classic data source type for 360 images
 */
export type ClassicImage360DataSourceType = {
  /**
   * Identifier type for Event- or DM-based 360 images
   */

  image360Identifier: { [key: string]: string } | Image360DataModelIdentifier;
  /**
   * Type of classic 360 annotations
   */

  image360AnnotationType: AnnotationModel;
};

/**
 * DM data source type for Cad and point cloud models
 */
export type DMCadAndPointCloudDataSourceType = {
  /**
   * The DM point cloud model identifier associated with the object, consisting of revision externalId and revision space
   */
  modelIdentifier: DMModelIdentifierType;
  /**
   * The CDF point cloud volume metadata containing reference associated with the object which includes externalId, space
   * and asset reference if any.
   */
  pointCloudVolumeMetadata: { volumeInstanceRef: DMInstanceRef; assetRef?: DMInstanceRef };
  /**
   * Point cloud volume collection type
   */
  pointCloudCollectionType: PointCloudDMVolumeCollection;
};

/**
 * Data source type for DM 360 images
 */
export type DMImage360DataSourceType = DMImage360IdentifierDataSourceType &
  DMImage360AnnotationIdentifierDataSourceType;

/**
 * Image360 DM identifier part of data source type
 */
export type DMImage360IdentifierDataSourceType = {
  /**
   * Identifier type for DM 360 collections
   */
  image360Identifier: Image360DataModelIdentifier;
};

/**
 * Image360 DM identifier part of data source type
 */
export type DMImage360AnnotationIdentifierDataSourceType = {
  /**
   * Type of CoreDM 360 image annotations (to be defined)
   */
  image360AnnotationType: CoreDmImage360Annotation;
};

/**
 * Data source type for DM data types
 * @deprecated Use CoreDMDataSourceType
 */
export type DMDataSourceType = DMCadAndPointCloudDataSourceType &
  DMImage360IdentifierDataSourceType & { image360AnnotationType: never };

/**
 * Data source type for Core DM data types
 */
export type CoreDMDataSourceType = DMCadAndPointCloudDataSourceType & DMImage360DataSourceType;

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
export type DataSourceType = ClassicDataSourceType | CoreDMDataSourceType;

/**
 * Common data source type
 * @deprecated Use FullDataSourceType
 */
export type ExportedDataSourceType = ClassicDataSourceType | DMDataSourceType;

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
