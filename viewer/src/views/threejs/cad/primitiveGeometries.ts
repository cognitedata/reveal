/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

/**
 * Generate a three-dimensional plane geometry, with an optional applied tranformation function
 *   (u, v) => [ x, y, z ]
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

export const boxGeometry = (() => {
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1);
  const result = {
    index: geometry.getIndex(),
    position: geometry.getAttribute('position'),
    normal: geometry.getAttribute('normal')
  };
  geometry.dispose();
  return result;
})();

export const quadGeometry = (() => {
  const geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
  const result = {
    index: geometry.getIndex(),
    position: geometry.getAttribute('position'),
    normal: geometry.getAttribute('normal')
  };
  geometry.dispose();
  return result;
})();

export const trapeziumGeometry = (() => {
  const index = [0, 1, 3, 0, 3, 2];
  const position = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
  return {
    index: new THREE.BufferAttribute(new Uint16Array(index), 1),
    position: new THREE.BufferAttribute(new Float32Array(position), 3)
  };
})();

// cone
export const coneGeometry = (() => {
  const positions = [];
  positions.push(-1, 1, -1);
  positions.push(-1, -1, -1);
  positions.push(1, 1, -1);
  positions.push(1, -1, -1);
  positions.push(1, 1, 1);
  positions.push(1, -1, 1);

  const indices = new Uint16Array([1, 2, 0, 1, 3, 2, 3, 4, 2, 3, 5, 4]);
  return {
    index: new THREE.BufferAttribute(indices, 1),
    position: new THREE.BufferAttribute(new Float32Array(positions), 3)
  };
})();

export const torusLODs = (() => {
  //TODO: chris, 06.05.2020 - Reduce number of LODS
  const parameters = [
    [6, 4],
    [9, 4],
    [11, 6],
    [16, 12],
    [24, 16]
  ];
  const transformFunc = (u: number, v: number) => [u, v * 2.0 * Math.PI];
  return parameters.map(([radialSegments, tubularSegments]) =>
    generatePlane3D(radialSegments, tubularSegments, transformFunc)
  );
})();

export const nutGeometry = (() => {
  // in order to further optimize 3d-viewer, we can make our own nut mesh
  // that way, we can reduce 4 more triangles
  // the problem is with the normals, because to do flat shading, we have to duplicate normals
  // one way to improve it is to use 'flat' qualifier to stop glsl from interpolating normals
  const geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 1, 6);
  geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  const result = {
    index: geometry.getIndex(),
    position: geometry.getAttribute('position'),
    normal: geometry.getAttribute('normal')
  };
  geometry.dispose();
  return result;
})();
