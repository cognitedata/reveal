/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from './StylableObject';
import { IShape } from '@reveal/utilities';

import { Box3 } from 'three';
import { AnnotationsAssetRef } from '@cognite/sdk';

export type CdfPointCloudObjectAnnotation = {
  annotationId: number;
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

export type PointCloudObject = PointCloudObjectMetadata & {
  stylableObject: StylableObject;
};

export type PointCloudAnnotationDataModelIdentifier = {
  space: string;
  pointCloudModelExternalId: string;
  pointCloudModelRevisionId: string;
};
