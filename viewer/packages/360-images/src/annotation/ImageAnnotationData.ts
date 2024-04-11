/*!
 * Copyright 2023 Cognite AS
 */

import { BufferGeometry, Matrix4, Vector2 } from 'three';

export type ImageAnnotationObjectData = {
  getGeometry(): BufferGeometry;
  getOutlinePoints(): Vector2[];
  getNormalizationMatrix(): Matrix4;
};
