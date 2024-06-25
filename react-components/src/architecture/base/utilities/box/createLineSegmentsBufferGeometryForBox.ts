/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3, BufferGeometry, BufferAttribute } from 'three';
import { OBB } from 'three/addons/math/OBB.js';

const HALF_SIDE = 0.5;

// ==================================================
// PUBLIC FUNCTIONS: Functions
// ==================================================

export function createOrientedBox(): OBB {
  return new OBB(new Vector3().setScalar(0), new Vector3().setScalar(HALF_SIDE));
}

export function createLineSegmentsBufferGeometryForBox(): BufferGeometry {
  const vertices = createBoxGeometryAsVertices();
  const verticesArray = new Float32Array(vertices);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
  return geometry;
}

// ==================================================
// PRIVATE FUNCTIONS:
// ==================================================

function createBoxGeometryAsVertices(): number[] {
  // Define vertices of a cube
  const a = HALF_SIDE;
  const corners = [
    { x: -a, y: -a, z: -a }, // Bottom-left-back
    { x: +a, y: -a, z: -a }, // Bottom-right-back
    { x: +a, y: +a, z: -a }, // Top-right-back
    { x: -a, y: +a, z: -a }, // Top-left-back
    { x: -a, y: -a, z: +a }, // Bottom-left-front
    { x: +a, y: -a, z: +a }, // Bottom-right-front
    { x: +a, y: +a, z: +a }, // Top-right-front
    { x: -a, y: +a, z: +a } // Top-left-front
  ];
  const vertices = corners.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);

  // Define the order of the vertices to form line segments of the cube
  const bottomIndices = [0, 1, 1, 2, 2, 3, 3, 0];
  const topIndices = [4, 5, 5, 6, 6, 7, 7, 4];
  const sideIndices = [0, 4, 1, 5, 2, 6, 3, 7];
  const indices = [...bottomIndices, ...topIndices, ...sideIndices];

  return createLineSegmentsAsVertices(vertices, indices);
}

function createLineSegmentsAsVertices(vertices: number[], indices: number[]): number[] {
  // Convert indexed lines to lines only
  const allVertices: number[] = [];
  for (let i = 0; i < indices.length; i++) {
    const index = 3 * indices[i];
    allVertices.push(vertices[index], vertices[index + 1], vertices[index + 2]);
  }
  return allVertices;
}
