/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3, Box3 } from 'three';
import { ICustomObject } from './ICustomObject';

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

  /**
   * The CustomObject that was intersected.
   */
  customObject: ICustomObject;

  /**
   * The bounding box of the part of the CustomObject that was intersected.
   */
  boundingBox?: Box3;

  /**
   * Additional info, for instance which part of the CustomObject was intersected.
   */
  userData?: any;
};
