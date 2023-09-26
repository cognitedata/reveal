import * as THREE from 'three';

export const createBoxGeometry = (): THREE.BufferGeometry => {
  // Define vertices of a cube
  const vertices = [
    { x: -1, y: -1, z: -1 }, // Bottom-left-back
    { x: +1, y: -1, z: -1 }, // Bottom-right-back
    { x: +1, y: +1, z: -1 }, // Top-right-back
    { x: -1, y: +1, z: -1 }, // Top-left-back
    { x: -1, y: -1, z: +1 }, // Bottom-left-front
    { x: +1, y: -1, z: +1 }, // Bottom-right-front
    { x: +1, y: +1, z: +1 }, // Top-right-front
    { x: -1, y: +1, z: +1 }, // Top-left-front
  ];

  // Convert cube vertices to an array format suitable for BufferGeometry
  const verticesArray = new Float32Array(
    vertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z])
  );

  // Define the order of the vertices to form line segments of the cube
  const bottomIndices = [0, 1, 1, 2, 2, 3, 3, 0];
  const topIndices = [4, 5, 5, 6, 6, 7, 7, 4];
  const sideIndices = [0, 4, 1, 5, 2, 6, 3, 7];
  const indices = [...bottomIndices, ...topIndices, ...sideIndices];

  // Create and configure the BufferGeometry for the cube
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(verticesArray, 3)
  );
  return geometry;
};
