/*!
 * Copyright 2022 Cognite AS
 */

export type CylinderPrimitive = {
  center_a: THREE.Vector3;
  center_b: THREE.Vector3;
  radius: number;
};
export type BoxPrimitive = {
  matrix: THREE.Matrix4;
};

export type Geometry = CylinderPrimitive | BoxPrimitive;

export type BoundingVolume = {
  annotationId: number;
  region: Geometry[];
};
