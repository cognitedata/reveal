/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import chunk from 'lodash/chunk';
import map from 'lodash/map';
import assert from 'assert';

export function calculateVolumeOfMesh(vertexBuffer: Float32Array, indexBuffer: Uint16Array | Uint32Array): number {
  assert(vertexBuffer.length % 3 === 0);
  assert(indexBuffer.length % 3 === 0);

  const vertices = chunk(vertexBuffer, 3).map(vertices => new THREE.Vector3(vertices[0], vertices[1], vertices[2]));

  const triangles = chunk(
    map(indexBuffer, index => vertices[index]),
    3
  );

  return (
    triangles.reduce((sum, triangle) => {
      const a = triangle[0].clone();
      const b = triangle[1].clone();
      const c = triangle[2].clone();

      return (sum += a.dot(b.cross(c)));
    }, 0) / 6
  );
}
