/*!
 * Copyright 2023 Cognite AS
 */

import { Color } from 'three';
import { AnnotationModel } from '@cognite/sdk';

/**
 * An annotation associated with a 360 image revision
 */
export interface Image360Annotation {
  /**
   * The underlying CDF annotation
   */
  readonly annotation: AnnotationModel;

  /**
   * Set the display color of this annotation. Default: Color(1, 1, 0)
   */
  setColor(color?: Color): void;

  /**
   * Set whether this annotation should be visible. Default: true
   */
  setVisibility(visible?: boolean): void;
}
