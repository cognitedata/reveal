/*!
 * Copyright 2024 Cognite AS
 */

import { Box3, Vector3, BufferGeometry, BufferAttribute, LineSegments, type Matrix4 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';

const HALF_SIDE = 0.5;

export const CUBE_CORNERS = [
  new Vector3(-HALF_SIDE, -HALF_SIDE, -HALF_SIDE),
  new Vector3(+HALF_SIDE, -HALF_SIDE, -HALF_SIDE),
  new Vector3(+HALF_SIDE, +HALF_SIDE, -HALF_SIDE),
  new Vector3(-HALF_SIDE, +HALF_SIDE, -HALF_SIDE),
  new Vector3(-HALF_SIDE, -HALF_SIDE, +HALF_SIDE),
  new Vector3(+HALF_SIDE, -HALF_SIDE, +HALF_SIDE),
  new Vector3(+HALF_SIDE, +HALF_SIDE, +HALF_SIDE),
  new Vector3(-HALF_SIDE, +HALF_SIDE, +HALF_SIDE)
];

// ==================================================
// PUBLIC FUNCTIONS: Functions
// ==================================================

export function expandBoundingBoxForBox(boundingBox: Box3, matrix: Matrix4): void {
  const copyOfCorner = new Vector3();
  for (const corner of CUBE_CORNERS) {
    copyOfCorner.copy(corner);
    copyOfCorner.applyMatrix4(matrix);
    boundingBox.expandByPoint(copyOfCorner);
  }
}

export function getBoundingBoxForBox(matrix: Matrix4): Box3 {
  const boundingBox = new Box3().makeEmpty();
  expandBoundingBoxForBox(boundingBox, matrix);
  return boundingBox;
}

export function createBoxGeometry(): LineSegmentsGeometry {
  const vertices = createBoxGeometryAsVertices();
  return createLineSegmentsGeometry(vertices);
}

export function createBoxGeometryAsVertices(): number[] {
  // Define vertices of a cube
  const vertices = CUBE_CORNERS.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);

  // Define the order of the vertices to form line segments of the cube
  const bottomIndices = [0, 1, 1, 2, 2, 3, 3, 0];
  const topIndices = [4, 5, 5, 6, 6, 7, 7, 4];
  const sideIndices = [0, 4, 1, 5, 2, 6, 3, 7];
  const indices = [...bottomIndices, ...topIndices, ...sideIndices];

  return createLineSegmentsAsVertices(vertices, indices);
}

export function createOrientedBox(): OBB {
  return new OBB(new Vector3(), new Vector3().setScalar(HALF_SIDE));
}

export function createLineSegmentsBufferGeometryForBox(): BufferGeometry {
  const vertices = createBoxGeometryAsVertices();
  const verticesArray = new Float32Array(vertices);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
  return geometry;
}

export function createLineSegmentsAsVertices(vertices: number[], indices: number[]): number[] {
  // Convert indexed lines to lines only
  const allVertices: number[] = [];
  for (let i = 0; i < indices.length; i++) {
    const index = 3 * indices[i];
    allVertices.push(vertices[index], vertices[index + 1], vertices[index + 2]);
  }
  return allVertices;
}

export function createLineSegmentsGeometry(vertices: number[]): LineSegmentsGeometry {
  const verticesArray = new Float32Array(vertices);
  const geometry = new BufferGeometry();

  geometry.setAttribute('position', new BufferAttribute(verticesArray, 3));
  const lineSegments = new LineSegments(geometry);
  const lineSegmentsGeometry = new LineSegmentsGeometry().fromLineSegments(lineSegments);
  return lineSegmentsGeometry;
}
