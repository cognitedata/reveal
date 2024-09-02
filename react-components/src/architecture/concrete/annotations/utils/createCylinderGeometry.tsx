/*!
 * Copyright 2024 Cognite AS
 */

import { type LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

import {
  createLineSegmentsGeometry,
  createLineSegmentsAsVertices
} from './createLineSegmentsGeometry';

export function createCylinderGeometry(): LineSegmentsGeometry {
  const vertices = createCylinderGeometryAsVertices();
  return createLineSegmentsGeometry(vertices);
}

export function createCylinderGeometryAsVertices(): number[] {
  // Define cylinder properties
  const segmentsBetweenCircles = 4;
  const totalSegments = segmentsBetweenCircles * 6;
  const angleIncrement = (2 * Math.PI) / totalSegments;

  // Define the vertices for the top and bottom circles of the cylinder
  const vertices: number[] = [];

  // Bottom circle vertices
  for (let i = 0; i <= totalSegments; i++) {
    const angle = i * angleIncrement;
    vertices.push(Math.sin(angle)); // x-coordinate
    vertices.push(-1); // y-coordinate (fixed for bottom circle)
    vertices.push(Math.cos(angle)); // z-coordinate
  }

  // Top circle vertices
  for (let i = 0; i <= totalSegments; i++) {
    const angle = i * angleIncrement;
    vertices.push(Math.sin(angle)); // x-coordinate
    vertices.push(1); // y-coordinate (fixed for top circle)
    vertices.push(Math.cos(angle)); // z-coordinate
  }

  // Define the indices to form line segments of the cylinder
  const indices: number[] = [];

  // Indices for the bottom circle
  for (let i = 0; i < totalSegments; i++) {
    indices.push(i, i + 1);
  }
  // Indices for the top circle
  const topCircleOffset = 1 + totalSegments;
  for (let i = 0; i < totalSegments; i++) {
    indices.push(i + topCircleOffset, i + 1 + topCircleOffset);
  }

  // Indices connecting top and bottom circles
  for (let i = 0; i < totalSegments; i += segmentsBetweenCircles) {
    indices.push(i, i + topCircleOffset);
  }
  // This is maybe a silly solution, but I will keep it like this because
  // we may change to indexed BufferGeometry later on.
  return createLineSegmentsAsVertices(vertices, indices);
}
