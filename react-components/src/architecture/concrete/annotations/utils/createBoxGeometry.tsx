/*!
 * Copyright 2024 Cognite AS
 */

import { type LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

import {
  createLineSegmentsGeometry,
  createLineSegmentsAsVertices
} from './createLineSegmentsGeometry';

export function createBoxGeometry(): LineSegmentsGeometry {
  const vertices = createBoxGeometryAsVertices();
  return createLineSegmentsGeometry(vertices);
}

export function createBoxGeometryAsVertices(): number[] {
  // Define vertices of a cube
  const corners = [
    { x: -1, y: -1, z: -1 }, // Bottom-left-back
    { x: +1, y: -1, z: -1 }, // Bottom-right-back
    { x: +1, y: +1, z: -1 }, // Top-right-back
    { x: -1, y: +1, z: -1 }, // Top-left-back
    { x: -1, y: -1, z: +1 }, // Bottom-left-front
    { x: +1, y: -1, z: +1 }, // Bottom-right-front
    { x: +1, y: +1, z: +1 }, // Top-right-front
    { x: -1, y: +1, z: +1 } // Top-left-front
  ];
  const vertices = corners.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);

  // Define the order of the vertices to form line segments of the cube
  const bottomIndices = [0, 1, 1, 2, 2, 3, 3, 0];
  const topIndices = [4, 5, 5, 6, 6, 7, 7, 4];
  const sideIndices = [0, 4, 1, 5, 2, 6, 3, 7];
  const indices = [...bottomIndices, ...topIndices, ...sideIndices];

  return createLineSegmentsAsVertices(vertices, indices);
}
