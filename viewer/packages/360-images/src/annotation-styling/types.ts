/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationModel } from '@cognite/sdk';
import { Color } from 'three';

/**
 * Appearance / "style" of a 360 image annotation
 */
export type Image360AnnotationAppearance = {
  color: Color;
  visible: boolean;
};

/**
 * A change to an annotation style. Undefined fields are ignored
 */
export type Image360AnnotationAppearanceEdit = Partial<Image360AnnotationAppearance>;

/**
 * A predicate function used for selectively applying styles to annotations
 */
export type Image360AnnotationFilter = (annotation: AnnotationModel) => boolean;
