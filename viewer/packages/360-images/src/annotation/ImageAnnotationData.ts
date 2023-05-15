/*!
 * Copyright 2023 Cognite AS
 */

import { BufferGeometry, Matrix4 } from 'three';

export interface ImageAnnotationObjectData {
  getGeometry(): BufferGeometry;
  getLineGeometry(): BufferGeometry;
  getNormalizationMatrix(): Matrix4;
}
