/*!
 * Copyright 2023 Cognite AS
 */

import { Image360Annotation } from './Image360Annotation';
import { Vector3 } from 'three';

/**
 * Describes an intersection with a 360 image annotation
 */
export type Image360AnnotationIntersection = {
  /**
   * The intersection type.
   */
  type: 'image360Annotation';
  /**
   * The intersected annotation
   */
  annotation: Image360Annotation;
  /**
   * The world direction from the camera to the intersection point
   */
  direction: Vector3;
};
