import { AnnotationsAssetRef } from '@cognite/sdk';
import {
  DMInstanceRef,
  PointCloudAnnotationVolumeCollection,
  PointCloudDMVolumeCollection
} from 'api-entry-points/core';

/**
 * Model identifier for classic CDF models, referenced by modelId and revisionId
 */
export type ClassicModelIdentifierType = { modelId: number; revisionId: number };

/**
 * Model identifier for DM-based models, referenced by externalId and space of the model revision
 */
export type DMModelIdentifierType = { revisionExternalId: string; revisionSpace: string };

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
   * Marker to make this type inconstructable
   */
  _never: never;
};

/**
 * Common data source type
 */
export type DataSourceType = ClassicDataSourceType | DMDataSourceType;

export function isClassicIdentifier(
  identifier: DataSourceType['modelIdentifier']
): identifier is ClassicModelIdentifierType {
  return (
    (identifier as ClassicModelIdentifierType).modelId !== undefined &&
    (identifier as ClassicModelIdentifierType).revisionId !== undefined
  );
}
export function isDMIdentifier(identifier: DataSourceType['modelIdentifier']): identifier is DMModelIdentifierType {
  return (
    (identifier as DMModelIdentifierType).revisionExternalId !== undefined &&
    (identifier as DMModelIdentifierType).revisionSpace !== undefined
  );
}
