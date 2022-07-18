/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from './styling/StylableObject';
import { IShape } from './styling/shapes/IShape';

export type CdfPointCloudObjectAnnotation = {
  annotationId: number;
  assetId?: number;
  region: IShape[];
};

export type PointCloudObjectMetadata = {
  annotationId: number;
  assetId?: number;
};

export type PointCloudObjectAnnotation = PointCloudObjectMetadata & {
  stylableObject: StylableObject;
};
