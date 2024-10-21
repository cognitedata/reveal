/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from './StylableObject';
import { IShape } from '@reveal/utilities';

import { Box3 } from 'three';
import { AnnotationsAssetRef, DirectRelationReference } from '@cognite/sdk';

/**
 * @public
 * CDF Data model instance reference
 */
export type DMInstanceRef = DirectRelationReference;

export type CdfPointCloudObjectAnnotation = {
  annotationId: number;
  instanceRef?: DMInstanceRef;
  asset?: AnnotationsAssetRef;
  region: IShape[];
};

/**
 * @public
 * Metadata for a single point cloud object
 */
export type PointCloudObjectMetadata = {
  /**
   * The CDF Annotation ID associated with the point cloud object.
   */
  annotationId: number;

  /**
   * The CDF Asset ID associated with the point cloud object, if any.
   *
   * @deprecated Use {@link PointCloudObjectMetadata.assetRef} instead.
   */
  assetId?: number;

  /**
   * Asset identifiers for asset associated with this point cloud object, if any.
   */
  assetRef?: AnnotationsAssetRef;

  /**
   * The bounding box of this annotation
   */
  boundingBox: Box3;
};

/**
 * @public
 * Data Model properties for a single point cloud volume
 */
export type PointCloudVolumeDataModelProperties = {
  /**
   * The CDF point cloud volume reference associated with the object which include externalId and space.
   */
  instanceRef: DMInstanceRef;

  /**
   * Asset identifiers for asset associated with this point cloud volume, if any.
   */
  assetRef?: AnnotationsAssetRef;

  /**
   * The bounding box of this point cloud volume
   */
  boundingBox: Box3;
};

/**
 * @public
 * Combined data model properties and metadata for a single point cloud object
 */
export type PointCloudVolumeMetadata = PointCloudObjectMetadata | PointCloudVolumeDataModelProperties;

export type PointCloudObject = PointCloudVolumeMetadata & {
  stylableObject: StylableObject;
};

export type DMPointCloudVolumeIdentifier = {
  space: string;
  pointCloudModelExternalId: string;
  pointCloudModelRevisionId: string;
};
