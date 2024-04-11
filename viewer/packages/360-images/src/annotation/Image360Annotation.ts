/*!
 * Copyright 2023 Cognite AS
 */

import { Color, Vector3 } from 'three';
import { AnnotationModel } from '@cognite/sdk';

/**
 * An annotation associated with a 360 image revision
 */
export type Image360Annotation = {
  /**
   * The underlying CDF annotation
   */
  readonly annotation: AnnotationModel;

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
};
