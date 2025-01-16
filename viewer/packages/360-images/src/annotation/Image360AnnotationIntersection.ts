/*!
 * Copyright 2023 Cognite AS
 */

import { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';
import { Image360Annotation } from './Image360Annotation';
import { Vector3 } from 'three';

/**
 * Describes an intersection with a 360 image annotation
 */
export type Image360AnnotationIntersection<T extends DataSourceType = ClassicDataSourceType> = {
  /**
   * The intersection type.
   */
  type: 'image360Annotation';
  /**
   * The intersected annotation
   */
  annotation: Image360Annotation<T>;
  /**
   * The world direction from the camera to the intersection point
   */
  direction: Vector3;
};
