/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3, Box3 } from 'three';
import { CustomObject } from './CustomObject';

/**
 * This class is used as output intersecting custom objects
 * @beta
 */
export type CustomObjectIntersection = {
  /**
   * The intersection type.
   */
  type: 'customObject';
  /**
   * Coordinate of the intersection.
   */
  point: Vector3;
  /**
   * Distance from the camera to the intersection.
   */
  distanceToCamera: number;

  customObject: CustomObject;
  boundingBox?: Box3;
};
