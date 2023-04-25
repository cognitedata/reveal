/*!
 * Copyright 2023 Cognite AS
 */

import { Color } from 'three';
import { AnnotationModel } from '@cognite/sdk';

export interface Image360Annotation {
  readonly annotation: AnnotationModel;
  setColor(color?: Color): void;
  setVisibility(visible?: boolean): void;
}
