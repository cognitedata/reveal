/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationStatus } from '@cognite/sdk';
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

/**
 * Options for loading annotations in 360 images
 */
export type Image360AnnotationFilterOptions = {
  /**
   * Allow annotations matching this/these statuses. 'all' will match  all annotations
   * @default 'approved'
   */
  status?: 'all' | AnnotationStatus | AnnotationStatus[];
};
