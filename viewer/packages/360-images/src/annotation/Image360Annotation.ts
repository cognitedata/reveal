/*!
 * Copyright 2023 Cognite AS
 */

import { Color, Vector3 } from 'three';
import { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers';

/**
 * An annotation associated with a 360 image revision
 */
export interface Image360Annotation<T extends DataSourceType = ClassicDataSourceType> {
  /**
   * The underlying CDF annotation
   */
  readonly annotation: T['image360AnnotationType'];

  /**
   * Get the individual display color of this annotation.
   */
  getColor(): Color;

  /**
   * Set the display color of this annotation. Default: Random, based on annotation label
   */
  setColor(color?: Color): void;

  /**
   * Get whether this annotation is visible
   */
  getVisible(): boolean;

  /**
   * Set whether this annotation should be visible. Default: true
   */
  setVisible(visible?: boolean): void;

  /**
   * Get center of annotation, to e.g. point the camera toward it
   */
  getCenter(out?: Vector3): Vector3;
}
