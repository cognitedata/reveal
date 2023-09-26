import * as THREE from 'three';

export const createCylinderGeometry = (): THREE.BufferGeometry => {
  // Define cylinder properties
  const segmentsBetweenCircles = 4;
  const totalSegments = segmentsBetweenCircles * 6;
  const angleIncrement = (2 * Math.PI) / totalSegments;

  // Define the vertices for the top and bottom circles of the cylinder
  const cylinderVertices: Array<number> = [];

  // Bottom circle vertices
  for (let i = 0; i <= totalSegments; i++) {
    const angle = i * angleIncrement;
    cylinderVertices.push(Math.sin(angle)); // x-coordinate
    cylinderVertices.push(-0.5); // y-coordinate (fixed for bottom circle)
    cylinderVertices.push(Math.cos(angle)); // z-coordinate
  }

  // Top circle vertices
  for (let i = 0; i <= totalSegments; i++) {
    const angle = i * angleIncrement;
    cylinderVertices.push(Math.sin(angle)); // x-coordinate
    cylinderVertices.push(0.5); // y-coordinate (fixed for top circle)
    cylinderVertices.push(Math.cos(angle)); // z-coordinate
  }

  // Define the indices to form line segments of the cylinder
  const cylinderIndices: Array<number> = [];

  // Indices for the bottom circle
  for (let i = 0; i < totalSegments; i++) {
    cylinderIndices.push(i, i + 1);
  }

  // Indices for the top circle
  const topCircleOffset = 1 + totalSegments;
  for (let i = 0; i < totalSegments; i++) {
    cylinderIndices.push(i + topCircleOffset, i + 1 + topCircleOffset);
  }

  // Indices connecting top and bottom circles
  for (let i = 0; i < totalSegments; i += segmentsBetweenCircles) {
    cylinderIndices.push(i, i + topCircleOffset);
  }

  // Create and configure the BufferGeometry for the cylinder
  const geometry = new THREE.BufferGeometry();
  const verticesArray = new Float32Array(cylinderVertices);
  geometry.setIndex(cylinderIndices);
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(verticesArray, 3)
  );

  return geometry;
};
