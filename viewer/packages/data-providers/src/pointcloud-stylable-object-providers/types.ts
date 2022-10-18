/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from './StylableObject';
import { IShape } from '@reveal/utilities';

import { Box3 } from 'three';

export type CdfPointCloudObjectAnnotation = {
  annotationId: number;
  assetId?: number;
  region: IShape[];
};

export type PointCloudObjectMetadata = {
  annotationId: number;
  assetId?: number;
  boundingBox: Box3;
};

export type PointCloudObject = PointCloudObjectMetadata & {
  stylableObject: StylableObject;
};
