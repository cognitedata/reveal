/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationModel } from '@cognite/sdk';
import { Color } from 'three';

export type Image360AnnotationAppearance = {
  color: Color;
  visible: boolean;
};

export type Image360AnnotationAppearanceEdit = Partial<Image360AnnotationAppearance>;

export type Image360AnnotationFilter = (annotation: AnnotationModel) => boolean;
