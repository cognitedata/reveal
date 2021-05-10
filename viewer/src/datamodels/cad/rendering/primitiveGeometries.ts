/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

/**
 * Generate a three-dimensional plane geometry,
 * with an optional applied tranformation function (u, v) => [ x, y, z ]
 */
function generatePlane3D(
  segmentsX: number,
  segmentsY: number,
  transformFunc: (u: number, v: number) => number[] = (u, v) => [u, v, 0]
) {
  const vertices = [];
  const indices = [];

  const segmentsXInv = 1 / segmentsX;
  const segmentsYInv = 1 / segmentsY;
  for (let j = 0; j <= segmentsY; j++) {
    for (let i = 0; i <= segmentsX; i++) {
      // vertices
      const [x, y, z] = transformFunc(i * segmentsXInv, j * segmentsYInv);
      vertices.push(x || 0, y || 0, z || 0);
    }
  }

  for (let j = 1; j <= segmentsY; j++) {
    for (let i = 1; i <= segmentsX; i++) {
      // indices
      const a = (segmentsX + 1) * j + i - 1;
      const b = (segmentsX + 1) * (j - 1) + i - 1;
      const c = (segmentsX + 1) * (j - 1) + i;
      const d = (segmentsX + 1) * j + i;

      // faces
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return {
    index: new THREE.Uint16BufferAttribute(indices, 1),
    position: new THREE.Float32BufferAttribute(vertices, 3)
  };
}

export const { boxGeometry, boxGeometryBoundingBox } = (() => {
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1);
  try {
    const result = {
      index: geometry.getIndex(),
      position: geometry.getAttribute('position'),
      normal: geometry.getAttribute('normal')
    };
    geometry.computeBoundingBox();
    return { boxGeometry: result, boxGeometryBoundingBox: geometry.boundingBox! };
  } finally {
    geometry.dispose();
  }
})();

export const { quadGeometry, quadGeometryBoundingBox } = (() => {
  const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  try {
    const result = {
      index: geometry.getIndex(),
      position: geometry.getAttribute('position'),
      normal: geometry.getAttribute('normal')
    };
    geometry.computeBoundingBox();
    return { quadGeometry: result, quadGeometryBoundingBox: geometry.boundingBox! };
  } finally {
    geometry.dispose();
  }
})();

export const { trapeziumGeometry, trapeziumGeometryBoundingBox } = (() => {
  const index = [0, 1, 3, 0, 3, 2];
  const position = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
  return {
    trapeziumGeometry: {
      index: new THREE.BufferAttribute(new Uint16Array(index), 1),
      position: new THREE.BufferAttribute(new Float32Array(position), 3)
    },
    trapeziumGeometryBoundingBox: new THREE.Box3().setFromArray(position)
  };
})();

// cone
export const { coneGeometry, coneGeometryBoundingBox } = (() => {
  const positions = [];
  positions.push(-1, 1, -1);
  positions.push(-1, -1, -1);
  positions.push(1, 1, -1);
  positions.push(1, -1, -1);
  positions.push(1, 1, 1);
  positions.push(1, -1, 1);

  const indices = new Uint16Array([1, 2, 0, 1, 3, 2, 3, 4, 2, 3, 5, 4]);
  return {
    coneGeometry: {
      index: new THREE.BufferAttribute(indices, 1),
      position: new THREE.BufferAttribute(new Float32Array(positions), 3)
    },
    coneGeometryBoundingBox: new THREE.Box3().setFromArray(positions)
  };
})();

export const { torusGeometry, torusGeometryBoundingBox } = (() => {
  const tubularSegments = 7;
  const radialSegments = 7;
  const transformFunc = (u: number, v: number) => [u, v * 2.0 * Math.PI];
  const torusGeometry = generatePlane3D(radialSegments, tubularSegments, transformFunc);
  return { torusGeometry, torusGeometryBoundingBox: new THREE.Box3().setFromArray(torusGeometry.position.array) };
})();

export const { nutGeometry, nutGeometryBoundingBox } = (() => {
  const geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 1, 6);
  try {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    const result = {
      index: geometry.getIndex(),
      position: geometry.getAttribute('position'),
      normal: geometry.getAttribute('normal')
    };
    return { nutGeometry: result, nutGeometryBoundingBox: new THREE.Box3().setFromArray(result.position.array) };
  } finally {
    geometry.dispose();
  }
})();
