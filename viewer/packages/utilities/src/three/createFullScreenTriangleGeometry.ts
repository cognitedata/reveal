/*!
 * Copyright 2022 Cognite AS
 */

import { BufferAttribute, BufferGeometry } from 'three';

export function createRenderTriangle(): BufferGeometry {
  const geometry = new BufferGeometry();
  const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
  const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

  geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));

  return geometry;
}
