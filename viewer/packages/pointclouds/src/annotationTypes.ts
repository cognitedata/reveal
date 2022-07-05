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

export type AnnotationMetadata = {
  annotationId: number;
  assetId?: number;
};

export type PointCloudObjectAnnotation = AnnotationMetadata & {
  stylableObject: StylableObject;
};
