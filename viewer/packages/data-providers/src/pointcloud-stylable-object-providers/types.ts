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
  volumeInstanceRef?: DMInstanceRef;
  asset?: AnnotationsAssetRef | DMInstanceRef;
  region: IShape[];
};

/**
 * @public
 * Data model instance reference for point cloud volume object with asset reference.
 */
export type DMPointCloudDataType = {
  /**
   * The CDF point cloud model identifier associated with the object which includes revisionExternalId and revisionSpace.
   */
  modelIdentifier: DMInstanceRef;
  /**
   * The CDF point cloud volume metadata containing reference associated with the object which includes externalId, space
   * and asset reference if any.
   */
  volumeMetadata: { volumeInstanceRef: DMInstanceRef; assetRef?: DMInstanceRef };
  _never: never;
};

/**
 * @public
 * Classic point cloud annotation data type with asset reference.
 */
export type ClassicPointCloudDataType = {
  /**
   * The classic point cloud model identifier associated with the object which include modelId and revisionId.
   */
  modelIdentifier: { modelId: number; revisionId: number };
  /**
   * The classic point cloud volume metadata containing reference associated with the object which includes annotationId
   * and asset reference if any.
   */
  volumeMetadata: { annotationId: number; assetRef?: AnnotationsAssetRef };
  _never: never;
};

export type PointCloudDataType = DMPointCloudDataType | ClassicPointCloudDataType;

/**
 * @public
 * Metadata for a single point cloud object
 */
export type PointCloudObjectMetadata<T extends PointCloudDataType = ClassicPointCloudDataType> = {
  boundingBox: Box3;
} & T['volumeMetadata'];

/**
 * Point cloud object containing point cloud volume or annotation metadata and stylable object
 */
export type PointCloudObject<T extends PointCloudDataType = ClassicPointCloudDataType> = PointCloudObjectMetadata<T> & {
  stylableObject: StylableObject;
};

export type DMPointCloudVolumeIdentifier = {
  space: string;
  pointCloudModelExternalId: string;
  pointCloudModelRevisionId: string;
};
