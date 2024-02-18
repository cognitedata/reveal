/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3, Box3 } from 'three';
import { CustomObject } from './CustomObject';

/**
 * This class is used as output intersecting custom objects
 * @beta
 */
export class CustomObjectIntersection {
  readonly customObject: CustomObject;
  readonly point: Vector3;
  boundingBox: Box3 | undefined = undefined;
  distanceToCamera: number;

  constructor(customObject: CustomObject, point: Vector3, distanceToCamera: number) {
    this.customObject = customObject;
    this.point = point.clone();
    this.distanceToCamera = distanceToCamera;
    this.boundingBox = undefined;
  }
}
