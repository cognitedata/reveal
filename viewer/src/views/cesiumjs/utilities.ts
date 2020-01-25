/*!
 * Copyright 2020 Cognite AS
 */

import { vec3, mat4 } from 'gl-matrix';
import * as Cesium from 'cesium';

export function toCartesian3(v: vec3): Cesium.Cartesian3 {
  return new Cesium.Cartesian3(v[0], v[1], v[2]);
}

export function toCesiumMatrix4(m: mat4): Cesium.Matrix4 {
  return Cesium.Matrix4.fromArray([...m]);
}

export function fromCesiumMatrix4(matrix: Cesium.Matrix4): mat4 {
  const m = Cesium.Matrix4.toArray(matrix);
  return mat4.fromValues(
    m[0],
    m[1],
    m[2],
    m[3],
    m[4],
    m[5],
    m[6],
    m[7],
    m[8],
    m[9],
    m[10],
    m[11],
    m[12],
    m[13],
    m[14],
    m[15]
  );
}

export function fromCesiumCartesian3(v: Cesium.Cartesian3): vec3 {
  return vec3.fromValues(v.x, v.y, v.z);
}
