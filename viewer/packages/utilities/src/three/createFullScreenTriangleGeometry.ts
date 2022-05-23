/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

export function createRenderTriangle(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  return geometry;
}
