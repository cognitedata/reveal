/*!
 * Copyright 2023 Cognite AS
 */

import { BufferGeometry, Matrix4, Vector3 } from 'three';

export interface ImageAnnotationObjectGeometryData {
  getGeometry(): BufferGeometry;
  getOutlinePoints(): Vector3[];
  getNormalizationMatrix(): Matrix4;
}
