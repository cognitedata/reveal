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

export type PointCloudObjectMetadata = {
  annotationId: number;
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
