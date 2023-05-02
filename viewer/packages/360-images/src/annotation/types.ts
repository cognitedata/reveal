/*!
 * Copyright 2023 Cognite AS
 */

import { Color } from 'three';

/**
 * The appearance of a 360 image annotation
 */
export type Image360AnnotationAppearance = {
  /**
   * The color of the annotation. Default: Random, based on annotation label
   */
  color?: Color;

  /**
   * Whether the annotation is visible. Default: true
   */
  visible?: boolean;
};
